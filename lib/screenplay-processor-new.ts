import { FountainParser, IScriptPage, IToken } from 'screenplay-js';
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
 * Process Fountain (.fountain) files into structured screenplay data
 * Replaces the previous PDF processing functionality
 */
export const processScreenplayFountain = async (fileContent: string): Promise<{ elements: ScreenplayElement[], pages: ScreenplayPage[] }> => {
  try {
    // Parse fountain content using screenplay-js
    const script = FountainParser.parse(fileContent, {
      tokens: true,
      paginate: true,
      script_html: false,
      script_html_array: false,
      lines_per_page: 'normal'
    });

    // Convert tokens to our ScreenplayElement format
    const elements: ScreenplayElement[] = [];
    if (script.tokens) {
      parseFountainTokens(script.tokens, elements);
    }

    // Create pages from script pages
    const pages: ScreenplayPage[] = script.script_pages.map((page: IScriptPage) => ({
      pageNumber: parseInt(page._id),
      content: [] // For now, we'll distribute elements across pages later
    }));

    // If we have pages but no elements distributed, put all elements in first page
    if (pages.length > 0 && elements.length > 0) {
      pages[0].content = elements;
    } else if (elements.length > 0) {
      // Create a single page if no pagination worked
      pages.push({
        pageNumber: 1,
        content: elements
      });
    }

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
