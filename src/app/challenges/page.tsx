'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trophy, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

// Placeholder challenge data
const placeholderChallenges = [
  { id: '1', title: 'Compost Champion', description: 'Classify 5 compostable items this week.', points: 50, completed: false, icon: <Zap className="h-5 w-5 text-yellow-500" /> },
  { id: '2', title: 'Recycling Rookie', description: 'Classify your first recyclable item.', points: 20, completed: true, icon: <Trophy className="h-5 w-5 text-green-500" /> },
  { id: '3', title: 'Waste Warrior', description: 'Reduce non-recyclable classifications for 3 consecutive days.', points: 100, completed: false, icon: <Zap className="h-5 w-5 text-yellow-500" /> },
];


export default function ChallengesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Eco Challenges</h1>
      
      <Alert>
        <Trophy className="h-4 w-4" />
        <AlertTitle>Feature Under Development</AlertTitle>
        <AlertDescription>
          Complete eco-friendly missions, track your progress, and earn badges! This section will soon be filled with exciting challenges to help you reduce waste.
          Start by classifying items on the <Link href="/" className="font-medium text-primary hover:underline">home page</Link>.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {placeholderChallenges.map(challenge => (
          <Card key={challenge.id} className={challenge.completed ? 'opacity-70' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {challenge.icon}
                {challenge.title}
              </CardTitle>
              <CardDescription>{challenge.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Points: {challenge.points}</span>
              {challenge.completed ? (
                <Button variant="ghost" size="sm" disabled className="text-green-500">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Completed
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Start Challenge
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <section className="mt-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Your Badges (Coming Soon)</h2>
        <div className="flex justify-center gap-4 p-4 bg-muted rounded-md">
          <div className="p-3 border rounded-full bg-background shadow" title="Placeholder Badge 1"><Trophy className="h-8 w-8 text-gray-400"/></div>
          <div className="p-3 border rounded-full bg-background shadow" title="Placeholder Badge 2"><Zap className="h-8 w-8 text-gray-400"/></div>
          <div className="p-3 border rounded-full bg-background shadow" title="Placeholder Badge 3"><CheckCircle className="h-8 w-8 text-gray-400"/></div>
        </div>
      </section>
    </div>
  );
}
