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
  const isConfident = confidencePercentage >= 60; 

  let categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <Card className="w-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-video w-full relative overflow-hidden bg-muted">
          <Image src={imageDataUri} alt={`Waste classified as ${category}`} layout="fill" objectFit="cover" data-ai-hint={`${category} image`} />
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 flex-grow">
        <CardTitle className="text-lg sm:text-xl mb-2 flex items-center gap-2 capitalize">
          {isConfident ? <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 flex-shrink-0" />}
          <span className="truncate">{categoryDisplay || "Unknown"}</span>
        </CardTitle>
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <span>Category: <Badge variant={isConfident ? "default" : "secondary"} className="capitalize bg-primary/10 text-primary border-primary/20 text-xs px-1.5 py-0.5 sm:px-2 sm:py-0.5">{categoryDisplay || "N/A"}</Badge></span>
          </div>
          <div className="flex items-center gap-2">
             <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <span>Confidence: {confidencePercentage}%</span>
          </div>
          <Progress value={confidencePercentage} className="h-1.5 sm:h-2 [&>div]:bg-primary" aria-label={`Confidence ${confidencePercentage}%`} />
          {points !== undefined && (
            <div className="flex items-center gap-2 mt-1 text-primary font-medium">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-accent text-accent flex-shrink-0" />
              <span>{points} points earned</span>
            </div>
          )}
        </div>
      </CardContent>
      {timestamp && (
        <CardFooter className="p-2 sm:p-3 bg-muted/30 border-t mt-auto">
          <div className="text-xs text-muted-foreground flex items-center gap-1 sm:gap-1.5 w-full">
            <CalendarDays className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
            <span className="truncate">Classified: {format(new Date(timestamp), 'MMM d, yyyy HH:mm')}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
