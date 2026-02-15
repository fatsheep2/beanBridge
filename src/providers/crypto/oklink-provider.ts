import { BaseProvider } from '../base/base-provider';
import type { Order, IR, FileData } from '../../types/provider';
import { OrderType, Type, ProviderType, Unit, Account } from '../../types/provider';
import { CryptoTransactionType } from '../../types/provider';

/**
 * OKLink 多链代币转账 CSV 解析器
 * 支持从 OKLink 导出的代币转账记录（如 ERC20、TRC20 等）
 * 预期 CSV 表头（中英文均可）：交易哈希、区块号、时间戳、发送地址、接收地址、代币数量、合约地址、代币名称、代币符号、方向
 */
export class OKLinkProvider extends BaseProvider {
  getProviderName(): string {
    return 'OKLink';
  }

  getSupportedFormats(): string[] {
    return ['csv'];
  }

  protected getProviderType(): ProviderType {
    return ProviderType.OKLink;
  }

  protected getHeaderPatterns(): RegExp[] {
    return [
      /交易哈希|txhash|transaction.?hash|hash/i,
      /区块|block/i,
      /时间|timestamp|date/i,
      /发送|from|sender/i,
      /接收|to|receiver|recipient/i,
      /数量|amount|value/i,
      /合约|contract|token.?address/i,
      /代币|token/i,
      /方向|direction|type/
    ];
  }

  protected async parseOrders(fileData: FileData): Promise<Order[]> {
    const { headers, rows } = fileData;
    const orders: Order[] = [];
    const fieldMap = this.mapFields(headers);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      this.lineNum = i + 2; // 表头占第 1 行

      try {
        const order = this.parseOrder(row, fieldMap);
        if (order) {
          orders.push(order);
          this.updateStatistics(order);
        }
      } catch (error) {
        console.warn(`[OKLink] 第 ${this.lineNum} 行解析失败，跳过:`, error);
      }
    }

    console.log(`[OKLink] 成功解析 ${orders.length} 条记录`);
    return orders;
  }

  private parseOrder(row: string[], fieldMap: Record<string, number>): Order | null {
    const get = (key: string) => {
      const idx = fieldMap[key];
      return idx !== undefined && row[idx] !== undefined ? String(row[idx]).trim() : '';
    };

    const txHash = get('transactionHash');
    const fromAddress = get('fromAddress');
    const toAddress = get('toAddress');
    const amountStr = get('amount');
    const tokenSymbol = get('tokenSymbol') || get('token');
    const tokenName = get('tokenName');
    const tokenAddress = get('tokenAddress');
    const directionStr = get('direction');
    const timestampStr = get('payTime');
    const blockStr = get('blockNumber');
    const chainStr = get('chain');

    if (!amountStr || !tokenSymbol) {
      return null;
    }

    const amount = this.parseAmount(amountStr);
    const payTime = this.parseTimestamp(timestampStr);
    const direction = this.normalizeDirection(directionStr);
    const type = direction === 'recv' ? Type.Recv : Type.Send;
    const money = type === Type.Recv ? amount : -amount;
    const peer = type === Type.Recv ? fromAddress : toAddress;

    const order: Order = {
      orderType: OrderType.CryptoTransfer,
      peer: peer || 'Unknown',
      item: `${tokenSymbol} 转账`,
      category: direction === 'recv' ? '收款' : '付款',
      merchantOrderID: undefined,
      orderID: txHash || undefined,
      money,
      note: `${direction === 'recv' ? '收到' : '转出'} ${amount} ${tokenSymbol}`,
      payTime,
      type,
      typeOriginal: direction,
      txTypeOriginal: direction,
      method: 'OKLink',
      amount,
      price: 0,
      currency: tokenSymbol,
      commission: 0,
      units: {
        [Unit.BaseUnit]: tokenSymbol,
        [Unit.TargetUnit]: tokenSymbol,
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
      metadata: {
        tokenSymbol,
        tokenName,
        tokenAddress,
        fromAddress,
        toAddress,
        blockNumber: blockStr,
        chain: chainStr
      },
      tags: ['crypto', 'oklink'],
      // 区块链字段，供规则引擎与 Beancount 转换使用
      chain: chainStr || 'ETH',
      token: tokenSymbol,
      tokenAddress: tokenAddress || undefined,
      transactionHash: txHash || undefined,
      transactionType: CryptoTransactionType.Transfer,
      blockNumber: blockStr ? parseInt(blockStr, 10) : undefined,
      fromAddress: fromAddress || undefined,
      toAddress: toAddress || undefined
    };

    return order;
  }

  private mapFields(headers: string[]): Record<string, number> {
    const fieldMap: Record<string, number> = {};
    const mapping: Array<{ keys: string[]; field: string }> = [
      { keys: ['交易哈希', 'txhash', 'transaction_hash', 'hash', 'tx_hash'], field: 'transactionHash' },
      { keys: ['区块号', '区块', 'block', 'block_number', 'blockNumber'], field: 'blockNumber' },
      { keys: ['时间戳', '时间', 'timestamp', 'date', '交易时间'], field: 'payTime' },
      { keys: ['发送地址', '发送方', 'from', 'from_address', 'fromAddress'], field: 'fromAddress' },
      { keys: ['接收地址', '接收方', 'to', 'to_address', 'toAddress'], field: 'toAddress' },
      { keys: ['代币数量', '数量', 'amount', 'value', '转账金额'], field: 'amount' },
      { keys: ['合约地址', '合约', 'contract', 'token_address', 'tokenAddress'], field: 'tokenAddress' },
      { keys: ['代币名称', 'token_name', 'tokenName'], field: 'tokenName' },
      { keys: ['代币符号', '代币', 'token', 'symbol', 'token_symbol', 'tokenSymbol'], field: 'tokenSymbol' },
      { keys: ['方向', 'direction', 'type', '交易类型'], field: 'direction' },
      { keys: ['链', 'chain', 'network', '区块链'], field: 'chain' }
    ];

    headers.forEach((header, index) => {
      const lower = header.toLowerCase().trim();
      for (const { keys, field } of mapping) {
        if (keys.some(k => lower.includes(k.toLowerCase()))) {
          fieldMap[field] = index;
          break;
        }
      }
      if (!Object.values(fieldMap).includes(index)) {
        if (lower.includes('token') && !fieldMap.tokenSymbol) fieldMap.tokenSymbol = index;
        if (lower.includes('amount') && fieldMap.amount === undefined) fieldMap.amount = index;
      }
    });

    return fieldMap;
  }

  private parseTimestamp(str: string): Date {
    if (!str) return new Date();
    const num = parseInt(str, 10);
    if (!isNaN(num)) {
      if (num < 1e12) return new Date(num * 1000);
      return new Date(num);
    }
    return this.parseDate(str);
  }

  private normalizeDirection(str: string): 'recv' | 'send' {
    const lower = (str || '').toLowerCase();
    if (lower.includes('recv') || lower.includes('收') || lower.includes('in') || lower === '1') return 'recv';
    if (lower.includes('send') || lower.includes('发') || lower.includes('out') || lower === '0') return 'send';
    return 'send';
  }
}
