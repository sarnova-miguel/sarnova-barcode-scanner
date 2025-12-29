"use client";

import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";

const SarnovaBarcodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // Initialize Html5Qrcode instance
    html5QrCodeRef.current = new Html5Qrcode("reader");

    // Cleanup on unmount
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch((err) => console.error("Failed to stop scanning:", err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startScanning = async () => {
    if (!html5QrCodeRef.current) {
      console.log("start scan but no html5QrCodeRef.curent ...");
      return;
    }

    try {
      console.log("start scanning...");
      setError("");

      // Configuration for scanning
      const config = {
        fps: 10, // Frame per second for scanning
        qrbox: { width: 250, height: 250 }, // Scanning box dimensions
      };

      // Success callback when barcode is scanned
      const qrCodeSuccessCallback = (decodedText: string) => {
        console.log(`Code scanned: ${decodedText}`);
        setScannedResult(decodedText);
      };

      // Error callback (optional, usually can be ignored)
      const qrCodeErrorCallback = () => {
        // Ignore errors during scanning (they happen frequently)
        console.log("Code scan error");
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
    if (!html5QrCodeRef.current) return;

    try {
      await html5QrCodeRef.current.stop();
      setIsScanning(false);
    } catch (err) {
      console.error("Failed to stop scanning:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to stop camera: ${errorMessage}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="w-full max-w-md">
        <div
          id="reader"
          className="w-full rounded-lg overflow-hidden border-2 border-gray-300"
        />
      </div>

      <div className="flex gap-2">
        {!isScanning ? (
          <Button onClick={startScanning} className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Start Scanning
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <CameraOff className="w-4 h-4" />
            Stop Scanning
          </Button>
        )}
      </div>

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
