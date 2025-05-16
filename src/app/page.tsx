
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { classifyWaste, type ClassifyWasteOutput } from '@/ai/flows/classify-waste';
import { saveToLocalStorage, getFromLocalStorage } from '@/lib/storage';
import type { ClassificationRecord, UserProfile, WasteCategory } from '@/lib/types';
import { ImageUpload } from '@/components/image-upload';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Award, ImagePlus, ChevronRight, BarChart3, MapPin, BotIcon, LogIn, UserPlus as SignupIcon, Trash2, Leaf, Package as PackageIcon, Edit, AlertTriangle, Tv2, Apple, Wind, Droplets, Lightbulb, Info, Loader2, Recycle, HelpCircle, Star as StarIcon, BookOpen, Users, ShoppingBag, CheckCircle, Settings2, Search } from 'lucide-react'; 
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';


const HISTORY_STORAGE_KEY = 'ecoSnapHistory';
const USER_DATA_KEY = 'ecoSnapUserData';
const MAX_HISTORY_DISPLAY_ITEMS = 5; 

const WASTE_POINTS: Record<WasteCategory, number> = {
  ewaste: 100,
  plastic: 50,
  biowaste: 60,
  cardboard: 80,
  paper: 70,
  glass: 30,
  metal: 40,
  organic: 60, 
  other: 10,
  plasticOther: 20,
  plasticPete: 55,
  plasticHdpe: 55,
  plasticPp: 45,
  plasticPs: 15,
};

const CO2_SAVED_PER_POINT = 0.1; 

interface LevelInfo {
  name: string;
  minScore: number;
  targetForNext: number;
  cardColor: string; 
  textColor: string; 
  badgeIconContainerColor: string; 
  badgeIconColor: string; 
  progressBarIndicatorColor: string;
  progressBarTrackColor: string; 
}

const LEVELS: LevelInfo[] = [
  { name: 'Bronze', minScore: 0, targetForNext: 500, cardColor: 'bg-yellow-700', textColor: 'text-yellow-100', badgeIconContainerColor: 'bg-yellow-500', badgeIconColor: 'text-yellow-50', progressBarIndicatorColor: 'bg-yellow-400', progressBarTrackColor: 'bg-yellow-900' },
  { name: 'Silver', minScore: 500, targetForNext: 1500, cardColor: 'bg-slate-600', textColor: 'text-slate-100', badgeIconContainerColor: 'bg-slate-400', badgeIconColor: 'text-slate-50', progressBarIndicatorColor: 'bg-slate-300', progressBarTrackColor: 'bg-slate-800' },
  { name: 'Gold', minScore: 1500, targetForNext: 3000, cardColor: 'bg-amber-600', textColor: 'text-amber-100', badgeIconContainerColor: 'bg-amber-400', badgeIconColor: 'text-amber-50', progressBarIndicatorColor: 'bg-amber-300', progressBarTrackColor: 'bg-amber-800' },
  { name: 'Diamond', minScore: 3000, targetForNext: Infinity, cardColor: 'bg-sky-600', textColor: 'text-sky-100', badgeIconContainerColor: 'bg-sky-400', badgeIconColor: 'text-sky-50', progressBarIndicatorColor: 'bg-sky-300', progressBarTrackColor: 'bg-sky-800' },
];

interface TipInfo {
  title: string;
  icon: React.ElementType;
  fiveRs: {
    reduce: string;
    reuse: string;
    recycle: string;
    educate: string;
    support: string;
  };
}

