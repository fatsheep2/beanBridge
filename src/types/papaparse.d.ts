declare module 'papaparse' {
  export interface ParseResult<T = any> {
    data: T[];
    errors: ParseError[];
    meta: ParseMeta;
  }

  export interface ParseError {
    type: string;
    code: string;
    message: string;
    row: number;
  }

  export interface ParseMeta {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
  }

  export interface ParseConfig {
    delimiter?: string;
    header?: boolean;
    skipEmptyLines?: boolean | 'greedy';
    complete?: (results: ParseResult) => void;
    error?: (error: ParseError) => void;
  }

  export function parse(input: string | File, config?: ParseConfig): ParseResult;
} 