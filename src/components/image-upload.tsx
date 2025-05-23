
"use client";

import { ChangeEvent, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Loader2, AlertTriangle, ImagePlus } from 'lucide-react'; // Changed Icon
import type { ClassifyWasteOutput } from '@/ai/flows/classify-waste';

interface ImageUploadProps {
  onClassify: (imageDataUri: string) => Promise<ClassifyWasteOutput | null>;
  isClassifying: boolean;
  classificationError: string | null;
  initialPromptText?: string; // Optional: To prefill some context if needed by AI
}

export function ImageUpload({ onClassify, isClassifying, classificationError, initialPromptText }: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [internalError, setInternalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for Genkit media
        setInternalError("Image size should not exceed 4MB.");
        setSelectedImage(null);
        setPreviewUrl(null);
        return;
      }
      setSelectedImage(file);
      setInternalError(null); // Clear previous internal errors
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClassify = async () => {
    if (selectedImage && previewUrl) {
      setInternalError(null); // Clear previous internal errors before new attempt
      await onClassify(previewUrl);
      // Do not reset selectedImage/previewUrl here, let parent component decide if modal closes
    } else {
      setInternalError("Please select an image first.");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Effect to clear errors if the component is re-rendered (e.g. modal reopens)
  useEffect(() => {
    setInternalError(null);
    // classificationError is managed by parent
  }, []);


  return (
    <Card className="w-full max-w-md shadow-lg border-none"> {/* Removed border to fit modal better */}
      <CardHeader className="pt-2 pb-4"> {/* Adjusted padding */}
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg"> {/* Smaller title, responsive */}
          <Camera className="h-5 w-5 text-primary" />
          Snap & Classify
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        <Button variant="outline" onClick={triggerFileInput} className="w-full">
          <ImagePlus className="mr-2 h-4 w-4" /> {previewUrl ? "Change Image" : "Choose or Capture Image"}
        </Button>
        
        {previewUrl && (
          <div className="mt-4 border rounded-md overflow-hidden aspect-video relative">
            <Image src={previewUrl} alt="Selected waste preview" layout="fill" objectFit="cover" data-ai-hint="upload preview" />
          </div>
        )}
        
        {(internalError || classificationError) && (
          <div className="mt-2 text-sm text-destructive flex items-center gap-1 p-2 bg-destructive/10 rounded-md">
            <AlertTriangle className="h-4 w-4" />
            {internalError || classificationError}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleClassify} disabled={!selectedImage || isClassifying} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          {isClassifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Classifying...
            </>
          ) : (
            'Classify Waste'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