const wasteCategoryFiveRTips: Partial<Record<WasteCategory, TipInfo>> = {
  cardboard: {
    title: "Cardboard",
    icon: PackageIcon,
    fiveRs: {
      reduce: "Opt for digital subscriptions. Choose products with minimal packaging. Buy in bulk.",
      reuse: "Use boxes for storage, moving, or shipping. Create DIY crafts, organizers, or pet toys.",
      recycle: "Flatten ALL boxes. Keep them clean and dry. Remove excessive plastic tape if possible. Pizza boxes: discard if greasy.",
      educate: "Teach family/friends to flatten boxes. Explain why clean cardboard is vital for recycling quality.",
      support: "Buy products made from recycled cardboard. Choose companies with sustainable packaging initiatives."
    }
  },
  paper: {
    title: "Paper",
    icon: BookOpen,
    fiveRs: {
      reduce: "Go paperless with bills and statements. Print double-sided. Use digital notebooks.",
      reuse: "Use scrap paper for notes or drafts. Use old newspapers for packing or cleaning.",
      recycle: "Keep paper clean and dry. Most paper (newspaper, office paper, magazines, mail) is recyclable. Shredded paper may need special handling (check local rules, often bagged). Avoid soiled paper (e.g., greasy food wrappers).",
      educate: "Share benefits of paper recycling. Label recycling bins clearly in offices/homes.",
      support: "Buy recycled paper products. Support sustainable forestry practices (e.g., FSC certified products)."
    }
  },
  plastic: {
    title: "Plastic",
    icon: Recycle,
    fiveRs: {
      reduce: "Carry reusable water bottles, coffee cups, and shopping bags. Avoid single-use plastics like straws and cutlery. Choose products with less plastic packaging.",
      reuse: "Repurpose plastic containers for food storage or organizing small items. Use durable plastic items multiple times.",
      recycle: "Check local guidelines for accepted plastic types (numbers 1-7). Rinse containers. Lids on or off depends on local rules.",
      educate: "Highlight issues of plastic pollution. Teach how to identify recyclable plastics.",
      support: "Choose products made from recycled plastic. Support businesses with plastic reduction or take-back programs."
    }
  },
  plasticPete: {
    title: "Plastic - PETE (#1)",
    icon: Recycle,
    fiveRs: {
      reduce: "Opt for larger beverage containers or make drinks at home. Choose products in glass or aluminum.",
      reuse: "PETE bottles can be refilled a few times if cleaned well, but avoid long-term reuse for food/drink due to potential leaching or bacterial growth. Can be used for non-food storage.",
      recycle: "Widely recycled. Empty and rinse bottles. Check if caps should be on or off locally.",
      educate: "Explain that PETE is one of the most commonly recycled plastics. Encourage proper rinsing.",
      support: "Look for products made with recycled PET (rPET). Support deposit return schemes."
    }
  },
  plasticHdpe: {
    title: "Plastic - HDPE (#2)",
    icon: Recycle,
    fiveRs: {
      reduce: "Buy concentrated detergents or cleaners to reduce bottle size. Use bar soap instead of liquid in plastic bottles.",
      reuse: "Sturdy HDPE containers (e.g., milk jugs, detergent bottles) can be cut and used as scoops, funnels, or for organizing.",
      recycle: "Widely recycled. Empty and rinse. Check local rules for caps (usually okay to leave on).",
      educate: "Inform that HDPE is a valuable recyclable material for new bottles, pipes, and lumber.",
      support: "Choose products packaged in HDPE where alternatives are less sustainable. Support community recycling programs."
    }
  },
  plasticPp: {
    title: "Plastic - PP (#5)",
    icon: PackageIcon, // Or Recycle
    fiveRs: {
      reduce: "Choose larger tubs of yogurt/butter. Use reusable food containers instead of single-use PP tubs.",
      reuse: "PP containers (yogurt cups, margarine tubs) are often good for storing leftovers, craft supplies, or starting seeds.",
      recycle: "Recyclability is increasing but varies by location. Check local guidelines. Often needs to be clean.",
      educate: "Raise awareness about whether PP is accepted locally. Emphasize cleaning before recycling.",
      support: "If PP is recycled locally, prioritize it. Some companies are now using recycled PP."
    }
  },
  plasticPs: {
    title: "Plastic - PS (#6)",
    icon: AlertTriangle, // To signify difficulty
    fiveRs: {
      reduce: "AVOID Polystyrene wherever possible. Use reusable cups and containers. Ask restaurants for non-PS takeout containers.",
      reuse: "Limited reuse. Packing peanuts can be reused for shipping. Clean PS containers might be used for non-food storage, but it's generally brittle.",
      recycle: "RARELY recycled curbside due to low density and contamination. Some specialized drop-off locations might exist for clean, foam-free PS.",
      educate: "Inform about the environmental problems of PS and its low recyclability. Promote alternatives.",
      support: "Support businesses that avoid PS packaging. Advocate for bans on single-use PS items."
    }
  },
  plasticOther: {
    title: "Plastic - Other (#7)",
    icon: HelpCircle,
    fiveRs: {
      reduce: "This is a catch-all; try to identify and reduce specific #7 items if possible. Focus on avoiding multi-layer packaging or items made from mixed/unidentified plastics.",
      reuse: "Reuse depends heavily on the specific item. Some #7 plastics are durable and reusable (e.g., some reusable water bottles).",
      recycle: "Generally NOT recyclable in curbside programs. Some specific #7 items (like PLA compostables) have their own disposal routes, but are not typical recycling. Check item-specific instructions.",
      educate: "Explain that #7 is complex. Encourage checking packaging for specific disposal info. Highlight the difficulty in recycling these.",
      support: "Choose products made from more easily recyclable plastics (#1, #2, sometimes #5). Support innovation in bio-based or truly compostable plastics."
    }
  },
  glass: {
    title: "Glass",
    icon: Lightbulb, // Using Lightbulb for generic 'tip'
    fiveRs: {
      reduce: "Buy products in larger glass containers. Opt for refillable options where available.",
      reuse: "Glass jars and bottles are excellent for food storage, preserving, vases, or organizing.",
      recycle: "Widely recyclable and can be recycled endlessly without loss of quality. Rinse clean. Check if different colors need tobe separated locally. Metal lids often recycled separately.",
      educate: "Emphasize the benefits of glass recycling (saves energy, resources). Caution about non-recyclable glass (Pyrex, ceramics, window glass).",
      support: "Choose products packaged in glass. Support local recycling programs for glass."
    }
  },
  ewaste: {
    title: "E-Waste",
    icon: Tv2,
    fiveRs: {
      reduce: "Extend the life of electronics. Repair instead of replacing. Avoid unnecessary upgrades.",
      reuse: "Donate working electronics to charities or schools. Sell used electronics. Use old phones/tablets for dedicated tasks (e.g., music player).",
      recycle: "NEVER put in regular trash/recycling. Find dedicated e-waste collection events or drop-off locations. Many retailers offer take-back programs.",
      educate: "Inform about hazardous materials in e-waste and the importance of special disposal. Share local e-waste recycling options.",
      support: "Support companies with good repair policies and take-back programs. Look for eco-certified electronics (e.g., EPEAT)."
    }
  },
  biowaste: {
    title: "Bio-Waste",
    icon: Apple,
    fiveRs: {
      reduce: "Plan meals to reduce food scraps. Store food properly to prevent spoilage. Compost fruit/veg peels instead of trashing.",
      reuse: "Use vegetable scraps to make broth. Regrow some vegetables from scraps (e.g., green onions).",
      recycle: "Compost at home (yard trimmings, fruit/veg scraps, coffee grounds). Use municipal green bin programs if available. Avoid meat, dairy, oily foods in home compost unless experienced.",
      educate: "Teach benefits of composting (reduces landfill, creates soil enricher). Explain what can/cannot be composted.",
      support: "Support community composting initiatives. Use compost in your garden."
    }
  },
  metal: {
    title: "Metal",
    icon: Settings2, // Example, could be a can icon if available
    fiveRs: {
      reduce: "Choose products with less metal packaging if alternatives are more sustainable overall. Use reusable containers instead of foil.",
      reuse: "Metal cans can be used for storage, planters, or DIY projects. Reuse aluminum foil if clean.",
      recycle: "Most metal cans (aluminum, steel) are highly recyclable. Rinse clean. Aerosol cans usually accepted if empty. Check local rules for scrap metal.",
      educate: "Highlight that metal can be recycled repeatedly. Explain the importance of rinsing cans.",
      support: "Buy products in recyclable metal packaging. Support scrap metal recycling facilities."
    }
  },
  other: { // Trash
    title: "Trash / Other",
    icon: Trash2,
    fiveRs: {
      reduce: "The ultimate goal! Conduct a waste audit to see what you throw away most and find alternatives. Prioritize items with no or minimal packaging. Refuse single-use items.",
      reuse: "Before trashing, think: can this be repaired? Can someone else use it? Can it be upcycled into something new?",
      recycle: "Double-check if any component of the 'other' item might be recyclable through special programs (e.g., textiles, soft plastics at store drop-offs). This category is for what's truly non-recyclable locally.",
      educate: "Raise awareness about waste reduction hierarchies (Reduce is best!). Share info on hard-to-recycle items and their alternatives.",
      support: "Support businesses that offer durable, repairable products or circular economy models. Advocate for better waste management infrastructure and producer responsibility."
    }
  }
};


