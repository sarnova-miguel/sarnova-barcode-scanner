"use client";

import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Upload } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";

// Product interface based on Barcode Lookup API
interface Product {
  barcode_number: string;
  barcode_type: string;
  barcode_formats: string;
  mpn: string;
  model: string;
  asin: string;
  product_name: string;
  title: string;
  category: string;
  manufacturer: string;
  brand: string;
  label: string;
  author: string;
  publisher: string;
  artist: string;
  actor: string;
  director: string;
  studio: string;
  genre: string;
  audience_rating: string;
  ingredients: string;
  nutrition_facts: string;
  color: string;
  format: string;
  package_quantity: string;
  size: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  release_date: string;
  description: string;
  features: string[];
  images: string[];
  last_update: string;
  stores: Array<{
    name: string;
    country: string;
    currency: string;
    currency_symbol: string;
    price: string;
    sale_price: string;
    tax: string;
    link: string;
    item_group_id: string;
    availability: string;
    condition: string;
    shipping: string;
    last_update: string;
  }>;
  reviews: Array<{
    name: string;
    rating: string;
    review: string;
    date: string;
  }>;
}

// Security constants
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 4096; // 4K resolution
const MAX_UPLOADS_PER_MINUTE = 10;

const SarnovaBarcodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [scannedResult, setScannedResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [uploadAttempts, setUploadAttempts] = useState<number[]>([]);
  const [productData, setProductData] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isStoppingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Initialize Html5Qrcode instance only once
    html5QrCodeRef.current = new Html5Qrcode("reader");

    // Cleanup on unmount
    return () => {
      if (html5QrCodeRef.current) {
        try {
          // Check if scanner is actually running before stopping
          const state = html5QrCodeRef.current.getState();
          if (state === 2) { // 2 = SCANNING
            html5QrCodeRef.current
              .stop()
              .catch((err) => console.log("Cleanup stop error (can be ignored):", err));
          }
        } catch (err) {
          // Ignore errors during cleanup
          console.log("Cleanup error (can be ignored):", err);
        }
      }
    };
  }, []); // Empty dependency array - only run once on mount

  // Fetch product data from internal API route
  const fetchProductData = async (barcode: string) => {
    setIsLoadingProduct(true);
    setProductData(null);
    setError("");

    try {
      // Call our internal API route instead of external API directly
      const response = await fetch(`/api/lookup/${encodeURIComponent(barcode)}`);

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch product information.");
        return;
      }

      const data = await response.json();

      if (data.success && data.product) {
        setProductData(data.product);
      } else {
        setError("No product information found for this barcode.");
      }
    } catch (err) {
      console.error("Failed to fetch product data:", err);
      setError("Failed to fetch product information. Please check your internet connection.");
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const startScanning = async () => {
    if (!html5QrCodeRef.current) {
      console.log("startScanning started but no html5QrCodeRef.current ...");
      return;
    }

    try {
      console.log("start scanning...");
      setError("");
      isStoppingRef.current = false;

      // Configuration for scanning
      const config = {
        fps: 10, // Frame per second for scanning
        qrbox: { width: 250, height: 250 }, // Scanning box dimensions
      };

      // Success callback when barcode is scanned
      const qrCodeSuccessCallback = async (decodedText: string) => {
        console.log(`Code scanned: ${decodedText}`);
        setScannedResult(decodedText);
        // Stop scanning after successful scan
        console.log("Stopping scanner after successful scan...");
        await stopScanning();
        // Fetch product data
        await fetchProductData(decodedText);
      };

      // Error callback (optional, usually can be ignored)
      const qrCodeErrorCallback = () => {
        // Ignore errors during scanning (they happen frequently)
        console.log("Common error - no barcode detected");
      };

      // Start scanning with back camera (environment)
      await html5QrCodeRef.current.start(
        { facingMode: "environment" }, // Use back camera on mobile
        config,
        qrCodeSuccessCallback,
        qrCodeErrorCallback
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Failed to start scanning:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to start camera: ${errorMessage}`);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (!html5QrCodeRef.current || isStoppingRef.current) return;

    // If already not scanning, just update state and return
    if (!isScanning) {
      console.log("Scanner already stopped, updating state anyway");
      setIsScanning(false);
      await html5QrCodeRef.current.stop();
      return;
    }

    isStoppingRef.current = true;
    setIsScanning(false); // Update state immediately to prevent UI issues

    try {
      // Try to get the scanner state
      let state;
      try {
        state = html5QrCodeRef.current.getState();
        console.log("Scanner state:", state);
      } catch (stateErr) {
        console.log("Could not get scanner state:", stateErr);
        // If we can't get state, assume it's not running
        isStoppingRef.current = false;
        return;
      }

      // Only call stop if scanner is actually running (state 2 = SCANNING)
      if (state === 2) {
        await html5QrCodeRef.current.stop();
        console.log("Scanner stopped successfully");
      } else {
        console.log("Scanner not in scanning state (state: " + state + "), skipping stop call");
      }
    } catch (err) {
      console.log("Error during stop:", err);
      // Don't show error to user for "not running" errors
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (!errorMessage.includes("not running") && !errorMessage.includes("not paused")) {
        setError(`Failed to stop camera: ${errorMessage}`);
      }
    } finally {
      isStoppingRef.current = false;
    }
  };

  // Validation #4: Rate limiting
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Filter out attempts older than 1 minute
    const recentAttempts = uploadAttempts.filter(time => time > oneMinuteAgo);

    if (recentAttempts.length >= MAX_UPLOADS_PER_MINUTE) {
      setError('Too many upload attempts. Please wait a moment before trying again.');
      return false;
    }

    setUploadAttempts([...recentAttempts, now]);
    return true;
  };

  // Validation #1: File type and size validation
  const validateFileTypeAndSize = (file: File): string | null => {
    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload a valid image (JPEG, PNG, WebP, or BMP).';
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    }

    // Validate file extension matches MIME type
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'bmp'];
    if (!extension || !validExtensions.includes(extension)) {
      return 'Invalid file extension. Please use JPG, PNG, WebP, or BMP files.';
    }

    return null;
  };

  // Validation #2: Magic bytes validation
  const validateImageFile = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = (e) => {
        if (!e.target?.result) {
          resolve(false);
          return;
        }

        const arr = new Uint8Array(e.target.result as ArrayBuffer).subarray(0, 4);
        let header = '';
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }

        // Check magic bytes for common image formats
        const validHeaders = [
          'ffd8ffe0', // JPEG
          'ffd8ffe1', // JPEG
          'ffd8ffe2', // JPEG
          'ffd8ffe8', // JPEG
          '89504e47', // PNG
          '47494638', // GIF
          '424d',     // BMP
          '52494646', // WEBP (starts with RIFF)
        ];

        resolve(validHeaders.some(h => header.startsWith(h)));
      };

      reader.onerror = () => {
        resolve(false);
      };

      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  };

  // Validation #3: Image dimension validation
  const validateImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  };

  // Sanitize file name for logging
  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent multiple simultaneous uploads
    if (isUploading) {
      console.log("Upload already in progress");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!html5QrCodeRef.current) {
      console.log("handleFileUpload: no html5QrCodeRef.current");
      return;
    }

    setIsUploading(true);

    try {
      setError("");
      console.log("Processing file:", sanitizeFileName(file.name));

      // Validation #4: Check rate limit
      if (!checkRateLimit()) {
        return;
      }

      // Validation #1: File type and size validation
      const typeError = validateFileTypeAndSize(file);
      if (typeError) {
        setError(typeError);
        console.warn("File validation failed:", typeError);
        return;
      }

      // Validation #2: Magic bytes validation
      const isValidImage = await validateImageFile(file);
      if (!isValidImage) {
        setError('File appears to be corrupted or not a valid image.');
        console.warn("Magic bytes validation failed");
        return;
      }

      // Validation #3: Image dimension validation
      try {
        const { width, height } = await validateImageDimensions(file);
        console.log(`Image dimensions: ${width}x${height}`);

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          setError(`Image dimensions too large. Maximum ${MAX_DIMENSION}x${MAX_DIMENSION} pixels.`);
          console.warn(`Image too large: ${width}x${height}`);
          return;
        }
      } catch (dimensionErr) {
        setError('Failed to validate image dimensions. The file may be corrupted.');
        console.error("Dimension validation error:", dimensionErr);
        return;
      }

      // Stop camera scanning if it's running
      if (isScanning) {
        await stopScanning();
      }

      // Scan the uploaded file
      console.log("Starting barcode scan...");
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      console.log(`File scan successful: ${decodedText}`);
      setScannedResult(decodedText);

      // Log successful scan (without sensitive data)
      console.log("Barcode scan completed successfully", {
        method: 'upload',
        fileSize: file.size,
        fileType: file.type
      });

      // Fetch product data
      await fetchProductData(decodedText);

    } catch (err) {
      console.error("Failed to scan file:", err);

      // Validation #8: Comprehensive error handling with user-friendly messages
      let userMessage = 'Failed to scan image. ';
      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();

        if (errorMsg.includes('no barcode') || errorMsg.includes('no qr code') || errorMsg.includes('couldn\'t find')) {
          userMessage += 'No barcode or QR code found in the image. Please ensure the image contains a clear, visible barcode.';
        } else if (errorMsg.includes('format')) {
          userMessage += 'Unsupported barcode format detected.';
        } else if (errorMsg.includes('decode') || errorMsg.includes('read')) {
          userMessage += 'Unable to decode the barcode. Please try a clearer image.';
        } else {
          userMessage += 'Please try a different image with a clear barcode.';
        }

        console.error("Scan error details:", err.message);
      } else {
        userMessage += 'An unexpected error occurred.';
      }

      setError(userMessage);

      // Log error for monitoring
      console.log("Barcode scan error", {
        method: 'upload',
        error: err instanceof Error ? err.message : 'Unknown error'
      });

    } finally {
      setIsUploading(false);

      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4 px-4 pb-8 pt-12">
      <div className="w-full max-w-md">
        <div
          id="reader"
          className="w-full rounded-lg overflow-hidden border-2 border-gray-300"
        />
      </div>

      <div className="flex gap-2">
        {!isScanning ? (
          <Button onClick={startScanning} className="flex items-center gap-2 cursor-pointer">
            <Camera className="w-4 h-4" />
            Start Scanning
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="destructive"
            className="flex items-center gap-2 cursor-pointer"
          >
            <CameraOff className="w-4 h-4" />
            Stop Scanning
          </Button>
        )}

        <Button
          onClick={handleUploadClick}
          variant="outline"
          className="flex items-center gap-2 cursor-pointer"
          disabled={isScanning || isUploading}
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Processing...' : 'Upload Image'}
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {error && (
        <div className="w-full max-w-md p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {scannedResult && !productData && !isLoadingProduct && !error && (
        <div className="w-full max-w-md p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p className="font-semibold">Scanned Barcode:</p>
          <p className="break-all">{scannedResult}</p>
        </div>
      )}

      {isLoadingProduct && (
        <div className="w-full max-w-2xl p-6 bg-white border border-gray-300 rounded-lg shadow-md">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <p className="text-gray-700">Loading product information...</p>
          </div>
        </div>
      )}

      {productData && (
        <ProductCard
          image={productData.images?.[0] || '/placeholder-product.png'}
          title={productData.product_name || productData.title || 'Unknown Product'}
          price={parseFloat(productData.stores?.[0]?.price || '0')}
          category={productData.category || 'Uncategorized'}
          manufacturer={productData.manufacturer || productData.brand}
          barcode={productData.barcode_number}
          description={productData.description}
          className="w-full max-w-2xl"
          onSaveClick={() => {
            // TODO: Implement save functionality
            console.log('Save product:', productData.barcode_number);
          }}
          onAddToCartClick={() => {
            // TODO: Implement add to cart functionality
            console.log('Add to cart:', productData.barcode_number);
          }}
        />
      )}
    </div>
  );
};

export default SarnovaBarcodeScanner;
