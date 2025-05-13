'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, Search, AlertTriangle, Navigation } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from 'next/image';
import { useState } from 'react';

export default function RecyclingCentersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      window.open(`https://www.google.com/maps/search/recycling+centers+near+${encodeURIComponent(searchTerm.trim())}`, '_blank');
    }
  };

  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          window.open(`https://www.google.com/maps/search/recycling+centers/@${latitude},${longitude},13z`, '_blank');
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not access your location. Please ensure location services are enabled or search manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };


  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary">Nearby Recycling Centers</h1>

      <Alert variant="default">
        <MapPin className="h-4 w-4" />
        <AlertTitle>Find Recycling Centers Near You!</AlertTitle>
        <AlertDescription>
          Enter your address or use current location to find facilities. This feature opens Google Maps.
        </AlertDescription>
      </Alert>
      
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Search className="h-5 w-5 text-primary" />
            Search for Centers
          </CardTitle>
           <CardDescription className="text-xs sm:text-sm">Find drop-off locations for various recyclable materials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4">
            <Input 
              type="text" 
              name="location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter your city, zip code, or address" 
              aria-label="Location search"
              className="text-sm sm:text-base"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button type="submit" className="w-full sm:flex-1">
                <Search className="mr-2 h-4 w-4" /> Search Manually
                </Button>
                <Button type="button" variant="outline" onClick={handleGeolocate} className="w-full sm:flex-1">
                    <Navigation className="mr-2 h-4 w-4" /> Use My Current Location
                </Button>
            </div>
          </form>
          <Alert variant="destructive" className="mt-4 sm:mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-sm sm:text-base">Developer Note</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">
              Full map integration would typically require a Google Maps API key and embedding. This version opens Google Maps in a new tab for searching.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">Map preview (placeholder):</p>
        <div className="aspect-video bg-muted rounded-md overflow-hidden relative w-full max-w-2xl mx-auto border shadow-sm">
            <Image 
                src="https://picsum.photos/seed/mapview/800/450?grayscale&blur=2" 
                alt="Placeholder map" 
                layout="fill" 
                objectFit="cover"
                data-ai-hint="map placeholder"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <p className="text-white text-lg sm:text-xl font-semibold p-4 text-center">Map Area (Functionality Opens Google Maps)</p>
            </div>
        </div>
      </div>
    </div>
  );
}
