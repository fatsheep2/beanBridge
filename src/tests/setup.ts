// 测试环境设置文件
import { vi } from 'vitest';

// 模拟FileReader
(global as any).FileReader = class MockFileReader {
    static EMPTY = 0;
    static LOADING = 1;
    static DONE = 2;

    readAsText = vi.fn();
    readAsArrayBuffer = vi.fn();
    result = '';
    onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    readyState = 0;
    error: DOMException | null = null;
};

// 模拟Blob
(global as any).Blob = class MockBlob {
    size: number;
    type: string;

    constructor(content: any[] = [], options: any = {}) {
        this.size = content ? content.length : 0;
        this.type = options?.type || '';
    }

    arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(0));
    text = vi.fn().mockResolvedValue('');
    stream = vi.fn();
    slice = vi.fn();
};

// 模拟URL.createObjectURL
global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');

// 模拟URL.revokeObjectURL
global.URL.revokeObjectURL = vi.fn(); 