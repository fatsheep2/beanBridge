import type { IR, Order, ProviderInterface, ProviderType, Statistics, FileData } from '../../types/provider';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export abstract class BaseProvider implements ProviderInterface {
  protected statistics: Statistics = {
    parsedItems: 0,
    start: new Date(),
    end: new Date(),
    totalInRecords: 0,
    totalInMoney: 0,
    totalOutRecords: 0,
    totalOutMoney: 0
  };

  protected lineNum: number = 0;
  protected orders: Order[] = [];
  protected titleParsed: boolean = false;

  abstract getProviderName(): string;
  abstract getSupportedFormats(): string[];

  async translate(file: File): Promise<IR> {
    this.reset();

    try {
      const fileData = await this.readFileFromBlob(file);
      const orders = await this.parseOrders(fileData);
      this.orders = orders;

      const ir = this.convertToIR();
      return this.postProcess(ir);
    } catch (error) {
      console.error(`[Provider-${this.getProviderName()}] 解析失败:`, error);
      throw error;
    }
  }

  protected reset(): void {
    this.statistics = {
      parsedItems: 0,
      start: new Date(),
      end: new Date(),
      totalInRecords: 0,
      totalInMoney: 0,
      totalOutRecords: 0,
      totalOutMoney: 0
    };
    this.lineNum = 0;
    this.orders = [];
    this.titleParsed = false;
  }

  protected async readFile(filename: string): Promise<FileData> {
    return new Promise((resolve, reject) => {
      // 由于我们无法直接通过文件名读取文件，这里需要修改接口
      // 在实际使用中，我们需要传入 File 对象而不是文件名
      reject(new Error('readFile 方法需要 File 对象，请使用 readFileFromBlob 方法'));
    });
  }

  /**
   * 获取表头所在行的索引，默认自动查找。子类可重写。
   * @param lines Excel: string[][], CSV: string[]
   */
  protected getHeaderRowIndex(lines: string[][] | string[]): number {
    // Excel: lines为二维数组，CSV: lines为一维字符串数组
    if (Array.isArray(lines) && Array.isArray(lines[0])) {
      // Excel: 默认自动查找第一个包含多个字段的行
      for (let i = 0; i < lines.length; i++) {
        const row = lines[i] as string[];
        // 至少有3个非空字段
        if (row.filter(cell => cell && cell.trim()).length >= 3) {
          return i;
        }
      }
      return 0;
    } else {
      // CSV: 走原有自动查找逻辑
      return this.findHeaderRow(lines as string[]);
    }
  }

  protected async readFileFromBlob(file: File): Promise<FileData> {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv' || ext === 'txt') {
      // 纯文本文件，走原有逻辑
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const processedData = this.preprocessFileContent(text, file.name);
            resolve(processedData);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsText(file);
      });
    } else if (ext === 'xls' || ext === 'xlsx') {
      // Excel 文件，使用 xlsx 解析
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            // 默认取第一个sheet
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
            if (!json || json.length === 0) {
              reject(new Error('Excel文件内容为空'));
              return;
            }
            // 自动查找表头行
            const headerIndex = this.getHeaderRowIndex(json as string[][]);
            const headers = (json[headerIndex] as string[]).map(h => h?.trim?.() || '');
            const rows = (json.slice(headerIndex + 1) as string[][]).map(row => row.map(cell => (cell ?? '').toString().trim()));
            resolve({
              headers,
              rows,
              provider: this.getProviderType(),
              filename: file.name
            });
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsArrayBuffer(file);
      });
    } else {
      throw new Error('不支持的文件格式');
    }
  }

  protected preprocessFileContent(text: string, filename: string): FileData {
    const lines = text.split('\n');

    // 查找表头行
    const headerIndex = this.findHeaderRow(lines);
    if (headerIndex === -1) {
      throw new Error('未找到有效的表头行');
    }

    // 提取表头和数据行
    const headers = this.parseHeaderLine(lines[headerIndex]);
    const dataRows = lines.slice(headerIndex + 1)
      .filter(line => line.trim() !== '') // 过滤空行
      .map(line => this.parseDataLine(line));

    console.log(`[Provider-${this.getProviderName()}] 跳过了 ${headerIndex} 行说明文本，找到表头:`, headers);
    console.log(`[Provider-${this.getProviderName()}] 数据行数: ${dataRows.length}`);

    return {
      headers,
      rows: dataRows,
      provider: this.getProviderType(),
      filename
    };
  }

  protected findHeaderRow(lines: string[]): number {
    // 根据不同的解析器类型，定义不同的表头识别规则
    const headerPatterns = this.getHeaderPatterns();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      // 必须是逗号分隔且字段数大于2
      const commaCount = (line.match(/,/g) || []).length;
      if (commaCount < 2) continue;
      // 检查是否匹配任何表头模式
      const lowerLine = line.toLowerCase();
      let matchCount = 0;
      for (const pattern of headerPatterns) {
        if (pattern.test(lowerLine)) {
          matchCount++;
        }
      }
      // 至少有2个字段匹配才算表头
      if (matchCount >= 2) {
        return i;
      }
    }
    return -1;
  }

  protected getHeaderPatterns(): RegExp[] {
    // 默认的表头识别模式，子类可以重写
    return [
      /交易时间|日期|时间/,
      /收\/支|类型|交易类型/,
      /对方|商家|收款方/,
      /商品|说明|备注/,
      /金额|交易金额/,
      /状态|交易状态/,
      /分类|交易分类/
    ];
  }

  protected parseHeaderLine(headerLine: string): string[] {
    // 先用 split 检查分隔符数量
    const cells = headerLine.split(',');
    if (cells.length < 2) {
      throw new Error('未找到有效的表头（字段数不足）');
    }
    // 使用 Papa.parse 解析表头行，确保正确处理引号和转义字符
    const result = Papa.parse(headerLine, {
      header: false,
      skipEmptyLines: false
    });
    if (result.errors.length > 0) {
      throw new Error(`表头解析失败: ${result.errors[0].message}`);
    }
    const headers = (result.data[0] as string[]) || [];
    return headers.map(header => header.trim());
  }

  protected parseDataLine(line: string): string[] {
    // 使用 Papa.parse 解析数据行
    const result = Papa.parse(line, {
      header: false,
      skipEmptyLines: false
    });

    if (result.errors.length > 0) {
      console.warn(`数据行解析失败: ${result.errors[0].message}, 行内容: ${line}`);
      return [];
    }

    const row = (result.data[0] as string[]) || [];
    return row.map(cell => cell.trim());
  }

  protected abstract parseOrders(fileData: FileData): Promise<Order[]>;
  protected abstract getProviderType(): ProviderType;

  protected convertToIR(): IR {
    return {
      orders: [...this.orders]
    };
  }

  protected postProcess(ir: IR): IR {
    // 默认的后处理逻辑，子类可以重写
    return ir;
  }

  protected parseDate(dateStr: string): Date {
    // 尝试多种日期格式
    const formats = [
      'YYYY-MM-DD HH:mm:ss',
      'YYYY-MM-DD',
      'MM/DD/YYYY',
      'DD/MM/YYYY',
      'YYYY/MM/DD'
    ];

    for (const format of formats) {
      try {
        // 简单的日期解析，实际项目中可以使用更强大的库如 dayjs
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error(`无法解析日期: ${dateStr}`);
  }

  protected parseAmount(amountStr: string): number {
    if (!amountStr) return 0;

    // 移除货币符号和空格
    const cleanAmount = amountStr.replace(/[^\d.-]/g, '');
    const amount = parseFloat(cleanAmount);

    if (isNaN(amount)) {
      throw new Error(`无法解析金额: ${amountStr}`);
    }

    return amount;
  }

  protected updateStatistics(order: Order): void {
    this.statistics.parsedItems++;

    if (order.payTime < this.statistics.start) {
      this.statistics.start = order.payTime;
    }
    if (order.payTime > this.statistics.end) {
      this.statistics.end = order.payTime;
    }

    if (order.type === 'Recv') {
      this.statistics.totalInRecords++;
      this.statistics.totalInMoney += order.money;
    } else if (order.type === 'Send') {
      this.statistics.totalOutRecords++;
      this.statistics.totalOutMoney += Math.abs(order.money);
    }
  }

  getStatistics(): Statistics {
    return { ...this.statistics };
  }
} 