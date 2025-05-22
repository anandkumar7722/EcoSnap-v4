
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trophy, Zap, Target, Recycle, Leaf, Package, Atom, Share2, Star } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import type { Challenge, UserChallengeProgress, WasteCategory } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Placeholder challenges - in a real app, this would come from Firestore
const allChallenges: Challenge[] = [
  { 
    id: 'ewaste-collector-1', 
    title: 'E-Waste Novice', 
    description: 'Log 3 e-waste items.', 
    points: 50, 
    badgeIcon: 'Atom',
    badgeName: 'E-Novice',
    type: 'log_specific_item_count', 
    categoryGoal: 'ewaste', 
    targetValue: 3,
    unit: 'items',
    isActive: true,
    createdAt: new Date().getTime()
  },
  { 
    id: 'plastic-reducer-weekly', 
    title: 'Weekly Plastic Diet', 
    description: 'Reduce your plastic logging by 20% compared to last week.', 
    points: 100, 
    badgeIcon: 'Recycle',
    badgeName: 'Plastic Conscious',
    type: 'reduce_category_by_percentage', 
    categoryGoal: 'plastic', 
    targetValue: 20, // 20%
    unit: '%',
    durationDays: 7,
    isActive: true,
    createdAt: new Date().getTime()
  },
  { 
    id: 'organic-hero', 
    title: 'Organic Champion', 
    description: 'Log 10 organic/biowaste items.', 
    points: 70,
    badgeIcon: 'Leaf',
    badgeName: 'Compost Starter',
    type: 'log_specific_item_count',
    categoryGoal: 'organic', // or 'biowaste'
    targetValue: 10,
    unit: 'items',
    isActive: true,
    createdAt: new Date().getTime()
  },
  { 
    id: 'plastic-other-collector', 
    title: 'Plastic Other Pro', 
    description: 'Log 5 plastic (other) items.', 
    points: 60, 
    badgeIcon: 'Package',
    badgeName: 'Misc Plastic Master',
    type: 'log_specific_item_count', 
    categoryGoal: 'plastic-other', 
    targetValue: 5,
    unit: 'items',
    isActive: true,
    createdAt: new Date().getTime()
  },
  { 
    id: 'plastic-pete-collector', 
    title: 'PETE Pioneer', 
    description: 'Log 7 plastic (PETE) items.', 
    points: 75, 
    badgeIcon: 'Recycle',
    badgeName: 'PETE Protector',
    type: 'log_specific_item_count', 
    categoryGoal: 'plastic-pete', 
    targetValue: 7,
    unit: 'items',
    isActive: true,
    createdAt: new Date().getTime()
  },
  { 
    id: 'plastic-hdpe-collector', 
    title: 'HDPE Hoarder', 
    description: 'Log 8 plastic (HDPE) items.', 
    points: 80, 
    badgeIcon: 'Recycle',
    badgeName: 'HDPE Helper',
    type: 'log_specific_item_count', 
    categoryGoal: 'plastic-hdpe', 
    targetValue: 8,
    unit: 'items',
    isActive: true,
    createdAt: new Date().getTime()
  },
  { 
    id: 'plastic-pp-collector', 
    title: 'PP Packer', 
    description: 'Log 6 plastic (PP) items.', 
    points: 65, 
    badgeIcon: 'Package',
    badgeName: 'PP Proponent',
    type: 'log_specific_item_count', 
    categoryGoal: 'plastic-pp', 
    targetValue: 6,
    unit: 'items',
    isActive: true,
    createdAt: new Date().getTime()
  },
  // Note: 'plastic-ps' could be added following the same pattern if needed.
  // { id: 'plastic-ps-collector', title: 'PS Purifier', description: 'Log 4 plastic (PS) items.', points: 55, badgeIcon: 'Package', badgeName: 'PS Partner', type: 'log_specific_item_count', categoryGoal: 'plastic-ps', targetValue: 4, unit: 'items', isActive: true, createdAt: new Date().getTime() },

];

// Placeholder user progress - in a real app, this would come from Firestore
const initialUserProgress: UserChallengeProgress[] = [
    { challengeId: 'ewaste-collector-1', userId: 'user1', currentProgress: 1, targetValue: 3, completed: false, startedAt: new Date().getTime(), lastUpdatedAt: new Date().getTime() },
    { challengeId: 'plastic-reducer-weekly', userId: 'user1', currentProgress: 5, targetValue: 20, completed: false, startedAt: new Date().getTime(), lastUpdatedAt: new Date().getTime() }, // 5% reduction logged
];


