
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart as BarChartIconGeneral, PieChart as PieChartIconLucideGeneral, Info, Edit, Filter, CalendarDays as CalendarIcon, Trash2 as SmartBinIconGeneral, Loader2, LineChart as LineChartIcon, PieChart as PieChartIconLucideEWaste, BarChart as BarChartIconEWaste, Clock, Server, Smartphone, Laptop, Battery, Package as EWastePackageIcon, WifiOff, AlertCircleIcon, CheckCircle2Icon, TrashIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { 
  Bar, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  Cell
} from "recharts";
import { useEffect, useState, useMemo } from 'react';
import type { WasteEntry, WasteCategory, RealTimeEWasteDataPoint, EWasteCategoryDistributionPoint, MonthlyEWasteDataPoint, EWasteCategory as EWasteType, BinData } from '@/lib/types';
import type { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, format, subMonths, addSeconds } from "date-fns";
import { firestore, database } from '@/lib/firebase'; // Added database
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { ref, onValue, off } from 'firebase/database'; // Added ref, onValue, off
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';


const allWasteCategories: WasteCategory[] = ['ewaste', 'plastic', 'biowaste', 'cardboard', 'paper', 'glass', 'metal', 'organic', 'other', 'plasticPete', 'plasticHdpe', 'plasticPp', 'plasticPs', 'plasticOther'];

const generalChartConfig = {
  items: { label: "Items/Kg" },
  ewaste: { label: "E-Waste", color: "hsl(var(--chart-1))" },
  plastic: { label: "Plastic", color: "hsl(var(--chart-2))" },
  biowaste: { label: "Bio-Waste", color: "hsl(var(--chart-3))" }, 
  organic: { label: "Organic", color: "hsl(var(--chart-3))" },
  cardboard: { label: "Cardboard", color: "hsl(var(--chart-4))" },
  paper: { label: "Paper", color: "hsl(var(--chart-5))" },
  glass: { label: "Glass", color: "hsl(var(--chart-1))" }, // Re-using color for demo
  metal: { label: "Metal", color: "hsl(var(--chart-2))" },  // Re-using color for demo
  other: { label: "Other", color: "hsl(var(--muted))" },
  plasticPete: { label: "Plastic PETE", color: "hsl(var(--chart-2))" },
  plasticHdpe: { label: "Plastic HDPE", color: "hsl(var(--chart-2))" },
  plasticPp: { label: "Plastic PP", color: "hsl(var(--chart-2))" },
  plasticPs: { label: "Plastic PS", color: "hsl(var(--chart-2))" },
  plasticOther: { label: "Plastic Other", color: "hsl(var(--chart-2))" },
} satisfies import("@/components/ui/chart").ChartConfig;

// E-Waste Specific Chart Constants
const MAX_REAL_TIME_EWASTE_POINTS = 20;
const REAL_TIME_EWASTE_UPDATE_INTERVAL = 3000; // Milliseconds

const eWasteCategoryColors: Record<EWasteType | 'others', string> = {
  batteries: 'hsl(var(--chart-1))', 
  mobiles: 'hsl(var(--chart-3))',   
  laptops: 'hsl(var(--accent))',    
  others: 'hsl(var(--chart-5))',    
};

const eWasteCategoryConfig = {
  batteries: { label: "Batteries", color: eWasteCategoryColors.batteries, icon: Battery },
  mobiles: { label: "Mobiles", color: eWasteCategoryColors.mobiles, icon: Smartphone },
  laptops: { label: "Laptops", color: eWasteCategoryColors.laptops, icon: Laptop },
  others: { label: "Other E-Waste", color: eWasteCategoryColors.others, icon: EWastePackageIcon },
} satisfies Record<EWasteType | 'others', {label: string; color: string; icon: React.ElementType}>;


