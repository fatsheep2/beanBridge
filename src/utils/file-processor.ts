import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface FileData {
  headers: string[];
  rows: any[][];
  content?: string;
  file?: File;
  provider?: string;
}

export interface ParseError {
  type: 'format' | 'encoding' | 'structure' | 'data' | 'unknown';
  message: string;
  details?: string;
  line?: number;
  column?: number;
}

export class FileProcessor {
  async parseFile(file: File): Promise<FileData> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    try {
      let fileData: FileData;
      
      switch (extension) {
        case 'csv':
          fileData = await this.parseCSV(file);
          break;
        case 'xlsx':
        case 'xls':
          fileData = await this.parseExcel(file);
          break;
        case 'txt':
          fileData = await this.parseText(file);
          break;
        default:
          throw new Error(`不支持的文件格式: ${extension}`);
      }
      
      // 添加文件引用和内容
      fileData.file = file;
      fileData.content = await this.readFileContent(file);
      
      return fileData;
    } catch (error) {
      // 增强错误信息
      const enhancedError = this.enhanceError(error as Error, file);
      throw enhancedError;
    }
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('文件内容读取失败'));
      reader.readAsText(file, 'utf-8');
    });
  }

  private enhanceError(error: Error, file: File): Error {
    const fileName = file.name;
    const fileSize = file.size;
    
    if (error.message.includes('CSV解析错误')) {
      return new Error(`CSV文件解析失败: ${fileName} (${this.formatFileSize(fileSize)}) - ${error.message}`);
    }
    
    if (error.message.includes('Excel解析失败')) {
      return new Error(`Excel文件解析失败: ${fileName} (${this.formatFileSize(fileSize)}) - ${error.message}`);
    }
    
    if (error.message.includes('文本文件解析失败')) {
      return new Error(`文本文件解析失败: ${fileName} (${this.formatFileSize(fileSize)}) - ${error.message}`);
    }
    
    if (error.message.includes('文件读取失败')) {
      return new Error(`文件读取失败: ${fileName} (${this.formatFileSize(fileSize)}) - 可能是文件损坏或权限问题`);
    }
    
    if (error.message.includes('不支持的文件格式')) {
      return new Error(`不支持的文件格式: ${fileName} (${this.formatFileSize(fileSize)}) - 请使用CSV、Excel或文本文件`);
    }
    
    return new Error(`${error.message} - 文件: ${fileName} (${this.formatFileSize(fileSize)})`);
  }

  private async parseCSV(file: File): Promise<FileData> {
    return new Promise((resolve, reject) => {
      // 首先尝试UTF-8编码
      this.parseCSVWithEncoding(file, 'utf-8')
        .then(resolve)
        .catch(() => {
          // 如果UTF-8失败，尝试GBK编码
          this.parseCSVWithEncoding(file, 'gbk')
            .then(resolve)
            .catch((error) => {
              reject(new Error(`CSV解析失败: 编码问题 - ${error.message}`));
            });
        });
    });
  }

  private async parseCSVWithEncoding(file: File, encoding: string): Promise<FileData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          Papa.parse(content, {
            header: false,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors.length > 0) {
                const firstError = results.errors[0];
                reject(new Error(`CSV解析错误: 第${firstError.row}行 - ${firstError.message}`));
                return;
              }
              
              if (results.data.length === 0) {
                reject(new Error('CSV文件为空，没有数据行'));
                return;
              }
              
              // 查找标题行
              let headerRowIndex = 0;
              for (let i = 0; i < Math.min(10, results.data.length); i++) {
                const row = results.data[i] as string[];
                if (this.isHeaderRow(row)) {
                  headerRowIndex = i;
                  break;
                }
              }
              
              const headers = (results.data[headerRowIndex] as string[]).map(h => h.trim());
              const rows = results.data.slice(headerRowIndex + 1) as string[][];
              
              resolve({
                headers,
                rows,
                content,
                provider: this.detectProvider({ headers, rows, content })
              });
            },
            error: (error) => {
              reject(new Error(`CSV解析失败: ${error.message}`));
            }
          });
        } catch (error) {
          reject(new Error(`CSV解析失败: ${error}`));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, encoding);
    });
  }

  private isHeaderRow(row: string[]): boolean {
    if (!row || row.length === 0) return false;
    
    const headerKeywords = [
      '交易时间', '交易日期', '时间', '日期',
      '金额', '收/支', '收入', '支出',
      '描述', '摘要', '商品', '说明',
      '对方', '交易对方', '商户', '账户',
      '状态', '交易状态', '方式', '支付方式'
    ];
    
    const rowText = row.join(' ').toLowerCase();
    const matchCount = headerKeywords.filter(keyword => 
      rowText.includes(keyword.toLowerCase())
    ).length;
    
    return matchCount >= 2; // 至少包含2个关键词才认为是标题行
  }

  private async parseExcel(file: File): Promise<FileData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (workbook.SheetNames.length === 0) {
            reject(new Error('Excel文件没有工作表'));
            return;
          }
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            reject(new Error('Excel工作表为空'));
            return;
          }
          
          // 查找标题行
          let headerRowIndex = 0;
          for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i] as string[];
            if (this.isHeaderRow(row)) {
              headerRowIndex = i;
              break;
            }
          }
          
          const headers = (jsonData[headerRowIndex] as string[]).map(h => String(h || '').trim());
          const rows = jsonData.slice(headerRowIndex + 1) as any[][];
          
          resolve({
            headers,
            rows,
            provider: this.detectProvider({ headers, rows })
          });
        } catch (error) {
          reject(new Error(`Excel解析失败: ${error}`));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  }

  private async parseText(file: File): Promise<FileData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const lines = content.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            reject(new Error('文本文件为空'));
            return;
          }
          
          // 尝试自动检测分隔符
          const firstLine = lines[0];
          let delimiter = '\t';
          if (firstLine.includes(',')) delimiter = ',';
          else if (firstLine.includes(';')) delimiter = ';';
          else if (firstLine.includes('\t')) delimiter = '\t';
          
          // 查找标题行
          let headerRowIndex = 0;
          for (let i = 0; i < Math.min(10, lines.length); i++) {
            const row = lines[i].split(delimiter).map(cell => cell.trim());
            if (this.isHeaderRow(row)) {
              headerRowIndex = i;
              break;
            }
          }
          
          const headers = lines[headerRowIndex].split(delimiter).map(h => h.trim());
          const rows = lines.slice(headerRowIndex + 1).map(line => 
            line.split(delimiter).map(cell => cell.trim())
          );
          
          resolve({
            headers,
            rows,
            content,
            provider: this.detectProvider({ headers, rows, content })
          });
        } catch (error) {
          reject(new Error(`文本文件解析失败: ${error}`));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'utf-8');
    });
  }

  detectProvider(fileData: FileData): string {
    const { headers, rows, content } = fileData;
    const headerStr = headers.join(' ').toLowerCase();
    const firstRow = rows[0]?.join(' ').toLowerCase() || '';
    const contentStr = content?.toLowerCase() || '';
    
    // 支付宝检测
    if (headerStr.includes('支付宝') || firstRow.includes('支付宝') || 
        contentStr.includes('支付宝') || headers.some(h => h.includes('支付宝'))) {
      return 'alipay';
    }
    
    // 微信检测
    if (headerStr.includes('微信') || firstRow.includes('微信') || 
        contentStr.includes('微信支付') || headers.some(h => h.includes('微信'))) {
      return 'wechat';
    }
    
    // 京东检测
    if (headerStr.includes('京东') || firstRow.includes('京东') || 
        contentStr.includes('京东') || headers.some(h => h.includes('京东'))) {
      return 'jd';
    }
    
    // 工商银行检测
    if (headerStr.includes('工商') || firstRow.includes('工商') || 
        contentStr.includes('工商银行') || headers.some(h => h.includes('工商'))) {
      return 'icbc';
    }
    
    // 招商银行检测
    if (headerStr.includes('招商') || firstRow.includes('招商') || 
        contentStr.includes('招商银行') || headers.some(h => h.includes('招商'))) {
      return 'cmb';
    }
    
    // 建设银行检测
    if (headerStr.includes('建设') || firstRow.includes('建设') || 
        contentStr.includes('建设银行') || headers.some(h => h.includes('建设'))) {
      return 'ccb';
    }
    
    // 中信银行检测
    if (headerStr.includes('中信') || firstRow.includes('中信') || 
        contentStr.includes('中信银行') || headers.some(h => h.includes('中信'))) {
      return 'citic';
    }
    
    // 汇丰香港检测
    if (headerStr.includes('汇丰') || firstRow.includes('汇丰') || 
        contentStr.includes('汇丰银行') || headers.some(h => h.includes('hsbc'))) {
      return 'hsbchk';
    }
    
    // 火币检测
    if (headerStr.includes('火币') || firstRow.includes('火币') || 
        contentStr.includes('火币') || headers.some(h => h.includes('火币'))) {
      return 'huobi';
    }
    
    return 'unknown';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 