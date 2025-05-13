
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trophy, Zap, Target, Recycle, Leaf, Package, Atom } from 'lucide-react'; // Added Atom
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import type { Challenge, WasteCategory } from '@/lib/types'; // Assuming Challenge type is defined

// Placeholder challenge data - updated with new categories and progress
const placeholderChallenges: Challenge[] = [
  { 
    id: '1', 
    title: 'E-Waste Collector', 
    description: 'Properly classify 5 e-waste items this month.', 
    points: 150, 
    completed: false, 
    currentProgress: 2,
    targetProgress: 5,
    badgeIcon: 'Atom', // Lucide icon name
    criteria: { type: 'specific_category_count', categoryGoal: 'ewaste', countGoal: 5 } 
  },
  { 
    id: '2', 
    title: 'Plastic Reducer', 
    description: 'Classify 10 plastic items correctly.', 
    points: 80, 
    completed: true, 
    currentProgress: 10,
    targetProgress: 10,
    badgeIcon: 'Recycle',
    criteria: { type: 'specific_category_count', categoryGoal: 'plastic', countGoal: 10 } 
  },
  { 
    id: '3', 
    title: 'Bio-Waste Champion', 
    description: 'Divert 2kg of bio-waste (classify 8 items).', 
    points: 100, 
    completed: false,
    currentProgress: 3,
    targetProgress: 8,
    badgeIcon: 'Leaf',
    criteria: { type: 'specific_category_count', categoryGoal: 'biowaste', countGoal: 8 } 
  },
  { 
    id: '4', 
    title: 'Paper Recycler Pro', 
    description: 'Classify 15 paper items.', 
    points: 70, 
    completed: false,
    currentProgress: 11,
    targetProgress: 15,
    badgeIcon: 'Package', // Using Package for paper/cardboard items
    criteria: { type: 'specific_category_count', categoryGoal: 'paper', countGoal: 15 } 
  },
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
  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">Eco Challenges</h1>
      
      <Alert className="bg-primary/10 border-primary/20">
        <Trophy className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Boost Your Eco Score!</AlertTitle>
        <AlertDescription>
          Complete these challenges to earn points, unlock badges, and make a bigger impact. 
          Start by classifying items on the <Link href="/" className="font-medium text-primary hover:underline">home page</Link>.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderChallenges.map(challenge => (
          <Card key={challenge.id} className={`flex flex-col justify-between ${challenge.completed ? 'opacity-80 bg-muted/50' : 'bg-card'}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                {getIconForChallenge(challenge.badgeIcon)}
                {challenge.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
              </div>
              <CardTitle className="text-lg sm:text-xl">{challenge.title}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{challenge.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pt-0 pb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>Progress: {challenge.currentProgress}/{challenge.targetProgress}</span>
                  <span>{((challenge.currentProgress || 0) / (challenge.targetProgress || 1) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={challenge.targetProgress ? ((challenge.currentProgress || 0) / challenge.targetProgress) * 100 : 0} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-4">
              <span className="text-base sm:text-lg font-semibold text-primary">{challenge.points} PTS</span>
              {challenge.completed ? (
                <Button variant="ghost" size="sm" disabled className="text-green-600 border-green-600">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Completed
                </Button>
              ) : (
                 <Button variant="outline" size="sm" disabled> {/* Link to classification page or relevant action */}
                  Track Progress
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <section className="mt-10 sm:mt-12 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Your Badges (Coming Soon)</h2>
        <Card className="p-4 sm:p-6">
            <CardContent className="flex flex-wrap justify-center gap-3 sm:gap-4 items-center">
                <div className="p-3 sm:p-4 border-2 border-dashed rounded-full bg-muted shadow-inner" title="Eco Starter Badge (Placeholder)">
                    <Trophy className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground opacity-50"/>
                </div>
                <div className="p-3 sm:p-4 border-2 border-dashed rounded-full bg-muted shadow-inner" title="Recycling Pro Badge (Placeholder)">
                    <Recycle className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground opacity-50"/>
                </div>
                <div className="p-3 sm:p-4 border-2 border-dashed rounded-full bg-muted shadow-inner" title="Green Thumb Badge (Placeholder)">
                    <Leaf className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground opacity-50"/>
                </div>
            </CardContent>
            <CardDescription className="text-sm sm:text-base">Unlock unique badges as you complete more challenges and recycle more items!</CardDescription>
        </Card>
      </section>
    </div>
  );
}
