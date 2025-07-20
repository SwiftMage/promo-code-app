# Test Suite

This directory contains comprehensive tests for the promo code application.

## Test Structure

### API Tests (`/api/`)
- `campaigns.test.ts` - Campaign creation and validation
- `claim.test.ts` - Code claiming logic and Reddit verification
- `admin-claim.test.ts` - Admin code claiming functionality

### Component Tests (`/components/`)
- `ClaimPage.test.tsx` - Claim page UI and user interactions

### Library Tests (`/lib/`)
- `reddit.test.ts` - Reddit verification and content fetching

### Utility Tests (`/utils/`)
- `utils.test.ts` - IP extraction and utility functions

### Integration Tests (`/integration/`)
- `full-flow.test.ts` - End-to-end workflow testing

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The test suite covers:
- ✅ Campaign creation and validation
- ✅ Code claiming with reCAPTCHA verification
- ✅ Reddit username verification
- ✅ Admin code claiming
- ✅ Bypass link functionality
- ✅ Error handling and edge cases
- ✅ UI component interactions
- ✅ Full end-to-end workflows

## Mocking Strategy

Tests use comprehensive mocking for:
- Supabase database operations
- External API calls (Reddit, reCAPTCHA)
- Browser APIs (clipboard, localStorage)
- Next.js navigation hooks