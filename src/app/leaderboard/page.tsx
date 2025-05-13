'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Users, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Eco Leaderboard</h1>

      <Alert>
        <Users className="h-4 w-4" />
        <AlertTitle>Compete and Inspire!</AlertTitle>
        <AlertDescription>
          See how you rank against other eco-conscious users! Earn points by classifying waste and completing challenges. This feature is currently showing placeholder data.
        </AlertDescription>
      </Alert>

      {/* Current User's Stats Card - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            Your Eco Stats (Placeholder)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>User:</strong> {currentUserData.name}</p>
          <p><strong>Score:</strong> {currentUserData.score} points</p>
          <p><strong>Items Classified:</strong> {currentUserData.itemsClassified}</p>
          <p><strong>Challenges Completed:</strong> {currentUserData.challenges}</p>
          <p><strong>Your Rank:</strong> {currentUserData.rank}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Top Eco Champions (Placeholder)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="hidden md:table-cell text-right">Items Classified</TableHead>
                <TableHead className="hidden md:table-cell text-right">Challenges Done</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderLeaderboard.map((user) => (
                <TableRow key={user.rank}>
                  <TableCell className="font-medium">{user.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="avatar person" />
                        <AvatarFallback>{user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{user.score}</TableCell>
                  <TableCell className="hidden md:table-cell text-right">{user.itemsClassified}</TableCell>
                  <TableCell className="hidden md:table-cell text-right">{user.challenges}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
