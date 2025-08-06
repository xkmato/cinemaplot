import { FountainParser, IToken } from 'screenplay-js';
import { ScreenplayElement, ScreenplayPage } from './types';

export interface ProcessedScreenplay {
  pages: ScreenplayPage[]; // Array of structured page data
  totalPageCount: number;
}

/**
 * Helper function to parse Fountain tokens into our ScreenplayElement format
 */
function parseFountainTokens(tokens: IToken[], elements: ScreenplayElement[]): void {
  tokens.forEach((token, index) => {
    if (token.text && token.text.trim()) {
      elements.push({
        id: `element-${index}`,
        type: mapFountainTokenType(token.type || 'action'),
        text: token.text.trim(),
        lineNumber: index + 1,
        startIndex: 0, // Will be calculated properly in full implementation
        endIndex: token.text.length
      });
    }
  });
}

/**
 * Map Fountain token types to our screenplay element types
 */
function mapFountainTokenType(fountainType: string): ScreenplayElement['type'] {
  if (!fountainType) return 'general';
  
  const type = fountainType.toLowerCase();
  
  switch (type) {
    case 'scene_heading':
    case 'scene heading':
    case 'slug_line':
    case 'slugline':
      return 'scene_heading';
    case 'action':
    case 'description':
      return 'action';
    case 'character':
    case 'character_name':
      return 'character';
    case 'dialogue':
    case 'dialog':
      return 'dialogue';
    case 'parenthetical':
    case 'paren':
      return 'parenthetical';
    case 'transition':
      return 'transition';
    default:
      return 'general';
  }
}

/**
 * Calculate the approximate line count for a screenplay element
 */
function calculateElementLines(element: ScreenplayElement): number {
  const text = element.text;
  const lineLength = getLineLength(element.type);
  
  // Handle empty or whitespace-only text
  if (!text || !text.trim()) {
    return 1;
  }
  
  // Split by actual line breaks first
  const lines = text.split('\n');
  let totalLines = 0;
  
  lines.forEach(line => {
    if (line.trim()) {
      // Calculate how many lines this text would take based on character limit
      const wrappedLines = Math.ceil(line.length / lineLength) || 1;
      totalLines += wrappedLines;
    } else {
      totalLines += 1; // Empty line
    }
  });
  
  // Add spacing based on element type
  switch (element.type) {
    case 'scene_heading':
      totalLines += 2; // Extra space after scene headings
      break;
    case 'character':
      totalLines += 0.5; // Small space before character name
      break;
    case 'action':
      totalLines += 1; // Space after action blocks
      break;
    case 'transition':
      totalLines += 2; // Extra space around transitions
      break;
  }
  
  return Math.max(1, Math.ceil(totalLines));
}

/**
 * Get the appropriate line length for different element types
 */
function getLineLength(elementType: ScreenplayElement['type']): number {
  switch (elementType) {
    case 'dialogue':
      return 50; // Increased from 35 to match wider dialogue margins
    case 'parenthetical':
      return 30; // Slightly increased from 25
    case 'character':
      return 25; // Increased from 20
    case 'scene_heading':
    case 'action':
    case 'transition':
    default:
      return 60; // Standard screenplay line length
  }
}

/**
 * Smart pagination that respects screenplay formatting rules
 */
function paginateElements(elements: ScreenplayElement[]): ScreenplayPage[] {
  const pages: ScreenplayPage[] = [];
  const LINES_PER_PAGE = 55; // Standard screenplay page has ~55-58 lines
  const MIN_LINES_FOR_NEW_SCENE = 8; // Don't orphan scenes at bottom of page
  
  let currentPage: ScreenplayElement[] = [];
  let currentPageLines = 0;
  let pageNumber = 1;
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const elementLines = calculateElementLines(element);
    const nextElement = elements[i + 1];
    
    // Check if we should start a new page
    const shouldBreakPage = 
      // Page is getting full
      (currentPageLines + elementLines > LINES_PER_PAGE) ||
      // Don't split scenes across pages - if next element is a scene heading and we're near the bottom
      (nextElement?.type === 'scene_heading' && currentPageLines + elementLines + MIN_LINES_FOR_NEW_SCENE > LINES_PER_PAGE) ||
      // Don't split character/dialogue pairs
      (element.type === 'character' && currentPageLines + elementLines + 3 > LINES_PER_PAGE);
    
    if (shouldBreakPage && currentPage.length > 0) {
      // Save current page
      pages.push({
        pageNumber,
        content: currentPage
      });
      
      // Start new page
      currentPage = [];
      currentPageLines = 0;
      pageNumber++;
    }
    
    // Add element to current page
    currentPage.push(element);
    currentPageLines += elementLines;
  }
  
  // Add the last page if it has content
  if (currentPage.length > 0) {
    pages.push({
      pageNumber,
      content: currentPage
    });
  }
  
  // Ensure we have at least one page
  if (pages.length === 0) {
    pages.push({
      pageNumber: 1,
      content: []
    });
  }
  
  return pages;
}

/**
 * Process Fountain (.fountain) files into structured screenplay data
 * Replaces the previous PDF processing functionality
 */
export const processScreenplayFountain = async (fileContent: string): Promise<{ elements: ScreenplayElement[], pages: ScreenplayPage[] }> => {
  try {
    // Parse fountain content using screenplay-js
    const script = FountainParser.parse(fileContent, {
      tokens: true,
      paginate: false, // We'll do our own pagination
      script_html: false,
      script_html_array: false,
      lines_per_page: 'normal'
    });

    // Convert tokens to our ScreenplayElement format
    const elements: ScreenplayElement[] = [];
    if (script.tokens) {
      parseFountainTokens(script.tokens, elements);
    }

    // Use smart pagination to create properly formatted pages
    const pages = paginateElements(elements);

    return { elements, pages };
  } catch (error) {
    console.error('Error processing Fountain screenplay:', error);
    throw new Error('Failed to process Fountain file');
  }
};

/**
 * Highlight and comment on a specific range of text
 * Updated to work with processed screenplay pages instead of raw text pages
 */
export function highlightAndComment(
  pages: ScreenplayPage[],
  pageNumber: number,
  elementId: string,
  comment: string
): { highlightedText: string; comment: string } {
  const page = pages[pageNumber - 1];
  if (!page) throw new Error('Page not found');

  const element = page.content.find(el => el.id === elementId);
  if (!element) throw new Error('Element not found');

  return { highlightedText: element.text, comment };
}
