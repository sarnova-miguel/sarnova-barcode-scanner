# Sarnova Barcode Scanner - Project Starter Guide

## 📋 Project Overview

The **Sarnova Barcode Scanner** is a Next.js-based web application that enables users to scan barcodes using their device camera or by uploading images. The application automatically fetches detailed product information from the Barcode Lookup API and displays it in a comprehensive, user-friendly interface.

Conceptually, this feature would be available on the Sarnova websites and used as a tool for customers to find products and add them to their cart. It can also be used as a tool to identify products and brands commonly used by Sarnova customers.

## Try out the Sarnova Barcode Scanner [here](https://sarnova-barcode-scanner.vercel.app/) :arrow_left:

### Key Features
- 📷 **Real-time Camera Scanning**: [Scan barcodes](#-barcode-scanner-functionality) using device camera (mobile & desktop)
- 📤 **Image Upload**: Upload barcode images for scanning
- 🔍 **Product Information Lookup**: Automatic product data retrieval from [Barcode Lookup API](#-barcode-api-lookup)
- 🛡️ **Advanced Security**: Comprehensive validation and security measures
- 🎨 **Modern UI**: Built with React, Next.js, TypeScript, and Tailwind CSS
- ⚡ **Performance Optimized**: Server-side caching and optimized image handling
- 📱 **Responsive Design**: Optimized for mobile and desktop
- 🧠 **AI Development**: Designed and developed using [AI tools](#️-developed-with-ai)

---

## 🏗️ Technology Stack

### Core Framework
- **Next.js 16.1.0** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type-safe development

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **shadcn/ui** - Component library (New York style)

### Barcode Scanning
- **html5-qrcode 2.3.8** - Barcode/QR code scanning library
  - Supports multiple formats: UPC, EAN, Code 128, Code 39, QR codes, etc.
  - Camera and file upload support
  - Cross-browser compatibility
  - ScanApp [docs](https://scanapp.org/html5-qrcode-docs/docs/intro)
- **Alternative Barcode Scanning products** - Paid services
  - [zxing-js](https://github.com/zxing-js/library) - FREE/Open Source
  - [Scanbot SDK](https://scanbot.io/barcode-scanner-sdk/)
  - [Dynamsoft Barcode Reader](https://www.dynamsoft.com/barcode-reader/overview/)
  - [Strich.io Barcode Scanning library](https://strich.io/)

### External APIs
- **Barcode Lookup API v3** - Product information database
  - Endpoint: `https://api.barcodelookup.com/v3/products`
  - Provides comprehensive product details, images, pricing, and reviews
  - Barcode Lookup [docs](https://www.barcodelookup.com/api-documentation)
  - [API subscription plans](https://www.barcodelookup.com/api#sign-up)
- **Alternative Barcode APIs** - Paid services
  - [Go UPC](https://go-upc.com/plans/api)
  - [UPC Item DB](https://devs.upcitemdb.com/)
  - [UPC Database](https://upcdatabase.org/)

---

## 🚀 Getting Started

### Sarnova Barcode Scanner [Demo](https://sarnova-barcode-scanner.vercel.app/) :arrow_left:

### Prerequisites (for local development)
- Node.js 20+ installed
- pnpm package manager (recommended)
- Barcode Lookup API key ([Get one here](https://www.barcodelookup.com/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sarnova-miguel/sarnova-barcode-scanner.git
   cd sarnova-barcode-scanner
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API key:
   ```env
   BARCODE_LOOKUP_API_KEY=your_actual_api_key_here
   ```
   
   ⚠️ **Important**: Do NOT use `NEXT_PUBLIC_` prefix - the API key must remain server-side only.

3. **Run the development server**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Barcode Scanner Functionality

### How It Works

The barcode scanner is implemented in `components/SarnovaBarcodeScanner.tsx` and provides two scanning methods:

#### 1. Camera Scanning
- Uses device camera (back camera on mobile, webcam on desktop)
- Real-time barcode detection at 10 FPS
- Scanning box: 250x250 pixels
- Automatically stops after successful scan
- Supports multiple barcode formats (UPC, EAN, QR codes, etc.)

**User Flow:**
1. User clicks "Start Scanning" button
2. Browser requests camera permission
3. Camera feed displays in scanning box
4. User positions barcode in the viewfinder
5. Barcode is automatically detected and decoded
6. Scanner stops and product lookup begins

#### 2. Image Upload
- Upload images containing barcodes
- Supports JPEG, PNG, WebP, BMP formats
- Maximum file size: 10MB
- Maximum dimensions: 4096x4096 pixels

**User Flow:**
1. User clicks "Upload Image" button
2. File picker opens
3. User selects image file
4. Image undergoes security validation
5. Barcode is extracted from image
6. Product lookup begins

### Supported Barcode Formats
- UPC-A, UPC-E
- EAN-8, EAN-13
- Code 39, Code 93, Code 128
- QR Codes
- Data Matrix
- PDF417
- And more...

---

## 🔍 Barcode API Lookup

### Architecture

The application uses a **proxy pattern** for API security:

```
Client → /api/lookup/[barcode] → Barcode Lookup API
```

### Benefits
- ✅ API key stored server-side only (never exposed to client)
- ✅ Server-side caching (1 hour) reduces API calls
- ✅ Centralized error handling
- ✅ Input sanitization and validation
- ✅ Rate limiting protection
- ✅ Server-side logging and monitoring

### API Route Implementation

**Location:** `app/api/lookup/[barcode]/route.ts`

**Process Flow:**
1. Extract barcode from URL parameter
2. Validate barcode is a string
3. Sanitize barcode (alphanumeric + hyphens only)
4. Verify API key exists in environment
5. Call Barcode Lookup API with sanitized barcode
6. Handle specific error codes (404, 401, 429, etc.)
7. Return formatted product data or error message
8. Cache successful responses for 1 hour

### Product Data Structure

The API returns comprehensive product information:
- Basic info: name, brand, manufacturer, category
- Identifiers: barcode number, UPC, EAN, ASIN, MPN
- Physical: dimensions, weight, color, size
- Content: description, features, ingredients, nutrition facts
- Media: product images array
- Pricing: store listings with prices and availability
- Reviews: customer ratings and reviews

### Example API Request

**Client-side call:**
```typescript
const response = await fetch(`/api/lookup/${encodeURIComponent(barcode)}`);
const data = await response.json();

if (data.success && data.product) {
  // Product found
  console.log(data.product);
} else {
  // Handle error
  console.error(data.error);
}
```

**Server-side API call:**
```
GET https://api.barcodelookup.com/v3/products?barcode=012000161155&key=YOUR_API_KEY
```

### Error Handling

The API route handles various error scenarios:
- **400 Bad Request**: Invalid barcode parameter or format
- **401 Unauthorized**: Invalid API key
- **404 Not Found**: Product not found in database
- **429 Too Many Requests**: API rate limit exceeded
- **500 Internal Server Error**: Server-side errors

---

## 🛡️ Security Implementation

Security is a top priority. The application implements multiple layers of protection:

### 1. File Upload Security

**Location:** `components/SarnovaBarcodeScanner.tsx`

#### File Type Validation
```typescript
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];
```
- Validates MIME type
- Checks file extension matches MIME type
- Prevents executable files disguised as images

#### File Size Limits
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```
- Prevents large file uploads that could cause DoS
- Protects server resources

#### Magic Bytes Validation
Reads the first 4 bytes of uploaded files to verify they are genuine images:
```typescript
const validHeaders = [
  'ffd8ffe0', // JPEG
  'ffd8ffe1', // JPEG
  '89504e47', // PNG
  '424d',     // BMP
  '52494646', // WEBP
];
```
- Prevents malicious files disguised as images
- Validates file integrity

#### Image Dimension Validation
```typescript
const MAX_DIMENSION = 4096; // 4K resolution
```
- Prevents extremely large images
- Protects against memory exhaustion attacks

#### Rate Limiting
```typescript
const MAX_UPLOADS_PER_MINUTE = 10;
```
- Limits uploads to 10 per minute per user
- Prevents abuse and DoS attacks
- Automatically clears old attempts after 1 minute

### 2. Input Sanitization

**Barcode Sanitization:**
```typescript
const sanitizedBarcode = barcode.replace(/[^a-zA-Z0-9-]/g, '');
```
- Removes all non-alphanumeric characters (except hyphens)
- Prevents injection attacks
- Validates barcode format before API call

**File Name Sanitization:**
```typescript
const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
};
```
- Prevents log injection attacks
- Limits file name length

### 3. API Key Protection

- API key stored in environment variables (server-side only)
- Never exposed to client-side code
- No `NEXT_PUBLIC_` prefix used
- All API requests proxied through Next.js API route

### 4. Content Security Policy (CSP)

**Location:** `next.config.ts`

Comprehensive security headers implemented:

```typescript
{
  'Content-Security-Policy': [
    "default-src 'self'",
    "img-src 'self' data: blob: https://images.barcodelookup.com",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "connect-src 'self' https://api.barcodelookup.com",
    "object-src 'none'",
    "frame-ancestors 'none'",
  ].join('; ')
}
```

**Additional Security Headers:**
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - Enables browser XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy` - Restricts browser features (camera allowed, others restricted)

### 5. Validation Flow

When a user uploads an image, validations occur in this order:

1. **Rate Limit Check** → Ensures user hasn't exceeded upload limit
2. **File Type & Size** → Validates MIME type, extension, and size
3. **Magic Bytes** → Verifies file is actually an image
4. **Dimensions** → Checks image isn't too large
5. **Barcode Scan** → Attempts to decode barcode from image
6. **Error Handling** → Provides user-friendly feedback

---

## 📂 Project Structure

```
sarnova-barcode-scanner/
├── app/
│   ├── api/
│   │   └── lookup/
│   │       └── [barcode]/
│   │           └── route.ts          # API proxy for Barcode Lookup
│   ├── cart/                          # Shopping cart page
│   ├── profile/                       # User profile page
│   ├── saved/                         # Saved items page
│   ├── layout.tsx                     # Root layout with navigation
│   ├── page.tsx                       # Home page with scanner
│   └── globals.css                    # Global styles
├── components/
│   ├── SarnovaBarcodeScanner.tsx     # Main scanner component
│   ├── SarnovaHeader.tsx             # Header component
│   ├── SarnovaNav.tsx                # Navigation component
│   └── ui/
│       ├── ProductCard.tsx           # Product display card
│       ├── button.tsx                # Button component
│       └── ...                       # Other UI components
├── lib/
│   └── utils.ts                      # Utility functions
├── hooks/
│   └── useMobile.ts                  # Mobile detection hook
├── public/                           # Static assets and test barcodes
├── next.config.ts                    # Next.js configuration + security headers
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies and scripts
├── .env.local                        # Environment variables (not in git)
├── README.md                         # This file - comprehensive guide
├── BARCODE_LOOKUP_INTEGRATION.md     # API integration details
└── SECURITY_IMPLEMENTATION.md        # Security features documentation
```

---

## 🧪 Testing

### Test Barcodes

The `public/` folder contains various test barcode images:

**UPC Barcodes:**
- `demo-upca-barcode1.png` - UPC-A format
- `demo-upce-barcode1.png` - UPC-E format

**EAN Barcodes:**
- `demo-ean13-barcode1.png` - EAN-13 format
- `demo-ean8-barcode1.png` - EAN-8 format

**Code Formats:**
- `demo-code128-barcode1.png` - Code 128
- `demo-code39full-barcode1.png` - Code 39
- `demo-code93-barcode1.png` - Code 93

**QR Codes:**
- `demo-qrcode1.png`, `demo-qrcode2.png`, `demo-qrcode3.png`

**Real Product Barcodes:**
- `febreeze-barcode.jpg` - Febreeze product
- `gloves-barcode.jpg`, `gloves-barcode2.jpg` - Medical gloves
- `car-frag-barcode.jpg`, `car-frag-barcode2.jpg` - Car air freshener

### Example Test Barcodes for API

- **UPC**: `012000161155` (Coca-Cola)
- **EAN**: `5449000000996` (Coca-Cola)
- **ISBN**: `9780134685991` (Book)

### Testing Checklist

**Functionality Tests:**
- [ ] Camera scanning with valid barcode
- [ ] Image upload with valid barcode
- [ ] Product information display
- [ ] Error handling for invalid barcodes
- [ ] Multiple barcode format support

**Security Tests:**
- [ ] Upload file larger than 10MB (should fail)
- [ ] Upload non-image file (should fail)
- [ ] Upload corrupted image (should fail)
- [ ] Upload image larger than 4096x4096 (should fail)
- [ ] Rapid successive uploads (rate limiting)
- [ ] Image with no barcode (should show error)

**Browser Compatibility:**
- [ ] Chrome/Edge (desktop & mobile)
- [ ] Firefox (desktop & mobile)
- [ ] Safari (desktop & mobile)

---

## 📚 Key Components

### SarnovaBarcodeScanner

**Location:** `components/SarnovaBarcodeScanner.tsx`

Main component handling all scanning functionality.

**State Management:**
- `isScanning` - Camera scanning active state
- `isUploading` - File upload in progress
- `scannedResult` - Decoded barcode string
- `productData` - Fetched product information
- `isLoadingProduct` - Product fetch loading state
- `error` - Error messages
- `uploadAttempts` - Rate limiting tracker

**Key Methods:**
- `startScanning()` - Initializes camera scanning
- `stopScanning()` - Stops camera and cleans up
- `handleFileUpload()` - Processes uploaded images
- `fetchProductData()` - Calls API to get product info
- `validateFileTypeAndSize()` - File validation
- `validateImageFile()` - Magic bytes validation
- `validateImageDimensions()` - Dimension validation
- `checkRateLimit()` - Rate limiting check

### ProductCard

**Location:** `components/ui/ProductCard.tsx`

Displays product information after successful scan.

**Props:**
- `image` - Product image URL
- `title` - Product name
- `price` - Product price
- `category` - Product category
- `manufacturer` - Manufacturer name
- `barcode` - Barcode number
- `description` - Product description

---

## 🚀 Deployment

### Vercel

1. Code pushed to GitHub
2. Project imported to Vercel
3. Environment variable added in Vercel: `BARCODE_LOOKUP_API_KEY`

### Sarnova Barcode Scanner [Vercel Deployment](https://sarnova-barcode-scanner.vercel.app/) :arrow_left:

---

## 📄 License

This project is private and proprietary to Sarnova.

---

## 🆘 Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure HTTPS (camera requires secure context)
- Try different browser

### API Key Errors
- Verify API key is correct in `.env.local`
- Ensure no `NEXT_PUBLIC_` prefix
- Restart development server after changing env vars

### Barcode Not Scanning
- Ensure good lighting
- Hold barcode steady for 2-3 seconds
- Try different distance from camera
- Ensure barcode is clear, in focus and not damaged

### Rate Limit Exceeded
- Free tier: 100 requests/day
- Consider upgrading API plan
- Implement additional client-side caching

---

## ❤️ Developed with AI

This project was designed and developed with the help of AI.

### AI Design
Each AI Design tool was given the same prompt to generate a design for the barcode scanner. The designs were then compared and the best elements were chosen.
- [Lovable](https://lovable.dev/)
![Lovable Design](https://github.com/sarnova-miguel/sarnova-barcode-scanner/blob/main/public/lovable-ui-mock.png)
- [Base44](https://base44.com/)
![Base44 Design](https://github.com/sarnova-miguel/sarnova-barcode-scanner/blob/main/public/base44-ui-mock.png)
- [Banani](https://www.banani.co/) 🏆
Offered multiple mobile or desktop focused designs with a Figma UI feel.
![Banani Design](https://github.com/sarnova-miguel/sarnova-barcode-scanner/blob/main/public/banani-3ui-mock.png)

### AI Development
- [Augment](https://www.augmentcode.com/) - VSCode extension with Claude Sonnet 4.5
- [Perplexity](https://www.perplexity.ai/)
- [ChatGPT](https://chat.openai.com/) 
