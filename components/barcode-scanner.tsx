"use client"

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onError: (error: Error) => void;
  onClose?: () => void;
}

const BarcodeScanner = forwardRef<{ stopCamera: () => void }, BarcodeScannerProps>(
  ({ onDetected, onError, onClose }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isClient, setIsClient] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);
    
    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.QR_CODE,
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_128,
    ]);
    
    const codeReader = useRef(new BrowserMultiFormatReader(hints));

    // Expose the stopCamera method to parent components
    useImperativeHandle(ref, () => ({
      stopCamera: () => {
        stopCamera();
        if (onClose) {
          onClose();
        }
      }
    }));

    // Stop camera when component unmounts
    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      codeReader.current.reset();
    };

    useEffect(() => {
      setIsClient(true);
      
      // Cleanup function to stop camera when component unmounts
      return () => {
        stopCamera();
      };
    }, []);

    useEffect(() => {
      if (!isClient || !videoRef.current) return;

      let mounted = true;
      const reader = codeReader.current;

      reader
        .decodeFromVideoDevice(null, videoRef.current, (result, error) => {
          if (!mounted) return;
          if (result) {
            const barcode = result.getText();
            console.log('Barcode detected:', barcode);
            onDetected(barcode);
          }
          if (error) {
            if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
              console.log('Camera error:', error.name);
              onError(error);
            }
            // Only log non-NotFoundException errors
            if (error.name !== 'NotFoundException') {
              console.error('Scanning error:', error);
              onError(error);
            }
          }
        })
        .then(controls => {
          // Store the stream to be able to stop it later
          if (videoRef.current && videoRef.current.srcObject) {
            streamRef.current = videoRef.current.srcObject as MediaStream;
          }
        })
        .catch((err) => {
          if (mounted) {
            console.error('Scanner initialization error:', err);
            onError(err);
          }
        });

      return () => {
        mounted = false;
        stopCamera();
      };
    }, [isClient, onDetected, onError]);

    // Handle the close button click
    const handleClose = () => {
      stopCamera();
      if (onClose) {
        onClose();
      }
    };

    if (!isClient) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
          autoPlay
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-[15%] right-[15%] top-1/2 h-[3px] bg-red-500/70 transform -translate-y-1/2" />
          <div className="absolute top-[15%] bottom-[15%] left-1/2 w-[3px] bg-red-500/70 transform -translate-x-1/2" />
          <div className="absolute top-[15%] left-[15%] w-[30px] h-[30px] border-l-[3px] border-t-[3px] border-red-500/70" />
          <div className="absolute top-[15%] right-[15%] w-[30px] h-[30px] border-r-[3px] border-t-[3px] border-red-500/70" />
          <div className="absolute bottom-[15%] left-[15%] w-[30px] h-[30px] border-l-[3px] border-b-[3px] border-red-500/70" />
          <div className="absolute bottom-[15%] right-[15%] w-[30px] h-[30px] border-r-[3px] border-b-[3px] border-red-500/70" />
        </div>
        
        <Button
          onClick={handleClose}
          variant="ghost"
          className="absolute top-4 right-4 text-white"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    );
  }
);

BarcodeScanner.displayName = 'BarcodeScanner';

export default BarcodeScanner;