
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ClassificationResultCard } from '@/components/classification-result-card';
import { getFromLocalStorage, saveToLocalStorage } from '@/lib/storage';
import type { ClassificationRecord, WasteCategory, TipInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, Info, ArrowLeft, PackageSearch, Atom, Recycle, Leaf, Package, HelpCircle, Lightbulb, Smile, BookOpen, Tv2, Wind, Apple, AlertTriangle } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'ecoSnapHistory';

const wasteCategorySuggestions: Record<WasteCategory | 'general' | 'recyclable' | 'compostable' | 'non-recyclable', TipInfo> = {
  general: {
    title: "General Waste Item",
    icon: HelpCircle,
    definition: "Items that don't fit into specific recycling or compost streams, often destined for landfill.",
    fiveRs: {
      reduce: "Minimize purchases of single-use or non-recyclable items. Opt for products with less packaging.",
      reuse: "Before discarding, think if the item can be repurposed for another use.",
      recycle: "Check local guidelines carefully. Some 'other' items might have special drop-off locations.",
      educate: "Understand what makes items non-recyclable in your area and share this knowledge.",
      support: "Choose products designed for durability and recyclability. Support businesses with take-back programs for hard-to-recycle items."
    }
  },
  cardboard: {
    title: "Cardboard",
    icon: Package,
    definition: "Paper-based material, commonly corrugated for boxes or flat for cereal boxes and shoe boxes.",
    fiveRs: {
      reduce: "Opt for digital subscriptions and statements. Choose products with minimal packaging.",
      reuse: "Use cardboard boxes for storage, moving, or as a base for art projects and gardening.",
      recycle: "Flatten ALL boxes. Keep them clean and dry. Remove excessive plastic tape if possible.",
      educate: "Teach family and friends to flatten boxes to save space in recycling bins and collection trucks.",
      support: "Buy products made from recycled cardboard. Support companies using sustainable packaging."
    }
  },
  paper: {
    title: "Paper",
    icon: BookOpen,
    definition: "Items like newspapers, magazines, office paper, and mail (not contaminated with food or wax).",
    fiveRs: {
      reduce: "Go paperless with bills and statements. Print double-sided. Use digital notebooks.",
      reuse: "Use scrap paper for notes or drafts. Use the back of printed sheets for non-official printing.",
      recycle: "Keep paper clean and dry. Most paper types are recyclable. Check local guidelines for specifics (e.g., shredded paper).",
      educate: "Promote paperless options at work or school. Explain the benefits of recycling paper.",
      support: "Purchase recycled paper products. Support businesses that use sustainable paper sourcing."
    }
  },
  plastic: { 
    title: "Plastic (General)",
    icon: Recycle,
    definition: "A wide range of synthetic or semi-synthetic materials, often found in packaging, bottles, and containers.",
    fiveRs: {
      reduce: "Avoid single-use plastics (bags, straws, cutlery, bottles). Choose items with less plastic packaging.",
      reuse: "Use reusable water bottles, coffee cups, and shopping bags. Repurpose plastic containers for storage.",
      recycle: "Check local recycling guidelines for accepted plastic types (resin codes #1-#7). Rinse containers. Remove lids if required locally.",
      educate: "Share information about plastic pollution and local recycling programs. Lead by example.",
      support: "Choose products made from recycled plastic. Support businesses with plastic reduction initiatives or take-back programs."
    }
  },
  plasticPete: {
    title: "Plastic - PETE (#1)",
    icon: Recycle, 
    definition: "Polyethylene Terephthalate. Common in beverage bottles, food containers. Widely recyclable.",
    fiveRs: {
      reduce: "Choose reusable bottles. Buy beverages in larger containers or from concentrate.",
      reuse: "PETE bottles can be refilled (check for safety) or used for DIY projects if clean.",
      recycle: "Empty and rinse. Most curbside programs accept PETE bottles. Lids on or off depends on local rules.",
      educate: "Explain that PETE is one of the most commonly recycled plastics. Encourage proper preparation.",
      support: "Look for products made with recycled PETE (rPET).",
    }
  },
  plasticHdpe: {
    title: "Plastic - HDPE (#2)",
    icon: Recycle, 
    definition: "High-Density Polyethylene. Found in milk jugs, detergent bottles. Often recyclable.",
    fiveRs: {
      reduce: "Buy concentrated detergents. Opt for bar soap over liquid soap in plastic bottles.",
      reuse: "HDPE containers are sturdy and can be reused for storage or gardening.",
      recycle: "Empty and rinse. Commonly accepted in curbside recycling.",
      educate: "Highlight that HDPE is a valuable recyclable plastic.",
      support: "Choose products packaged in HDPE when possible if you need plastic.",
    }
  },
  plasticPp: {
    title: "Plastic - PP (#5)",
    icon: Package, 
    definition: "Polypropylene. Used for yogurt containers, bottle caps, some tubs. Increasingly recyclable.",
    fiveRs: {
      reduce: "Buy yogurt in larger tubs. Consider making some items (like sauces) at home.",
      reuse: "PP containers are good for food storage or organizing small items.",
      recycle: "Check local guidelines; PP acceptance is growing but not universal. Clean items thoroughly.",
      educate: "Advocate for PP recycling in your community if it's not yet available.",
      support: "Support brands using easily recyclable PP packaging or offering PP take-back.",
    }
  },
  plasticPs: {
    title: "Plastic - PS (#6)",
    icon: AlertTriangle, 
    definition: "Polystyrene. Found in disposable foam cups/plates, some food containers, packing peanuts. Rarely recycled.",
    fiveRs: {
      reduce: "AVOID PS whenever possible. Use reusable cups and containers. Ask restaurants for non-PS takeout containers.",
      reuse: "Packing peanuts can be reused for shipping. Clean PS containers could be used for non-food storage, but prioritize reduction.",
      recycle: "Very difficult to recycle and rarely accepted. Check for specialized drop-off locations, but they are uncommon.",
      educate: "Inform others about the environmental issues with PS and the lack of recycling options. Encourage alternatives.",
      support: "Actively choose businesses that do not use PS packaging. Support bans on single-use polystyrene.",
    }
  },
  plasticOther: {
    title: "Plastic - Other (#7)",
    icon: HelpCircle, 
    definition: "Miscellaneous plastics, including multi-layer materials or newer bioplastics. Recyclability varies greatly.",
    fiveRs: {
      reduce: "Be cautious with items marked #7; try to find alternatives if unsure about recyclability. Avoid products with excessive or mixed-material plastic packaging.",
      reuse: "Reuse depends heavily on the specific item. Some #7 containers might be durable enough for storage.",
      recycle: "Generally NOT recyclable in curbside programs unless specifically stated by your local facility. Check local guidelines meticulously.",
      educate: "Highlight that #7 is a catch-all category and often means non-recyclable. Emphasize looking for known recyclable plastics (#1, #2, sometimes #5).",
      support: "Support innovation in sustainable packaging. Ask companies about the recyclability of their #7 plastics.",
    }
  },
  glass: {
    title: "Glass",
    icon: Lightbulb, 
    definition: "Made from sand, soda ash, and limestone. Infinitely recyclable without loss of quality.",
    fiveRs: {
      reduce: "Buy items in glass when it's a good alternative to plastic. Consider products with refill options.",
      reuse: "Glass jars and bottles are excellent for food storage, preserving, or DIY crafts.",
      recycle: "Rinse clean. Most curbside programs accept glass bottles and jars. Some areas require color sorting (clear, brown, green).",
      educate: "Promote glass as a highly recyclable material. Remind others to rinse items.",
      support: "Choose products packaged in glass. Support local bottle return schemes if available."
    }
  },
  ewaste: {
    title: "E-Waste",
    icon: Tv2, 
    definition: "Electronic waste like old phones, computers, TVs, batteries, cables. Contains valuable and hazardous materials.",
    fiveRs: {
      reduce: "Repair electronics instead of replacing them. Buy durable, high-quality products. Resist upgrading too frequently.",
      reuse: "Donate working electronics to charities or schools. Sell or give away usable items.",
      recycle: "NEVER put e-waste in regular trash or recycling bins. Find designated e-waste collection events or drop-off locations (e.g., some retailers, municipal sites).",
      educate: "Inform others about the hazards of improper e-waste disposal and the importance of specialized recycling.",
      support: "Support companies with take-back programs for old electronics or those that design for repairability and recyclability."
    }
  },
  biowaste: {
    title: "Bio-Waste / Organic",
    icon: Leaf, 
    definition: "Organic matter like food scraps (fruit, vegetables, coffee grounds), yard trimmings, and some paper products (if not waxy or coated).",
    fiveRs: {
      reduce: "Plan meals to reduce food waste. Store food properly to extend its life. Only buy what you need.",
      reuse: "Use vegetable scraps to make broth. Regrow some vegetables from scraps.",
      recycle: "Compost at home (backyard bin or worm farm). Use municipal green bin programs if available. Check local rules for what's accepted (e.g., meat, dairy).",
      educate: "Teach others about composting benefits. Share tips for reducing food waste in the kitchen.",
      support: "Support community composting initiatives. Choose businesses that compost their organic waste."
    }
  },
  metal: {
    title: "Metal",
    icon: Wind, 
    definition: "Includes aluminum cans, steel/tin cans, and sometimes other metal items. Highly recyclable.",
    fiveRs: {
      reduce: "Choose reusable containers over single-use cans where possible.",
      reuse: "Metal cans can be used for storage, planters, or DIY projects.",
      recycle: "Empty and rinse cans. Most curbside programs accept aluminum and steel cans. Check locally for other metal items (e.g., scrap metal).",
      educate: "Highlight that metals are valuable and can be recycled repeatedly. Encourage proper preparation.",
      support: "Buy products in recyclable metal packaging. Support scrap metal recycling facilities."
    }
  },
  other: { 
    title: "Trash / Other Non-Recyclables",
    icon: Trash2,
    definition: "Items that cannot be recycled or composted in your local programs, destined for landfill or incineration.",
    fiveRs: {
      reduce: "The most important 'R' for trash! Choose products with less packaging, opt for reusables, and repair items instead of discarding.",
      reuse: "Before trashing, double-check if any part can be repurposed or if there's a specialized, albeit less common, recycling stream (e.g., Terracycle for specific items).",
      recycle: "Ensure you're not accidentally trashing items that ARE recyclable or compostable in your area. When in doubt, check local guidelines.",
      educate: "Understand what truly belongs in the trash in your municipality and why. Share this knowledge to reduce contamination in recycling/compost bins.",
      support: "Support businesses that design products for longevity and with end-of-life in mind. Advocate for better waste management infrastructure and policies."
    }
  },
  organic: { // Explicitly defining 'organic' as it's a valid WasteCategory from types.ts
    title: "Organic Waste", 
    icon: Apple, 
    definition: "Primarily food scraps and plant matter that can decompose naturally.",
    fiveRs: { 
      reduce: "Smart shopping, proper food storage, and using leftovers creatively can significantly reduce organic waste.",
      reuse: "Many vegetable scraps can be used to make broth. Coffee grounds can be great for your garden.",
      recycle: "Compost at home using a bin, pile, or worm farm. Utilize municipal green bin collection services if available.",
      educate: "Share the benefits of composting and how-to guides. Raise awareness about the impact of food waste.",
      support: "Support local farms that use compost, community gardens, or businesses with organic waste diversion programs."
    }
  },
  recyclable: {
    title: "Recyclable Item",
    icon: Recycle,
    definition: "Items that can be processed and materials recovered for reuse. This is a broad category; specific material type (e.g., paper, specific plastic) determines actual recyclability in your area.",
    fiveRs: {
      reduce: "Choose items with less packaging overall. Opt for durable, reusable alternatives to single-use items.",
      reuse: "Before recycling, see if the item can be repurposed. Jars for storage, paper for scrap, etc.",
      recycle: "Key: Check local guidelines! Not all 'recyclable' materials are accepted everywhere. Clean and dry items are best. Empty containers. For plastics, know which numbers (#1-7) your facility takes.",
      educate: "Learn your local recycling rules thoroughly and share them. Explain common contaminants (like food in containers, plastic bags in paper recycling).",
      support: "Buy products made from recycled materials. Support companies with clear recycling information and sustainable packaging."
    }
  },
  compostable: {
    title: "Compostable Item",
    icon: Leaf,
    definition: "Organic matter that can naturally decompose into nutrient-rich compost. Primarily food scraps and yard waste.",
    fiveRs: {
      reduce: "Minimize food waste by planning meals, storing food correctly, and using leftovers. Avoid over-purchasing perishable goods.",
      reuse: "Use vegetable scraps to make broth. Regrow certain vegetables (like green onions) from scraps.",
      recycle: "Compost at home (backyard bin, worm farm) or use municipal green bin/organics collection if available. Check what's accepted (e.g., meat, dairy, certified compostable plastics often have specific rules).",
      educate: "Promote composting benefits for soil health and waste reduction. Share tips on what can and cannot be composted locally.",
      support: "Support community composting programs or local farms that use compost. If buying 'compostable' products, verify they are accepted by your local composting facility."
    }
  },
  'non-recyclable': {
    title: "Non-Recyclable Item",
    icon: Trash2,
    definition: "Items that currently cannot be recycled or composted through standard municipal programs and are typically sent to landfill.",
    fiveRs: {
      reduce: "This is the most crucial 'R' here! Avoid items known to be non-recyclable (e.g., Styrofoam, many flexible plastics). Choose products with minimal or recyclable/compostable packaging. Repair items instead of replacing.",
      reuse: "Before discarding, think if the item (or parts of it) can be repurposed for a completely different use. This might be for crafts, organization, etc.",
      recycle: "Double-check if there's a special drop-off or mail-in program for the specific item (e.g., some stores take plastic bags, Terracycle for hard-to-recycle waste). However, most items in this category won't have standard recycling options.",
      educate: "Understand why certain items are non-recyclable (e.g., mixed materials, contamination, lack of market). Share this to help others make informed choices.",
      support: "Support businesses that design for durability and use easily recyclable/compostable materials. Advocate for policies that reduce non-recyclable waste and improve waste management infrastructure."
    }
  }
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

  // Determine which categories to show tips for. Include specific ones and new broad AI ones.
  const categoriesForTips = Array.from(new Set([
    ...Object.keys(wasteCategorySuggestions) as Array<keyof typeof wasteCategorySuggestions>,
    ...history.map(record => record.category)
  ])).filter(catKey => wasteCategorySuggestions[catKey as keyof typeof wasteCategorySuggestions]);


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
            {categoriesForTips.map((categoryKey) => {
              const suggestion = wasteCategorySuggestions[categoryKey as keyof typeof wasteCategorySuggestions];
              if (!suggestion) return null; // Should not happen with the filter above
              const IconComponent = suggestion.icon;
              return (
                <AccordionItem value={categoryKey} key={categoryKey} className="border-b last:border-b-0">
                  <AccordionTrigger className="text-base sm:text-lg hover:no-underline py-3 text-left">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                      {suggestion.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-3 pl-8 sm:pl-10">
                    <p className="italic mb-2">{suggestion.definition}</p>
                    <div className="space-y-1.5">
                        <p><strong className="text-primary/90">Reduce:</strong> {suggestion.fiveRs.reduce}</p>
                        <p><strong className="text-primary/90">Reuse:</strong> {suggestion.fiveRs.reuse}</p>
                        <p><strong className="text-primary/90">Recycle:</strong> {suggestion.fiveRs.recycle}</p>
                        <p><strong className="text-primary/90">Educate:</strong> {suggestion.fiveRs.educate}</p>
                        <p><strong className="text-primary/90">Support:</strong> {suggestion.fiveRs.support}</p>
                    </div>
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

