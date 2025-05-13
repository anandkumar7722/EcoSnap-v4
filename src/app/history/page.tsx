
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClassificationResultCard } from '@/components/classification-result-card';
import { getFromLocalStorage, saveToLocalStorage } from '@/lib/storage';
import type { ClassificationRecord, WasteCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, Info, ArrowLeft, PackageSearch, Atom, Recycle, Leaf, Package, HelpCircle, Lightbulb, Smile } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'ecoSnapHistory';

interface SuggestionInfo {
  title: string;
  tip: string;
  icon: React.ElementType;
}

const wasteCategorySuggestions: Record<WasteCategory, SuggestionInfo> = {
  ewaste: {
    title: "E-Waste",
    tip: "Got old gadgets? E-waste like phones, laptops, and batteries needs a special send-off. Tossing them in the regular bin is a no-go! Hunt for local e-waste drop-off points or special collection events. It's a fantastic way to recycle them responsibly and keep harmful stuff out of landfills. High five for being an e-waste hero!",
    icon: Atom
  },
  plastic: {
    title: "Plastic Items",
    tip: "Hey there, plastic warrior! Before you toss that plastic bottle or container in the recycling, give it a quick rinse – it helps a lot! Not all plastics are created equal, so check what your local heroes (recycling program!) accept (usually #1, #2, or #5). Oh, and squashing bottles saves space. You're doing great!",
    icon: Recycle
  },
  biowaste: {
    title: "Bio-Waste Goodness",
    tip: "Food scraps and yard trimmings are like gold for your garden! Instead of the landfill, these organic goodies can be composted at home or in a city green bin if you have one. Imagine turning leftovers into super-food for plants! It's a win-win for reducing waste and making the earth happy.",
    icon: Leaf
  },
  cardboard: {
    title: "Cardboard Conqueror",
    tip: "Flatten those cardboard boxes like a recycling ninja – it makes a huge difference in the bin! Try to peel off any plastic tape or big labels. Keeping your cardboard clean and dry is key to making sure it gets a new life. You're awesome for this!",
    icon: Package
  },
  paper: {
    title: "Paper Power",
    tip: "Paper, like newspapers, magazines, and your old notes, loves to be recycled! Just make sure it's clean and dry. Things like greasy pizza boxes or waxy paper cups can be tricky, so keep those out. Every clean sheet you recycle is a tree saved. Go you!",
    icon: Package // Reusing Package icon for paper
  },
  glass: {
    title: "Glass Champions",
    tip: "Give those glass bottles and jars a little rinse before they head to recycling. Metal lids can often be recycled too, but check your local rules – sometimes they go separately. Some places even like glass sorted by color. Thanks for helping glass get a shiny new beginning!",
    icon: Lightbulb // Using Lightbulb as a generic 'tip' icon for Glass
  },
  other: {
    title: "Mysterious 'Other' Items",
    tip: "Hmm, the 'other' pile! These are the tricky items that don't quite fit the usual recycling or compost bins. The best superpower here is to try and create less of this waste in the first place. Think reusable items or products with minimal packaging. Every little bit helps to shrink this pile!",
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
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Smile className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <h2 className="text-xl sm:text-2xl font-semibold text-center text-primary">Friendly Eco Tips!</h2>
          </div>
          <Accordion type="single" collapsible className="w-full bg-card p-3 sm:p-4 rounded-lg shadow-md">
            {(Object.keys(wasteCategorySuggestions) as WasteCategory[]).map((categoryKey) => {
              const suggestion = wasteCategorySuggestions[categoryKey];
              const IconComponent = suggestion.icon;
              return (
                <AccordionItem value={categoryKey} key={categoryKey} className="border-b last:border-b-0">
                  <AccordionTrigger className="text-base sm:text-lg hover:no-underline py-3 text-left">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                      {suggestion.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3 pl-8 sm:pl-10 leading-relaxed">
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

