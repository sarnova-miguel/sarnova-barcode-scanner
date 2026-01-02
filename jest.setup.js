// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock html5-qrcode library since it requires browser APIs
jest.mock('html5-qrcode', () => ({
  Html5Qrcode: jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    scanFile: jest.fn().mockResolvedValue('test-barcode'),
    getState: jest.fn().mockReturnValue(1), // NOT_STARTED
  })),
}))

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:test-url')
global.URL.revokeObjectURL = jest.fn()

// Mock fetch
global.fetch = jest.fn()

// Mock Image
class MockImage {
  constructor() {
    this.onload = null
    this.onerror = null
    this.crossOrigin = null
    this.src = ''
    setTimeout(() => {
      if (this.onload) {
        this.width = 100
        this.height = 100
        this.onload()
      }
    }, 10)
  }
}
global.Image = MockImage

// Mock FileReader
class MockFileReader {
  constructor() {
    this.onloadend = null
    this.onerror = null
    this.result = null
  }
  readAsArrayBuffer(blob) {
    setTimeout(() => {
      // Simulate JPEG magic bytes (FFD8FFE0)
      this.result = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]).buffer
      if (this.onloadend) {
        this.onloadend({ target: this })
      }
    }, 10)
  }
}
global.FileReader = MockFileReader

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
}))
HTMLCanvasElement.prototype.toBlob = jest.fn((callback, mimeType, quality) => {
  const blob = new Blob(['test'], { type: mimeType || 'image/jpeg' })
  callback(blob)
})

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

