import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { DataSource } from '../types/data-source';

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
  async parseFile(file: File, dataSource?: DataSource): Promise<FileData> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    try {
      let fileData: FileData;
      
      switch (extension) {
        case 'csv':
          fileData = await this.parseCSV(file, dataSource);
          break;
        case 'xlsx':
        case 'xls':
          fileData = await this.parseExcel(file, dataSource);
          break;
        case 'txt':
          fileData = await this.parseText(file, dataSource);
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

  private async parseCSV(file: File, dataSource?: DataSource): Promise<FileData> {
    return new Promise((resolve, reject) => {
      // 首先尝试UTF-8编码
      this.parseCSVWithEncoding(file, 'utf-8', dataSource)
        .then(resolve)
        .catch(() => {
          // 如果UTF-8失败，尝试GBK编码
          this.parseCSVWithEncoding(file, 'gbk', dataSource)
            .then(resolve)
            .catch((error) => {
              reject(new Error(`CSV解析失败: 编码问题 - ${error.message}`));
            });
        });
    });
  }

  private async parseCSVWithEncoding(file: File, encoding: string, dataSource?: DataSource): Promise<FileData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          // 首先检测数据源类型
          const detectedProvider = this.detectProviderFromContent(content);
          console.log('检测到的数据源:', detectedProvider);
          
          // 根据数据源类型处理内容，使用配置的skipLines
          const processedContent = this.preprocessContent(content, detectedProvider, dataSource);
          console.log('预处理后的内容前200字符:', processedContent.substring(0, 200));
          
          // 检测分隔符
          const delimiter = this.detectDelimiter(processedContent);
          console.log('检测到的分隔符:', delimiter);
          
          Papa.parse(processedContent, {
            header: false,
            skipEmptyLines: true,
            delimiter: delimiter, // 明确指定分隔符
            complete: (results) => {
              console.log('Papa Parse 结果:', results);
              
              if (results.errors.length > 0) {
                const firstError = results.errors[0];
                console.error('Papa Parse 错误:', firstError);
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
                console.log(`检查第${i}行是否为标题行:`, row);
                if (this.isHeaderRow(row)) {
                  headerRowIndex = i;
                  console.log(`找到标题行，索引: ${i}`);
                  break;
                }
              }
              
              const headers = (results.data[headerRowIndex] as string[]).map(h => h.trim());
              const rows = results.data.slice(headerRowIndex + 1) as string[][];
              
              console.log('解析结果:', { headers, rowsCount: rows.length });
              
              resolve({
                headers,
                rows,
                content,
                provider: detectedProvider
              });
            },
            error: (error) => {
              console.error('Papa Parse 错误:', error);
              reject(new Error(`CSV解析失败: ${error.message}`));
            }
          });
        } catch (error) {
          console.error('CSV解析异常:', error);
          reject(new Error(`CSV解析失败: ${error}`));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, encoding);
    });
  }

  // 检测分隔符
  private detectDelimiter(content: string): string {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return ',';
    
    console.log('检测分隔符，前几行:', lines.slice(0, 3));
    
    const delimiters = [',', ';', '\t', '|'];
    const scores: Record<string, number> = {};
    
    delimiters.forEach(delimiter => {
      scores[delimiter] = 0;
    });
    
    // 检查前几行
    const checkLines = lines.slice(0, Math.min(5, lines.length));
    checkLines.forEach((line, lineIndex) => {
      delimiters.forEach(delimiter => {
        const parts = line.split(delimiter);
        if (parts.length > 1) {
          // 计算这一行的分隔符质量分数
          let score = parts.length;
          
          // 如果所有部分都不为空，加分
          const nonEmptyParts = parts.filter(part => part.trim().length > 0);
          if (nonEmptyParts.length === parts.length) {
            score += 2;
          }
          
          // 如果字段数量合理（3-20个），加分
          if (parts.length >= 3 && parts.length <= 20) {
            score += 3;
          }
          
          // 第一行（标题行）的分隔符更重要
          if (lineIndex === 0) {
            score *= 2;
          }
          
          scores[delimiter] += score;
        }
      });
    });
    
    console.log('分隔符分数:', scores);
    
    // 选择分数最高的分隔符
    let bestDelimiter = ',';
    let maxScore = 0;
    
    Object.entries(scores).forEach(([delimiter, score]) => {
      if (score > maxScore) {
        maxScore = score;
        bestDelimiter = delimiter;
      }
    });
    
    // 如果所有分隔符都没有得分，默认使用逗号
    if (maxScore === 0) {
      console.log('没有检测到有效的分隔符，使用默认逗号');
      return ',';
    }
    
    console.log(`选择分隔符: ${bestDelimiter}, 分数: ${maxScore}`);
    return bestDelimiter;
  }

  // 从内容中检测数据源类型
  private detectProviderFromContent(content: string): string {
    const contentLower = content.toLowerCase();
    
    // 支付宝检测
    if (contentLower.includes('支付宝') || contentLower.includes('交易时间')) {
      return 'alipay';
    }
    
    // 微信检测
    if (contentLower.includes('微信支付') || contentLower.includes('微信昵称')) {
      return 'wechat';
    }
    
    // 京东检测
    if (contentLower.includes('京东') || contentLower.includes('京东账号名')) {
      return 'jd';
    }
    
    // 工商银行检测
    if (contentLower.includes('明细查询文件下载') || contentLower.includes('交易日期')) {
      return 'icbc';
    }
    
    // 火币检测
    if (contentLower.includes('时间') && contentLower.includes('交易类型') && contentLower.includes('交易对')) {
      return 'huobi';
    }
    
    // 招商银行检测
    if (contentLower.includes('招商银行') || contentLower.includes('招商')) {
      return 'cmb';
    }
    
    // 建设银行检测
    if (contentLower.includes('建设银行') || contentLower.includes('建设')) {
      return 'ccb';
    }
    
    // 中信银行检测
    if (contentLower.includes('中信银行') || contentLower.includes('中信')) {
      return 'citic';
    }
    
    // 汇丰香港检测
    if (contentLower.includes('汇丰银行') || contentLower.includes('hsbc')) {
      return 'hsbchk';
    }
    
    return 'unknown';
  }

  // 根据数据源类型预处理内容
  private preprocessContent(content: string, provider: string, dataSource?: DataSource): string {
    const lines = content.split('\n');
    
    // 如果提供了数据源配置且有skipLines设置，优先使用配置
    if (dataSource && dataSource.skipLines !== undefined) {
      const processedLines = lines.slice(dataSource.skipLines);
      // 确保处理后的内容不为空
      if (processedLines.length === 0) {
        return content; // 如果处理后为空，返回原始内容
      }
      return processedLines.join('\n');
    }
    
    // 否则使用原有的基于关键词的预处理逻辑
    switch (provider) {
      case 'alipay':
        return this.preprocessAlipayContent(lines);
      case 'wechat':
        return this.preprocessWechatContent(lines);
      case 'jd':
        return this.preprocessJDContent(lines);
      case 'icbc':
        return this.preprocessICBCContent(lines);
      case 'huobi':
        return this.preprocessHuobiContent(lines);
      default:
        return content; // 未知数据源，返回原始内容
    }
  }

  // 支付宝内容预处理
  private preprocessAlipayContent(lines: string[]): string {
    // 支付宝文件结构：
    // 1-25行：说明信息
    // 第26行：分隔线
    // 第27行：标题行
    // 第28行开始：数据行
    
    let startIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 查找包含"交易时间"的行
      if (line.includes('交易时间') && line.includes(',')) {
        startIndex = i;
        break;
      }
    }
    
    return lines.slice(startIndex).join('\n');
  }

  // 微信内容预处理
  private preprocessWechatContent(lines: string[]): string {
    // 微信文件结构：
    // 1-18行：说明信息
    // 第19行：分隔线
    // 第20行：标题行
    // 第21行开始：数据行
    
    let startIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 查找包含"交易时间"的行
      if (line.includes('交易时间') && line.includes(',')) {
        startIndex = i;
        break;
      }
    }
    
    return lines.slice(startIndex).join('\n');
  }

  // 京东内容预处理
  private preprocessJDContent(lines: string[]): string {
    // 京东文件结构：
    // 1-22行：说明信息
    // 第23行：标题行
    // 第24行开始：数据行
    
    let startIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 查找包含"交易时间"的行
      if (line.includes('交易时间') && line.includes(',')) {
        startIndex = i;
        break;
      }
    }
    
    return lines.slice(startIndex).join('\n');
  }

  // 工商银行内容预处理
  private preprocessICBCContent(lines: string[]): string {
    // 工商银行文件结构：
    // 1-7行：说明信息
    // 第8行：标题行
    // 第9行开始：数据行
    
    let startIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 查找包含"交易日期"的行
      if (line.includes('交易日期') && line.includes(',')) {
        startIndex = i;
        break;
      }
    }
    
    return lines.slice(startIndex).join('\n');
  }

  // 火币内容预处理
  private preprocessHuobiContent(lines: string[]): string {
    // 火币文件结构：
    // 第1行：标题行
    // 第2行开始：数据行
    // 火币文件比较简单，直接从第一行开始
    
    return lines.join('\n');
  }

  private isHeaderRow(row: string[]): boolean {
    if (!row || row.length === 0) return false;
    
    const headerKeywords = [
      '交易时间', '交易日期', '时间', '日期', 'date', 'time',
      '金额', '收/支', '收入', '支出', 'amount', 'money',
      '描述', '摘要', '商品', '说明', 'description', 'remark',
      '对方', '交易对方', '商户', '账户', 'payee', 'merchant',
      '状态', '交易状态', '方式', '支付方式', 'status', 'method',
      '分类', 'category', '类型', 'type'
    ];
    
    const rowText = row.join(' ').toLowerCase();
    const matchCount = headerKeywords.filter(keyword => 
      rowText.includes(keyword.toLowerCase())
    ).length;
    
    // 检查是否包含数字（标题行通常不包含数字）
    const hasNumbers = /\d/.test(rowText);
    
    // 检查字段数量（标题行通常有合理的字段数量）
    const reasonableFieldCount = row.length >= 3 && row.length <= 20;
    
    // 检查是否包含特殊字符（标题行通常不包含特殊字符）
    const hasSpecialChars = /[^\w\s\u4e00-\u9fff,，;；]/.test(rowText);
    
    // 综合判断：至少包含2个关键词，字段数量合理，不包含数字或特殊字符
    return matchCount >= 2 && reasonableFieldCount && !hasNumbers && !hasSpecialChars;
  }

  private async parseExcel(file: File, dataSource?: DataSource): Promise<FileData> {
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
          
          // 将Excel数据转换为文本内容以进行数据源检测
          const content = jsonData.map(row => (row as any[]).join(',')).join('\n');
          const detectedProvider = this.detectProviderFromContent(content);
          
          // 如果提供了数据源配置且有skipLines设置，跳过指定行数
          let startRowIndex = 0;
          if (dataSource && dataSource.skipLines !== undefined) {
            startRowIndex = dataSource.skipLines;
          } else {
            // 否则查找标题行
            for (let i = 0; i < Math.min(10, jsonData.length); i++) {
              const row = jsonData[i] as string[];
              if (this.isHeaderRow(row)) {
                startRowIndex = i;
                break;
              }
            }
          }
          
          const headers = (jsonData[startRowIndex] as string[]).map(h => String(h || '').trim());
          const rows = jsonData.slice(startRowIndex + 1) as any[][];
          
          resolve({
            headers,
            rows,
            provider: detectedProvider
          });
        } catch (error) {
          reject(new Error(`Excel解析失败: ${error}`));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  }

  private async parseText(file: File, dataSource?: DataSource): Promise<FileData> {
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
          
          // 检测数据源类型
          const detectedProvider = this.detectProviderFromContent(content);
          
          // 根据数据源类型预处理内容，使用配置的skipLines
          const processedContent = this.preprocessContent(content, detectedProvider, dataSource);
          const processedLines = processedContent.split('\n').filter(line => line.trim());
          
          // 尝试自动检测分隔符
          const firstLine = processedLines[0];
          let delimiter = '\t';
          if (firstLine.includes(',')) delimiter = ',';
          else if (firstLine.includes(';')) delimiter = ';';
          else if (firstLine.includes('\t')) delimiter = '\t';
          
          // 如果提供了数据源配置且有skipLines设置，跳过指定行数
          let headerRowIndex = 0;
          if (dataSource && dataSource.skipLines !== undefined) {
            headerRowIndex = 0; // 预处理后第一行就是标题行
          } else {
            // 否则查找标题行
            for (let i = 0; i < Math.min(10, processedLines.length); i++) {
              const row = processedLines[i].split(delimiter).map(cell => cell.trim());
              if (this.isHeaderRow(row)) {
                headerRowIndex = i;
                break;
              }
            }
          }
          
          const headers = processedLines[headerRowIndex].split(delimiter).map(h => h.trim());
          const rows = processedLines.slice(headerRowIndex + 1).map(line => 
            line.split(delimiter).map(cell => cell.trim())
          );
          
          resolve({
            headers,
            rows,
            content,
            provider: detectedProvider
          });
        } catch (error) {
          reject(new Error(`文本文件解析失败: ${error}`));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
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