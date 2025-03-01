"use client"

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { MealEntry } from "@/components/meal-entry";
import type { FoodItem } from "@/types/food";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from 'next/navigation';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onError: (error: Error) => void;
  onClose?: () => void;
  onSuccess?: () => void;
}

const BarcodeScanner = forwardRef<{ stopCamera: () => void }, BarcodeScannerProps>(
  ({ onDetected, onError, onClose, onSuccess }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isClient, setIsClient] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);
    
    // Add states for food entry processing
    const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
    const [foodData, setFoodData] = useState<FoodItem | null>(null);
    const [showMealEntry, setShowMealEntry] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    
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

    // Process barcode and fetch food data
    const processBarcodeResult = async (barcodeData: string, saveToFoodInfo: boolean = false) => {
      try {
        setScannedBarcode(barcodeData);
        setIsProcessing(true);
        setError(null);
        
        // First, stop the camera to save resources and give focus to the food entry
        stopCamera();
        
        // Fetch food data based on barcode
        const response = await fetch(`/api/lookup-barcode?barcode=${barcodeData}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch food data for barcode");
        }
        
        const data = await response.json();
        
        // Format the data as a FoodItem
        const formattedData: FoodItem = {
          food_ky: data.id || Math.random().toString(36).substring(2, 15),
          foodName: data.foodName || data.product_name || "Unknown Food",
          brands: data.brands || "",
          unit: data.unit || "g",
          serving_size: data.serving_size || "100",
          serving_size_g: parseFloat(data.serving_size_g?.toString() || "100"),
          serving_size_imported: data.serving_size_imported || null,
          product_quantity_unit: data.product_quantity_unit || "g",
          serving_quantity: parseFloat(data.serving_quantity?.toString() || "1"),
          serving_quantity_unit: data.serving_quantity_unit || "serving",
          perGramValues: {
            calories: data.calories_per_gram || 0,
            carbs: data.carbs_per_gram || 0,
            fats: data.fats_per_gram || 0,
            protein: data.protein_per_gram || 0,
            sugar: data.sugar_per_gram || 0,
            fiber: data.fiber_per_gram || 0,
          },
          calories: data.calories || 0,
          carbs: data.carbs || 0,
          fats: data.fats || 0,
          protein: data.protein || 0,
          sugar: data.sugar || 0,
          fiber: data.fiber || 0,
          sodium: data.sodium || 0,
          potassium: data.potassium || 0,
          barcode: barcodeData,
        };
        
        setFoodData(formattedData);
        setShowMealEntry(true);
        
        // If saveToFoodInfo is true, also save to food_info table
        if (saveToFoodInfo) {
          await fetch("/api/save-to-food-info", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formattedData),
          });
        }
      } catch (error) {
        console.error("Error processing barcode:", error);
        setError("Failed to process barcode: " + (error instanceof Error ? error.message : String(error)));
      } finally {
        setIsProcessing(false);
      }
    };

    const handleMealEntryConfirm = async (foodData: any, saveToFoodInfo: boolean) => {
      try {
        setIsProcessing(true);
        
        // Save the food entry
        const response = await fetch("/api/macro-calculator", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(foodData),
        });
        
        if (!response.ok) {
          throw new Error("Failed to save food entry");
        }
        
        // If user chose to save to food_info table
        if (saveToFoodInfo) {
          await fetch("/api/save-to-food-info", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(foodData),
          });
        }
        
        // Show confirmation and call onSuccess callback
        setShowMealEntry(false);
        setShowConfirmation(true);
        
        // Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
      } catch (error) {
        console.error("Error saving food entry:", error);
        setError("Failed to save food entry: " + (error instanceof Error ? error.message : String(error)));
      } finally {
        setIsProcessing(false);
      }
    };

    const handleConfirmationClose = () => {
      setShowConfirmation(false);
      if (onClose) {
        onClose();
      }
    };

    const handleClose = () => {
      stopCamera();
      if (onClose) {
        onClose();
      }
    };

    useEffect(() => {
      setIsClient(true);
      
      // Cleanup function to stop camera when component unmounts
      return () => {
        stopCamera();
      };
    }, []);

    const [videoConstraints, setVideoConstraints] = useState({
      width: { ideal: window.innerWidth },
      height: { ideal: window.innerHeight },
      facingMode: "environment"
    });

    useEffect(() => {
      if (!isClient || !videoRef.current) return;

      let mounted = true;
      const reader = codeReader.current;

      // Define exact constraints to match viewport
      const constraints = {
        video: videoConstraints
      };

      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          if (!mounted || !videoRef.current) return;
          
          // Set the stream to video element
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          // Get actual dimensions after camera is initialized
          const { videoWidth, videoHeight } = videoRef.current;
          
          // Adjust video element to match camera output ratio
          if (videoWidth && videoHeight) {
            videoRef.current.style.objectFit = "cover";
            
            // Apply specific styling to center the video properly
            const containerAspect = window.innerWidth / window.innerHeight;
            const videoAspect = videoWidth / videoHeight;
            
            if (videoAspect > containerAspect) {
              // Video is wider than container
              videoRef.current.style.width = "100%";
              videoRef.current.style.height = "auto";
            } else {
              // Video is taller than container
              videoRef.current.style.width = "auto";
              videoRef.current.style.height = "100%";
            }
          }
          
          // Now start decoding from the properly configured stream
          return reader.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
            // Existing decode handler logic
            if (!mounted) return;
            if (result) {
              const barcode = result.getText();
              console.log('Barcode detected:', barcode);
              processBarcodeResult(barcode, false);
            }
            if (error && error.name !== 'NotFoundException') {
              console.error('Scanning error:', error);
              onError(error);
            }
          });
        })
        .catch((err) => {
          if (mounted) {
            console.error('Scanner initialization error:', err);
            onError(err);
          }
        });

      // Add a resize handler to adjust on orientation change
      const handleResize = () => {
        setVideoConstraints({
          width: { ideal: window.innerWidth },
          height: { ideal: window.innerHeight },
          facingMode: "environment"
        });
      };
      
      window.addEventListener('resize', handleResize);

      return () => {
        mounted = false;
        stopCamera();
        window.removeEventListener('resize', handleResize);
      };
    }, [isClient, onDetected, onError, videoConstraints]);

    return (
      <div className="fixed inset-0 z-50 bg-black">
        {!showMealEntry && !showConfirmation && (
          <>
            <video
              ref={videoRef}
              className="h-full w-full object-cover absolute inset-0"
              playsInline
              muted
              autoPlay
            />
            <div className="absolute inset-0 pointer-events-none">
              {/* Darkened overlay with transparent center */}
              <div className="absolute inset-0 bg-black bg-opacity-50">
                {/* Transparent center matching the effective scan area */}
                <div className="absolute left-[15%] right-[15%] top-[30%] bottom-[30%] border-2 border-red-500/70 bg-transparent"></div>
              </div>
              
              {/* Scanning line animation - UPDATED */}
              <div 
                className="absolute left-[15%] right-[15%] h-[2px] bg-red-500/70"
                style={{
                  animation: 'scanFullHeight 2s infinite linear',
                  top: 'calc(30%)',
                }}
              ></div>
              
              {/* Corner markers */}
              <div className="absolute top-[30%] left-[15%] w-[20px] h-[20px] border-l-2 border-t-2 border-red-500/70"></div>
              <div className="absolute top-[30%] right-[15%] w-[20px] h-[20px] border-r-2 border-t-2 border-red-500/70"></div>
              <div className="absolute bottom-[30%] left-[15%] w-[20px] h-[20px] border-l-2 border-b-2 border-red-500/70"></div>
              <div className="absolute bottom-[30%] right-[15%] w-[20px] h-[20px] border-r-2 border-b-2 border-red-500/70"></div>
            </div>
            
            {/* Header with title and close button */}
            <div className="absolute top-0 left-0 right-0 bg-black/50 p-4 flex justify-between items-center">
              <h2 className="text-white text-xl font-bold">Scan Barcode</h2>
              <Button
                onClick={handleClose}
                variant="ghost"
                className="text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Loading indicator */}
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                <div className="text-white text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Processing barcode...</p>
                </div>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="absolute bottom-20 left-4 right-4">
                <Alert className="bg-red-500 text-white border-none">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
          </>
        )}
        
        {/* Meal Entry Dialog - Note we're using an absolute position to prevent nesting */}
        {showMealEntry && foodData && (
          <MealEntry
            isOpen={showMealEntry}
            onClose={() => {
              setShowMealEntry(false);
              handleClose();
            }}
            onConfirm={handleMealEntryConfirm}
            selectedFood={foodData}
          />
        )}
        
        {/* Success Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center bg-background bg-opacity-95 z-50">
            <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Success!</h2>
              <p className="mb-6">Your food has been saved to your meal journal!</p>
              <div className="flex justify-end">
                <Button onClick={handleConfirmationClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

BarcodeScanner.displayName = 'BarcodeScanner';

export default BarcodeScanner;