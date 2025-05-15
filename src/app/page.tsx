
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
import { Award, ImagePlus, ChevronRight, BarChart3, MapPin, BotIcon, LogIn, UserPlus as SignupIcon, Trash2, Leaf, Package as PackageIcon, Edit, AlertTriangle, Tv2, Apple } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


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
};

const CO2_SAVED_PER_POINT = 0.1; 

// New component for handling image with fallback
const ImageWithFallback = ({
  src,
  alt,
  dataAiHint,
  placeholderSize = "114x50", // Default to larger size of the container
  sizes = "(max-width: 639px) 94px, 114px",
  className = "rounded-md object-cover",
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src); // Reset src if the original src prop changes
    setIsError(false);  // Reset error state
  }, [src]);

  const handleError = () => {
    // Avoid loop if placeholder itself fails or if already placeholder
    if (!isError && currentSrc !== `https://placehold.co/${placeholderSize}.png`) { 
      setIsError(true);
      setCurrentSrc(`https://placehold.co/${placeholderSize}.png`);
    }
  };

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      data-ai-hint={isError ? `placeholder ${dataAiHint}`.trim() : dataAiHint}
      onError={handleError}
      unoptimized={isError} // Using unoptimized for placeholder to avoid potential processing issues by Next/Image
    />
  );
};


const verticalLogCategories: Array<{
  id: WasteCategory;
  name: string;
  imageUrl?: string;
  icon?: React.ElementType;
  points: number;
  dataAiHint: string;
  quantityKey: keyof Pick<UserProfile, 'totalCardboard' | 'totalPaper' | 'totalGlass' | 'totalPlastic' | 'totalOther' | 'totalEwaste' | 'totalBiowaste' | 'totalMetal' | 'totalOrganic'>;
}> = [
  { id: 'cardboard', name: 'Cardboard', imageUrl: '/assets/images/cardboard.png', points: WASTE_POINTS.cardboard, dataAiHint: 'cardboard box', quantityKey: 'totalCardboard' },
  { id: 'paper', name: 'Paper', imageUrl: '/assets/images/paper.png', points: WASTE_POINTS.paper, dataAiHint: 'stack paper', quantityKey: 'totalPaper' },
  { id: 'glass', name: 'Glass', imageUrl: '/assets/images/glass.png', points: WASTE_POINTS.glass, dataAiHint: 'glass jar', quantityKey: 'totalGlass' },
  { id: 'plastic', name: 'Plastic', imageUrl: '/assets/images/plastic.png', points: WASTE_POINTS.plastic, dataAiHint: 'plastic bottle', quantityKey: 'totalPlastic' },
  { id: 'other', name: 'Trash', icon: Trash2, points: WASTE_POINTS.other, dataAiHint: 'general trash', quantityKey: 'totalOther' },
  { id: 'ewaste', name: 'E-Waste', imageUrl: '/assets/images/ewaste.png', points: WASTE_POINTS.ewaste, dataAiHint: 'electronic waste', quantityKey: 'totalEwaste' },
  { id: 'biowaste', name: 'Bio-Waste', imageUrl: '/assets/images/biowaste.jpeg', points: WASTE_POINTS.biowaste, dataAiHint: 'apple core food', quantityKey: 'totalBiowaste' },
];


const defaultUserProfile: UserProfile = {
  id: 'localUser',
  displayName: 'Guest',
  email: '',
  avatar: `https://placehold.co/100x100.png?text=G`, 
  score: 0,
  targetScore: 500, 
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
  itemsClassified: 0,
  challengesCompleted: 0,
};