const getCurrentLevel = (score: number): LevelInfo => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].minScore) {
      return LEVELS[i];
    }
  }
  return LEVELS[0]; 
};

const ImageWithFallback = ({
  src: initialSrcProp, 
  alt,
  dataAiHint,
  placeholderSize = "114x50", 
  sizes = "(max-width: 639px) 94px, 114px",
  className = "rounded-md object-cover",
  wrapperClassName = "relative w-[94px] h-[44px] sm:w-[114px] sm:h-[50px] rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center",
  icon,
  placeholderText
}: {
  src: string | null | undefined;
  alt: string;
  dataAiHint: string;
  placeholderSize?: string;
  sizes?: string;
  className?: string;
  wrapperClassName?: string;
  icon?: React.ReactNode;
  placeholderText?: string;
}) => {
  const validatedInitialSrc = initialSrcProp === "" || initialSrcProp === undefined ? null : initialSrcProp;
  const [currentSrc, setCurrentSrc] = useState(validatedInitialSrc);
  const [isError, setIsError] = useState(!validatedInitialSrc && !icon); 
  const [isLoading, setIsLoading] = useState(!!validatedInitialSrc);

  useEffect(() => {
    const validatedSrcPropOnUpdate = initialSrcProp === "" || initialSrcProp === undefined ? null : initialSrcProp;
    if (validatedSrcPropOnUpdate) {
      setCurrentSrc(validatedSrcPropOnUpdate);
      setIsError(false);
      setIsLoading(true);
    } else {
      setCurrentSrc(null); 
      setIsError(true); 
      setIsLoading(false);
    }
  }, [initialSrcProp]);

  const handleError = () => {
    if (!isError) setIsError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    if (currentSrc === initialSrcProp) setIsError(false);
  };
  
  const placeholderBaseUrl = "https://placehold.co";

  if (icon && (!currentSrc || isError)) {
    return (
      <div className={wrapperClassName.replace('bg-muted', 'bg-transparent')}>
        {icon}
      </div>
    );
  }

  if (!icon && (!currentSrc || isError)) {
    const placeholderUrl = placeholderText 
      ? `${placeholderBaseUrl}/${placeholderSize}.png?text=${encodeURIComponent(placeholderText)}`
      : `${placeholderBaseUrl}/${placeholderSize}.png`;
    return (
      <div className={wrapperClassName}>
        <Image
          src={placeholderUrl}
          alt={alt || "Placeholder"}
          fill
          className={className}
          sizes={sizes}
          data-ai-hint={`placeholder ${dataAiHint || ''}`.trim()}
          unoptimized={true} 
        />
      </div>
    );
  }
  
  if (currentSrc) {
    const isPlaceholderSrc = currentSrc.startsWith(placeholderBaseUrl);
    return (
      <div className={wrapperClassName}>
        {isLoading && !isPlaceholderSrc && <div className="absolute inset-0 flex items-center justify-center bg-muted/50"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
        <Image
          src={currentSrc} 
          alt={alt}
          fill
          className={cn(className, isLoading && !isPlaceholderSrc ? 'opacity-0' : 'opacity-100')}
          sizes={sizes}
          data-ai-hint={(isError || isPlaceholderSrc) ? `placeholder ${dataAiHint}`.trim() : dataAiHint}
          onError={handleError}
          onLoad={handleLoad}
          unoptimized={isPlaceholderSrc} 
        />
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
       <PackageIcon className="w-1/2 h-1/2 text-muted-foreground opacity-50" />
    </div>
  );
};


const topHorizontalCategories: Array<{
  id: WasteCategory;
  name: string;
  imageUrl?: string;
  icon?: React.ElementType;
  dataAiHint: string;
}> = [
  { id: 'cardboard', name: 'Cardboard', imageUrl: '/assets/images/cardboard.png', dataAiHint: 'cardboard box' },
  { id: 'paper', name: 'Paper', imageUrl: '/assets/images/paper.png', dataAiHint: 'stack paper' },
  { id: 'plastic', name: 'Plastic', imageUrl: '/assets/images/plastic.png', dataAiHint: 'plastic bottle' },
  { id: 'glass', name: 'Glass', imageUrl: '/assets/images/glass.png', dataAiHint: 'glass jar' },
  { id: 'ewaste', name: 'E-Waste', imageUrl: '/assets/images/ewaste.png', dataAiHint: 'electronic waste' },
  { id: 'biowaste', name: 'Bio-Waste', imageUrl: '/assets/images/bio-waste.png', dataAiHint: 'food waste' },
  { id: 'metal', name: 'Metal', imageUrl: '/assets/images/metal.png', dataAiHint: 'metal items' }, 
  { id: 'other', name: 'Trash', imageUrl: '/assets/images/trash.png', dataAiHint: 'trash bag' },
];


const verticalLogCategories: Array<{
  id: WasteCategory;
  name: string;
  imageUrl?: string;
  icon?: React.ElementType;
  points: number;
  dataAiHint: string;
  quantityKey: keyof Pick<UserProfile, 'totalCardboard' | 'totalPaper' | 'totalGlass' | 'totalPlastic' | 'totalOther' | 'totalEwaste' | 'totalBiowaste' | 'totalMetal' | 'totalOrganic' | 'totalPlasticOther' | 'totalPlasticPete' | 'totalPlasticHdpe' | 'totalPlasticPp' | 'totalPlasticPs'>;
  placeholderText?: string;
}> = [
  { id: 'cardboard', name: 'Cardboard', imageUrl: '/assets/images/cardboard.png', points: WASTE_POINTS.cardboard, dataAiHint: 'cardboard box', quantityKey: 'totalCardboard' },
  { id: 'paper', name: 'Paper', imageUrl: '/assets/images/paper.png', points: WASTE_POINTS.paper, dataAiHint: 'stack paper', quantityKey: 'totalPaper' },
  { id: 'glass', name: 'Glass', imageUrl: '/assets/images/glass.png', points: WASTE_POINTS.glass, dataAiHint: 'glass jar', quantityKey: 'totalGlass' },
  { id: 'plastic', name: 'Plastic', imageUrl: '/assets/images/plastic.png', points: WASTE_POINTS.plastic, dataAiHint: 'plastic bottle', quantityKey: 'totalPlastic' },
  { id: 'plasticPete', name: 'Plastic - PETE', imageUrl: `https://placehold.co/114x50.png?text=PETE`, points: WASTE_POINTS.plasticPete, dataAiHint: 'PETE plastic', quantityKey: 'totalPlasticPete', placeholderText: 'PETE' },
  { id: 'plasticHdpe', name: 'Plastic - HDPE', imageUrl: `https://placehold.co/114x50.png?text=HDPE`, points: WASTE_POINTS.plasticHdpe, dataAiHint: 'HDPE plastic', quantityKey: 'totalPlasticHdpe', placeholderText: 'HDPE' },
  { id: 'plasticPp', name: 'Plastic - PP', imageUrl: `https://placehold.co/114x50.png?text=PP`, points: WASTE_POINTS.plasticPp, dataAiHint: 'PP plastic', quantityKey: 'totalPlasticPp', placeholderText: 'PP' },
  { id: 'plasticPs', name: 'Plastic - PS', imageUrl: `https://placehold.co/114x50.png?text=PS`, points: WASTE_POINTS.plasticPs, dataAiHint: 'PS plastic', quantityKey: 'totalPlasticPs', placeholderText: 'PS' },
  { id: 'plasticOther', name: 'Plastic - Other', imageUrl: `https://placehold.co/114x50.png?text=OTHER`, points: WASTE_POINTS.plasticOther, dataAiHint: 'other plastic', quantityKey: 'totalPlasticOther', placeholderText: 'OTHER' },
  { id: 'ewaste', name: 'E-Waste', imageUrl: '/assets/images/ewaste.png', points: WASTE_POINTS.ewaste, dataAiHint: 'electronic waste', quantityKey: 'totalEwaste' },
  { id: 'biowaste', name: 'Bio-Waste', imageUrl: '/assets/images/bio-waste.png', points: WASTE_POINTS.biowaste, dataAiHint: 'food waste', quantityKey: 'totalBiowaste' },
  { id: 'metal', name: 'Metal', imageUrl: '/assets/images/metal.png', points: WASTE_POINTS.metal, dataAiHint: 'metal items', quantityKey: 'totalMetal'}, 
  { id: 'other', name: 'Trash', imageUrl: '/assets/images/trash.png', points: WASTE_POINTS.other, dataAiHint: 'trash bag', quantityKey: 'totalOther' },
];


const defaultUserProfile: UserProfile = {
  id: 'localUser',
  displayName: 'Guest',
  email: '',
  avatar: `https://placehold.co/100x100.png?text=G`, 
  score: 0,
  co2Managed: 0,
  totalEwaste: 0,
  totalPlastic: 0,
  totalBiowaste: 0,
  totalCardboard: 0,
  totalPaper: 0,
  totalGlass: 0,
  totalMetal: 0,
  totalOrganic: 0,
  totalOther: 0,
  totalPlasticOther: 0,
  totalPlasticPete: 0,
  totalPlasticHdpe: 0,
  totalPlasticPp: 0,
  totalPlasticPs: 0,
  itemsClassified: 0,
  challengesCompleted: 0,
};

export default function HomePage() {
  const [userData, setUserData] = useState<UserProfile>(defaultUserProfile);
  const [recentClassifications, setRecentClassifications] = useState<ClassificationRecord[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationError, setClassificationError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentUploadCategory, setCurrentUploadCategory] = useState<WasteCategory | undefined>(undefined);
  const [currentUploadCategoryFriendlyName, setCurrentUploadCategoryFriendlyName] = useState<string | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);

      let storedUserData = getFromLocalStorage<UserProfile>(USER_DATA_KEY, defaultUserProfile);
      
      if (loggedIn) {
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName'); 
        if (userEmail && storedUserData.email !== userEmail) { 
           const displayName = userName || userEmail.split('@')[0];
           storedUserData = { 
            ...defaultUserProfile, 
            id: userEmail, 
            displayName: displayName,
            email: userEmail,
            avatar: `https://placehold.co/100x100.png?text=${displayName.substring(0,2).toUpperCase()}`,
           };
        } else if (!userEmail && storedUserData.email) { 
            storedUserData = defaultUserProfile; 
        } else if (userEmail && userName && storedUserData.displayName !== userName) {
            storedUserData.displayName = userName;
            storedUserData.avatar = `https://placehold.co/100x100.png?text=${userName.substring(0,2).toUpperCase()}`;
        }
      } else { 
        if (storedUserData.id !== 'localUser' || storedUserData.email) { 
            storedUserData = defaultUserProfile;
        }
      }
      
      setUserData(storedUserData);
      if (Object.keys(storedUserData).length > Object.keys(defaultUserProfile).length || storedUserData.score > 0) {
          saveToLocalStorage(USER_DATA_KEY, storedUserData); 
      }

      const history = getFromLocalStorage<ClassificationRecord[]>(HISTORY_STORAGE_KEY, []);
      const uniqueRecentItems = Object.values(
        history.reduce((acc, item) => {
          if (!acc[item.category] || acc[item.category].timestamp < item.timestamp) {
            acc[item.category] = item;
          }
          return acc;
        }, {} as Record<string, ClassificationRecord>)
      ).sort((a,b) => b.timestamp - a.timestamp)
      .slice(0, MAX_HISTORY_DISPLAY_ITEMS);
      setRecentClassifications(uniqueRecentItems);
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus); 
    window.addEventListener('authChange', checkLoginStatus); 
    return () => {
        window.removeEventListener('storage', checkLoginStatus);
        window.removeEventListener('authChange', checkLoginStatus);
    };
  }, []);


  const handleClassify = async (imageDataUri: string): Promise<ClassifyWasteOutput | null> => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in or sign up to classify items and track your progress.",
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
        )
      });
      // Keep modal open for tips, but don't proceed with classification.
      // User needs to login first.
      return null; 
    }

    setIsClassifying(true);
    setClassificationError(null);

    try {
      let classificationResultCategory: WasteCategory;
      let classificationConfidence = 1; 

      if (currentUploadCategory) {
        classificationResultCategory = currentUploadCategory;
      } else {
        const result = await classifyWaste({ photoDataUri: imageDataUri });
        if (!result || !result.category) {
          setClassificationError("Could not classify the image. The AI returned no result or an invalid category.");
          toast({
            title: "Classification Failed",
            description: "The AI could not process the image correctly.",
            variant: "destructive",
          });
          setIsClassifying(false);
          return null;
        }
        classificationResultCategory = result.category;
        classificationConfidence = result.confidence;
      }
      
      const pointsEarned = WASTE_POINTS[classificationResultCategory] || WASTE_POINTS.other;
      const newRecord: ClassificationRecord = {
        id: Date.now().toString(),
        imageDataUri,
        category: classificationResultCategory,
        confidence: classificationConfidence,
        timestamp: Date.now(),
        points: pointsEarned,
      };

      const currentHistory = getFromLocalStorage<ClassificationRecord[]>(HISTORY_STORAGE_KEY, []);
      const updatedHistory = [newRecord, ...currentHistory].slice(0, 50); 
      saveToLocalStorage(HISTORY_STORAGE_KEY, updatedHistory);
      
      const uniqueRecentItems = Object.values(
        updatedHistory.reduce((acc, item) => {
          if (!acc[item.category] || acc[item.category].timestamp < item.timestamp) {
            acc[item.category] = item;
          }
          return acc;
        }, {} as Record<string, ClassificationRecord>)
      ).sort((a,b) => b.timestamp - a.timestamp)
        .slice(0, MAX_HISTORY_DISPLAY_ITEMS);
      setRecentClassifications(uniqueRecentItems);

      setUserData(prevData => {
        const newScore = prevData.score + pointsEarned;
        const newCo2Managed = prevData.co2Managed + (pointsEarned * CO2_SAVED_PER_POINT);
        let categoryKeyToUpdate = `total${classificationResultCategory.charAt(0).toUpperCase() + classificationResultCategory.slice(1)}` as keyof UserProfile;
        if (!(categoryKeyToUpdate in defaultUserProfile) && classificationResultCategory.startsWith('plastic')) {
            categoryKeyToUpdate = 'totalPlastic'; 
        } else if (!(categoryKeyToUpdate in defaultUserProfile)) {
            categoryKeyToUpdate = 'totalOther';
        }
        const currentCategoryCount = typeof prevData[categoryKeyToUpdate] === 'number' ? (prevData[categoryKeyToUpdate] as number) : 0;
        const updatedCategoryCount = currentCategoryCount + 1; 
        
        const newUserData: UserProfile = {
          ...prevData,
          score: newScore,
          co2Managed: parseFloat(newCo2Managed.toFixed(1)),
          itemsClassified: prevData.itemsClassified + 1,
          [categoryKeyToUpdate]: updatedCategoryCount, 
        };
        saveToLocalStorage(USER_DATA_KEY, newUserData);
        return newUserData;
      });
      
      toast({
        title: "Classification Successful!",
        description: `Item classified as ${currentUploadCategoryFriendlyName || classificationResultCategory}. You earned ${pointsEarned} points!`,
      });
      setIsUploadModalOpen(false); // Close modal on successful classification
      setCurrentUploadCategory(undefined);
      setCurrentUploadCategoryFriendlyName(undefined);
      return { category: classificationResultCategory, confidence: classificationConfidence };
      
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
  
  const currentLevel = getCurrentLevel(userData.score);
  let scorePercentage = 0;
  let pointsForNextLevelDisplay: string | number = currentLevel.targetForNext;

  if (currentLevel.targetForNext !== Infinity) {
    const pointsEarnedInLevel = Math.max(0, userData.score - currentLevel.minScore);
    const pointsToNextLevelRange = currentLevel.targetForNext - currentLevel.minScore;
    if (pointsToNextLevelRange > 0) {
      scorePercentage = Math.min((pointsEarnedInLevel / pointsToNextLevelRange) * 100, 100);
    } else {
      scorePercentage = userData.score >= currentLevel.minScore ? 100 : 0;
    }
  } else { 
    scorePercentage = 100;
    pointsForNextLevelDisplay = "Max"; 
  }

  const openUploadModalForCategory = (categoryId: WasteCategory | undefined, categoryName: string) => {
    setClassificationError(null);
    setCurrentUploadCategory(categoryId);
    setCurrentUploadCategoryFriendlyName(categoryName);
    setIsUploadModalOpen(true);
  };

  const selectedCategoryTips = currentUploadCategory ? wasteCategoryFiveRTips[currentUploadCategory] : null;
  const SelectedCategoryIcon = selectedCategoryTips?.icon || HelpCircle;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 pb-24">
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2">
        <div>
          <p className="text-muted-foreground text-sm sm:text-base">Hi {userData.displayName || 'Guest'}!</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Let&apos;s recycle</h1>
        </div>
      </section>

      {!isLoggedIn && (
        <Card className="bg-primary/10 p-4 sm:p-6 text-center">
            <CardTitle className="text-primary mb-2">Join the EcoSnap Community!</CardTitle>
            <CardDescription className="mb-4">
              Log in or sign up to classify waste, track your progress, and earn rewards.
            </CardDescription>
            <div className="flex gap-2 sm:gap-3 justify-center">
              <Button asChild>
                <Link href="/login"><LogIn className="mr-2 h-4 w-4"/>Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup"><SignupIcon className="mr-2 h-4 w-4"/>Sign Up</Link>
              </Button>
            </div>
        </Card>
      )}

      <section className="mt-1 mb-4">
        <h2 className="text-base sm:text-xl font-semibold mb-2 text-foreground">Quick Classify</h2>
        <div className="flex overflow-x-auto space-x-3 pb-2 no-scrollbar">
          {topHorizontalCategories.map(category => {
            const CategoryIcon = category.icon;
            return (
              <Dialog key={`top-${category.id}`} open={isUploadModalOpen && currentUploadCategory === category.id && currentUploadCategoryFriendlyName === category.name} onOpenChange={ open => { 
                if(open) { openUploadModalForCategory(category.id, category.name); } 
                else { 
                  if(currentUploadCategory === category.id && currentUploadCategoryFriendlyName === category.name) {
                    setCurrentUploadCategory(undefined); 
                    setCurrentUploadCategoryFriendlyName(undefined); 
                    setIsUploadModalOpen(false); 
                  }
                }
              }}>
                <DialogTrigger asChild>
                  <Card className="p-3 flex flex-col items-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors shadow-sm w-[90px] sm:w-[100px] flex-shrink-0">
                     <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                      {category.imageUrl ? (
                        <ImageWithFallback
                          src={category.imageUrl}
                          alt={category.name}
                          dataAiHint={category.dataAiHint}
                          placeholderSize="48x48" 
                          sizes="48px"
                          wrapperClassName="relative w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden bg-transparent flex items-center justify-center"
                          className="rounded-md object-contain" 
                          placeholderText={category.id.startsWith('plastic') ? category.id.substring(7).toUpperCase() : undefined}
                        />
                      ) : CategoryIcon ? (
                        <CategoryIcon className="w-7 h-7 sm:w-8 sm:w-8 text-primary" />
                      ) : (
                        <PackageIcon className="w-7 h-7 sm:w-8 sm:w-8 text-muted-foreground" />
                      )}
                    </div>
                    <p className="font-medium text-xs sm:text-sm text-center truncate w-full">{category.name}</p>
                  </Card>
                </DialogTrigger>
              </Dialog>
            );
          })}
        </div>
      </section>


      <section className="space-y-2 sm:space-y-3">
        <h2 className="text-base sm:text-xl font-semibold mb-2 text-foreground">Log Items by Category</h2>
        {verticalLogCategories.map(item => {
          const quantity = (userData && typeof userData[item.quantityKey] === 'number') ? userData[item.quantityKey] as number : 0;
          return (
            <Dialog key={item.id} open={isUploadModalOpen && currentUploadCategory === item.id && currentUploadCategoryFriendlyName === item.name} onOpenChange={ open => { 
              if(open) { openUploadModalForCategory(item.id, item.name); } 
              else { 
                if(currentUploadCategory === item.id && currentUploadCategoryFriendlyName === item.name) {
                  setCurrentUploadCategory(undefined); 
                  setCurrentUploadCategoryFriendlyName(undefined); 
                  setIsUploadModalOpen(false); 
                }
              }
            }}>
              <DialogTrigger asChild>
                <Card className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-muted/50 transition-colors shadow-sm">
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.name}
                    dataAiHint={item.dataAiHint}
                    placeholderSize="114x50" 
                    sizes="(max-width: 639px) 94px, 114px"
                    icon={item.icon ? <item.icon className="w-6 h-6 sm:w-7 sm:w-7 text-primary" /> : undefined}
                    wrapperClassName="relative w-[94px] h-[44px] sm:w-[114px] sm:h-[50px] rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center"
                    className="rounded-md object-contain" 
                    placeholderText={item.placeholderText}
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-sm sm:text-base">{item.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{item.points} pts</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base sm:text-lg font-semibold text-primary">{quantity}</p>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                  </div>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground ml-1 sm:ml-2 flex-shrink-0" />
                </Card>
              </DialogTrigger>
            </Dialog>
          );
        })}
      </section>
      
      {isLoggedIn && (
        <section>
          <h2 className="text-base sm:text-xl font-semibold mb-2 text-foreground">Progress - {currentLevel.name} Level</h2>
          <Card className={cn("p-3 sm:p-6 shadow-xl", currentLevel.cardColor, currentLevel.textColor)}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm opacity-90">Waste managed: {userData.co2Managed.toFixed(1)} Kg CO₂</p>
                <p className="text-lg sm:text-2xl font-bold mt-1">
                  {userData.score} / {pointsForNextLevelDisplay} points
                </p>
              </div>
              <div className={cn("p-1.5 sm:p-2 rounded-full", currentLevel.badgeIconContainerColor)}>
                <Award className={cn("h-5 w-5 sm:h-8 sm:w-8", currentLevel.badgeIconColor)} />
              </div>
            </div>
            <Progress 
                value={scorePercentage} 
                className={cn(
                    "mt-2 sm:mt-4 h-1.5 sm:h-3", 
                    currentLevel.progressBarTrackColor,
                    "[&>div]:transition-all [&>div]:duration-500", 
                    `[&>div]:${currentLevel.progressBarIndicatorColor}`
                 )}
            />
          </Card>
        </section>
      )}

      {isLoggedIn && recentClassifications.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base sm:text-xl font-semibold text-foreground">Recent Items</h2>
             <Button variant="link" asChild className="text-primary p-0 h-auto text-xs sm:text-base">
                <Link href="/history">View all <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" /></Link>
            </Button>
          </div>
            <div className="flex overflow-x-auto space-x-3 pb-3 no-scrollbar">
              {recentClassifications.map(item => {
                 let categoryKeyForQuantity = `total${item.category.charAt(0).toUpperCase() + item.category.slice(1)}` as keyof UserProfile;
                  if (item.category === 'organic' && !('totalOrganic' in defaultUserProfile) && ('totalBiowaste' in defaultUserProfile)) {
                    categoryKeyForQuantity = 'totalBiowaste';
                  } else if (item.category === 'biowaste' && !('totalBiowaste' in defaultUserProfile) && ('totalOrganic' in defaultUserProfile)) {
                    categoryKeyForQuantity = 'totalOrganic';
                  } else if (!(categoryKeyForQuantity in defaultUserProfile)) {
                     if (item.category.startsWith('plastic') && item.category !== 'plastic') {
                         categoryKeyForQuantity = `total${item.category.charAt(0).toUpperCase() + item.category.slice(1)}` as keyof UserProfile;
                         if (!(categoryKeyForQuantity in defaultUserProfile)){ 
                            categoryKeyForQuantity = 'totalPlastic';
                         }
                     } else {
                         categoryKeyForQuantity = 'totalOther'; 
                     }
                  }
                const quantity = (userData && typeof userData[categoryKeyForQuantity] === 'number') ? userData[categoryKeyForQuantity] as number : 0;

                return (
                  <Card key={item.id} className="p-3 flex items-center gap-3 min-w-[260px] sm:min-w-[300px] flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
                    <ImageWithFallback
                        src={item.imageDataUri}
                        alt={item.category}
                        dataAiHint={`${item.category} item`}
                        placeholderSize="48x48"
                        sizes="(max-width: 639px) 40px, 48px"
                        wrapperClassName="relative w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden bg-muted flex-shrink-0"
                        className="rounded-md object-cover"
                    />
                    <div className="flex-grow overflow-hidden">
                      <p className="font-medium capitalize text-sm sm:text-base truncate">{item.category}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {item.points || 0} points{' '}
                        <span className="text-primary font-medium">x {quantity}</span>
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
        </section>
      )}
       {isLoggedIn && recentClassifications.length === 0 && (
         <section>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-base sm:text-xl font-semibold text-foreground">Recent Items</h2>
            </div>
            <Card className="p-3 sm:p-4 text-center text-muted-foreground text-sm">
              <p>No items classified yet. Tap a category above or the <ImagePlus className="inline h-4 w-4 relative -top-px" /> button to start!</p>
            </Card>
         </section>
      )}

      <Separator className="my-2 sm:my-4" />

      <section className="space-y-2 sm:space-y-3">
        <h2 className="text-base sm:text-xl font-semibold text-foreground">Explore More</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <Link href="/dashboard" className="block">
              <Card className="p-3 sm:p-4 hover:bg-muted/50 transition-colors h-full">
                <div className="flex items-center gap-2 sm:gap-3">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Waste Dashboard</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Visualize your impact.</p>
                  </div>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-auto text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            </Link>
            <Link href="/challenges" className="block">
              <Card className="p-3 sm:p-4 hover:bg-muted/50 transition-colors h-full">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Eco Challenges</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Earn points and badges.</p>
                  </div>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-auto text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            </Link>
             <Link href="/recycling-centers" className="block">
              <Card className="p-3 sm:p-4 hover:bg-muted/50 transition-colors h-full">
                <div className="flex items-center gap-2 sm:gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">Find Centers</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Locate recycling spots.</p>
                  </div>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-auto text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            </Link>
             <Link href="/assistant" className="block">
              <Card className="p-3 sm:p-4 hover:bg-muted/50 transition-colors h-full">
                <div className="flex items-center gap-2 sm:gap-3">
                  <BotIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">AI Assistant</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Get eco advice.</p>
                  </div>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-auto text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            </Link>
        </div>
      </section>

      <Dialog open={isUploadModalOpen} onOpenChange={open => { 
          if(!open) { 
            setClassificationError(null); 
            if (!isClassifying) { 
                setCurrentUploadCategory(undefined);
                setCurrentUploadCategoryFriendlyName(undefined);
            }
          }
          setIsUploadModalOpen(open);
      }}>
        <DialogTrigger asChild>
           <Button 
             onClick={() => openUploadModalForCategory(undefined, 'General Waste')}
             className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-2xl text-2xl p-0" 
             aria-label="Upload image for general classification"
           >
            <ImagePlus className="h-6 w-6 sm:h-7 sm:w-7" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SelectedCategoryIcon className="h-5 w-5 text-primary" />
              {selectedCategoryTips?.title || currentUploadCategoryFriendlyName || "Classify Waste"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCategoryTips && (
            <div className="my-4 space-y-3 text-sm max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-2">
              <h3 className="font-semibold text-base text-primary mb-1">5 Rs of Waste Management:</h3>
              {(Object.keys(selectedCategoryTips.fiveRs) as Array<keyof TipInfo['fiveRs']>).map((key) => (
                selectedCategoryTips.fiveRs[key] && (
                  <div key={key}>
                    <p className="font-medium capitalize text-primary/90">{key}:</p>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{selectedCategoryTips.fiveRs[key]}</p>
                  </div>
                )
              ))}
            </div>
          )}

          <Separator className={cn(selectedCategoryTips ? "my-4" : "my-0")}/>

          <ImageUpload 
            onClassify={handleClassify}
            isClassifying={isClassifying}
            classificationError={classificationError}
            initialPromptText={currentUploadCategoryFriendlyName && currentUploadCategoryFriendlyName !== 'General Waste' ? `Image of ${currentUploadCategoryFriendlyName.toLowerCase()}` : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

    