import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Tag, Percent, CalendarDays, CheckCircle2, AlertCircle, Star } from 'lucide-react';
import type { WasteCategory } from '@/lib/types';

interface ClassificationResultCardProps {
  imageDataUri: string;
  category: WasteCategory | string; // Allow string for flexibility if enum isn't strictly enforced everywhere yet
  confidence: number;
  timestamp?: number;
  points?: number;
}

export function ClassificationResultCard({ imageDataUri, category, confidence, timestamp, points }: ClassificationResultCardProps) {
  const confidencePercentage = Math.round(confidence * 100);
  const isConfident = confidencePercentage >= 60; // Adjusted threshold for "confident" display

  let categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <Card className="w-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="aspect-video w-full relative overflow-hidden bg-muted">
          <Image src={imageDataUri} alt={`Waste classified as ${category}`} layout="fill" objectFit="cover" data-ai-hint={`${category} image`} />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-xl mb-2 flex items-center gap-2 capitalize">
          {isConfident ? <CheckCircle2 className="h-6 w-6 text-green-600" /> : <AlertCircle className="h-6 w-6 text-orange-500" />}
          {categoryDisplay || "Unknown"}
        </CardTitle>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <span>Category: <Badge variant={isConfident ? "default" : "secondary"} className="capitalize bg-primary/10 text-primary border-primary/20">{categoryDisplay || "N/A"}</Badge></span>
          </div>
          <div className="flex items-center gap-2">
             <Percent className="h-4 w-4 text-primary" />
            <span>Confidence: {confidencePercentage}%</span>
          </div>
          <Progress value={confidencePercentage} className="h-2 [&>div]:bg-primary" aria-label={`Confidence ${confidencePercentage}%`} />
          {points !== undefined && (
            <div className="flex items-center gap-2 mt-1 text-primary font-medium">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span>{points} points earned</span>
            </div>
          )}
        </div>
      </CardContent>
      {timestamp && (
        <CardFooter className="p-3 bg-muted/30 border-t">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Classified: {format(new Date(timestamp), 'MMM d, yyyy HH:mm')}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
