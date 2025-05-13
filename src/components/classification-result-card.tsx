import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Tag, Percent, CalendarDays, CheckCircle2, AlertCircle } from 'lucide-react';

interface ClassificationResultCardProps {
  imageDataUri: string;
  category: string;
  confidence: number;
  timestamp?: number;
}

export function ClassificationResultCard({ imageDataUri, category, confidence, timestamp }: ClassificationResultCardProps) {
  const confidencePercentage = Math.round(confidence * 100);
  const isConfident = confidencePercentage >= 70;

  return (
    <Card className="w-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="aspect-video w-full relative overflow-hidden">
          <Image src={imageDataUri} alt={`Waste classified as ${category}`} layout="fill" objectFit="cover" data-ai-hint="waste image" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-xl mb-2 flex items-center gap-2">
          {isConfident ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <AlertCircle className="h-6 w-6 text-orange-500" />}
          {category || "Unknown"}
        </CardTitle>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>Category: <Badge variant={isConfident ? "default" : "secondary"}>{category || "N/A"}</Badge></span>
          </div>
          <div className="flex items-center gap-2">
             <Percent className="h-4 w-4" />
            <span>Confidence: {confidencePercentage}%</span>
          </div>
          <Progress value={confidencePercentage} className="h-2 [&>div]:bg-primary" aria-label={`Confidence ${confidencePercentage}%`} />
        </div>
      </CardContent>
      {timestamp && (
        <CardFooter className="p-4 bg-muted/50">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            Classified on: {format(new Date(timestamp), 'PPpp')}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
