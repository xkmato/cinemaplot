import pdfParse from 'pdf-parse';
import { ScreenplayElement, ScreenplayPage } from './types';

export interface ProcessedScreenplay {
  pages: ScreenplayPage[]; // Array of structured page data
  totalPageCount: number;
}

/**
 * Convert raw text into screenplay elements with basic formatting
 */
function parseScreenplayText(text: string, pageNumber: number): ScreenplayElement[] {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const elements: ScreenplayElement[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    let elementType: ScreenplayElement['type'] = 'general';
    
    // Basic screenplay format detection
    if (trimmedLine.toUpperCase() === trimmedLine && trimmedLine.includes('INT.') || trimmedLine.includes('EXT.')) {
      elementType = 'scene_heading';
    } else if (trimmedLine.toUpperCase() === trimmedLine && trimmedLine.length < 50 && !trimmedLine.includes('.')) {
      elementType = 'character';
    } else if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
      elementType = 'parenthetical';
    } else if (trimmedLine.toUpperCase() === trimmedLine && (trimmedLine.includes('CUT TO:') || trimmedLine.includes('FADE'))) {
      elementType = 'transition';
    } else if (index > 0 && elements[index - 1]?.type === 'character') {
      elementType = 'dialogue';
    } else {
      elementType = 'action';
    }
    
    elements.push({
      id: `page-${pageNumber}-element-${index}`,
      type: elementType,
      text: trimmedLine,
      lineNumber: index + 1,
      startIndex: 0, // Would need more sophisticated calculation for exact positions
      endIndex: trimmedLine.length
    });
  });
  
  return elements;
}

/**
 * Extract text from individual PDF pages using pdf-lib for better page consistency
 */
async function extractPagesWithPdfLib(pdfBuffer: Buffer): Promise<string[]> {
  try {
    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    const pages: string[] = [];
    
    console.log(`PDF has ${pageCount} pages, extracting each page individually...`);
    
    // Extract each page individually
    for (let i = 0; i < pageCount; i++) {
      try {
        // Create a new PDF with just this page
        const singlePagePdf = await PDFDocument.create();
        const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [i]);
        singlePagePdf.addPage(copiedPage);
        
        // Convert back to buffer and extract text
        const singlePageBuffer = Buffer.from(await singlePagePdf.save());
        const pageData = await pdfParse(singlePageBuffer);
        
        if (pageData.text && pageData.text.trim()) {
          pages.push(pageData.text.trim());
        } else {
          // If no text extracted, add empty page placeholder
          pages.push(`[Page ${i + 1} - No text content]`);
        }
      } catch (pageError) {
        console.warn(`Error extracting page ${i + 1}:`, pageError);
        pages.push(`[Page ${i + 1} - Extraction failed]`);
      }
    }
    
    return pages;
  } catch (error) {
    console.warn('pdf-lib extraction failed, falling back to pdf-parse:', error);
    throw error;
  }
}

/**
 * Split PDF into pages and structure content
 * Preserves original PDF page structure
 */
export async function processScreenplayPDF(pdfBuffer: Buffer): Promise<ProcessedScreenplay> {
  try {
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Invalid PDF buffer: The buffer is empty or undefined.');
    }

    let rawPages: string[] = [];
    
    // First try to extract pages individually using pdf-lib for maximum accuracy
    try {
      rawPages = await extractPagesWithPdfLib(pdfBuffer);
      console.log(`Successfully extracted ${rawPages.length} pages using pdf-lib.`);
    } catch {
      console.log('pdf-lib extraction failed, falling back to pdf-parse method...');
      
      // Fallback to original pdf-parse method
      const data = await pdfParse(pdfBuffer);

      if (!data.text || data.text.trim().length === 0) {
        throw new Error('Failed to extract text from PDF: The PDF might be corrupted or empty.');
      }

      // First, try to split by form feed characters (\f) which indicate page breaks
      rawPages = data.text.split('\f').filter(page => page.trim().length > 0);
      
      // If we only get one page but the PDF has multiple pages (according to numpages),
      // try alternative page splitting methods
      if (rawPages.length === 1 && data.numpages > 1) {
        console.log(`PDF has ${data.numpages} pages but form feed split only found 1 page. Trying alternative methods.`);
        
        // Try splitting by common page indicators
        const pageIndicators = [
          /\n\s*\d+\s*\n/g, // Page numbers on their own line
          /\n\s*Page \d+\s*\n/gi, // "Page X" format
          /\n\s*-\s*\d+\s*-\s*\n/g, // "-X-" format
        ];
        
        for (const indicator of pageIndicators) {
          const testSplit = data.text.split(indicator);
          if (testSplit.length > 1 && testSplit.length <= data.numpages * 2) { // Allow some flexibility
            rawPages = testSplit.filter(page => page.trim().length > 0);
            console.log(`Successfully split into ${rawPages.length} pages using page indicator.`);
            break;
          }
        }
        
        // If still only one page, estimate page breaks by content length
        if (rawPages.length === 1) {
          const avgCharsPerPage = Math.floor(data.text.length / data.numpages);
          const estimatedPages: string[] = [];
          
          const lines = data.text.split('\n');
          let currentPage = '';
          let currentLength = 0;
          
          for (const line of lines) {
            currentPage += line + '\n';
            currentLength += line.length;
            
            // If we've reached approximately one page worth of content, start a new page
            if (currentLength >= avgCharsPerPage && estimatedPages.length < data.numpages - 1) {
              if (currentPage.trim()) {
                estimatedPages.push(currentPage.trim());
              }
              currentPage = '';
              currentLength = 0;
            }
          }
          
          // Add the last page
          if (currentPage.trim()) {
            estimatedPages.push(currentPage.trim());
          }
          
          if (estimatedPages.length > 1) {
            rawPages = estimatedPages;
            console.log(`Estimated ${rawPages.length} pages based on content length.`);
          }
        }
      }
      
      console.log(`Processing ${rawPages.length} pages from PDF using pdf-parse fallback.`);
    }
    
    // Ensure we have at least one page
    if (rawPages.length === 0) {
      throw new Error('No content could be extracted from the PDF.');
    }
    
    const pages: ScreenplayPage[] = rawPages.map((pageText, index) => ({
      pageNumber: index + 1,
      content: parseScreenplayText(pageText, index + 1)
    }));

    return {
      pages,
      totalPageCount: pages.length
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error(`Failed to process screenplay PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Highlight and comment on a specific range of text
 */
export function highlightAndComment(
  pages: string[],
  pageNumber: number,
  startIndex: number,
  endIndex: number,
  comment: string
): { highlightedText: string; comment: string } {
  const page = pages[pageNumber - 1];
  if (!page) throw new Error('Page not found');

  const highlightedText = page.substring(startIndex, endIndex);
  return { highlightedText, comment };
}
