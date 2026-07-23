import { describe, it, expect } from 'vitest'
import { slugify, toKhmerNumeral, truncate, formatFileSize } from '@/utils'

describe('slugify', () => {
  it('should convert English text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
    expect(slugify('Testing 1 2 3')).toBe('testing-1-2-3')
  })

  it('should handle special characters', () => {
    expect(slugify('Hello @ World!')).toBe('hello-world')
  })

  it('should handle Khmer characters', () => {
    // ភាសាខ្មែរ -> ភាសាខ្មែរ
    expect(slugify('ភាសាខ្មែរ')).toBe('ភាសាខ្មែរ')
    expect(slugify('សាលារៀន របស់ខ្ញុំ')).toBe('សាលារៀន-របស់ខ្ញុំ')
  })

  it('should fallback to hash for empty results', () => {
    const result = slugify('!!!')
    expect(result).toMatch(/^post-/)
  })
})

describe('toKhmerNumeral', () => {
  it('should convert numbers to Khmer numerals', () => {
    expect(toKhmerNumeral(123)).toBe('១២៣')
    expect(toKhmerNumeral('456')).toBe('៤៥៦')
  })
})

describe('truncate', () => {
  it('should truncate text', () => {
    expect(truncate('Hello World', 5)).toBe('Hello…')
    expect(truncate('Short', 10)).toBe('Short')
  })
})

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(500)).toBe('500 B')
    expect(formatFileSize(1024)).toBe('1.0 KB')
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
  })
})
