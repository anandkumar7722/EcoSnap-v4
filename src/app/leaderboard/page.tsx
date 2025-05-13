'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Users, ShieldCheck, BarChart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';

// Placeholder leaderboard data
const placeholderLeaderboard = [
  { rank: 1, name: 'EcoWarriorJane', score: 1250, avatar: 'https://picsum.photos/seed/jane/40/40', itemsClassified: 50, challenges: 5 },
  { rank: 2, name: 'GreenThumbAlex', score: 1100, avatar: 'https://picsum.photos/seed/alex/40/40', itemsClassified: 45, challenges: 4 },
  { rank: 3, name: 'RecycleRita', score: 980, avatar: 'https://picsum.photos/seed/rita/40/40', itemsClassified: 40, challenges: 3 },
  { rank: 4, name: 'SustainableSam', score: 750, avatar: 'https://picsum.photos/seed/sam/40/40', itemsClassified: 30, challenges: 2 },
  { rank: 5, name: 'CompostKing', score: 600, avatar: 'https://picsum.photos/seed/king/40/40', itemsClassified: 25, challenges: 1 },
];

// Placeholder for current user's data (would be dynamic)
const currentUserData = {
  name: 'You (EcoSnapUser)',
  score: 820,
  rank: 'N/A (Soon!)', // Rank calculation would be dynamic
  itemsClassified: 35,
  challenges: 2,
};


export default function LeaderboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary">Eco Leaderboard</h1>

      <Alert>
        <Users className="h-4 w-4" />
        <AlertTitle>Compete and Inspire!</AlertTitle>
        <AlertDescription>
          See how you rank against other eco-conscious users! Earn points by classifying waste on the <Link href="/" className="font-medium text-primary hover:underline">home page</Link> and completing challenges. This feature is currently showing placeholder data.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <ShieldCheck className="h-5 w-5 text-accent" />
              Your Eco Stats
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your current performance (placeholder).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm sm:text-base">
            <p><strong>User:</strong> {currentUserData.name}</p>
            <p><strong>Score:</strong> {currentUserData.score} points</p>
            <p><strong>Items Classified:</strong> {currentUserData.itemsClassified}</p>
            <p><strong>Challenges Completed:</strong> {currentUserData.challenges}</p>
            <p><strong>Your Rank:</strong> {currentUserData.rank}</p>
            <Link href="/dashboard" className="text-sm text-primary hover:underline flex items-center mt-2">
                <BarChart className="mr-1 h-4 w-4" /> View Your Dashboard
            </Link>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
              Top Eco Champions
            </CardTitle>
             <CardDescription className="text-xs sm:text-sm">Leaderboard (placeholder data).</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-xs sm:text-sm">Rank</TableHead>
                  <TableHead className="text-xs sm:text-sm">User</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Score</TableHead>
                  <TableHead className="hidden md:table-cell text-right text-xs sm:text-sm">Items</TableHead>
                  <TableHead className="hidden sm:table-cell text-right text-xs sm:text-sm">Challenges</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {placeholderLeaderboard.map((user) => (
                  <TableRow key={user.rank}>
                    <TableCell className="font-medium text-sm sm:text-base">{user.rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                          <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="avatar person" />
                          <AvatarFallback>{user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm sm:text-base">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm sm:text-base">{user.score}</TableCell>
                    <TableCell className="hidden md:table-cell text-right text-sm sm:text-base">{user.itemsClassified}</TableCell>
                    <TableCell className="hidden sm:table-cell text-right text-sm sm:text-base">{user.challenges}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
