import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-recaptcha-key'
process.env.RECAPTCHA_SECRET_KEY = 'test-recaptcha-secret'
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

// Mock fetch globally
global.fetch = jest.fn()

// Mock window.grecaptcha
Object.defineProperty(window, 'grecaptcha', {
  writable: true,
  value: {
    ready: jest.fn((callback) => callback()),
    execute: jest.fn(() => Promise.resolve('test-recaptcha-token')),
  },
})

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: jest.fn(() => Promise.resolve()),
  },
})

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'mock-object-url'),
})

// Mock URL.revokeObjectURL
Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
})