declare module 'screenplay-js' {
  export interface IToken {
    type?: string;
    text?: string;
    scene_number?: number;
    depth?: number;
  }

  export interface IScriptPage {
    _id: string;
    html: string;
  }

  interface IParserOptions {
    paginate: boolean;
    lines_per_page: 'none' | 'loose' | 'normal' | 'tight' | 'very_tight';
    script_html: boolean;
    script_html_array: boolean;
    notes: boolean;
    draft_date: boolean;
    boneyard: boolean;
    tokens: boolean;
  }

  interface IScriptJSON {
    title: string;
    credit: string;
    authors: string[];
    source: string;
    notes?: string;
    draft_date?: string;
    date: string;
    contact: string;
    copyright: string;
    scenes: string[];
    title_page_html: string;
    script_html?: string;
    script_pages: IScriptPage[];
    script_pages_html: string[][];
    script_html_array?: string[];
    tokens?: IToken[];
  }

  // FountainParser is a singleton instance with parse method
  interface FountainParserInstance {
    parse(script: string, options?: Partial<IParserOptions>): IScriptJSON;
    paginate(script_html: string[], lpp?: string): {
      pages: unknown;
      pages_html: unknown;
    };
    lexer(s: string): string | undefined | null;
  }

  // Export the singleton instance
  export const FountainParser: FountainParserInstance;
}
