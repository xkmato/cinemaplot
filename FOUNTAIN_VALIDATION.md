# Fountain File Validation System

## Overview

The screenplay upload system now includes comprehensive validation to ensure only proper Fountain (.fountain) files are accepted. This helps maintain content quality and prevents users from uploading incompatible file formats.

## Validation Features

### 1. File Extension Validation

- Only `.fountain` files are accepted
- Rejects other formats like `.txt`, `.pdf`, `.fdx`, etc.

### 2. File Size Validation

- Maximum file size: 10MB
- Prevents large file uploads that could impact performance

### 3. Content Format Validation

- **Scene Headings**: Checks for proper scene headings like:

  - `INT. LOCATION - DAY`
  - `EXT. LOCATION - NIGHT`
  - `FADE IN:`, `FADE OUT:`, `CUT TO:`, etc.

- **Character Names**: Validates proper character name formatting:

  - All caps format (e.g., `SARAH`, `JOHN`)
  - Standalone lines
  - Reasonable length (1-50 characters)

- **Action Lines**: Identifies descriptive text with mixed case

- **Parentheticals**: Recognizes dialogue directions like `(whispers)`, `(V.O.)`

### 4. Binary Content Detection

- Rejects files containing binary data
- Detects and rejects other file formats disguised as .fountain:
  - PDF files (`%PDF`)
  - FDX files (`<FinalDraft>`, `<?xml`)
  - ZIP files (`PK`)

### 5. Empty File Detection

- Rejects empty or whitespace-only files

## Usage

The validation function is available in `/lib/helpers.ts`:

```typescript
import { validateFountainFile } from "@/lib/helpers";

const validation = await validateFountainFile(file);
if (!validation.isValid) {
  console.error(validation.error);
}
```

## User Experience

- **Loading States**: Shows "Validating file format..." during validation
- **Clear Error Messages**: Provides specific feedback about what's wrong
- **Educational Content**: Includes examples and links to Fountain documentation
- **File Input Restrictions**: Browser-level filtering to `.fountain` files only

## Example Valid Fountain File Structure

```fountain
FADE IN:

INT. COFFEE SHOP - DAY

A busy coffee shop filled with morning customers.

SARAH
Can I get a large coffee, please?

BARISTA
Coming right up!

FADE OUT.
```

## Error Messages

The system provides specific error messages:

- "Only Fountain (.fountain) files are allowed for screenplays"
- "File size must be less than 10MB"
- "The Fountain file appears to be empty"
- "Missing scene headings. Fountain screenplays should start with scene headings like 'INT. LOCATION - DAY'"
- "This appears to be a different file format (PDF, FDX, etc.). Please convert your screenplay to Fountain format first."

## Testing

Sample files for testing are available in `/test/`:

- `sample-valid.fountain` - Valid Fountain format
- `sample-invalid.txt` - Invalid format for testing

## Future Enhancements

Potential improvements could include:

- More sophisticated Fountain syntax validation
- Character name consistency checking
- Scene numbering validation
- Integration with screenplay parsing libraries
- Automatic format detection and conversion suggestions
