import React, { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';

function BarcodeScanner({ onDetected, onError }) {
    const videoRef = useRef(null);
    
    // Create hints map to enable TRY_HARDER and specify possible formats
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
        // Add other formats as needed
    ]);
    
    const codeReader = useRef(new BrowserMultiFormatReader(hints));

    useEffect(() => {
        if (!videoRef.current) return;

        let mounted = true;
        const reader = codeReader.current;  // Store ref value

        reader
            .decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
                if (!mounted) return;
                if (result) {
                    onDetected(result.getText());
                }
                if (error) {
                    // Only report critical errors, not normal scanning attempts
                    if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
                        console.log('Stopping due to error:', error.name);
                        onError(error);
                    }
                    // Ignore NotFoundException which occurs during normal scanning
                    if (!(error.name === 'NotFoundException')) {
                        onError(error);
                    }
                }
            })
            .catch((err) => {
                if (mounted) onError(err);
            });

        return () => {
            mounted = false;
            reader.reset();  // Use stored ref value
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onDetected, onError]);

    return (
        <div className="relative w-[640px] h-[480px] mx-auto overflow-hidden">
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
            />
            {/* Scanning overlay with crosshair */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Horizontal line */}
                <div className="absolute left-1/4 right-1/4 top-1/2 h-[2px] bg-red-500 transform -translate-y-1/2" />
                {/* Vertical line */}
                <div className="absolute top-1/4 bottom-1/4 left-1/2 w-[2px] bg-red-500 transform -translate-x-1/2" />
                {/* Optional: Corner brackets for visual guidance */}
                <div className="absolute top-1/4 left-1/4 w-[20px] h-[20px] border-l-2 border-t-2 border-red-500" />
                <div className="absolute top-1/4 right-1/4 w-[20px] h-[20px] border-r-2 border-t-2 border-red-500" />
                <div className="absolute bottom-1/4 left-1/4 w-[20px] h-[20px] border-l-2 border-b-2 border-red-500" />
                <div className="absolute bottom-1/4 right-1/4 w-[20px] h-[20px] border-r-2 border-b-2 border-red-500" />
            </div>
        </div>
    );
}

export default BarcodeScanner;