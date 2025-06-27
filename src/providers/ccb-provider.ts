import { BaseProvider } from './base-provider';
import type { Order, IR, FileData } from '../types/provider';
import { OrderType, Type, ProviderType, Unit, Account } from '../types/provider';

export class CCBProvider extends BaseProvider {
    getProviderName(): string {
        return 'CCB';
    }

    getSupportedFormats(): string[] {
        return ['.xls', '.xlsx', '.csv'];
    }

    protected getProviderType(): ProviderType {
        return ProviderType.CCB;
    }

    protected getHeaderPatterns(): RegExp[] {
        // 建设银行特定的表头识别模式
        return [
            /记账日|交易日期|交易时间/,
            /支出|收入|账户余额/,
            /币种|摘要|对方账号/,
            /对方户名|交易地点/
        ];
    }

    protected async parseOrders(fileData: FileData): Promise<Order[]> {
        const { headers, rows } = fileData;
        const orders: Order[] = [];

        // 调试：显示字段映射
        const fieldMap = this.mapFields(headers);
        console.log('[Provider-CCB] 字段映射:', fieldMap);
        console.log('[Provider-CCB] 表头:', headers);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            this.lineNum = i + 1; // 行号从1开始

            try {
                const order = this.parseOrder(row, headers);
                if (order) {
                    orders.push(order);
                    this.updateStatistics(order);
                } else {
                    console.warn(`[Provider-CCB] 第 ${this.lineNum} 行解析失败，跳过`);
                }
            } catch (error) {
                console.warn(`第 ${this.lineNum} 行解析失败:`, error);
                continue;
            }
        }

