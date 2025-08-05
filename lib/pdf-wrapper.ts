/**
 * PDF processing wrapper to avoid pdf-parse test file issues
 */

type PDFParseFunction = (buffer: Buffer) => Promise<{ text: string; numpages: number }>;

let pdfParseModule: PDFParseFunction | null = null;

export async function initializePDFParser(): Promise<PDFParseFunction | null> {
  // pdf-parse is a server-side only dependency.
  if (typeof window !== 'undefined') {
    return null;
  }

  if (pdfParseModule) {
    return pdfParseModule;
  }

  try {
    // Change working directory temporarily to avoid test file issues
    const originalCwd = process.cwd();
    
    try {
      // Change to a safe directory
      process.chdir('/tmp');
      
      // Now try to import pdf-parse
      const pdfParseImport = await import('pdf-parse');
      pdfParseModule = pdfParseImport.default || pdfParseImport;
    } finally {
      // Always restore the original working directory
      process.chdir(originalCwd);
    }
    
    return pdfParseModule;
  } catch (error) {
    console.error('Failed to initialize PDF parser:', error);
    throw new Error('PDF parsing library not available');
  }
}

export async function parsePDF(buffer: Buffer): Promise<{ text: string; numpages: number }> {
  const pdfParse = await initializePDFParser();
  
  if (!pdfParse) {
    throw new Error('PDF parsing is not supported in this environment.');
  }

  try {
    const result = await pdfParse(buffer);
    return {
      text: result.text || '',
      numpages: result.numpages || 1
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
