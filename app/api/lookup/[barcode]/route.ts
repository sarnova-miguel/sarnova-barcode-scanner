import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ barcode: string }> }
) {
  try {
    const { barcode } = await params;
    console.log('Barcode unsanitized: ', barcode);

    // Validate barcode parameter
    if (!barcode || typeof barcode !== 'string') {
      return NextResponse.json(
        { error: 'Invalid barcode parameter' },
        { status: 400 }
      );
    }

    // Sanitize barcode (allow only alphanumeric characters and hyphens)
    const sanitizedBarcode = barcode.replace(/[^a-zA-Z0-9-]/g, '');

    if (sanitizedBarcode.length === 0) {
      return NextResponse.json(
        { error: 'Invalid barcode format' },
        { status: 400 }
      );
    }

    console.log('Barcode lookup request:', sanitizedBarcode);

    // Get API key from environment variable (server-side only, not NEXT_PUBLIC_)
    const apiKey = process.env.BARCODE_LOOKUP_API_KEY;

    if (!apiKey) {
      console.error('BARCODE_LOOKUP_API_KEY is not configured');
      return NextResponse.json(
        { error: 'API configuration error. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Call Barcode Lookup API
    const apiUrl = `https://api.barcodelookup.com/v3/products?barcode=${encodeURIComponent(sanitizedBarcode)}&key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Cache for 1 hour to reduce API calls
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Product not found in database.' },
          { status: 404 }
        );
      } else if (response.status === 401) {
        console.error('Invalid Barcode Lookup API key');
        return NextResponse.json(
          { error: 'API authentication error. Please contact administrator.' },
          { status: 500 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: 'API rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      } else {
        console.error(`Barcode Lookup API error: ${response.status}`);
        return NextResponse.json(
          { error: 'Failed to fetch product information.' },
          { status: response.status }
        );
      }
    }

    const data = await response.json();

    // Check if products were found
    if (!data.products || data.products.length === 0) {
      return NextResponse.json(
        { error: 'No product information found for this barcode.' },
        { status: 404 }
      );
    }

    // Return the first product with success flag
    return NextResponse.json({
      success: true,
      product: data.products[0]
    }, { status: 200 }
    );

  } catch (error) {
    console.error('Error in barcode lookup API route:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}