        console.log(`[Provider-CCB] 成功解析 ${orders.length} 条记录`);
        return orders;
    }

    private parseOrder(row: string[], headers: string[]): Order | null {
        if (row.length < 8) return null;

        // 建设银行字段映射
        const fieldMap = this.mapFields(headers);

        const recordDateStr = row[fieldMap.recordDate] || '';
        const tradeDateStr = row[fieldMap.tradeDate] || '';
        const tradeTimeStr = row[fieldMap.tradeTime] || '';
        const expenseStr = row[fieldMap.expense] || '';
        const incomeStr = row[fieldMap.income] || '';
        const balanceStr = row[fieldMap.balance] || '';
        const currency = row[fieldMap.currency] || '';
        const summary = row[fieldMap.summary] || '';
        const peerAccount = row[fieldMap.peerAccount] || '';
        const peerName = row[fieldMap.peerName] || '';
        const tradeLocation = row[fieldMap.tradeLocation] || '';

        // 检查是否为有效数据行（跳过说明行）
        if (!tradeDateStr || (expenseStr === '' && incomeStr === '')) return null;

        // 检查是否为文件末尾的说明行
        if (summary.includes('以上数据仅供参考') || summary.includes('具体内容请以柜台为准')) {
            return null;
        }

        // 使用交易日期，如果没有则使用记账日
        const dateStr = tradeDateStr || recordDateStr;
        if (!dateStr) return null;

        // 计算金额：支出为负数，收入为正数
        const expense = this.parseAmount(expenseStr);
        const income = this.parseAmount(incomeStr);
        const money = income - expense; // 收入为正，支出为负

        if (money === 0) return null; // 跳过金额为0的交易

        // 拼接日期和时间，然后转换为Date对象
        const payTime = this.parseDate(dateStr, tradeTimeStr);
        const type = money > 0 ? Type.Recv : Type.Send;

        // 只保留 payTime 及其它有值的元数据
        const metadata: Record<string, string> = {};
        if (summary) metadata.summary = summary;
        if (peerAccount) metadata.peerAccount = peerAccount;
        if (peerName) metadata.peerName = peerName;
        if (tradeLocation) metadata.tradeLocation = tradeLocation;
        if (balanceStr) metadata.balance = balanceStr;
        // 保存原始时间字符串到元数据中
        if (tradeTimeStr) metadata.tradeTime = tradeTimeStr;
        if (dateStr) metadata.tradeDate = dateStr;
        // payTime 保存为本地时间格式，而不是ISO字符串
        if (payTime) {
            const year = payTime.getFullYear();
            const month = String(payTime.getMonth() + 1).padStart(2, '0');
            const day = String(payTime.getDate()).padStart(2, '0');
            const hour = String(payTime.getHours()).padStart(2, '0');
            const minute = String(payTime.getMinutes()).padStart(2, '0');
            const second = String(payTime.getSeconds()).padStart(2, '0');
            metadata.payTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
        }

        const order: Order = {
            orderType: OrderType.Normal,
            peer: peerName,
            item: summary,
            category: this.categorizeTransaction(summary, expenseStr, incomeStr),
            merchantOrderID: undefined,
            orderID: undefined,
            money,
            note: summary,
            payTime,
            type,
            typeOriginal: money > 0 ? '收入' : '支出',
            txTypeOriginal: money > 0 ? '收入' : '支出',
            method: tradeLocation,
            amount: Math.abs(money),
            price: 1,
            currency: this.normalizeCurrency(currency) || 'CNY',
            commission: 0,
            units: {
                [Unit.BaseUnit]: '',
                [Unit.TargetUnit]: '',
                [Unit.CommissionUnit]: ''
            },
            extraAccounts: {
                [Account.CashAccount]: '',
                [Account.PositionAccount]: '',
                [Account.CommissionAccount]: '',
                [Account.PnlAccount]: '',
                [Account.ThirdPartyCustodyAccount]: '',
                [Account.PlusAccount]: '',
                [Account.MinusAccount]: ''
            },
            minusAccount: '',
            plusAccount: '',
            metadata,
            tags: []
        };

        if (order.plusAccount) {
            order.extraAccounts[Account.PlusAccount] = order.plusAccount;
        }
        if (order.minusAccount) {
            order.extraAccounts[Account.MinusAccount] = order.minusAccount;
        }

        return order;
    }

    private mapFields(headers: string[]): Record<string, number> {
        const fieldMap: Record<string, number> = {};

        headers.forEach((header, index) => {
            const lowerHeader = header.toLowerCase();

            if (lowerHeader.includes('记账日')) {
                fieldMap.recordDate = index;
            } else if (lowerHeader.includes('交易日期')) {
                fieldMap.tradeDate = index;
            } else if (lowerHeader.includes('交易时间')) {
                fieldMap.tradeTime = index;
            } else if (lowerHeader.includes('支出')) {
                fieldMap.expense = index;
            } else if (lowerHeader.includes('收入')) {
                fieldMap.income = index;
            } else if (lowerHeader.includes('账户余额')) {
                fieldMap.balance = index;
            } else if (lowerHeader.includes('币种')) {
                fieldMap.currency = index;
            } else if (lowerHeader.includes('摘要')) {
                fieldMap.summary = index;
            } else if (lowerHeader.includes('对方账号')) {
                fieldMap.peerAccount = index;
            } else if (lowerHeader.includes('对方户名')) {
                fieldMap.peerName = index;
            } else if (lowerHeader.includes('交易地点')) {
                fieldMap.tradeLocation = index;
            }
        });

        return fieldMap;
    }

    protected parseDate(dateStr: string, timeStr?: string): Date {
        // 建设银行日期格式：YYYYMMDD
        if (dateStr.length === 8) {
            const year = parseInt(dateStr.substring(0, 4));
            const month = parseInt(dateStr.substring(4, 6)) - 1; // 月份从0开始
            const day = parseInt(dateStr.substring(6, 8));

            let hour = 0, minute = 0, second = 0;

            // 如果有时间信息，先解析时间
            if (timeStr && timeStr.includes(':')) {
                const timeParts = timeStr.split(':');
                hour = parseInt(timeParts[0]);
                minute = parseInt(timeParts[1]);
                second = timeParts[2] ? parseInt(timeParts[2]) : 0;
            }

            console.log('[Provider-CCB] 开始解析:', { dateStr, timeStr });
            console.log('[Provider-CCB] 解析结果:', { year, month, day, hour, minute, second });

            // 直接使用Date构造函数传入参数，避免时区转换
            const date = new Date(year, month, day, hour, minute, second, 0);

            console.log('[Provider-CCB] 创建的时间对象:', date);
            console.log('[Provider-CCB] 本地时间字符串:', date.toString());
            console.log('[Provider-CCB] ISO字符串:', date.toISOString());

            return date;
        }

        // 尝试其他日期格式，但也要避免时区转换
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
            // 如果解析成功，返回本地时间
            return new Date(
                parsedDate.getFullYear(),
                parsedDate.getMonth(),
                parsedDate.getDate(),
                parsedDate.getHours(),
                parsedDate.getMinutes(),
                parsedDate.getSeconds(),
                0
            );
        }

        // 如果都失败了，返回当前时间
        console.warn(`[Provider-CCB] 无法解析日期: ${dateStr}，使用当前时间`);
        return new Date();
    }

    protected parseAmount(amountStr: string): number {
        if (!amountStr || amountStr.trim() === '') return 0;

        // 移除千分位逗号和引号
        const cleanStr = amountStr.replace(/[,，]/g, '').replace(/"/g, '');

        const amount = parseFloat(cleanStr);
        return isNaN(amount) ? 0 : amount;
    }

    private categorizeTransaction(summary: string, expenseStr: string, incomeStr: string): string {
        const lowerSummary = summary.toLowerCase();

        // 根据交易摘要进行分类
        if (lowerSummary.includes('工资') || lowerSummary.includes('薪金') || lowerSummary.includes('薪金报酬')) {
            return '工资收入';
        } else if (lowerSummary.includes('电子汇入') || lowerSummary.includes('银联入账')) {
            return '转账收入';
        } else if (lowerSummary.includes('消费退货')) {
            return '退款';
        } else if (lowerSummary.includes('消费')) {
            return '消费';
        } else if (lowerSummary.includes('转账') || lowerSummary.includes('汇款')) {
            return '转账';
        } else if (lowerSummary.includes('充值')) {
            return '充值';
        } else if (lowerSummary.includes('手续费')) {
            return '手续费';
        } else if (lowerSummary.includes('利息存入')) {
            return '利息收入';
        } else if (lowerSummary.includes('售汇')) {
            return '外汇交易';
        } else if (lowerSummary.includes('跨行转出')) {
            return '转账支出';
        } else if (lowerSummary.includes('无卡自助交易') || lowerSummary.includes('有卡自助消费')) {
            return '消费';
        } else if (lowerSummary.includes('微信支付') || lowerSummary.includes('支付宝')) {
            return '第三方支付';
        } else if (lowerSummary.includes('抖音支付')) {
            return '第三方支付';
        } else if (lowerSummary.includes('财付通')) {
            return '第三方支付';
        } else {
            return '其他';
        }
    }

    protected postProcess(ir: IR): IR {
        // 建设银行特有的后处理逻辑
        const processedOrders: Order[] = [];

        for (const order of ir.orders) {
            // 过滤掉金额为0或无效的交易
            if (order.money === 0) {
                console.log(`[orderId ${order.orderID}] 跳过金额为0的交易`);
                continue;
            }

            // 过滤掉说明行
            if (order.metadata.summary?.includes('以上数据仅供参考')) {
                console.log(`[orderId ${order.orderID}] 跳过说明行`);
                continue;
            }

            processedOrders.push(order);
        }

        return {
            orders: processedOrders
        };
    }

    // 重写表头行号识别，适配建行Excel账单
    protected getHeaderRowIndex(lines: string[][] | string[]): number {
        if (Array.isArray(lines) && Array.isArray(lines[0])) {
            // Excel: 检查前几行是否包含'China Construction Bank'，如有则第6行为表头
            for (let i = 0; i < 5 && i < lines.length; i++) {
                const row = lines[i] as string[];
                if (row.some(cell => typeof cell === 'string' && cell.includes('China Construction Bank'))) {
                    return 5; // 第6行（index=5）为表头
                }
            }
        }
        // 其它情况走默认逻辑
        return super.getHeaderRowIndex(lines);
    }

    private normalizeCurrency(currency: string): string | null {
        if (!currency) return null;

        const currencyMap: Record<string, string> = {
            '人民币': 'CNY',
            '人民币元': 'CNY',
            '元': 'CNY',
            '美元': 'USD',
            '美金': 'USD',
            '港币': 'HKD',
            '港元': 'HKD',
            '欧元': 'EUR',
            '日元': 'JPY',
            '英镑': 'GBP',
            '加元': 'CAD',
            '澳元': 'AUD',
            '新加坡元': 'SGD',
            '新币': 'SGD',
            '韩元': 'KRW',
            '韩币': 'KRW',
            '泰铢': 'THB',
            '马来西亚林吉特': 'MYR',
            '林吉特': 'MYR',
            '印尼盾': 'IDR',
            '菲律宾比索': 'PHP',
            '比索': 'PHP',
            '印度卢比': 'INR',
            '卢比': 'INR',
            '俄罗斯卢布': 'RUB',
            '卢布': 'RUB',
            '瑞士法郎': 'CHF',
            '瑞典克朗': 'SEK',
            '挪威克朗': 'NOK',
            '丹麦克朗': 'DKK',
            '新西兰元': 'NZD'
        };

        // 标准化输入：去除空格，转换为小写
        const normalizedInput = currency.trim().toLowerCase();

        // 查找匹配的中文货币名称
        for (const [chineseName, code] of Object.entries(currencyMap)) {
            if (normalizedInput === chineseName.toLowerCase()) {
                return code;
            }
        }

        // 如果输入已经是标准货币代码，直接返回
        if (/^[A-Z]{3}$/.test(currency.toUpperCase())) {
            return currency.toUpperCase();
        }

        // 如果没有找到匹配，返回原始值（让后续逻辑处理）
        return currency;
    }
} 