
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
import type { ClassificationRecord, UserProfile, QuickLogItem, WasteCategory } from '@/lib/types';
import { ImageUpload } from '@/components/image-upload'; // This will be used in a Dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Award, ImagePlus, ChevronRight, BarChart3, Recycle, Trash2, Droplets, ShoppingBag, BotIcon } from 'lucide-react';
import Link from 'next/link';

const HISTORY_STORAGE_KEY = 'ecoSnapHistory';
const USER_DATA_KEY = 'ecoSnapUserData';
const MAX_HISTORY_DISPLAY_ITEMS = 3; // Max recent items to display on dashboard

const WASTE_POINTS: Record<WasteCategory, number> = {
  ewaste: 100,
  plastic: 50,
  biowaste: 60,
  cardboard: 80,
  paper: 70,
  glass: 30,
  other: 10,
};

const CO2_SAVED_PER_POINT = 0.1; // Example: 0.1 Kg CO2 saved per point earned

const quickLogItems: QuickLogItem[] = [
  { id: 'cardboard', name: 'Cardboard', imageUrl: 'https://picsum.photos/seed/cardboardbox/200/150', points: WASTE_POINTS.cardboard, dataAiHint: 'cardboard box' },
  { id: 'paper', name: 'Paper', imageUrl: 'https://picsum.photos/seed/papernotes/200/150', points: WASTE_POINTS.paper, dataAiHint: 'paper notes' },
  { id: 'glass', name: 'Glass', imageUrl: 'https://picsum.photos/seed/glassjar/200/150', points: WASTE_POINTS.glass, dataAiHint: 'glass jar' },
  { id: 'plastic', name: 'Plastic', imageUrl: 'https://picsum.photos/seed/plasticbottle/200/150', points: WASTE_POINTS.plastic, dataAiHint: 'plastic bottle' },
  { id: 'ewaste', name: 'E-Waste', imageUrl: 'https://picsum.photos/seed/ewasteitems/200/150', points: WASTE_POINTS.ewaste, dataAiHint: 'electronic waste' },
  { id: 'biowaste', name: 'Bio-Waste', imageUrl: 'https://picsum.photos/seed/foodscraps/200/150', points: WASTE_POINTS.biowaste, dataAiHint: 'apple core' },
];

const defaultUserProfile: UserProfile = {
  id: 'localUser',
  displayName: 'Anand',
  avatar: 'https://picsum.photos/seed/useravatar/100/100',
  score: 330,
  targetScore: 1000, 
  co2Managed: 258.4,
  totalEwaste: 0,
  totalPlastic: 0,
  totalBiowaste: 0,
  totalCardboard: 0,
  totalPaper: 0,
  totalGlass: 0,
  totalOther: 0,
  itemsClassified: 0,
  challengesCompleted: 0,
};

