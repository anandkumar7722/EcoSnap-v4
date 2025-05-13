
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClassificationResultCard } from '@/components/classification-result-card';
import { getFromLocalStorage, saveToLocalStorage } from '@/lib/storage';
import type { ClassificationRecord, WasteCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, Info, ArrowLeft, PackageSearch, Atom, Recycle, Leaf, Package, HelpCircle, Lightbulb } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'ecoSnapHistory';

interface SuggestionInfo {
  title: string;
  tip: string;
  icon: React.ElementType;
}

const wasteCategorySuggestions: Record<WasteCategory, SuggestionInfo> = {
  ewaste: { 
    title: "E-Waste", 
    tip: "Electronic waste like old phones, computers, and batteries should not go into regular bins. Look for designated e-waste drop-off locations or collection events in your area to ensure safe and proper recycling.", 
    icon: Atom 
  },
  plastic: { 
    title: "Plastic", 
    tip: "Rinse plastic containers before recycling. Check your local guidelines as not all plastic types are accepted (e.g., #1, #2, #5 often are). Flatten bottles to save space.", 
    icon: Recycle 
  },
  biowaste: { 
    title: "Bio-Waste", 
    tip: "Compostable items like food scraps and yard waste can be composted at home or placed in municipal green bins. This reduces landfill waste and creates valuable soil amendment.", 
    icon: Leaf 
  },
  cardboard: { 
    title: "Cardboard", 
    tip: "Flatten all cardboard boxes to save space in your recycling bin. Remove any plastic tape, labels, or packaging inserts if possible. Keep it clean and dry.", 
    icon: Package 
  },
  paper: { 
    title: "Paper", 
    tip: "Keep paper clean and dry. Most types of paper like newspapers, magazines, and office paper are recyclable. Avoid recycling paper soiled with food, grease, or wax coatings.", 
    icon: Package // Reusing Package icon for paper
  },
  glass: { 
    title: "Glass", 
    tip: "Rinse glass bottles and jars. Metal lids can often be recycled separately (check local rules). Some facilities may require sorting by color (clear, brown, green).", 
    icon: Lightbulb // Using Lightbulb as a generic 'tip' icon for Glass
  },
  other: { 
    title: "Other Items", 
    tip: "This category includes items that don't fit into standard recycling or compost streams. Try to reduce 'other' waste by choosing products with less packaging or opting for reusable alternatives whenever possible.", 
    icon: HelpCircle 
  },
};

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
      <div className="w-full max-w-5xl">
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

        <section className="mt-10 sm:mt-12 w-full max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-center text-primary">Eco Tips for Recycling</h2>
          <Accordion type="single" collapsible className="w-full bg-card p-4 rounded-lg shadow">
            {(Object.keys(wasteCategorySuggestions) as WasteCategory[]).map((categoryKey) => {
              const suggestion = wasteCategorySuggestions[categoryKey];
              const IconComponent = suggestion.icon;
              return (
                <AccordionItem value={categoryKey} key={categoryKey} className="border-b last:border-b-0">
                  <AccordionTrigger className="text-base sm:text-lg hover:no-underline py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                      {suggestion.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3 pl-8 sm:pl-10">
                    {suggestion.tip}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>

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
