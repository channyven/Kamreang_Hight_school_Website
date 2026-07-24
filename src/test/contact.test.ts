import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitContactMessage } from '@/actions/contact'
import { checkRateLimit } from '@/lib/rate-limit'

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue('127.0.0.1')
  })
}))

// Mock rate limiter to avoid state issues between tests
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue(true)
}))

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  createServerClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null })
  })
}))

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue(true)
    })
  }
}))

describe('submitContactMessage', () => {
  const validData = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Test Subject',
    message: 'Test message content here.',
    website: ''
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return success for valid data', async () => {
    const result = await submitContactMessage(validData)
    expect(result.success).toBe(true)
  })

  it('should block spam content', async () => {
    const spamData = { ...validData, message: 'Check this out: http://spam.com' }
    const result = await submitContactMessage(spamData)
    expect(result.success).toBe(false)
    expect(result.error).toContain('prohibited content')
  })

  it('should return error if rate limit exceeded', async () => {
    vi.mocked(checkRateLimit).mockReturnValue(false)
    const result = await submitContactMessage(validData)
    expect(result.success).toBe(false)
    expect(result.error).toContain('Too many messages')
  })
})
