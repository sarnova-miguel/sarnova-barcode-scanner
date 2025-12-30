# Barcode Lookup API Integration

This document describes the integration of the Barcode Lookup API for product information retrieval.

## Overview

After successfully scanning a barcode, the application automatically queries the Barcode Lookup API to fetch detailed product information and displays it in a comprehensive product card.

## Features

### 1. Automatic Product Lookup
- Triggers automatically after successful barcode scan (camera or upload)
- Fetches product data from Barcode Lookup API v3
- Displays loading state while fetching data

### 2. Product Card Display
The product card shows:
- **Product Images**: Up to 3 product images
- **Product Name/Title**: Main product identifier
- **Brand**: Manufacturer/brand information
- **Barcode Details**: Barcode number and type
- **Product Details**: 
  - Manufacturer
  - Category
  - Model number
  - MPN (Manufacturer Part Number)
  - Color
  - Size
- **Description**: Full product description
- **Features**: List of product features (up to 5)
- **Store Availability**: Where to buy (up to 3 stores with pricing)

### 3. Error Handling
Comprehensive error handling for:
- Missing API key
- Product not found (404)
- Invalid API key (401)
- Rate limit exceeded (429)
- Network errors
- Other API errors

## Architecture

### API Route Pattern
The application uses a Next.js API route to proxy requests to the Barcode Lookup API:

**Client** → **`/api/lookup/[barcode]`** → **Barcode Lookup API**

This architecture provides several benefits:
- **Security**: API key is stored server-side only (not exposed to client)
- **Caching**: Server-side caching reduces API calls (1 hour revalidation)
- **Error Handling**: Centralized error handling and sanitization
- **Rate Limiting**: Better control over API usage
- **Monitoring**: Server-side logging of all API requests

### API Configuration

#### Environment Variable
```bash
BARCODE_LOOKUP_API_KEY=your_api_key_here
```

**Important**: Do NOT use `NEXT_PUBLIC_` prefix. The API key should remain server-side only.

#### Internal API Route
```
GET /api/lookup/[barcode]
```

Example:
```
GET /api/lookup/012000161155
```

Response:
```json
{
  "success": true,
  "product": {
    "barcode_number": "012000161155",
    "product_name": "Coca-Cola Classic",
    ...
  }
}
```

#### External API Endpoint (called by server)
```
https://api.barcodelookup.com/v3/products?barcode={barcode}&key={api_key}
```

## Security Updates

### API Key Protection
- API key is stored server-side only (no `NEXT_PUBLIC_` prefix)
- Client never has access to the API key
- All API requests go through internal Next.js API route

### Content Security Policy
Updated CSP headers in `next.config.ts`:
- **img-src**: Added `https://images.barcodelookup.com` and `https://*.barcodelookup.com` for product images
- **connect-src**: Added `https://api.barcodelookup.com` for server-side API requests

### Input Sanitization
The API route sanitizes barcode input:
- Removes all non-alphanumeric characters (except hyphens)
- Validates barcode format before making API call
- Prevents injection attacks

## Implementation Details

### Product Interface
Comprehensive TypeScript interface matching Barcode Lookup API response:
- All product fields from API documentation
- Store information with pricing
- Review data structure
- Image arrays

### State Management
- `productData`: Stores fetched product information
- `isLoadingProduct`: Loading state for API request
- `scannedResult`: Barcode string
- `error`: Error messages

### API Function
`fetchProductData(barcode: string)`:
1. Sets loading state
2. Calls internal API route `/api/lookup/[barcode]`
3. Handles error responses from API route
4. Updates product data state
5. Clears loading state

### API Route Handler
`/app/api/lookup/[barcode]/route.ts`:
1. Extracts barcode from URL parameter
2. Validates and sanitizes barcode
3. Checks for API key in environment
4. Calls Barcode Lookup API
5. Handles API errors with specific messages
6. Returns formatted response with caching
7. Logs errors server-side

### UI Components
1. **Loading State**: Spinner with message
2. **Product Card**: Responsive card with all product details
3. **Error Display**: User-friendly error messages
4. **Barcode Display**: Shows scanned barcode when no product data

## Usage Flow

1. User scans barcode (camera or upload)
2. Barcode is decoded successfully
3. `fetchProductData()` is called automatically
4. Loading spinner appears
5. Client calls `/api/lookup/[barcode]`
6. API route validates and sanitizes barcode
7. API route calls Barcode Lookup API (server-side)
8. Response is cached for 1 hour
9. Product data returned to client
10. Product card displays with fetched data
11. Or error message if lookup fails

## Testing

### Test Cases
1. **Valid Barcode**: Scan a known product barcode
2. **Invalid Barcode**: Scan a barcode not in database
3. **No API Key**: Test without API key configured
4. **Network Error**: Test with network disconnected
5. **Rate Limiting**: Test with multiple rapid scans

### Example Barcodes for Testing
- UPC: 012000161155 (Coca-Cola)
- EAN: 5449000000996 (Coca-Cola)
- ISBN: 9780134685991 (Book)

## API Documentation Reference
- [Barcode Lookup API Documentation](https://www.barcodelookup.com/api-documentation)
- [Get API Key](https://www.barcodelookup.com/api)

## Rate Limits
- Free tier: 100 requests per day
- Paid tiers: Higher limits available
- Application includes rate limit error handling

## Future Enhancements
- [ ] Cache product data locally
- [ ] Add product comparison feature
- [ ] Implement barcode history
- [ ] Add "Add to Cart" functionality
- [ ] Support multiple product results
- [ ] Add product reviews display
- [ ] Implement nutrition facts display
- [ ] Add price tracking

