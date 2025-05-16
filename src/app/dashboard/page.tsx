
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIconLucide, Info, Recycle, Package, Atom, Edit, Filter, CalendarDays as CalendarIcon, Trash2 as SmartBinIcon, Loader2 } from 'lucide-react';
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
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend
} from "recharts";
import { useEffect, useState } from 'react';
import type { WasteEntry, WasteCategory } from '@/lib/types';
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, format } from "date-fns";
import { firestore } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const allWasteCategories: WasteCategory[] = ['ewaste', 'plastic', 'biowaste', 'cardboard', 'paper', 'glass', 'metal', 'organic', 'other', 'plasticPete', 'plasticHdpe', 'plasticPp', 'plasticPs', 'plasticOther'];

const chartConfig = {
  items: { label: "Items/Kg" },
  ewaste: { label: "E-Waste", color: "hsl(var(--chart-1))" },
  plastic: { label: "Plastic", color: "hsl(var(--chart-2))" },
  biowaste: { label: "Bio-Waste", color: "hsl(var(--chart-3))" }, 
  organic: { label: "Organic", color: "hsl(var(--chart-3))" },
  cardboard: { label: "Cardboard", color: "hsl(var(--chart-4))" },
  paper: { label: "Paper", color: "hsl(var(--chart-5))" },
  glass: { label: "Glass", color: "hsl(var(--chart-1))" },
  metal: { label: "Metal", color: "hsl(var(--chart-2))" }, 
  other: { label: "Other", color: "hsl(var(--muted))" },
  plasticPete: { label: "Plastic PETE", color: "hsl(var(--chart-2))" },
  plasticHdpe: { label: "Plastic HDPE", color: "hsl(var(--chart-2))" },
  plasticPp: { label: "Plastic PP", color: "hsl(var(--chart-2))" },
  plasticPs: { label: "Plastic PS", color: "hsl(var(--chart-2))" },
  plasticOther: { label: "Plastic Other", color: "hsl(var(--chart-2))" },
} satisfies import("@/components/ui/chart").ChartConfig;


