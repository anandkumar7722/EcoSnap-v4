"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClassificationResultCard } from '@/components/classification-result-card';
import { getFromLocalStorage, saveToLocalStorage } from '@/lib/storage';
import type { ClassificationRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trash2, Info, ArrowLeft } from 'lucide-react';

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
    // Render nothing or a loading skeleton on the server/initial client render
    // to avoid hydration mismatch with localStorage.
    return (
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-primary">Classification History</h1>
        <p>Loading history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Classification History</h1>
          {history.length > 0 && (
            <Button variant="destructive" onClick={clearHistory} size="sm">
              <Trash2 className="mr-2 h-4 w-4" /> Clear History
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No History Yet!</AlertTitle>
            <AlertDescription>
              You haven&apos;t classified any waste items. Start by uploading an image on the <Link href="/" className="font-medium text-primary hover:underline">home page</Link>.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((record) => (
              <ClassificationResultCard key={record.id} {...record} />
            ))}
          </div>
        )}
        <div className="mt-12 text-center">
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
