import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSearchParams } from 'next/navigation'
import ClaimPage from '@/app/claim/[id]/page'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn()
}))

// Mock AdSense component
jest.mock('@/components/AdSense', () => {
  return function MockAdSense() {
    return <div data-testid="adsense">AdSense Component</div>
  }
})

const mockUseSearchParams = useSearchParams as jest.Mock

describe('ClaimPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    
    // Default search params mock (no bypass)
    mockUseSearchParams.mockReturnValue({
      get: jest.fn(() => null)
    })
  })

  it('should render initial verification screen', async () => {
    const mockParams = Promise.resolve({ id: 'test-campaign' })
    
    render(<ClaimPage params={mockParams} />)
    
    await waitFor(() => {
      expect(screen.getByText('Verify You\'re Human')).toBeInTheDocument()
      expect(screen.getByText('Click the button below to verify and claim your promo code')).toBeInTheDocument()
    })
  })

  it('should show bypass UI when bypass parameter is present', async () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn((param) => param === 'bypass' ? 'test-bypass-token' : null)
    })
    
    const mockParams = Promise.resolve({ id: 'test-campaign' })
    
    render(<ClaimPage params={mockParams} />)
    
    await waitFor(() => {
      expect(screen.getByText('Direct Access Code')).toBeInTheDocument()
      expect(screen.getByText('You have a direct access link. Click below to claim your code.')).toBeInTheDocument()
      expect(screen.getByText('Claim Code')).toBeInTheDocument()
    })
  })

  it('should handle successful code claiming', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ requireRedditVerification: false })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 'SUCCESS123' })
      })

    const mockParams = Promise.resolve({ id: 'test-campaign' })
    
    render(<ClaimPage params={mockParams} />)
    
    await waitFor(() => {
      expect(screen.getByText('Verify & Claim Code')).toBeInTheDocument()
    })
    
    const claimButton = screen.getByText('Verify & Claim Code')
    fireEvent.click(claimButton)
    
    await waitFor(() => {
      expect(screen.getByText('Congratulations!')).toBeInTheDocument()
      expect(screen.getByText('SUCCESS123')).toBeInTheDocument()
    })
  })

  it('should show Reddit verification when required', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ requireRedditVerification: true })
      })

    const mockParams = Promise.resolve({ id: 'test-campaign' })
    
    render(<ClaimPage params={mockParams} />)
    
    const claimButton = await screen.findByText('Verify & Claim Code')
    fireEvent.click(claimButton)
    
    await waitFor(() => {
      expect(screen.getByText('Reddit Verification Required')).toBeInTheDocument()
      expect(screen.getByText('You must comment in the specified Reddit post to claim a code.')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('your_reddit_username')).toBeInTheDocument()
    })
  })

  it('should handle Reddit username verification', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ requireRedditVerification: true })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 'REDDIT123' })
      })

    const mockParams = Promise.resolve({ id: 'test-campaign' })
    
    render(<ClaimPage params={mockParams} />)
    
    // First click to get to Reddit verification
    const initialClaimButton = await screen.findByText('Verify & Claim Code')
    fireEvent.click(initialClaimButton)
    
    await waitFor(() => {
      expect(screen.getByText('Reddit Verification Required')).toBeInTheDocument()
    })
    
    // Enter Reddit username
    const usernameInput = screen.getByPlaceholderText('your_reddit_username')
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    
    // Click verify button
    const verifyButton = screen.getByText('Verify & Claim Code')
    fireEvent.click(verifyButton)
    
    await waitFor(() => {
      expect(screen.getByText('Congratulations!')).toBeInTheDocument()
      expect(screen.getByText('REDDIT123')).toBeInTheDocument()
    })
  })

  it('should handle errors gracefully', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ requireRedditVerification: false })
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'All codes have been claimed' })
      })

    const mockParams = Promise.resolve({ id: 'test-campaign' })
    
    render(<ClaimPage params={mockParams} />)
    
    const claimButton = await screen.findByText('Verify & Claim Code')
    fireEvent.click(claimButton)
    
    await waitFor(() => {
      expect(screen.getByText('Sorry!')).toBeInTheDocument()
      expect(screen.getByText('All codes have been claimed')).toBeInTheDocument()
    })
  })

  it('should copy code to clipboard', async () => {
    const mockWriteText = jest.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    })

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ requireRedditVerification: false })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 'COPY123' })
      })

    const mockParams = Promise.resolve({ id: 'test-campaign' })
    
    render(<ClaimPage params={mockParams} />)
    
    const claimButton = await screen.findByText('Verify & Claim Code')
    fireEvent.click(claimButton)
    
    await waitFor(() => {
      expect(screen.getByText('COPY123')).toBeInTheDocument()
    })
    
    const copyButton = screen.getByText('Copy Code')
    fireEvent.click(copyButton)
    
    expect(mockWriteText).toHaveBeenCalledWith('COPY123')
  })

  it('should bypass Reddit verification with bypass token', async () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn((param) => param === 'bypass' ? 'test-bypass-token' : null)
    })

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ requireRedditVerification: true })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ code: 'BYPASS123' })
      })

    const mockParams = Promise.resolve({ id: 'test-campaign' })
    
    render(<ClaimPage params={mockParams} />)
    
    await waitFor(() => {
      expect(screen.getByText('Direct Access Code')).toBeInTheDocument()
    })
    
    const claimButton = screen.getByText('Claim Code')
    fireEvent.click(claimButton)
    
    await waitFor(() => {
      expect(screen.getByText('Congratulations!')).toBeInTheDocument()
      expect(screen.getByText('BYPASS123')).toBeInTheDocument()
    })
    
    // Should skip Reddit verification entirely
    expect(screen.queryByText('Reddit Verification Required')).not.toBeInTheDocument()
  })

  it('should disable claim button when username is empty in Reddit verification', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ requireRedditVerification: true })
      })

    const mockParams = Promise.resolve({ id: 'test-campaign' })
    
    render(<ClaimPage params={mockParams} />)
    
    const initialClaimButton = await screen.findByText('Verify & Claim Code')
    fireEvent.click(initialClaimButton)
    
    await waitFor(() => {
      expect(screen.getByText('Reddit Verification Required')).toBeInTheDocument()
    })
    
    const verifyButton = screen.getByText('Verify & Claim Code')
    expect(verifyButton).toBeDisabled()
    
    // Enter username to enable button
    const usernameInput = screen.getByPlaceholderText('your_reddit_username')
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    
    expect(verifyButton).not.toBeDisabled()
  })
})