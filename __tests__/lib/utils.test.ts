import { cn, isFirebaseStorageUrl, shouldUseUnoptimized } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('should combine class names correctly', () => {
      const result = cn('bg-red-500', 'text-white', 'p-4')
      expect(result).toContain('bg-red-500')
      expect(result).toContain('text-white')
      expect(result).toContain('p-4')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
    })

    it('should handle falsy conditional classes', () => {
      const isActive = false
      const result = cn('base-class', isActive && 'active-class')
      expect(result).toContain('base-class')
      expect(result).not.toContain('active-class')
    })

    it('should merge conflicting Tailwind classes', () => {
      const result = cn('p-2', 'p-4') // p-4 should win
      expect(result).toBe('p-4')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['bg-blue-500', 'text-white'], 'p-4')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('text-white')
      expect(result).toContain('p-4')
    })

    it('should handle empty inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })
  })

  describe('isFirebaseStorageUrl', () => {
    it('should return true for Firebase Storage URLs', () => {
      const firebaseUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket-name/o/file.jpg'
      expect(isFirebaseStorageUrl(firebaseUrl)).toBe(true)
    })

    it('should return false for non-Firebase Storage URLs', () => {
      const regularUrl = 'https://example.com/image.jpg'
      expect(isFirebaseStorageUrl(regularUrl)).toBe(false)
    })

    it('should return false for YouTube URLs', () => {
      const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      expect(isFirebaseStorageUrl(youtubeUrl)).toBe(false)
    })

    it('should handle empty strings', () => {
      expect(isFirebaseStorageUrl('')).toBe(false)
    })

    it('should be case sensitive', () => {
      const caseVariantUrl = 'https://FIREBASESTORAGE.GOOGLEAPIS.COM/v0/b/bucket/o/file.jpg'
      expect(isFirebaseStorageUrl(caseVariantUrl)).toBe(false)
    })
  })

  describe('shouldUseUnoptimized', () => {
    const originalNodeEnv = process.env.NODE_ENV

    afterEach(() => {
      // Restore original NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalNodeEnv,
        writable: true,
        configurable: true,
      })
    })

    it('should return true for Firebase Storage URLs in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      })
      const firebaseUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/file.jpg'
      expect(shouldUseUnoptimized(firebaseUrl)).toBe(true)
    })

    it('should return false for Firebase Storage URLs in development', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      })
      const firebaseUrl = 'https://firebasestorage.googleapis.com/v0/b/bucket/o/file.jpg'
      expect(shouldUseUnoptimized(firebaseUrl)).toBe(false)
    })

    it('should return false for non-Firebase URLs regardless of environment', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      })
      const regularUrl = 'https://example.com/image.jpg'
      expect(shouldUseUnoptimized(regularUrl)).toBe(false)
    })

    it('should return false for non-Firebase URLs in development', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      })
      const regularUrl = 'https://example.com/image.jpg'
      expect(shouldUseUnoptimized(regularUrl)).toBe(false)
    })
  })
})
