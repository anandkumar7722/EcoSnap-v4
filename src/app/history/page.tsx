
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClassificationResultCard } from '@/components/classification-result-card';
import { getFromLocalStorage, saveToLocalStorage } from '@/lib/storage';
import type { ClassificationRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trash2, Info, ArrowLeft, PackageSearch } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'ecoSnapHistory';

export default function HistoryPage() {
  const [history, setHistory] = useState<ClassificationRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedHistory = getFromLocalStorage<ClassificationRecord[]>(HISTORY_STORAGE_KEY, []);
    setHistory(storedHistory.sort((a, b) => b.timestamp - a.timestamp)); // Sort newest first
  }, []);

  const clearHistory = () => {
    saveToLocalStorage(HISTORY_STORAGE_KEY, []);
    setHistory([]);
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center w-full pt-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-primary">Classification History</h1>
        <div className="flex flex-col items-center justify-center text-muted-foreground">
            <PackageSearch className="w-12 h-12 mb-4" />
            <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-5xl"> {/* Increased max-width slightly for larger screens */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-2 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Classification History</h1>
          {history.length > 0 && (
            <Button variant="destructive" onClick={clearHistory} size="sm">
              <Trash2 className="mr-2 h-4 w-4" /> Clear History
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <Alert className="max-w-lg mx-auto">
            <Info className="h-4 w-4" />
            <AlertTitle>No History Yet!</AlertTitle>
            <AlertDescription>
              You haven&apos;t classified any waste items. Start by uploading an image on the <Link href="/" className="font-medium text-primary hover:underline">home page</Link>.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {history.map((record) => (
              <ClassificationResultCard key={record.id} {...record} />
            ))}
          </div>
        )}
        <div className="mt-10 sm:mt-12 text-center">
            <Button variant="outline" asChild>
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
