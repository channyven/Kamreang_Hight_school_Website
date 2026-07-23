import { describe, it, expect } from 'vitest'
import { contactSchema, statisticsSchema, newsSchema } from '@/schemas/validations'

describe('contactSchema', () => {
  const validData = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Inquiry',
    message: 'Hello, I have a question about the school.',
    website: '' // Honeypot empty
  }

  it('should validate correct data', () => {
    const result = contactSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should fail if honeypot is filled', () => {
    const result = contactSchema.safeParse({ ...validData, website: 'http://spam.com' })
    expect(result.success).toBe(false)
  })

  it('should validate phone number correctly', () => {
    // Optional/Empty is fine
    expect(contactSchema.safeParse({ ...validData, phone: '' }).success).toBe(true)
    // Too short
    expect(contactSchema.safeParse({ ...validData, phone: '123' }).success).toBe(false)
    // Valid
    expect(contactSchema.safeParse({ ...validData, phone: '012345678' }).success).toBe(true)
  })

  it('should fail on invalid email', () => {
    const result = contactSchema.safeParse({ ...validData, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })
})

describe('statisticsSchema', () => {
  it('should validate academic year format', () => {
    expect(statisticsSchema.safeParse({ academic_year: '2023-2024' }).success).toBe(true)
    expect(statisticsSchema.safeParse({ academic_year: '2023/2024' }).success).toBe(false)
  })
})

describe('newsSchema', () => {
  it('should validate slug format', () => {
    const base = {
      title_km: 'សួស្តី',
      title_en: 'Hello',
      status: 'published'
    }
    expect(newsSchema.safeParse({ ...base, slug: 'valid-slug-123' }).success).toBe(true)
    expect(newsSchema.safeParse({ ...base, slug: 'Invalid Slug' }).success).toBe(false)
  })
})
