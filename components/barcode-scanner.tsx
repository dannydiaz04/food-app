"use client"

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';

function BarcodeScanner({ onDetected, onError }) {
    const videoRef = useRef(null);
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    
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

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !videoRef.current) return;

        let mounted = true;
        const reader = codeReader.current;

        reader
            .decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
                if (!mounted) return;
                if (result) {
                    const barcode = result.getText();
                    console.log('Barcode detected:', barcode); // Debug log
                    onDetected(barcode);
                    // Instead of directly navigating, let the parent component handle it
                    // router.push(`/add-food/macro-calculator?barcode=${barcode}`);
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
            .catch((err) => {
                if (mounted) {
                    console.error('Scanner initialization error:', err);
                    onError(err);
                }
            });

        return () => {
            mounted = false;
            reader.reset();
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isClient, onDetected, onError]);

    if (!isClient) {
        return null;
    }

    return (
        <div className="relative w-full max-w-[640px] aspect-[4/3] mx-auto overflow-hidden">
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
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
        </div>
    );
}

export default BarcodeScanner;