export default function HomePage() {
  const [userData, setUserData] = useState<UserProfile>(defaultUserProfile);
  const [recentClassifications, setRecentClassifications] = useState<ClassificationRecord[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationError, setClassificationError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentUploadCategory, setCurrentUploadCategory] = useState<string | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);

      let storedUserData = getFromLocalStorage<UserProfile>(USER_DATA_KEY, defaultUserProfile);
      
      if (loggedIn) {
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName'); // Use 'userName'
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
            // If email matches but display name doesn't (e.g. updated from signup)
            storedUserData.displayName = userName;
            storedUserData.avatar = `https://placehold.co/100x100.png?text=${userName.substring(0,2).toUpperCase()}`;
        }
      } else { 
        if (storedUserData.id !== 'localUser' || storedUserData.email) { 
            storedUserData = defaultUserProfile;
        }
      }
      
      let targetScoreUpdated = false;
      let baseTarget = storedUserData.targetScore && storedUserData.targetScore > 0 ? storedUserData.targetScore : defaultUserProfile.targetScore;
      if (storedUserData.score > 0 && baseTarget <= storedUserData.score) {
          baseTarget = Math.floor(storedUserData.score / 500 + 1) * 500;
          targetScoreUpdated = true;
      }
       if (baseTarget < defaultUserProfile.targetScore && !targetScoreUpdated) {
          baseTarget = defaultUserProfile.targetScore;
      }
      storedUserData.targetScore = baseTarget;

      setUserData(storedUserData);
      saveToLocalStorage(USER_DATA_KEY, storedUserData); 

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
      setIsUploadModalOpen(false);
      return null;
    }

    setIsClassifying(true);
    setClassificationError(null);

    try {
      const result = await classifyWaste({ photoDataUri: imageDataUri });
      if (result && result.category) {
        const pointsEarned = WASTE_POINTS[result.category] || WASTE_POINTS.other;
        const newRecord: ClassificationRecord = {
          id: Date.now().toString(),
          imageDataUri,
          category: result.category,
          confidence: result.confidence,
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
          
          let categoryKeyToUpdate = `total${result.category.charAt(0).toUpperCase() + result.category.slice(1)}` as keyof UserProfile;
          // Handle 'organic' and 'biowaste' potentially mapping to same counter or if schema strictly uses one
          if (result.category === 'organic' && !('totalOrganic' in defaultUserProfile) && ('totalBiowaste' in defaultUserProfile)) {
            categoryKeyToUpdate = 'totalBiowaste';
          } else if (result.category === 'biowaste' && !('totalBiowaste' in defaultUserProfile) && ('totalOrganic' in defaultUserProfile)) {
             categoryKeyToUpdate = 'totalOrganic';
          }


          const currentCategoryCount = typeof prevData[categoryKeyToUpdate] === 'number' ? (prevData[categoryKeyToUpdate] as number) : 0;
          const updatedCategoryCount = currentCategoryCount + 1; // Assuming each classification is 1 item
          
          let newTargetScore = prevData.targetScore && prevData.targetScore > 0 ? prevData.targetScore : defaultUserProfile.targetScore;
          if (newScore >= newTargetScore) {
            newTargetScore = Math.floor(newScore / 500 + 1) * 500;
          }

          const newUserData: UserProfile = {
            ...prevData,
            score: newScore,
            co2Managed: parseFloat(newCo2Managed.toFixed(1)),
            itemsClassified: prevData.itemsClassified + 1,
            [categoryKeyToUpdate]: updatedCategoryCount, 
            targetScore: newTargetScore,
          };
          saveToLocalStorage(USER_DATA_KEY, newUserData);
          return newUserData;
        });
        
        toast({
          title: "Classification Successful!",
          description: `Item classified as ${result.category}. You earned ${pointsEarned} points!`,
        });
        setIsUploadModalOpen(false);
        setCurrentUploadCategory(undefined);
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
  
  const scorePercentage = userData.targetScore && userData.targetScore > 0 ? Math.min((userData.score / userData.targetScore) * 100, 100) : 0;

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

      {/* Vertical Quick Log Section */}
      <section className="space-y-2 sm:space-y-3">
        {verticalLogCategories.map(item => {
          const CategoryIcon = item.icon;
          const quantity = (userData && typeof userData[item.quantityKey] === 'number') ? userData[item.quantityKey] as number : 0;
          return (
            <Dialog key={item.id} onOpenChange={ open => { 
              if(open) { setClassificationError(null); setCurrentUploadCategory(item.name); } 
              else { setCurrentUploadCategory(undefined); }
              setIsUploadModalOpen(open); 
            }}>
              <DialogTrigger asChild>
                <Card className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-muted/50 transition-colors shadow-sm">
                  <div className="relative w-[94px] h-[44px] sm:w-[114px] sm:h-[50px] rounded-md overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                    {item.imageUrl ? (
                       <ImageWithFallback
                        src={item.imageUrl}
                        alt={item.name}
                        dataAiHint={item.dataAiHint}
                        // placeholderSize will default to "114x50"
                        // sizes prop will default to "(max-width: 639px) 94px, 114px"
                      />
                    ) : CategoryIcon ? (
                      <CategoryIcon className="w-6 h-6 sm:w-7 sm:w-7 text-primary" />
                    ) : (
                      <PackageIcon className="w-6 h-6 sm:w-7 sm:w-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-sm sm:text-base">{item.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{item.points} pts</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base sm:text-lg font-semibold text-primary">{quantity}</p>
                    <p className="text-xs text-muted-foreground">Logged</p>
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
          <h2 className="text-base sm:text-xl font-semibold mb-2 text-foreground">Progress</h2>
          <Card className="bg-primary text-primary-foreground p-3 sm:p-6 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs sm:text-sm opacity-90">Waste managed: {userData.co2Managed.toFixed(1)} Kg CO₂</p>
                <p className="text-lg sm:text-2xl font-bold mt-1">{userData.score} / {userData.targetScore} points</p>
              </div>
              <div className="bg-accent p-1.5 sm:p-2 rounded-full">
                <Award className="h-5 w-5 sm:h-8 sm:w-8 text-accent-foreground" />
              </div>
            </div>
            <Progress value={scorePercentage} className="mt-2 sm:mt-4 h-1.5 sm:h-3 [&>div]:bg-white/80 bg-white/30" />
          </Card>
        </section>
      )}

      {/* Horizontal Recent Items Section */}
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
                 // Adjust for biowaste/organic mapping if necessary, similar to handleClassify
                  if (item.category === 'organic' && !('totalOrganic' in defaultUserProfile) && ('totalBiowaste' in defaultUserProfile)) {
                    categoryKeyForQuantity = 'totalBiowaste';
                  } else if (item.category === 'biowaste' && !('totalBiowaste' in defaultUserProfile) && ('totalOrganic' in defaultUserProfile)) {
                    categoryKeyForQuantity = 'totalOrganic';
                  }
                const quantity = (userData && typeof userData[categoryKeyForQuantity] === 'number') ? userData[categoryKeyForQuantity] as number : 0;

                return (
                  <Card key={item.id} className="p-3 flex items-center gap-3 min-w-[260px] sm:min-w-[300px] flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <Image 
                        src={item.imageDataUri} 
                        alt={item.category} 
                        fill 
                        className="rounded-md object-cover" 
                        sizes="(max-width: 639px) 40px, 48px"
                        data-ai-hint={`${item.category} item`} 
                      />
                    </div>
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
              <p>No items classified yet. Tap the <ImagePlus className="inline h-4 w-4 relative -top-px" /> button below to start!</p>
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
          if(!open) { setClassificationError(null); setCurrentUploadCategory(undefined); }
          setIsUploadModalOpen(open);
      }}>
        <DialogTrigger asChild>
           <Button className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-2xl text-2xl p-0" aria-label="Upload image for general classification">
            <ImagePlus className="h-6 w-6 sm:h-7 sm:w-7" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Waste Image {currentUploadCategory ? `for ${currentUploadCategory}` : ''}</DialogTitle>
          </DialogHeader>
          <ImageUpload 
            onClassify={handleClassify}
            isClassifying={isClassifying}
            classificationError={classificationError}
            initialPromptText={currentUploadCategory ? `Image of ${currentUploadCategory.toLowerCase()}` : undefined}
          />
          {verticalLogCategories.map(item => (
            item.id === currentUploadCategory?.toLowerCase() && item.id === 'other' && ( 
                <Alert variant="default" className="mt-4 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    <AlertTitle>Tip for &quot;{item.name}&quot;</AlertTitle>
                    <AlertDescription>
                        Try to be specific if possible! If it&apos;s mixed material or you&apos;re unsure, &quot;other&quot; is okay. The AI will do its best.
                    </AlertDescription>
                </Alert>
            )
          ))}
           {currentUploadCategory && verticalLogCategories.find(vc => vc.name === currentUploadCategory)?.id === 'ewaste' && (
             <Alert variant="default" className="mt-4 text-xs">
                <Tv2 className="h-3 w-3" />
                <AlertTitle>Tip for E-Waste</AlertTitle>
                <AlertDescription>
                    Includes items like old phones, laptops, chargers, cables, and batteries. Ensure they are disposed of at designated e-waste collection points.
                </AlertDescription>
            </Alert>
           )}
           {currentUploadCategory && verticalLogCategories.find(vc => vc.name === currentUploadCategory)?.id === 'biowaste' && (
             <Alert variant="default" className="mt-4 text-xs">
                <Apple className="h-3 w-3" />
                <AlertTitle>Tip for Bio-Waste</AlertTitle>
                <AlertDescription>
                    Includes fruit and vegetable scraps, coffee grounds, and garden trimmings. Great for composting!
                </AlertDescription>
            </Alert>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
    

    