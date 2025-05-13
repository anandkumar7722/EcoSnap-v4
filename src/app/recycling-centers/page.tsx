'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Search, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from 'next/image';

export default function RecyclingCentersPage() {
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const location = formData.get('location') as string;
    if (location) {
      // In a real app, this would trigger geolocation or a map search.
      // For now, it opens Google Maps with the location.
      window.open(`https://www.google.com/maps/search/recycling+centers+near+${encodeURIComponent(location)}`, '_blank');
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Nearby Recycling Centers</h1>

      <Alert variant="default">
        <MapPin className="h-4 w-4" />
        <AlertTitle>Find Recycling Centers Near You!</AlertTitle>
        <AlertDescription>
          This feature will help you locate recycling centers. Enter your address or allow location access (coming soon!) to find facilities and their operating hours.
        </AlertDescription>
      </Alert>
      
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search for Centers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <Input 
              type="text" 
              name="location"
              placeholder="Enter your city, zip code, or address" 
              aria-label="Location search"
            />
            <Button type="submit" className="w-full">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </form>
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Developer Note</AlertTitle>
            <AlertDescription>
              Full map integration requires a Google Maps API key. This placeholder opens a Google Maps search in a new tab. For a production app, ensure API keys are configured and geolocation is implemented.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-4">Map preview (placeholder):</p>
        <div className="aspect-video bg-muted rounded-md overflow-hidden relative w-full max-w-2xl mx-auto border">
            <Image 
                src="https://picsum.photos/800/450?grayscale&blur=2" 
                alt="Placeholder map" 
                layout="fill" 
                objectFit="cover"
                data-ai-hint="map placeholder"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <p className="text-white text-xl font-semibold">Map Area (Coming Soon)</p>
            </div>
        </div>
      </div>
    </div>
  );
}
