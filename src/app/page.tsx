"use client";

import { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/image-upload';
import { ClassificationResultCard } from '@/components/classification-result-card';
import { classifyWaste, type ClassifyWasteOutput } from '@/ai/flows/classify-waste';
import { saveToLocalStorage, getFromLocalStorage } from '@/lib/storage';
import type { ClassificationRecord } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { History, ArrowRight } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'ecoSnapHistory';
const MAX_HISTORY_ITEMS = 10; // Limit history to last 10 items for performance

export default function HomePage() {
  const [latestResult, setLatestResult] = useState<ClassificationRecord | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationError, setClassificationError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Optionally load the very last result to show on mount, or keep it empty
    // const history = getFromLocalStorage<ClassificationRecord[]>(HISTORY_STORAGE_KEY, []);
    // if (history.length > 0) {
    //   setLatestResult(history[0]);
    // }
  }, []);

  const handleClassify = async (imageDataUri: string): Promise<ClassifyWasteOutput | null> => {
    setIsClassifying(true);
    setClassificationError(null);
    setLatestResult(null); // Clear previous latest result while classifying

    try {
      const result = await classifyWaste({ photoDataUri: imageDataUri });
      if (result) {
        const newRecord: ClassificationRecord = {
          id: Date.now().toString(),
          imageDataUri,
          category: result.category,
          confidence: result.confidence,
          timestamp: Date.now(),
        };
        setLatestResult(newRecord);

        // Save to history
        const currentHistory = getFromLocalStorage<ClassificationRecord[]>(HISTORY_STORAGE_KEY, []);
        const updatedHistory = [newRecord, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);
        saveToLocalStorage(HISTORY_STORAGE_KEY, updatedHistory);
        
        toast({
          title: "Classification Successful!",
          description: `Waste identified as ${result.category}.`,
        });
        return result;
      } else {
        setClassificationError("Could not classify the image. The AI returned no result.");
        toast({
          title: "Classification Failed",
          description: "The AI could not process the image.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Classification error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during classification.";
      setClassificationError(errorMessage);
      toast({
        title: "Classification Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-12">
      <section className="w-full flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
          Snap, Classify, Recycle!
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Help the environment by easily identifying waste types. Just upload a photo, and let our AI do the rest.
        </p>
      </section>

      <ImageUpload 
        onClassify={handleClassify} 
        isClassifying={isClassifying}
        classificationError={classificationError}
      />

      {latestResult && (
        <section className="w-full max-w-md mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">Latest Classification</h2>
          <ClassificationResultCard {...latestResult} />
        </section>
      )}
      
      <Separator className="my-8" />

      <section className="text-center">
        <h2 className="text-2xl font-semibold mb-4">View Your Scan History</h2>
        <p className="mb-4 text-muted-foreground">
          Keep track of all your waste classifications.
        </p>
        <Button asChild size="lg">
          <Link href="/history">
            <History className="mr-2 h-5 w-5" />
            Go to History
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
