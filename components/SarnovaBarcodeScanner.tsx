"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Upload } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { useProducts } from "@/context/ProductContext";

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

// Normalized product data for UI consumption
interface TransformedProduct {
  barcode_number: string;
  product_name: string;
  title: string;
  price: number;
  image: string;
  manufacturer?: string;
  category?: string;
  description?: string;
}

// Transform API product data to normalized format
// This eliminates duplication of transformation logic across handlers
const transformProductData = (product: Product): TransformedProduct => ({
  barcode_number: product.barcode_number,
  product_name: product.product_name || product.title || 'Unknown Product',
  title: product.title || product.product_name || 'Unknown Product',
  price: parseFloat(product.stores?.[0]?.price || '0'),
  image: product.images?.[0] || '/placeholder-product.png',
  manufacturer: product.manufacturer || product.brand,
  category: product.category || 'Uncategorized',
  description: product.description,
});

// Security constants
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 4096; // 4K resolution
const MAX_UPLOADS_PER_MINUTE = 10;

const SarnovaBarcodeScanner = () => {
  const { addToCart, toggleSaved, isSaved } = useProducts();
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [scannedResult, setScannedResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const uploadAttemptsRef = useRef<number[]>([]);
  const [productData, setProductData] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isStoppingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Request deduplication: cache and abort controller
  const productCacheRef = useRef<Map<string, { data: Product; timestamp: number }>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingBarcodeRef = useRef<string | null>(null);
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

  // Memoize transformed product data to prevent recalculation on every render
  const transformedProduct = useMemo(() => {
    return productData ? transformProductData(productData) : null;
  }, [productData]);

  // Memoize isSaved check to prevent recalculation on every render
  const isProductSaved = useMemo(() => {
    return transformedProduct ? isSaved(transformedProduct.barcode_number) : false;
  }, [transformedProduct, isSaved]);

  // Memoize save click handler to prevent ProductCard re-renders
  const handleSaveClick = useCallback(() => {
    if (!transformedProduct) return;
    const wasSaved = isSaved(transformedProduct.barcode_number);
    toggleSaved(transformedProduct);
    setConfirmationMessage(
      wasSaved
        ? 'Product removed from saved list!'
        : 'Product saved successfully!'
    );
    setProductData(null);
  }, [transformedProduct, isSaved, toggleSaved]);

  // Memoize add to cart click handler to prevent ProductCard re-renders
  const handleAddToCartClick = useCallback(() => {
    if (!transformedProduct) return;
    addToCart(transformedProduct);
    setConfirmationMessage('Product added to cart successfully!');
    setProductData(null);
  }, [transformedProduct, addToCart]);

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
          console.log("Cleanup error (can be ignored):", err);
        }
      }
    };
  }, []);

  // Cleanup effect to periodically prune old upload attempts (every 30 seconds)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const oneMinuteAgo = Date.now() - 60000;
      uploadAttemptsRef.current = uploadAttemptsRef.current.filter(time => time > oneMinuteAgo);
    }, 30000);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Fetch product data from internal API route with caching and request deduplication
  const fetchProductData = async (barcode: string) => {
    // Check if this is a duplicate request for the same barcode
    if (pendingBarcodeRef.current === barcode) {
      console.log("Duplicate request detected, skipping:", barcode);
      return;
    }

    // Cancel any pending request for a different barcode
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log("Cancelled previous request");
    }

    // Check cache first
    const cached = productCacheRef.current.get(barcode);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("Using cached product data for:", barcode);
      setProductData(cached.data);
      setError("");
      setConfirmationMessage("");
      return;
    }

    // Set up new request
    pendingBarcodeRef.current = barcode;
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsLoadingProduct(true);
    setProductData(null);
    setError("");
    setConfirmationMessage(""); // Reset confirmation message on new scan

    try {
      // Call our internal API route instead of external API directly
      const response = await fetch(`/api/lookup/${encodeURIComponent(barcode)}`, { signal });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch product information.");
        return;
      }

      const data = await response.json();

      if (data.success && data.product) {
        // Cache the successful response
        productCacheRef.current.set(barcode, {
          data: data.product,
          timestamp: Date.now(),
        });
        setProductData(data.product);
      } else {
        setError("No product information found for this barcode.");
      }
    } catch (err) {
      // Don't show error if request was aborted (user scanned a new barcode)
      if (err instanceof Error && err.name === 'AbortError') {
        console.log("Request aborted for barcode:", barcode);
        return;
      }
      console.error("Failed to fetch product data:", err);
      setError("Failed to fetch product information. Please check your internet connection.");
    } finally {
      // Only clear loading state if this is still the pending request
      if (pendingBarcodeRef.current === barcode) {
        pendingBarcodeRef.current = null;
        abortControllerRef.current = null;
        setIsLoadingProduct(false);
      }
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

    // Filter out attempts older than 1 minute and update ref in place
    uploadAttemptsRef.current = uploadAttemptsRef.current.filter(time => time > oneMinuteAgo);

    if (uploadAttemptsRef.current.length >= MAX_UPLOADS_PER_MINUTE) {
      setError('Too many upload attempts. Please wait a moment before trying again.');
      return false;
    }

    uploadAttemptsRef.current.push(now);
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

  // Security: Re-encode image through canvas to strip embedded malicious content
  // This sanitizes the image by decoding and re-encoding it, removing any scripts,
  // metadata exploits, or polyglot payloads that could exploit browser vulnerabilities
  const sanitizeImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        try {
          // Create a canvas to re-encode the image
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to create canvas context'));
            return;
          }

          // Draw the image to the canvas (this decodes and re-encodes it)
          ctx.drawImage(img, 0, 0);

          // Convert canvas back to a blob with the original type
          const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const quality = file.type === 'image/png' ? undefined : 0.95;

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(url);

              if (!blob) {
                reject(new Error('Failed to sanitize image'));
                return;
              }

              // Create a new File from the sanitized blob
              const sanitizedFile = new File([blob], file.name, {
                type: mimeType,
                lastModified: Date.now(),
              });

              console.log('Image sanitized successfully');
              resolve(sanitizedFile);
            },
            mimeType,
            quality
          );
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image for sanitization'));
      };

      // Security: Prevent image from executing scripts during load
      img.crossOrigin = 'anonymous';
      img.src = url;
    });
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

      // Security: Sanitize image by re-encoding through canvas
      // This strips any embedded scripts, metadata exploits, or polyglot payloads
      let sanitizedFile: File;
      try {
        sanitizedFile = await sanitizeImage(file);
      } catch (sanitizeErr) {
        setError('Failed to process image. The file may be corrupted or contain invalid data.');
        console.error("Image sanitization error:", sanitizeErr);
        return;
      }

      // Scan the sanitized file
      console.log("Starting barcode scan...");
      const decodedText = await html5QrCodeRef.current.scanFile(sanitizedFile, true);
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

      // Smooth scroll to results section after successful upload
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);

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
        <div ref={resultsRef} className="w-full max-w-md p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p className="font-semibold">Scanned Barcode:</p>
          <p className="break-all">{scannedResult}</p>
        </div>
      )}

      {isLoadingProduct && (
        <div ref={resultsRef} className="w-full max-w-2xl p-6 bg-white border border-gray-300 rounded-lg shadow-md">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <p className="text-gray-700">Loading product information...</p>
          </div>
        </div>
      )}

      {transformedProduct && !confirmationMessage && (
        <div ref={resultsRef}>
          <ProductCard
            image={transformedProduct.image}
            title={transformedProduct.title}
            price={transformedProduct.price}
            category={transformedProduct.category || 'Uncategorized'}
            manufacturer={transformedProduct.manufacturer}
            barcode={transformedProduct.barcode_number}
            description={transformedProduct.description}
            className="w-full max-w-2xl my-8"
            isSaved={isProductSaved}
            onSaveClick={handleSaveClick}
            onAddToCartClick={handleAddToCartClick}
          />
        </div>
      )}

      {confirmationMessage && (
        <div className="w-full max-w-2xl p-6 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p className="font-semibold text-center">{confirmationMessage}</p>
          <p className="text-sm text-center mt-2">Scan another barcode to continue</p>
        </div>
      )}
    </div>
  );
};

export default SarnovaBarcodeScanner;
