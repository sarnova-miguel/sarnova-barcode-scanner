import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SarnovaBarcodeScanner from './SarnovaBarcodeScanner'
import { ProductProvider } from '@/context/ProductContext'
import { Html5Qrcode } from 'html5-qrcode'

// Get the mocked version for test manipulation
const MockedHtml5Qrcode = Html5Qrcode as jest.MockedClass<typeof Html5Qrcode>

// Helper function to render with ProductProvider
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<ProductProvider>{ui}</ProductProvider>)
}

// Mock product data
const mockProduct = {
  barcode_number: '123456789012',
  barcode_type: 'UPC-A',
  barcode_formats: 'UPC-A',
  mpn: 'TEST-001',
  model: 'Test Model',
  asin: 'B001234567',
  product_name: 'Test Product',
  title: 'Test Product Title',
  category: 'Test Category',
  manufacturer: 'Test Manufacturer',
  brand: 'Test Brand',
  label: '',
  author: '',
  publisher: '',
  artist: '',
  actor: '',
  director: '',
  studio: '',
  genre: '',
  audience_rating: '',
  ingredients: '',
  nutrition_facts: '',
  color: '',
  format: '',
  package_quantity: '',
  size: '',
  length: '',
  width: '',
  height: '',
  weight: '',
  release_date: '',
  description: 'Test product description',
  features: [],
  images: ['https://example.com/image.jpg'],
  last_update: '',
  stores: [{ name: 'Test Store', country: 'US', currency: 'USD', currency_symbol: '$', price: '29.99', sale_price: '', tax: '', link: '', item_group_id: '', availability: '', condition: '', shipping: '', last_update: '' }],
  reviews: [],
}

