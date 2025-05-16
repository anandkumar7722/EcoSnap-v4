
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { MapPin, Search, AlertTriangle, Navigation, CalendarClock, Bell, Info, Trash2, Recycle, Leaf, Package as PackageIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { RecyclingScheduleItem, UserScheduleSettings } from '@/lib/types';
import { getFromLocalStorage, saveToLocalStorage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const SCHEDULE_SETTINGS_KEY = 'ecoSnapScheduleSettings';

// Placeholder schedules - in a real app, this would come from an API
const placeholderSchedules: RecyclingScheduleItem[] = [
  { id: '1', date: '2024-08-15', wasteType: 'recycling', notes: 'Blue bin pickup' },
  { id: '2', date: '2024-08-16', wasteType: 'compost', notes: 'Green bin pickup' },
  { id: '3', date: '2024-08-22', wasteType: 'recycling', notes: 'Blue bin pickup' },
  { id: '4', date: '2024-08-22', wasteType: 'trash', notes: 'Black bin pickup' },
];

const getIconForWasteType = (wasteType: string) => {
  switch (wasteType.toLowerCase()) {
    case 'recycling': return <Recycle className="h-4 w-4 text-blue-500" />;
    case 'compost':
    case 'yard_waste':
      return <Leaf className="h-4 w-4 text-green-600" />;
    case 'trash': return <Trash2 className="h-4 w-4 text-gray-700" />;
    default: return <PackageIcon className="h-4 w-4 text-gray-500" />;
  }
};

export default function RecyclingFeaturesPage() {
  const [centerSearchTerm, setCenterSearchTerm] = useState('');
  const [scheduleSettings, setScheduleSettings] = useState<UserScheduleSettings>({
    locationQuery: '',
    notificationsEnabled: false,
    schedules: [],
  });
  const [isFetchingSchedule, setIsFetchingSchedule] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedSettings = getFromLocalStorage<UserScheduleSettings>(SCHEDULE_SETTINGS_KEY, {
      locationQuery: '',
      notificationsEnabled: false,
      schedules: [],
    });
    setScheduleSettings(storedSettings);
  }, []);

  const handleCenterSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (centerSearchTerm.trim()) {
      window.open(`https://www.google.com/maps/search/recycling+centers+near+${encodeURIComponent(centerSearchTerm.trim())}`, '_blank');
    }
  };

  const handleGeolocateCenterSearch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          window.open(`https://www.google.com/maps/search/recycling+centers/@${latitude},${longitude},13z`, '_blank');
        },
        (error) => {
          console.error("Error getting location for centers:", error);
          toast({ variant: "destructive", title: "Location Error", description: "Could not access your location. Please search manually."});
        }
      );
    } else {
      toast({ variant: "destructive", title: "Geolocation Not Supported", description: "Your browser doesn't support geolocation."});
    }
  };

  const handleScheduleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScheduleSettings(prev => ({ ...prev, locationQuery: event.target.value }));
  };

  const handleToggleScheduleNotifications = (checked: boolean) => {
    const newSettings = { ...scheduleSettings, notificationsEnabled: checked };
    setScheduleSettings(newSettings);
    saveToLocalStorage(SCHEDULE_SETTINGS_KEY, newSettings);
    toast({
      title: 'Notification Settings Updated',
      description: `Collection schedule notifications ${checked ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleFetchSchedule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!scheduleSettings.locationQuery.trim()) {
      toast({
        variant: 'destructive',
        title: 'Location Needed',
        description: 'Please enter your city, zip code, or address to fetch schedules.',
      });
      return;
    }
    setIsFetchingSchedule(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    const newSchedules = placeholderSchedules.filter(s => 
        s.date.includes(new Date().getFullYear().toString()) || 
        (scheduleSettings.locationQuery.toLowerCase().includes('recycling') && s.wasteType === 'recycling')
    ).slice(0, Math.random() > 0.5 ? 3: 4);

    const newSettings = { ...scheduleSettings, schedules: newSchedules, lastFetched: Date.now() };
    setScheduleSettings(newSettings);
    saveToLocalStorage(SCHEDULE_SETTINGS_KEY, newSettings);
    setIsFetchingSchedule(false);

    if (newSchedules.length > 0) {
        toast({
        title: 'Schedules Updated',
        description: `Found ${newSchedules.length} upcoming events for "${scheduleSettings.locationQuery}".`,
        });
    } else {
        toast({
        variant: 'default',
        title: 'No Specific Schedules Found',
        description: `Showing general placeholders for "${scheduleSettings.locationQuery}". Municipal API integration needed for real data.`,
        });
        const fallbackSettings = { ...scheduleSettings, schedules: placeholderSchedules.slice(0,2), lastFetched: Date.now() };
        setScheduleSettings(fallbackSettings);
        saveToLocalStorage(SCHEDULE_SETTINGS_KEY, fallbackSettings);
    }
  };


  return (
    <div className="space-y-8 sm:space-y-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary">Recycling Centers & Schedules</h1>

      <Alert variant="default">
        <MapPin className="h-4 w-4" />
        <AlertTitle>Find Drop-off Locations & Local Schedules!</AlertTitle>
        <AlertDescription>
          Use the forms below to find nearby recycling centers or check local collection schedules. Schedule data is placeholder.
        </AlertDescription>
      </Alert>
      
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Search className="h-5 w-5 text-primary" />
            Find Recycling Centers
          </CardTitle>
           <CardDescription className="text-xs sm:text-sm">Search for drop-off locations (opens Google Maps).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCenterSearch} className="space-y-3 sm:space-y-4">
            <Input 
              type="text" 
              name="centerLocation"
              value={centerSearchTerm}
              onChange={(e) => setCenterSearchTerm(e.target.value)}
              placeholder="Enter city, zip, or address for centers" 
              aria-label="Recycling center location search"
              className="text-sm sm:text-base"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button type="submit" className="w-full sm:flex-1">
                  <Search className="mr-2 h-4 w-4" /> Search Centers
                </Button>
                <Button type="button" variant="outline" onClick={handleGeolocateCenterSearch} className="w-full sm:flex-1">
                  <Navigation className="mr-2 h-4 w-4" /> Use My Location
                </Button>
            </div>
          </form>
          <Alert variant="destructive" className="mt-4 sm:mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-sm sm:text-base">Note on Center Search</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">
              This search opens Google Maps in a new tab. Full map embedding requires a Google Maps API key.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="mt-6 sm:mt-8 text-center">
        <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">Map preview for centers (placeholder):</p>
        <div className="aspect-video bg-muted rounded-md overflow-hidden relative w-full max-w-2xl mx-auto border shadow-sm">
            <Image 
                src="https://picsum.photos/seed/mapview/800/450?grayscale&blur=2" 
                alt="Placeholder map" 
                layout="fill" 
                objectFit="cover"
                data-ai-hint="map placeholder"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <p className="text-white text-lg sm:text-xl font-semibold p-4 text-center">Map Area (Opens Google Maps)</p>
            </div>
        </div>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CalendarClock className="h-5 w-5 text-primary" />
            Local Collection Schedules
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Enter your location to find local collection schedules. (Prototype: Uses placeholder data).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFetchSchedule} className="space-y-3 sm:space-y-4">
            <Input
              type="text"
              name="scheduleLocation"
              value={scheduleSettings.locationQuery}
              onChange={handleScheduleLocationChange}
              placeholder="e.g., 'Springfield, IL' or '90210'"
              aria-label="Location for schedule lookup"
              className="text-sm sm:text-base"
              disabled={isFetchingSchedule}
            />
            <Button type="submit" className="w-full" disabled={isFetchingSchedule}>
              {isFetchingSchedule ? 'Fetching Schedules...' : 'Check Collection Schedule'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
            <div className="flex items-center justify-between space-x-2 w-full">
                <Label htmlFor="notifications-switch" className="text-sm sm:text-base">
                Enable pickup reminders
                </Label>
                <Switch
                id="notifications-switch"
                checked={scheduleSettings.notificationsEnabled}
                onCheckedChange={handleToggleScheduleNotifications}
                aria-label="Toggle collection schedule notifications"
                />
            </div>
            <p className="text-xs text-muted-foreground">Actual push notifications require backend setup (e.g., Firebase Cloud Messaging).</p>
        </CardFooter>
      </Card>

      {scheduleSettings.schedules && scheduleSettings.schedules.length > 0 && (
        <section className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-primary flex items-center gap-2">
            <Info className="h-5 w-5 sm:h-6 sm:w-6" />
            Upcoming Collection Events {scheduleSettings.lastFetched ? `(as of ${new Date(scheduleSettings.lastFetched).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scheduleSettings.schedules.map((item) => (
              <Card key={item.id} className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2 capitalize">
                    {getIconForWasteType(item.wasteType)}
                    {item.wasteType.replace('_', ' ')} Pickup
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Date: {new Date(item.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                {item.notes && (
                  <CardContent className="pt-0 pb-3">
                    <p className="text-xs sm:text-sm text-muted-foreground">{item.notes}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}
       {scheduleSettings.locationQuery && !isFetchingSchedule && scheduleSettings.schedules && scheduleSettings.schedules.length === 0 && (
         <Alert variant="default" className="max-w-2xl mx-auto">
            <Info className="h-4 w-4" />
            <AlertTitle>No Schedules Found</AlertTitle>
            <AlertDescription>
             We couldn't find specific schedules for "{scheduleSettings.locationQuery}". This might be because the location is too broad, or municipal data isn't available (prototype limitation).
            </AlertDescription>
          </Alert>
       )}
    </div>
  );
}
