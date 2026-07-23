import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkRateLimit } from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should allow first request', () => {
    expect(checkRateLimit('user1', 2, 1000)).toBe(true)
  })

  it('should block after reaching max requests', () => {
    const id = 'user2'
    expect(checkRateLimit(id, 2, 1000)).toBe(true)
    expect(checkRateLimit(id, 2, 1000)).toBe(true)
    expect(checkRateLimit(id, 2, 1000)).toBe(false)
  })

  it('should reset after window time passes', () => {
    const id = 'user3'
    expect(checkRateLimit(id, 1, 1000)).toBe(true)
    expect(checkRateLimit(id, 1, 1000)).toBe(false)
    
    vi.advanceTimersByTime(1001)
    
    expect(checkRateLimit(id, 1, 1000)).toBe(true)
  })
})