export default function HomePage() {
  const [userData, setUserData] = useState<UserProfile>(defaultUserProfile);
  const [recentClassifications, setRecentClassifications] = useState<ClassificationRecord[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationError, setClassificationError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedUserData = getFromLocalStorage<UserProfile>(USER_DATA_KEY, defaultUserProfile);
    
    let targetScoreUpdated = false;
    if (storedUserData.score >= (storedUserData.targetScore || 0)) {
      storedUserData.targetScore = Math.floor(storedUserData.score / 500 + 1) * 500;
      targetScoreUpdated = true;
    }
     if (storedUserData.targetScore < defaultUserProfile.targetScore && !targetScoreUpdated) {
        storedUserData.targetScore = defaultUserProfile.targetScore;
    }


    setUserData(storedUserData);

    const history = getFromLocalStorage<ClassificationRecord[]>(HISTORY_STORAGE_KEY, []);
    // Get unique items by category, then take the latest 3
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
  }, []);

  const handleClassify = async (imageDataUri: string): Promise<ClassifyWasteOutput | null> => {
    setIsClassifying(true);
    setClassificationError(null);

    try {
      const result = await classifyWaste({ photoDataUri: imageDataUri });
      if (result && result.category) {
        const pointsEarned = WASTE_POINTS[result.category] || 0;
        const newRecord: ClassificationRecord = {
          id: Date.now().toString(),
          imageDataUri,
          category: result.category,
          confidence: result.confidence,
          timestamp: Date.now(),
          points: pointsEarned,
        };

        // Update history
        const currentHistory = getFromLocalStorage<ClassificationRecord[]>(HISTORY_STORAGE_KEY, []);
        const updatedHistory = [newRecord, ...currentHistory].slice(0, 50); // Keep last 50 for general history
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


        // Update user data
        setUserData(prevData => {
          const newScore = prevData.score + pointsEarned;
          const newCo2Managed = prevData.co2Managed + (pointsEarned * CO2_SAVED_PER_POINT);
          const categoryKey = `total${result.category.charAt(0).toUpperCase() + result.category.slice(1)}` as keyof UserProfile;
          
          const updatedCategoryCount = (typeof prevData[categoryKey] === 'number' ? (prevData[categoryKey] as number) : 0) + 1;
          
          let newTargetScore = prevData.targetScore || defaultUserProfile.targetScore;
          if (newScore >= newTargetScore) {
            newTargetScore = Math.floor(newScore / 500 + 1) * 500;
          }


          const newUserData: UserProfile = {
            ...prevData,
            score: newScore,
            co2Managed: parseFloat(newCo2Managed.toFixed(1)), // Keep one decimal place for CO2
            itemsClassified: prevData.itemsClassified + 1,
            [categoryKey]: updatedCategoryCount,
            targetScore: newTargetScore,
          };
          saveToLocalStorage(USER_DATA_KEY, newUserData);
          return newUserData;
        });
        
        toast({
          title: "Classification Successful!",
          description: `Item classified as ${result.category}. You earned ${pointsEarned} points!`,
        });
        setIsUploadModalOpen(false); // Close modal on success
        return result;
      } else {
        setClassificationError("Could not classify the image. The AI returned no result or an invalid category.");
        toast({
          title: "Classification Failed",
          description: "The AI could not process the image correctly.",
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
  
  const scorePercentage = userData.targetScore ? Math.min((userData.score / userData.targetScore) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-6 pb-24"> {/* Padding bottom for FAB */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <p className="text-muted-foreground text-sm sm:text-base">Hi {userData.displayName}!</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Let's recycle</h1>
        </div>
      </section>

      <section>
        <div className="flex overflow-x-auto space-x-3 pb-2 no-scrollbar">
          {quickLogItems.map(item => (
            <Dialog key={item.id} onOpenChange={ open => { if(open) { setClassificationError(null); } setIsUploadModalOpen(open); }}>
              <DialogTrigger asChild>
                <Card className="min-w-[120px] sm:min-w-[140px] flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-2 sm:p-3 flex flex-col items-center text-center">
                    <Image src={item.imageUrl} alt={item.name} width={80} height={60} className="rounded-md mb-2 object-cover h-[50px] sm:h-[60px]" data-ai-hint={item.dataAiHint} />
                    <p className="text-xs sm:text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.points} points</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Classify {item.name}</DialogTitle>
                </DialogHeader>
                <ImageUpload
                  onClassify={handleClassify}
                  isClassifying={isClassifying}
                  classificationError={classificationError}
                  initialPromptText={`Image of ${item.name.toLowerCase()}`}
                />
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </section>
      
      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Progress</h2>
        <Card className="bg-primary text-primary-foreground p-4 sm:p-6 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs sm:text-sm opacity-90">Waste managed: {userData.co2Managed} Kg CO₂</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{userData.score} / {userData.targetScore} points</p>
            </div>
            <div className="bg-accent p-2 rounded-full">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-accent-foreground" />
            </div>
          </div>
          <Progress value={scorePercentage} className="mt-3 sm:mt-4 h-2 sm:h-3 [&>div]:bg-white/80 bg-white/30" />
        </Card>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Items</h2>
        {recentClassifications.length > 0 ? (
          <div className="space-y-3">
            {recentClassifications.map(item => (
              <Card key={item.id} className="p-3 flex items-center gap-3">
                <Image src={item.imageDataUri} alt={item.category} width={48} height={48} className="rounded-md aspect-square object-cover" data-ai-hint={`${item.category} item`} />
                <div className="flex-grow">
                  <p className="font-medium capitalize text-sm sm:text-base">{item.category}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{item.points || 0} points</p>
                </div>
              </Card>
            ))}
             <Button variant="link" asChild className="text-primary p-0 h-auto text-sm sm:text-base">
                <Link href="/history">View all items <ChevronRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
        ) : (
          <Card className="p-4 text-center text-muted-foreground text-sm sm:text-base">
            <p>No items classified yet. Tap the button below to start!</p>
          </Card>
        )}
      </section>

      <Separator className="my-4" />

      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">Explore More</h2>
        <Link href="/dashboard" className="block">
          <Card className="p-3 sm:p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <div>
                <h3 className="font-medium text-sm sm:text-base">Waste Dashboard</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Visualize your impact.</p>
              </div>
              <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground" />
            </div>
          </Card>
        </Link>
         <Link href="/challenges" className="block">
          <Card className="p-3 sm:p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <div>
                <h3 className="font-medium text-sm sm:text-base">Eco Challenges</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Earn points and badges.</p>
              </div>
              <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground" />
            </div>
          </Card>
        </Link>
      </section>


      <Dialog open={isUploadModalOpen} onOpenChange={open => { if(!open) setClassificationError(null); setIsUploadModalOpen(open);}}>
        <DialogTrigger asChild>
           <Button className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl text-2xl p-0">
            <ImagePlus className="h-7 w-7 sm:h-8 sm:w-8" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Waste Image</DialogTitle>
          </DialogHeader>
          <ImageUpload 
            onClassify={handleClassify}
            isClassifying={isClassifying}
            classificationError={classificationError}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper to get a specific category count from history
// This could be expanded or moved to a service if complex
const getItemCountFromHistory = (history: ClassificationRecord[], category: WasteCategory): number => {
  return history.filter(item => item.category === category).length;
};
