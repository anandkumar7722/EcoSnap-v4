
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CalendarClock, MapPin, Bell, Info, Trash2, Recycle, Package } from 'lucide-react';
import type { RecyclingScheduleItem, UserScheduleSettings } from '@/lib/types';
import { getFromLocalStorage, saveToLocalStorage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const SCHEDULE_SETTINGS_KEY = 'ecoSnapScheduleSettings';

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
      return <Leaf className="h-4 w-4 text-green-600" />; // Re-using Leaf icon
    case 'trash': return <Trash2 className="h-4 w-4 text-gray-700" />;
    default: return <Package className="h-4 w-4 text-gray-500" />;
  }
};

export default function RecyclingSchedulesPage() {
  const [settings, setSettings] = useState<UserScheduleSettings>({
    locationQuery: '',
    notificationsEnabled: false,
    schedules: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedSettings = getFromLocalStorage<UserScheduleSettings>(SCHEDULE_SETTINGS_KEY, {
      locationQuery: '',
      notificationsEnabled: false,
      schedules: [],
    });
    setSettings(storedSettings);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, locationQuery: event.target.value }));
  };

  const handleToggleNotifications = (checked: boolean) => {
    const newSettings = { ...settings, notificationsEnabled: checked };
    setSettings(newSettings);
    saveToLocalStorage(SCHEDULE_SETTINGS_KEY, newSettings);
    toast({
      title: 'Notification Settings Updated',
      description: `Recycling schedule notifications ${checked ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleFetchSchedule = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings.locationQuery.trim()) {
      toast({
        variant: 'destructive',
        title: 'Location Needed',
        description: 'Please enter your city, zip code, or address to fetch schedules.',
      });
      return;
    }
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, you would make an API call here:
    // const fetchedSchedules = await fetchMunicipalApi(settings.locationQuery);
    // For now, use placeholder data based on the query (e.g. filter placeholders)
    const newSchedules = placeholderSchedules.filter(s => 
        s.date.includes(new Date().getFullYear().toString()) || // include current year
        (settings.locationQuery.toLowerCase().includes('recycling') && s.wasteType === 'recycling')
    ).slice(0, Math.random() > 0.5 ? 3: 4);


    const newSettings = { ...settings, schedules: newSchedules, lastFetched: Date.now() };
    setSettings(newSettings);
    saveToLocalStorage(SCHEDULE_SETTINGS_KEY, newSettings);
    setIsLoading(false);
    if (newSchedules.length > 0) {
        toast({
        title: 'Schedules Updated',
        description: `Found ${newSchedules.length} upcoming events for your area.`,
        });
    } else {
        toast({
        variant: 'default',
        title: 'No Specific Schedules Found',
        description: `No specific schedules matched for "${settings.locationQuery}". Showing general placeholders.`,
        });
        const fallbackSettings = { ...settings, schedules: placeholderSchedules.slice(0,2), lastFetched: Date.now() };
        setSettings(fallbackSettings);
        saveToLocalStorage(SCHEDULE_SETTINGS_KEY, fallbackSettings);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary">Recycling Schedules & Alerts</h1>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Stay Updated on Pickups!</AlertTitle>
        <AlertDescription>
          Enter your location to find local recycling schedules. Enable notifications to get reminders.
          (This feature is a prototype; actual municipal API integration is required for real data.)
        </AlertDescription>
      </Alert>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <MapPin className="h-5 w-5 text-primary" />
            Set Your Location
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Enter your city, zip code, or full address to find relevant schedules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFetchSchedule} className="space-y-3 sm:space-y-4">
            <Input
              type="text"
              name="location"
              value={settings.locationQuery}
              onChange={handleInputChange}
              placeholder="e.g., 'Springfield, IL' or '90210'"
              aria-label="Location for schedule lookup"
              className="text-sm sm:text-base"
              disabled={isLoading}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Fetching Schedules...' : 'Check Schedule'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Bell className="h-5 w-5 text-primary" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="notifications-switch" className="text-sm sm:text-base">
              Enable pickup reminders
            </Label>
            <Switch
              id="notifications-switch"
              checked={settings.notificationsEnabled}
              onCheckedChange={handleToggleNotifications}
              aria-label="Toggle recycling schedule notifications"
            />
          </div>
           <p className="text-xs text-muted-foreground mt-2">Actual push notifications require backend setup (e.g., Firebase Cloud Messaging).</p>
        </CardContent>
      </Card>

      {settings.schedules && settings.schedules.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-primary flex items-center gap-2">
            <CalendarClock className="h-5 w-5 sm:h-6 sm:w-6" />
            Upcoming Schedules {settings.lastFetched ? `(as of ${new Date(settings.lastFetched).toLocaleTimeString()})` : ''}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {settings.schedules.map((item) => (
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
       {settings.locationQuery && !isLoading && settings.schedules && settings.schedules.length === 0 && (
         <Alert variant="default" className="max-w-2xl mx-auto">
            <Info className="h-4 w-4" />
            <AlertTitle>No Schedules Found</AlertTitle>
            <AlertDescription>
             We couldn't find specific schedules for "{settings.locationQuery}". This might be because the location is too broad, or municipal data isn't available (prototype limitation).
            </AlertDescription>
          </Alert>
       )}

    </div>
  );
}
