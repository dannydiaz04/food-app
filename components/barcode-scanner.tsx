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
        <div className="relative w-full max-w-[640px] aspect-[4/3] mx-auto overflow-hidden">
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                muted
                autoPlay
            />
            {/* Scanning overlay with crosshair - made more visible on mobile */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Horizontal line - thicker for mobile */}
                <div className="absolute left-[15%] right-[15%] top-1/2 h-[3px] bg-red-500/70 transform -translate-y-1/2" />
                {/* Vertical line - thicker for mobile */}
                <div className="absolute top-[15%] bottom-[15%] left-1/2 w-[3px] bg-red-500/70 transform -translate-x-1/2" />
                {/* Corner brackets - larger for mobile */}
                <div className="absolute top-[15%] left-[15%] w-[30px] h-[30px] border-l-[3px] border-t-[3px] border-red-500/70" />
                <div className="absolute top-[15%] right-[15%] w-[30px] h-[30px] border-r-[3px] border-t-[3px] border-red-500/70" />
                <div className="absolute bottom-[15%] left-[15%] w-[30px] h-[30px] border-l-[3px] border-b-[3px] border-red-500/70" />
                <div className="absolute bottom-[15%] right-[15%] w-[30px] h-[30px] border-r-[3px] border-b-[3px] border-red-500/70" />
            </div>
        </div>
    );
}

export default BarcodeScanner;