const getIconForChallenge = (iconName?: string) => {
  switch (iconName) {
    case 'Atom': return <Atom className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />;
    case 'Recycle': return <Recycle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />;
    case 'Leaf': return <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />;
    case 'Package': return <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />;
    default: return <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />;
  }
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>(allChallenges);
  const [userProgress, setUserProgress] = useState<UserChallengeProgress[]>(initialUserProgress);
  const { toast } = useToast();

  // In a real app, fetch challenges and userProgress from Firestore
  // useEffect(() => {
  //   // fetchChallenges().then(setChallenges);
  //   // fetchUserProgress(userId).then(setUserProgress);
  // }, [userId]);

  const getChallengeProgress = (challengeId: string): UserChallengeProgress | undefined => {
    return userProgress.find(p => p.challengeId === challengeId);
  };

  const handleShareChallenge = (challengeTitle: string) => {
    if(navigator.share) {
      navigator.share({
        title: `EcoSnap Challenge: ${challengeTitle}`,
        text: `I'm taking on the ${challengeTitle} challenge on EcoSnap! Join me in making a difference.`,
        url: window.location.href,
      })
      .then(() => toast({ title: "Challenge Shared!", description: "Thanks for spreading the word."}))
      .catch((error) => {
        console.error("Error sharing:", error);
        if (error instanceof Error && error.name === 'AbortError') {
          // User cancelled the share operation
          toast({ variant: "default", title: "Share Cancelled", description: "You decided not to share the challenge."});
        } else if (error instanceof Error && error.message.includes("Permission denied")) {
          toast({ variant: "destructive", title: "Share Failed", description: "Could not share due to permission issues. Ensure you're on HTTPS and sharing is allowed by your browser."});
        } else {
          toast({ variant: "destructive", title: "Share Error", description: "An unexpected error occurred while trying to share."});
        }
      });
    } else {
      toast({ variant: "destructive", title: "Share Not Supported", description: "Your browser doesn't support direct sharing."});
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">Eco Challenges</h1>
      
      <Alert className="bg-primary/10 border-primary/20">
        <Trophy className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Boost Your Eco Score!</AlertTitle>
        <AlertDescription>
          Complete challenges to earn points, unlock badges, and make a bigger impact. 
          Your progress is tracked as you log items on the <Link href="/" className="font-medium text-primary hover:underline">home page</Link>.
          (Challenge and progress data is currently placeholder).
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {challenges.filter(c => c.isActive).map(challenge => {
          const progress = getChallengeProgress(challenge.id);
          const currentVal = progress?.currentProgress || 0;
          const targetVal = challenge.targetValue;
          const isCompleted = progress?.completed || false;
          const progressPercentage = targetVal > 0 ? Math.min((currentVal / targetVal) * 100, 100) : 0;

          return (
            <Card key={challenge.id} className={`flex flex-col justify-between ${isCompleted ? 'opacity-80 bg-muted/50' : 'bg-card'}`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  {getIconForChallenge(challenge.badgeIcon)}
                  {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                <CardTitle className="text-lg sm:text-xl">{challenge.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{challenge.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pt-0 pb-4 space-y-2">
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>Progress: {currentVal}{challenge.unit === '%' ? '%' : ''} / {targetVal}{challenge.unit || ''}</span>
                  <span>{progressPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                {challenge.badgeName && (
                   <Badge variant="secondary" className="mt-2 text-xs">
                     <Star className="mr-1 h-3 w-3 text-yellow-500 fill-yellow-500" /> Badge: {challenge.badgeName}
                   </Badge>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-2">
                <span className="text-base sm:text-lg font-semibold text-primary">{challenge.points} PTS</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleShareChallenge(challenge.title)} disabled={isCompleted}>
                    <Share2 className="mr-2 h-3 w-3" /> Share
                  </Button>
                  {isCompleted ? (
                    <Button variant="ghost" size="sm" disabled className="text-green-600 border-green-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Completed
                    </Button>
                  ) : (
                     <Button variant="outline" size="sm" asChild>
                        <Link href="/">Log Items</Link>
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      <section className="mt-10 sm:mt-12 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Your Badges</h2>
        <Card className="p-4 sm:p-6">
            <CardContent className="flex flex-wrap justify-center gap-3 sm:gap-4 items-center">
                {userProgress.filter(p => p.completed).map(p => {
                    const challengeDetails = challenges.find(c => c.id === p.challengeId);
                    if (!challengeDetails || !challengeDetails.badgeIcon) return null;
                    return (
                        <div key={p.challengeId} className="p-3 sm:p-4 border-2 border-primary/50 rounded-full bg-primary/10 shadow-md" title={challengeDetails.badgeName || challengeDetails.title}>
                           {getIconForChallenge(challengeDetails.badgeIcon)}
                        </div>
                    );
                })}
                 {userProgress.filter(p => p.completed).length === 0 && (
                     <p className="text-muted-foreground">No badges unlocked yet. Complete challenges to earn them!</p>
                 )}
                 {/* Placeholder for unearned badges */}
                <div className="p-3 sm:p-4 border-2 border-dashed rounded-full bg-muted shadow-inner" title="Future Badge (Placeholder)">
                    <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground opacity-50"/>
                </div>
            </CardContent>
            <CardDescription className="text-sm sm:text-base mt-2">Unlock unique badges as you complete more challenges!</CardDescription>
        </Card>
      </section>
    </div>
  );
}