export default function DetailedDashboardPage() {
  const [isMobileView, setIsMobileView] = useState(false);
  const [liveWasteData, setLiveWasteData] = useState<WasteEntry[]>([]);
  const [filteredData, setFilteredData] = useState<WasteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedWasteType, setSelectedWasteType] = useState<WasteCategory | 'all'>('all');
  
  // State for E-Waste Charts
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [realTimeEWasteData, setRealTimeEWasteData] = useState<RealTimeEWasteDataPoint[]>([]);
  const [eWasteDistributionData, setEWasteDistributionData] = useState<EWasteCategoryDistributionPoint[]>([]);
  const [monthlyEWasteVolume, setMonthlyEWasteVolume] = useState<MonthlyEWasteDataPoint[]>([]);

  // State for General Smart Bins
  const [smartBinsData, setSmartBinsData] = useState<BinData[]>([]);
  const [isLoadingSmartBins, setIsLoadingSmartBins] = useState(true);
  const [smartBinsError, setSmartBinsError] = useState<string | null>(null);

  // Client-side effect to set initial date range
  useEffect(() => {
    setDateRange({
      from: addDays(new Date(), -90),
      to: new Date(),
    });
  }, []);

  // Update current time every second for E-Waste header
  useEffect(() => {
    setCurrentTime(new Date()); // Set initial time on mount
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate real-time E-Waste volume updates
  useEffect(() => {
    const initialTimestamp = new Date();
    const initialData: RealTimeEWasteDataPoint[] = Array.from({ length: 5 }, (_, i) => ({
      timestamp: format(addSeconds(initialTimestamp, i * -(REAL_TIME_EWASTE_UPDATE_INTERVAL/1000) * (5-i) ), 'HH:mm:ss'),
      volume: Math.floor(Math.random() * 20) + 5,
    })).slice(-MAX_REAL_TIME_EWASTE_POINTS);
    setRealTimeEWasteData(initialData);
    
    const interval = setInterval(() => {
      setRealTimeEWasteData((prevData) => {
        const newPoint = {
          timestamp: format(new Date(), 'HH:mm:ss'),
          volume: Math.floor(Math.random() * 70) + 10,
        };
        const updatedData = [...prevData, newPoint];
        return updatedData.slice(-MAX_REAL_TIME_EWASTE_POINTS);
      });
    }, REAL_TIME_EWASTE_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Simulate E-Waste category distribution
  useEffect(() => {
    const generateDistribution = () => {
      const data: EWasteCategoryDistributionPoint[] = (Object.keys(eWasteCategoryColors) as Array<EWasteType | 'others'>).map(key => ({
        name: eWasteCategoryConfig[key].label as EWasteCategoryDistributionPoint['name'],
        value: Math.floor(Math.random() * 50) + 10,
        fill: eWasteCategoryConfig[key].color,
      }));
      setEWasteDistributionData(data);
    };
    generateDistribution();
  }, []);

  // Generate static data for monthly E-Waste volume
  useEffect(() => {
    const now = new Date();
    const data: MonthlyEWasteDataPoint[] = Array.from({ length: 6 }).map((_, i) => {
      const monthDate = subMonths(now, 5 - i);
      return {
        month: format(monthDate, 'MMM'),
        volume: Math.floor(Math.random() * 200) + 50,
      };
    });
    setMonthlyEWasteVolume(data);
  }, []);

  const eWastePieChartConfig = useMemo(() => {
    return eWasteDistributionData.reduce((acc, cur) => {
      const key = Object.keys(eWasteCategoryConfig).find(k => eWasteCategoryConfig[k as EWasteType | 'others'].label === cur.name) || 'others';
      acc[key as keyof typeof acc] = {label: cur.name, color: cur.fill, icon: eWasteCategoryConfig[key as EWasteType | 'others'].icon };
      return acc;
    }, {} as import("@/components/ui/chart").ChartConfig);
  }, [eWasteDistributionData]);


  // Real-time data fetching from Firestore for general waste
  useEffect(() => {
    setIsLoading(true);
    const userId = 'user1'; 

    if (!firestore) {
        toast({ variant: "destructive", title: "Firebase Error", description: "Firestore is not initialized." });
        setIsLoading(false);
        return;
    }
    if (!userId) { 
        toast({ variant: "destructive", title: "Auth Error", description: "User ID not available." });
        setIsLoading(false);
        setLiveWasteData([]); 
        return;
    }

    const wasteEntriesRef = collection(firestore, 'wasteEntries');
    const q = query(
      wasteEntriesRef, 
      where('userId', '==', userId), 
      orderBy('timestamp', 'desc')
    );

    const unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
      const entries: WasteEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          ...data,
          timestamp: (data.timestamp instanceof Timestamp) ? data.timestamp.toMillis() : Number(data.timestamp),
        } as WasteEntry);
      });
      setLiveWasteData(entries);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching real-time waste entries:", error);
      toast({ variant: "destructive", title: "Data Fetch Error", description: "Could not load live waste data." });
      setIsLoading(false);
    });

    return () => unsubscribeFirestore();
  }, [toast]);

  // Real-time data fetching from Firebase Realtime Database for smart bins
  useEffect(() => {
    if (!database) {
      setSmartBinsError("Firebase Realtime Database is not initialized.");
      setIsLoadingSmartBins(false);
      return;
    }

    const binsRef = ref(database, 'bins');
    const listener = onValue(binsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const binsArray: BinData[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setSmartBinsData(binsArray);
        setSmartBinsError(null);
      } else {
        setSmartBinsData([]);
      }
      setIsLoadingSmartBins(false);
    }, (error) => {
      console.error("Error fetching smart bins data:", error);
      setSmartBinsError("Could not load smart bin data. " + error.message);
      setIsLoadingSmartBins(false);
      toast({ variant: "destructive", title: "Smart Bin Error", description: "Failed to load data from Realtime Database." });
    });

    return () => {
      off(binsRef, 'value', listener); // Detach listener
    };
  }, [toast]);


  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    if (typeof window !== 'undefined') {
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  useEffect(() => {
    let data = liveWasteData;
    if (dateRange?.from && dateRange?.to) {
      data = data.filter(entry => {
        if (!entry.timestamp) return false;
        const entryDate = new Date(entry.timestamp);
        return entryDate >= dateRange.from! && entryDate <= dateRange.to!;
      });
    }
    if (selectedWasteType !== 'all') {
      data = data.filter(entry => entry.type === selectedWasteType);
    }
    setFilteredData(data);
  }, [liveWasteData, dateRange, selectedWasteType]);

  const monthlyData = useMemo(() => {
    return filteredData.reduce((acc, entry) => {
      if (!entry.timestamp) return acc;
      const month = format(new Date(entry.timestamp), "MMM");
      if (!acc[month]) {
        acc[month] = { month };
        allWasteCategories.forEach(cat => acc[month][cat] = 0);
      }
      const quantity = typeof entry.quantity === 'number' ? entry.quantity : 0;
      acc[month][entry.type] = (acc[month][entry.type] || 0) + quantity;
      return acc;
    }, {} as Record<string, any>);
  }, [filteredData]);
  const barChartData = useMemo(() => Object.values(monthlyData), [monthlyData]);

  const categoryDistribution = useMemo(() => {
    return filteredData.reduce((acc, entry) => {
      const existing = acc.find(item => item.name === entry.type);
      const quantity = typeof entry.quantity === 'number' ? entry.quantity : 0;
      if (existing) {
        existing.value += quantity;
      } else {
        acc.push({ name: entry.type, value: quantity, fill: generalChartConfig[entry.type]?.color || generalChartConfig.other.color });
      }
      return acc;
    }, [] as { name: WasteCategory; value: number, fill: string }[]);
  }, [filteredData]);

  const totalWaste = useMemo(() => {
    return filteredData.reduce((sum, entry) => {
      const quantity = typeof entry.quantity === 'number' ? entry.quantity : 0;
      return sum + (entry.unit === 'items' ? quantity * 0.1 : quantity); // Assuming 0.1kg per item for simplicity
    }, 0).toFixed(1);
  }, [filteredData]);
  
  const recycledPercentage = useMemo(() => {
    const totalValueForRecycledPercentage = categoryDistribution.reduce((sum, cat) => sum + cat.value, 0);
    return totalValueForRecycledPercentage > 0 ? 
      ((categoryDistribution.filter(cat => cat.name !== 'other' && cat.name !== 'organic' && cat.name !== 'biowaste').reduce((sum, cat) => sum + cat.value, 0) / 
      totalValueForRecycledPercentage) * 100).toFixed(0) : '0';
  }, [categoryDistribution]);

  const pieOuterRadius = isMobileView ? 60 : 90;
  const barChartLeftMargin = isMobileView ? -25 : -25;

  const renderPieLabel = ({ name, percent, x, y, midAngle, outerRadius: currentOuterRadius }: any) => {
    const labelRadiusOffset = isMobileView ? 10 : 15;
    const RADIAN = Math.PI / 180;
    const effectiveOuterRadius = typeof currentOuterRadius === 'number' ? currentOuterRadius : pieOuterRadius;
    const radius = effectiveOuterRadius + labelRadiusOffset;
    const lx = x + radius * Math.cos(-midAngle * RADIAN);
    const ly = y + radius * Math.sin(-midAngle * RADIAN);
    const textAnchor = lx > x ? 'start' : 'end';
    if ((isMobileView && percent * 100 < 7) || percent * 100 < 5) return null; 
    return (
      <text x={lx} y={ly} fill="currentColor" textAnchor={textAnchor} dominantBaseline="central" className="text-[9px] sm:text-xs fill-foreground">
        {generalChartConfig[name as WasteCategory]?.label || name} (${(percent * 100).toFixed(0)}%)
      </text>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Waste Tracking Dashboard</h1>
        <Button variant="outline" asChild size="sm">
            <Link href="/"><Edit className="mr-2 h-4 w-4" /> Back to Main Page</Link>
        </Button>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Track Your Impact!</AlertTitle>
        <AlertDescription>
          Visualize your general waste habits and e-waste trends. Data is updated in real-time from your logged entries or simulated for e-waste.
          Log items on the <Link href="/" className="font-medium text-primary hover:underline">home page</Link>.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Filter className="h-5 w-5 text-primary" />
            Filters (For General Waste)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full sm:w-auto justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Select value={selectedWasteType} onValueChange={(value) => setSelectedWasteType(value as WasteCategory | 'all')}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select waste type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {allWasteCategories.map(cat => (
                <SelectItem key={cat} value={cat} className="capitalize">{generalChartConfig[cat]?.label || cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="ml-4 text-lg text-muted-foreground">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {liveWasteData.length === 0 && !isLoading && (
            <Alert variant="default" className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>No General Waste Data Yet</AlertTitle>
              <AlertDescription>
                No general waste entries found for your account. Start logging items on the <Link href="/" className="font-medium text-primary hover:underline">home page</Link> to see your dashboard populate!
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total General Waste Logged</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalWaste} kg <span className="text-xs text-muted-foreground">(approx)</span></div>
                    <p className="text-xs text-muted-foreground">Across selected period</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Recycled Ratio (General Est.)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{recycledPercentage}%</div>
                    <p className="text-xs text-muted-foreground">Non-organic/other vs total</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">General Items Logged</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{filteredData.length}</div>
                    <p className="text-xs text-muted-foreground">Entries in selected period</p>
                </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <PieChartIconLucideGeneral className="h-5 w-5 text-primary" />
                  General Waste Category Distribution
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Overall breakdown of classified general items by category.</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryDistribution.length > 0 ? (
                  <ChartContainer config={generalChartConfig} className="mx-auto aspect-square min-h-[250px] max-h-[250px] sm:max-h-[300px] md:max-h-[350px]">
                    <RechartsPieChart>
                      <RechartsTooltip content={<ChartTooltipContent nameKey="name" />} />
                      <Pie
                        data={categoryDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={pieOuterRadius} 
                        labelLine={false}
                        label={renderPieLabel}
                      />
                      <RechartsLegend content={<ChartLegendContent nameKey="name" className="text-xs sm:text-sm [&>div]:gap-1 [&>div>svg]:size-3" />} />
                    </RechartsPieChart>
                  </ChartContainer>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">No general data for selected filters.</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <BarChartIconGeneral className="h-5 w-5 text-primary" />
                  Monthly General Classification Volume
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Volume of general items classified each month by type.</CardDescription>
              </CardHeader>
              <CardContent>
                {barChartData.length > 0 ? (
                  <ChartContainer config={generalChartConfig} className="min-h-[250px] h-[250px] sm:h-[300px] md:h-[350px] w-full">
                    <RechartsBarChart data={barChartData} margin={{ top: 5, right: isMobileView ? 0 : 5, left: barChartLeftMargin, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={isMobileView ? "0.6rem" : "0.75rem"} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={isMobileView ? "0.6rem" : "0.75rem"} />
                        <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                        <RechartsLegend content={<ChartLegendContent nameKey="name" className="text-xs sm:text-sm [&>div]:gap-1 [&>div>svg]:size-3"/>} />
                        {allWasteCategories.filter(cat => cat !== 'other' && generalChartConfig[cat]).map(cat => (
                          <Bar key={cat} dataKey={cat} stackId="a" fill={generalChartConfig[cat]?.color || generalChartConfig.other.color} name={generalChartConfig[cat]?.label as string} radius={cat === 'ewaste' ? [4,4,0,0] : [0,0,0,0]}/>
                        ))}
                        <Bar dataKey="other" stackId="a" fill={generalChartConfig.other.color} name={generalChartConfig.other.label as string} radius={[0,0,4,4]}/>
                    </RechartsBarChart>
                  </ChartContainer>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">No general data for selected filters.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* E-Waste Section */}
      <Card className="shadow-md mt-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-xl sm:text-2xl font-bold text-primary">E-Waste Smart Bin Monitoring</CardTitle>
          <div className="text-sm sm:text-base text-muted-foreground flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            {currentTime ? format(currentTime, 'PPpp') : 'Loading time...'}
          </div>
        </CardHeader>
        <CardContent>
            <Alert variant="default" className="bg-primary/5">
                <Server className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Live E-Waste Data (Simulated)</AlertTitle>
                <AlertDescription>
                This section displays simulated real-time e-waste smart bin data. Track volumes, category distributions, and monthly trends.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <LineChartIcon className="h-5 w-5 text-primary" />
              Real-Time E-Waste Volume
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Waste volume updates every {REAL_TIME_EWASTE_UPDATE_INTERVAL / 1000} seconds (simulated).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{volume: {label: "Volume (kg)", color: "hsl(var(--primary))"}}} className="h-[250px] sm:h-[300px] w-full">
              <RechartsLineChart data={realTimeEWasteData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                <XAxis
                  dataKey="timestamp"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize="0.7rem"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize="0.7rem"
                  domain={[0, 'dataMax + 10']}
                />
                <RechartsTooltip
                  cursor={{stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "3 3"}}
                  content={<ChartTooltipContent indicator="line" nameKey="volume" labelKey="timestamp" />}
                />
                <RechartsLine
                  dataKey="volume"
                  type="monotone"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={500}
                />
              </RechartsLineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <PieChartIconLucideEWaste className="h-5 w-5 text-primary" />
              E-Waste Category Distribution
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Proportion of different e-waste types (simulated).</CardDescription>
          </CardHeader>
          <CardContent>
            {eWasteDistributionData.length > 0 ? (
              <ChartContainer config={eWastePieChartConfig} className="mx-auto aspect-square min-h-[250px] max-h-[250px] sm:max-h-[300px]">
                <RechartsPieChart>
                  <RechartsTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie
                    data={eWasteDistributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={({ name, percent, ...entry }) => {
                        if (percent * 100 < 5) return '';
                        return `${(percent * 100).toFixed(0)}%`;
                    }}
                  >
                    {eWasteDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsLegend
                    content={<ChartLegendContent 
                        nameKey="name" 
                        className="text-xs sm:text-sm [&>div]:gap-1 [&>div>svg]:size-3 mt-2" 
                        payload={eWasteDistributionData.map(entry => ({
                            value: entry.name,
                            type: 'square',
                            id: entry.name,
                            color: entry.fill,
                            payload: { icon: eWasteCategoryConfig[Object.keys(eWasteCategoryConfig).find(k => eWasteCategoryConfig[k as EWasteType | 'others'].label === entry.name) as EWasteType | 'others']?.icon }
                        }))}
                    />}
                  />
                </RechartsPieChart>
              </ChartContainer>
            ) : (
              <div className="text-center py-10 text-muted-foreground">Loading e-waste distribution...</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <BarChartIconEWaste className="h-5 w-5 text-primary" />
              Monthly E-Waste Collection
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">E-waste volume collected over last 6 months (kg, simulated).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{volume: {label: "Volume (kg)", color: "hsl(var(--chart-3))"}}} className="h-[250px] sm:h-[300px] w-full">
              <RechartsBarChart data={monthlyEWasteVolume} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize="0.7rem"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize="0.7rem"
                  domain={[0, 'dataMax + 20']}
                />
                <RechartsTooltip
                    cursor={{fill: "hsl(var(--muted)/0.5)"}}
                    content={<ChartTooltipContent indicator="rectangle" nameKey="volume" />}
                />
                <Bar dataKey="volume" radius={4}>
                    {monthlyEWasteVolume.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="hsl(var(--chart-3))" />
                    ))}
                </Bar>
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <SmartBinIconGeneral className="h-5 w-5 text-primary" />
            General Smart Bin Monitoring (IoT)
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Overview of connected smart bin statuses for general waste. Backend logic to update bin 'notify' status is handled by a Cloud Function.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSmartBins ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 text-primary animate-spin mr-2" />
              <p className="text-muted-foreground">Loading smart bin data...</p>
            </div>
          ) : smartBinsError ? (
            <Alert variant="destructive">
              <WifiOff className="h-4 w-4" />
              <AlertTitle>Error Loading Smart Bins</AlertTitle>
              <AlertDescription>{smartBinsError}</AlertDescription>
            </Alert>
          ) : smartBinsData.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Smart Bins Found</AlertTitle>
              <AlertDescription>No general smart bin data available in the Realtime Database at the moment.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {smartBinsData.map((bin) => (
                <Card key={bin.id} className={cn("p-4", bin.notify ? "border-orange-500 bg-orange-500/5" : "border-green-500 bg-green-500/5")}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex-grow">
                      <h4 className="font-semibold text-base sm:text-lg flex items-center">
                        <TrashIcon className={cn("h-5 w-5 mr-2", bin.notify ? "text-orange-600" : "text-green-600")} />
                        Bin ID: {bin.id}
                      </h4>
                       {bin.location && (
                        <p className="text-xs text-muted-foreground">
                          Location: Lat {bin.location.latitude.toFixed(4)}, Lon {bin.location.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-start sm:items-end w-full sm:w-auto mt-2 sm:mt-0">
                      <div className="text-sm w-full">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Fill Level:</span>
                          <span className={cn("font-semibold", bin.fill_level >= 90 ? "text-destructive" : bin.fill_level > 70 ? "text-orange-600" : "text-green-600")}>
                            {bin.fill_level}%
                          </span>
                        </div>
                        <Progress value={bin.fill_level} className={cn("h-2.5", bin.fill_level >= 90 ? "[&>div]:bg-destructive" : bin.fill_level > 70 ? "[&>div]:bg-orange-500" : "[&>div]:bg-green-500")} />
                      </div>
                       <div className={cn("mt-2 text-xs sm:text-sm font-medium flex items-center px-2 py-1 rounded-md", bin.notify ? "bg-destructive/10 text-destructive" : "bg-green-600/10 text-green-700")}>
                        {bin.notify ? <AlertCircleIcon className="h-4 w-4 mr-1.5" /> : <CheckCircle2Icon className="h-4 w-4 mr-1.5" />}
                        Status: {bin.notify ? 'Needs Attention' : 'OK'}
                      </div>
                    </div>
                  </div>
                   {typeof bin.lastEmptied === 'number' && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-muted/50">
                      Last Emptied: {format(new Date(bin.lastEmptied), 'PPpp')}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