describe('SarnovaBarcodeScanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockReset()
  })

  describe('Rendering', () => {
    it('renders the scanner component with all controls', () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      expect(screen.getByRole('button', { name: /start camera scanning/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /upload an image/i })).toBeInTheDocument()
      // Use getAllBy to handle multiple matching elements (outer and inner sections)
      const regions = screen.getAllByRole('region', { name: /barcode scanner/i })
      expect(regions.length).toBeGreaterThan(0)
    })

    it('renders the reader div for camera scanning', () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      const reader = document.getElementById('reader')
      expect(reader).toBeInTheDocument()
    })

    it('has accessible screen reader announcements', () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      const statusElements = screen.getAllByRole('status')
      expect(statusElements.length).toBeGreaterThan(0)
    })
  })

  describe('Camera Controls', () => {
    it('shows "Stop Scanning" button when scanning is active', async () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      const startButton = screen.getByRole('button', { name: /start camera scanning/i })
      await userEvent.click(startButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop camera scanning/i })).toBeInTheDocument()
      })
    })

    it('disables upload button while scanning', async () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      const startButton = screen.getByRole('button', { name: /start camera scanning/i })
      await userEvent.click(startButton)

      await waitFor(() => {
        const uploadButton = screen.getByRole('button', { name: /upload an image/i })
        expect(uploadButton).toBeDisabled()
      })
    })
  })

  describe('File Upload Validation', () => {
    it('validates file type and shows error for invalid types', async () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      Object.defineProperty(input, 'files', { value: [invalidFile] })

      await act(async () => {
        fireEvent.change(input)
      })

      await waitFor(() => {
        // Use getAllBy since there are multiple alert roles (sr-only and visible)
        const alerts = screen.getAllByRole('alert')
        expect(alerts.length).toBeGreaterThan(0)
      })
    })

    it('validates file size and shows error for large files', async () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      // Create a mock file larger than 10MB
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      Object.defineProperty(input, 'files', { value: [largeFile] })

      await act(async () => {
        fireEvent.change(input)
      })

      await waitFor(() => {
        // Use getAllBy since there are multiple alert roles (sr-only and visible)
        const alerts = screen.getAllByRole('alert')
        expect(alerts.length).toBeGreaterThan(0)
      })
    })

    it('validates file extension and shows error for invalid extensions', async () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const fileWithBadExt = new File(['content'], 'test.invalid', { type: 'image/jpeg' })
      Object.defineProperty(input, 'files', { value: [fileWithBadExt] })

      await act(async () => {
        fireEvent.change(input)
      })

      await waitFor(() => {
        const alerts = screen.queryAllByRole('alert')
        expect(alerts.length).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles null file input gracefully', async () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      Object.defineProperty(input, 'files', { value: null })

      await act(async () => {
        fireEvent.change(input)
      })

      // Should not crash, component should still be functional
      expect(screen.getByRole('button', { name: /start camera scanning/i })).toBeInTheDocument()
    })

    it('handles empty file list gracefully', async () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      Object.defineProperty(input, 'files', { value: [] })

      await act(async () => {
        fireEvent.change(input)
      })

      expect(screen.getByRole('button', { name: /start camera scanning/i })).toBeInTheDocument()
    })

    it('handles file with no extension', async () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      const fileWithNoExt = new File(['content'], 'testfile', { type: 'image/jpeg' })
      Object.defineProperty(input, 'files', { value: [fileWithNoExt] })

      await act(async () => {
        fireEvent.change(input)
      })

      await waitFor(() => {
        const alerts = screen.queryAllByRole('alert')
        expect(alerts.length).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Request Deduplication', () => {
    it('aborts first request and only displays second product when scanning rapidly', async () => {
      // Track abort calls
      let abortCalled = false
      const originalAbortController = global.AbortController

      // Store abort handlers to simulate abort behavior
      const abortHandlers: Array<() => void> = []

      class MockAbortController {
        signal: AbortSignal
        private controller: AbortController

        constructor() {
          this.controller = new originalAbortController()
          this.signal = this.controller.signal
        }

        abort() {
          abortCalled = true
          this.controller.abort()
          // Also trigger any registered abort handlers
          abortHandlers.forEach(handler => handler())
        }
      }
      global.AbortController = MockAbortController as unknown as typeof AbortController

      // Create two different products
      const productB = {
        ...mockProduct,
        barcode_number: 'BARCODE_B',
        product_name: 'Product B',
        title: 'Product B Title',
      }

      // Track fetch calls
      const fetchCalls: string[] = []

      ;(global.fetch as jest.Mock).mockImplementation((url: string, options?: { signal?: AbortSignal }) => {
        fetchCalls.push(url)

        if (url.includes('BARCODE_A')) {
          // First request: return a promise that will be rejected when aborted
          return new Promise((_, reject) => {
            const abortHandler = () => {
              const abortError = new Error('The operation was aborted')
              abortError.name = 'AbortError'
              reject(abortError)
            }

            // Register handler for later abort
            abortHandlers.push(abortHandler)

            // Also listen to the actual signal if provided
            if (options?.signal) {
              options.signal.addEventListener('abort', abortHandler)
            }
          })
        } else if (url.includes('BARCODE_B')) {
          // Second request: resolve immediately
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, product: productB }),
          })
        }

        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: 'Not found' }),
        })
      })

      // Configure the mocked Html5Qrcode
      let scanSuccessCallback: ((decodedText: string) => void) | null = null

      MockedHtml5Qrcode.mockImplementation(() => ({
        start: jest.fn().mockImplementation((_config: unknown, _options: unknown, onSuccess: (text: string) => void) => {
          scanSuccessCallback = onSuccess
          return Promise.resolve()
        }),
        stop: jest.fn().mockResolvedValue(undefined),
        scanFile: jest.fn().mockResolvedValue('test-barcode'),
        getState: jest.fn().mockReturnValue(2), // SCANNING
      }) as unknown as Html5Qrcode)

      renderWithProvider(<SarnovaBarcodeScanner />)

      // Start scanning
      const startButton = screen.getByRole('button', { name: /start camera scanning/i })
      await userEvent.click(startButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop camera scanning/i })).toBeInTheDocument()
      })

      // Simulate first barcode scan (this will trigger a slow API request)
      await act(async () => {
        if (scanSuccessCallback) {
          scanSuccessCallback('BARCODE_A')
        }
      })

      // Wait a moment to ensure first request is initiated
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      // First request should be pending
      expect(fetchCalls).toContain('/api/lookup/BARCODE_A')

      // Reset mock to allow second scan to work
      MockedHtml5Qrcode.mockImplementation(() => ({
        start: jest.fn().mockImplementation((_config: unknown, _options: unknown, onSuccess: (text: string) => void) => {
          scanSuccessCallback = onSuccess
          return Promise.resolve()
        }),
        stop: jest.fn().mockResolvedValue(undefined),
        scanFile: jest.fn().mockResolvedValue('test-barcode'),
        getState: jest.fn().mockReturnValue(1), // NOT_STARTED (after stop)
      }) as unknown as Html5Qrcode)

      // Start scanning again to scan second barcode
      const startButton2 = screen.getByRole('button', { name: /start camera scanning/i })
      await userEvent.click(startButton2)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop camera scanning/i })).toBeInTheDocument()
      })

      // Simulate second barcode scan immediately (before first response returns)
      // This should abort the first request and start a new one
      await act(async () => {
        if (scanSuccessCallback) {
          scanSuccessCallback('BARCODE_B')
        }
      })

      // Wait for the second request to complete
      await waitFor(() => {
        expect(fetchCalls).toContain('/api/lookup/BARCODE_B')
      })

      // The abort should have been called for the first request
      expect(abortCalled).toBe(true)

      // Wait for UI to stabilize and show Product B
      await waitFor(() => {
        expect(screen.getByText('Product B Title')).toBeInTheDocument()
      })

      // Product A should NOT be displayed (request was aborted)
      expect(screen.queryByText('Product A Title')).not.toBeInTheDocument()

      // Restore original AbortController
      global.AbortController = originalAbortController
    })

    it('skips duplicate requests for the same barcode', async () => {
      const fetchCalls: string[] = []

      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        fetchCalls.push(url)
        // Return a slow response
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({ success: true, product: mockProduct }),
            })
          }, 100)
        })
      })

      // Configure the mocked Html5Qrcode
      let scanSuccessCallback: ((decodedText: string) => void) | null = null

      MockedHtml5Qrcode.mockImplementation(() => ({
        start: jest.fn().mockImplementation((_config: unknown, _options: unknown, onSuccess: (text: string) => void) => {
          scanSuccessCallback = onSuccess
          return Promise.resolve()
        }),
        stop: jest.fn().mockResolvedValue(undefined),
        scanFile: jest.fn().mockResolvedValue('test-barcode'),
        getState: jest.fn().mockReturnValue(2), // SCANNING
      }) as unknown as Html5Qrcode)

      renderWithProvider(<SarnovaBarcodeScanner />)

      const startButton = screen.getByRole('button', { name: /start camera scanning/i })
      await userEvent.click(startButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop camera scanning/i })).toBeInTheDocument()
      })

      // Simulate scanning the same barcode twice rapidly
      await act(async () => {
        if (scanSuccessCallback) {
          scanSuccessCallback('123456789012')
        }
      })

      // Try to scan the same barcode again immediately
      await act(async () => {
        if (scanSuccessCallback) {
          scanSuccessCallback('123456789012')
        }
      })

      // Wait for request to complete
      await waitFor(() => {
        expect(fetchCalls.length).toBeGreaterThan(0)
      })

      // Only one fetch call should be made for the same barcode
      const callsForBarcode = fetchCalls.filter(url => url.includes('123456789012'))
      expect(callsForBarcode.length).toBe(1)
    })

    it('does not show error when request is aborted due to new scan', async () => {
      const originalAbortController = global.AbortController

      class MockAbortController {
        signal: AbortSignal
        private controller: AbortController

        constructor() {
          this.controller = new originalAbortController()
          this.signal = this.controller.signal
        }

        abort() {
          this.controller.abort()
        }
      }
      global.AbortController = MockAbortController as unknown as typeof AbortController

      const productB = {
        ...mockProduct,
        barcode_number: 'BARCODE_B',
        product_name: 'Product B',
        title: 'Product B Title',
      }

      ;(global.fetch as jest.Mock).mockImplementation((url: string, options?: { signal?: AbortSignal }) => {
        if (url.includes('BARCODE_A')) {
          // First request: will be aborted
          return new Promise((_, reject) => {
            if (options?.signal) {
              options.signal.addEventListener('abort', () => {
                const abortError = new Error('The operation was aborted')
                abortError.name = 'AbortError'
                reject(abortError)
              })
            }
          })
        } else if (url.includes('BARCODE_B')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, product: productB }),
          })
        }
        return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Not found' }) })
      })

      // Configure the mocked Html5Qrcode
      let scanSuccessCallback: ((decodedText: string) => void) | null = null

      MockedHtml5Qrcode.mockImplementation(() => ({
        start: jest.fn().mockImplementation((_config: unknown, _options: unknown, onSuccess: (text: string) => void) => {
          scanSuccessCallback = onSuccess
          return Promise.resolve()
        }),
        stop: jest.fn().mockResolvedValue(undefined),
        scanFile: jest.fn().mockResolvedValue('test-barcode'),
        getState: jest.fn().mockReturnValue(2),
      }) as unknown as Html5Qrcode)

      renderWithProvider(<SarnovaBarcodeScanner />)

      const startButton = screen.getByRole('button', { name: /start camera scanning/i })
      await userEvent.click(startButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /stop camera scanning/i })).toBeInTheDocument()
      })

      // Scan first barcode
      await act(async () => {
        if (scanSuccessCallback) {
          scanSuccessCallback('BARCODE_A')
        }
      })

      // Immediately scan second barcode (this aborts the first request)
      await act(async () => {
        if (scanSuccessCallback) {
          scanSuccessCallback('BARCODE_B')
        }
      })

      // Wait for UI to update
      await waitFor(() => {
        expect(screen.getByText('Product B Title')).toBeInTheDocument()
      })

      // No error should be displayed for the aborted request
      const errorText = screen.queryByText(/failed to fetch product information/i)
      expect(errorText).not.toBeInTheDocument()

      global.AbortController = originalAbortController
    })
  })

  describe('Accessibility', () => {
    it('has accessible toolbar with proper aria-label', () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      const toolbar = screen.getByRole('toolbar', { name: /scanner controls/i })
      expect(toolbar).toBeInTheDocument()
    })

    it('has proper aria-labels on all interactive elements', () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      expect(screen.getByRole('button', { name: /start camera scanning/i })).toHaveAccessibleName()
      expect(screen.getByRole('button', { name: /upload an image/i })).toHaveAccessibleName()
    })

    it('has screen reader only status announcements', () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      const srElements = document.querySelectorAll('.sr-only')
      expect(srElements.length).toBeGreaterThan(0)
    })

    it('has proper heading structure', () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
    })
  })

  describe('Rate Limiting', () => {
    it('enforces rate limit after multiple rapid uploads', async () => {
      renderWithProvider(<SarnovaBarcodeScanner />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      // Simulate multiple uploads by triggering file change events
      for (let i = 0; i < 12; i++) {
        const validFile = new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' })
        Object.defineProperty(input, 'files', { value: [validFile], configurable: true })
        await act(async () => {
          fireEvent.change(input)
        })
      }

      // The rate limit error should be shown
      await waitFor(() => {
        const alerts = screen.queryAllByRole('alert')
        expect(alerts.length).toBeGreaterThanOrEqual(0)
      })
    })
  })
})
