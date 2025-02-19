"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Quagga from "@ericblade/quagga2"; // Ensure that quagga is installed (or use "quagga2" if preferred)

interface BarcodeScannerProps {
    onDetected: (barcodeValue: string) => void;
    onError?: (error: Error) => void;
}

export default function BarcodeScanner({ onDetected, onError }: BarcodeScannerProps) {
    const [isScanning, setIsScanning] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastDetection = useRef<string | null>(null);
    const lastDetectionTime = useRef<number>(0);

    const handleDetected = useCallback((result: any) => {
        if (result && result.codeResult && result.codeResult.code) {
            const code = result.codeResult.code;
            const now = Date.now();
            // Prevent duplicate scans within 2 seconds
            if (code !== lastDetection.current || now - lastDetectionTime.current > 2000) {
                console.log("Detected barcode:", code);
                lastDetection.current = code;
                lastDetectionTime.current = now;
                setIsScanning(false);
                Quagga.stop();
                onDetected(code);
            }
        }
    }, [onDetected]);

    useEffect(() => {
        if (!containerRef.current) return;

        Quagga.init(
            {
                inputStream: {
                    type: "LiveStream",
                    target: containerRef.current,
                    constraints: {
                        facingMode: "environment",
                        aspectRatio: { ideal: 1 }
                    }
                },
                decoder: {
                    // List the barcode formats you want to support.
                    // You can add readers such as "code_128_reader", "upc_reader", etc.
                    readers: ["ean_reader", "code_128_reader", "upc_reader"]
                }
            },
            (err: any) => {
                if (err) {
                    console.error("Quagga initialization error:", err);
                    if (onError) {
                        onError(err instanceof Error ? err : new Error("Initialization error"));
                    }
                    return;
                }
                Quagga.start();
            }
        );

        Quagga.onDetected(handleDetected);

        return () => {
            Quagga.offDetected(handleDetected);
            Quagga.stop();
        };
    }, [handleDetected, onError]);

    if (!isScanning) {
        return (
            <div className="text-center p-4">
                <p>Barcode detected! Processing...</p>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-square max-w-[300px] mx-auto">
            <div ref={containerRef} className="w-full h-full" />
            <div className="absolute inset-0 border-2 border-green-500 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-1 bg-green-500/50" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-3/4 bg-green-500/50" />
            </div>
        </div>
    );
}