export default function DetailedDashboardPage() {
  const [isMobileView, setIsMobileView] = useState(false);
  const [liveWasteData, setLiveWasteData] = useState<WasteEntry[]>([]);
  const [filteredData, setFilteredData] = useState<WasteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -90), // Default to last 90 days for more data
    to: new Date(),
  });
  const [selectedWasteType, setSelectedWasteType] = useState<WasteCategory | 'all'>('all');

  // Real-time data fetching from Firestore
  useEffect(() => {
    setIsLoading(true);
    // Placeholder userId. In a real app, get this from your auth context.
    const userId = 'user1'; 
    // If you don't have a user logged in for testing, you might want to remove the 'where' clause
    // or ensure 'user1' has data in your 'wasteEntries' collection.

    if (!firestore) {
        toast({ variant: "destructive", title: "Firebase Error", description: "Firestore is not initialized." });
        setIsLoading(false);
        return;
    }
    if (!userId) { // Or if you have a proper auth check, use that.
        toast({ variant: "destructive", title: "Auth Error", description: "User ID not available." });
        setIsLoading(false);
        // Potentially clear data or show login prompt. For now, we just stop.
        setLiveWasteData([]); 
        return;
    }


    const wasteEntriesRef = collection(firestore, 'wasteEntries');
    const q = query(
      wasteEntriesRef, 
      where('userId', '==', userId), 
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entries: WasteEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          ...data,
          // Firestore Timestamps need to be converted to milliseconds (number)
          timestamp: (data.timestamp instanceof Timestamp) ? data.timestamp.toMillis() : Number(data.timestamp),
        } as WasteEntry);
      });
      setLiveWasteData(entries);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching real-time waste entries:", error);
      toast({ variant: "destructive", title: "Data Fetch Error", description: "Could not load live waste data. Ensure you are logged in and have data." });
      setIsLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [toast]); // Removed userId from deps for now as it's hardcoded

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Effect to filter data when liveWasteData, dateRange, or selectedWasteType changes
  useEffect(() => {
    let data = liveWasteData;
    if (dateRange?.from && dateRange?.to) {
      data = data.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= dateRange.from! && entryDate <= dateRange.to!;
      });
    }
    if (selectedWasteType !== 'all') {
      data = data.filter(entry => entry.type === selectedWasteType);
    }
    setFilteredData(data);
  }, [liveWasteData, dateRange, selectedWasteType]);

  // Chart data calculations (derived from filteredData)
  const monthlyData = filteredData.reduce((acc, entry) => {
    const month = format(new Date(entry.timestamp), "MMM");
    if (!acc[month]) {
      acc[month] = { month };
      allWasteCategories.forEach(cat => acc[month][cat] = 0);
    }
    // Ensure quantity is a number
    const quantity = typeof entry.quantity === 'number' ? entry.quantity : 0;
    acc[month][entry.type] = (acc[month][entry.type] || 0) + quantity;
    return acc;
  }, {} as Record<string, any>);
  const barChartData = Object.values(monthlyData);

  const categoryDistribution = filteredData.reduce((acc, entry) => {
    const existing = acc.find(item => item.name === entry.type);
    const quantity = typeof entry.quantity === 'number' ? entry.quantity : 0;
    if (existing) {
      existing.value += quantity;
    } else {
      acc.push({ name: entry.type, value: quantity, fill: chartConfig[entry.type]?.color || chartConfig.other.color });
    }
    return acc;
  }, [] as { name: WasteCategory; value: number, fill: string }[]);

  const totalWaste = filteredData.reduce((sum, entry) => {
    const quantity = typeof entry.quantity === 'number' ? entry.quantity : 0;
    return sum + (entry.unit === 'items' ? quantity * 0.1 : quantity);
  }, 0).toFixed(1);
  
  const totalValueForRecycledPercentage = categoryDistribution.reduce((sum, cat) => sum + cat.value, 0);
  const recycledPercentage = totalValueForRecycledPercentage > 0 ? 
    ((categoryDistribution.filter(cat => cat.name !== 'other' && cat.name !== 'organic' && cat.name !== 'biowaste').reduce((sum, cat) => sum + cat.value, 0) / 
    totalValueForRecycledPercentage) * 100).toFixed(0) : '0';


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
    if (isMobileView && percent * 100 < 7) return null; 
    return (
      <text x={lx} y={ly} fill="currentColor" textAnchor={textAnchor} dominantBaseline="central" className="text-[9px] sm:text-xs fill-foreground">
        {`${chartConfig[name as WasteCategory]?.label || name} (${(percent * 100).toFixed(0)}%)`}
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
          Visualize your waste habits and find ways to reduce. Data is updated in real-time from your logged entries.
          Log items on the <Link href="/" className="font-medium text-primary hover:underline">home page</Link>.
          (Ensure you are logged in and have entries for 'user1' or update the `userId` in the code for testing).
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Filter className="h-5 w-5 text-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full sm:w-auto justify-start text-left font-normal"
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
                <SelectItem key={cat} value={cat} className="capitalize">{chartConfig[cat]?.label || cat}</SelectItem>
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
              <AlertTitle>No Data Yet</AlertTitle>
              <AlertDescription>
                No waste entries found for your account. Start logging items on the <Link href="/" className="font-medium text-primary hover:underline">home page</Link> to see your dashboard populate!
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Waste Logged</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalWaste} kg <span className="text-xs text-muted-foreground">(approx)</span></div>
                    <p className="text-xs text-muted-foreground">Across selected period</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Recycled Ratio (Est.)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{recycledPercentage}%</div>
                    <p className="text-xs text-muted-foreground">Non-organic/other vs total</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Items Logged</CardTitle>
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
                  <PieChartIconLucide className="h-5 w-5 text-primary" />
                  Waste Category Distribution
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Overall breakdown of classified items by category.</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryDistribution.length > 0 ? (
                  <ChartContainer config={chartConfig} className="mx-auto aspect-square min-h-[250px] max-h-[250px] sm:max-h-[300px] md:max-h-[350px]">
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
                  <div className="text-center py-10 text-muted-foreground">No data for selected filters.</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <BarChartIcon className="h-5 w-5 text-primary" />
                  Monthly Classification Volume
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Volume of items classified each month by type.</CardDescription>
              </CardHeader>
              <CardContent>
                {barChartData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="min-h-[250px] h-[250px] sm:h-[300px] md:h-[350px] w-full">
                    <RechartsBarChart data={barChartData} margin={{ top: 5, right: isMobileView ? 0 : 5, left: barChartLeftMargin, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={isMobileView ? "0.6rem" : "0.75rem"} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={isMobileView ? "0.6rem" : "0.75rem"} />
                        <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                        <RechartsLegend content={<ChartLegendContent nameKey="name" className="text-xs sm:text-sm [&>div]:gap-1 [&>div>svg]:size-3"/>} />
                        {allWasteCategories.filter(cat => cat !== 'other' && chartConfig[cat]).map(cat => (
                          <Bar key={cat} dataKey={cat} stackId="a" fill={chartConfig[cat]?.color || chartConfig.other.color} name={chartConfig[cat]?.label as string} radius={cat === 'ewaste' ? [4,4,0,0] : [0,0,0,0]}/>
                        ))}
                        <Bar dataKey="other" stackId="a" fill={chartConfig.other.color} name={chartConfig.other.label as string} radius={[0,0,4,4]}/>
                    </RechartsBarChart>
                  </ChartContainer>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">No data for selected filters.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <SmartBinIcon className="h-5 w-5 text-primary" />
            Smart Bin Monitoring (IoT)
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Overview of connected smart bin statuses. (Feature in development)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This section will display real-time data from IoT-enabled smart bins, such as fill levels and locations.
            The backend logic to update bin 'notify' status based on fill level is handled by a Cloud Function.
          </p>
          <div className="mt-4 p-4 border border-dashed rounded-md text-center text-muted-foreground">
            Smart Bin data will appear here.
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
