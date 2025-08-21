import { validateFountainFile } from '@/lib/helpers'

// Helper function to create mock File objects
const createMockFile = (content: string, name = 'test.fountain'): File => {
  const mockFile = new File([content], name, { type: 'text/plain' })
  
  // Mock the text() method that's missing in Jest environment
  Object.defineProperty(mockFile, 'text', {
    value: jest.fn().mockResolvedValue(content),
    writable: false,
  })
  
  return mockFile
}

describe('validateFountainFile', () => {
  it('should validate a proper Fountain file with scene headings and dialogue', async () => {
    const validFountain = `
FADE IN:

INT. COFFEE SHOP - DAY

A bustling coffee shop filled with morning patrons.

SARAH
(nervously checking her phone)
I can't believe I'm late for the interview.

BARISTA
(calling out)
Large latte for Sarah!

SARAH approaches the counter.

SARAH
That's me. Thank you.

She takes her coffee and hurries toward the exit.

EXT. OFFICE BUILDING - CONTINUOUS

SARAH rushes up the steps, coffee in hand.

FADE OUT.
    `.trim()

    const file = createMockFile(validFountain)
    const result = await validateFountainFile(file)
    
    expect(result.isValid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should reject empty content', async () => {
    const file = createMockFile('')
    const result = await validateFountainFile(file)
    
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('empty')
  })

  it('should reject files without .fountain extension', async () => {
    const content = `
INT. COFFEE SHOP - DAY

SARAH
Hello there.
    `.trim()

    const file = createMockFile(content, 'test.txt')
    const result = await validateFountainFile(file)
    
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Fountain (.fountain) files')
  })

  it('should reject files without scene headings', async () => {
    const invalidFountain = `
SARAH
Hello, how are you?

JOHN
I'm fine, thank you.
    `.trim()

    const file = createMockFile(invalidFountain)
    const result = await validateFountainFile(file)
    
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('scene headings')
  })

  it('should validate files with proper scene headings', async () => {
    const validFountain = `
INT. BEDROOM - NIGHT

SARAH tosses and turns in bed.

SARAH
(mumbling)
Tomorrow's the big day.

EXT. PARK - DAY

The sun rises over a peaceful park.
    `.trim()

    const file = createMockFile(validFountain)
    const result = await validateFountainFile(file)
    
    expect(result.isValid).toBe(true)
  })

  it('should accept various scene heading formats', async () => {
    const formats = [
      'INT. COFFEE SHOP - DAY',
      'EXT. PARK - NIGHT', 
      'INT./EXT. CAR - MOVING - DAY',
    ]

    for (const heading of formats) {
      const fountain = `
${heading}

SARAH walks into the scene.

SARAH
This should work.
      `.trim()

      const file = createMockFile(fountain)
      const result = await validateFountainFile(file)
      expect(result.isValid).toBe(true)
    }
    
    // Test transition formats separately since they have different validation logic
    const transitions = ['FADE IN:', 'FADE OUT.']
    
    for (const transition of transitions) {
      const fountain = `
${transition}

INT. COFFEE SHOP - DAY

SARAH walks into the scene.

SARAH
This should work.
      `.trim()

      const file = createMockFile(fountain)
      const result = await validateFountainFile(file)
      expect(result.isValid).toBe(true)
    }
  })

  it('should reject files that are clearly not screenplays', async () => {
    const notAScreenplay = `
This is just a regular text document.
It doesn't have any screenplay formatting.
No scene headings, no character names in caps.
Just regular prose text.
    `.trim()

    const file = createMockFile(notAScreenplay)
    const result = await validateFountainFile(file)
    
    expect(result.isValid).toBe(false)
  })

  it('should handle files with mixed content', async () => {
    const mixedContent = `
INT. LIVING ROOM - DAY

A cozy living room with family photos on the mantle.

MOTHER
(calling from kitchen)
Dinner's ready!

The family gathers around the table.

FATHER
How was school today?

SON
It was great! We had a science experiment.
    `.trim()

    const file = createMockFile(mixedContent)
    const result = await validateFountainFile(file)
    
    expect(result.isValid).toBe(true)
  })

  it('should validate files with only scene headings and action', async () => {
    const actionOnly = `
EXT. MOUNTAIN PEAK - DAWN

The sun breaks over the horizon, casting long shadows across the valley below.

A lone figure stands at the edge, silhouetted against the brightening sky.

INT. BASE CAMP - CONTINUOUS

Equipment scattered around a small tent.
    `.trim()

    const file = createMockFile(actionOnly)
    const result = await validateFountainFile(file)
    
    expect(result.isValid).toBe(true)
  })

  it('should handle parentheticals correctly', async () => {
    const withParentheticals = `
INT. RESTAURANT - NIGHT

SARAH sits across from JOHN at a candlelit table.

SARAH
(whispering)
I have something important to tell you.

JOHN
(leaning in)
What is it?

SARAH
(hesitating)
I... I'm moving to Paris.
    `.trim()

    const file = createMockFile(withParentheticals)
    const result = await validateFountainFile(file)
    
    expect(result.isValid).toBe(true)
  })

  it('should reject files larger than 10MB', async () => {
    // Create a large string (simulate large file)
    const largeContent = 'A'.repeat(11 * 1024 * 1024) // 11MB of 'A' characters
    const file = createMockFile(largeContent)
    
    const result = await validateFountainFile(file)
    
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('10MB')
  })

  it('should handle binary content rejection', async () => {
    const binaryContent = 'INT. COFFEE SHOP - DAY\n\nSARAH\nHello\x00world'
    const file = createMockFile(binaryContent)
    
    const result = await validateFountainFile(file)
    
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('binary data')
  })
})
