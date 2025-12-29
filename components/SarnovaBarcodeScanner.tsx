"use client";

import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Upload } from "lucide-react";

const SarnovaBarcodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string>("");
  const [error, setError] = useState<string>("");
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!html5QrCodeRef.current) {
      console.log("handleFileUpload: no html5QrCodeRef.current");
      return;
    }

    try {
      setError("");
      console.log("Scanning file:", file.name);

      // Stop camera scanning if it's running
      if (isScanning) {
        await stopScanning();
      }

      // Scan the uploaded file
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      console.log(`File scan successful: ${decodedText}`);
      setScannedResult(decodedText);
    } catch (err) {
      console.error("Failed to scan file:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to scan image: ${errorMessage}`);
    } finally {
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
          disabled={isScanning}
        >
          <Upload className="w-4 h-4" />
          Upload Image
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

      {scannedResult && (
        <div className="w-full max-w-md p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <p className="font-semibold">Scanned Result:</p>
          <p className="break-all">{scannedResult}</p>
        </div>
      )}
    </div>
  );
};

export default SarnovaBarcodeScanner;
