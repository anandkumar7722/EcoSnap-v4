
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LineChart as LineChartIcon, PieChart as PieChartIconLucide, BarChart as BarChartIcon, Clock, Server, Smartphone, Laptop, Battery, Package } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  Legend as RechartsLegend,
} from "recharts";
import { format, subMonths, addSeconds } from 'date-fns';
import type { RealTimeEWasteDataPoint, EWasteCategoryDistributionPoint, MonthlyEWasteDataPoint, EWasteCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

const MAX_REAL_TIME_POINTS = 20; // Max points to show on the live graph
const REAL_TIME_UPDATE_INTERVAL = 3000; // Milliseconds (e.g., 3 seconds)

const eWasteCategoryColors: Record<EWasteCategory | 'others', string> = {
  batteries: 'hsl(var(--chart-1))', // Green
  mobiles: 'hsl(var(--chart-3))',   // Blue
  laptops: 'hsl(var(--accent))',    // Orange/Yellow (theme accent)
  others: 'hsl(var(--chart-5))',    // Grey
};

const eWasteCategoryConfig = {
  batteries: { label: "Batteries", color: eWasteCategoryColors.batteries, icon: Battery },
  mobiles: { label: "Mobiles", color: eWasteCategoryColors.mobiles, icon: Smartphone },
  laptops: { label: "Laptops", color: eWasteCategoryColors.laptops, icon: Laptop },
  others: { label: "Other E-Waste", color: eWasteCategoryColors.others, icon: Package },
} satisfies Record<EWasteCategory | 'others', {label: string; color: string; icon: React.ElementType}>;


export default function EWasteDashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [realTimeData, setRealTimeData] = useState<RealTimeEWasteDataPoint[]>([]);
  const [eWasteDistribution, setEWasteDistribution] = useState<EWasteCategoryDistributionPoint[]>([]);
  const [monthlyVolume, setMonthlyVolume] = useState<MonthlyEWasteDataPoint[]>([]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate real-time waste volume updates
  useEffect(() => {
    const initialTimestamp = new Date();
    const initialData: RealTimeEWasteDataPoint[] = Array.from({ length: 5 }, (_, i) => ({
      timestamp: format(addSeconds(initialTimestamp, i * -(REAL_TIME_UPDATE_INTERVAL/1000) * (5-i) ), 'HH:mm:ss'),
      volume: Math.floor(Math.random() * 20) + 5, // Start with some historical data
    })).slice(-MAX_REAL_TIME_POINTS);
    setRealTimeData(initialData);
    
    const interval = setInterval(() => {
      setRealTimeData((prevData) => {
        const newPoint = {
          timestamp: format(new Date(), 'HH:mm:ss'),
          volume: Math.floor(Math.random() * 70) + 10, // Simulate volume between 10 and 80
        };
        const updatedData = [...prevData, newPoint];
        return updatedData.slice(-MAX_REAL_TIME_POINTS); // Keep only the last MAX_POINTS
      });
    }, REAL_TIME_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Simulate E-Waste category distribution (can be updated periodically or on demand)
  useEffect(() => {
    const generateDistribution = () => {
      const data: EWasteCategoryDistributionPoint[] = (Object.keys(eWasteCategoryColors) as Array<EWasteCategory | 'others'>).map(key => ({
        name: eWasteCategoryConfig[key].label as EWasteCategoryDistributionPoint['name'],
        value: Math.floor(Math.random() * 50) + 10,
        fill: eWasteCategoryConfig[key].color,
      }));
      setEWasteDistribution(data);
    };
    generateDistribution();
    // Optional: update distribution periodically
    // const interval = setInterval(generateDistribution, 30000); // every 30 seconds
    // return () => clearInterval(interval);
  }, []);

  // Generate static data for monthly classification volume for the last 6 months
  useEffect(() => {
    const now = new Date();
    const data: MonthlyEWasteDataPoint[] = Array.from({ length: 6 }).map((_, i) => {
      const monthDate = subMonths(now, 5 - i); // Iterate from 5 months ago to current month
      return {
        month: format(monthDate, 'MMM'),
        volume: Math.floor(Math.random() * 200) + 50, // Simulate volume between 50 and 250 kg
      };
    });
    setMonthlyVolume(data);
  }, []);

  const pieChartConfig = useMemo(() => {
    return eWasteDistribution.reduce((acc, cur) => {
      const key = Object.keys(eWasteCategoryConfig).find(k => eWasteCategoryConfig[k as EWasteCategory | 'others'].label === cur.name) || 'others';
      acc[key] = {label: cur.name, color: cur.fill, icon: eWasteCategoryConfig[key as EWasteCategory | 'others'].icon };
      return acc;
    }, {} as import("@/components/ui/chart").ChartConfig);
  }, [eWasteDistribution]);


  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-xl sm:text-2xl font-bold text-primary">E-Waste Tracking Dashboard</CardTitle>
          <div className="text-sm sm:text-base text-muted-foreground flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            {format(currentTime, 'PPpp')}
          </div>
        </CardHeader>
        <CardContent>
            <Alert variant="default" className="bg-primary/5">
                <Server className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Live E-Waste Monitoring</AlertTitle>
                <AlertDescription>
                This dashboard displays simulated real-time e-waste smart bin data. Track volumes, category distributions, and monthly trends.
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
            <CardDescription className="text-xs sm:text-sm">Waste volume updates every {REAL_TIME_UPDATE_INTERVAL / 1000} seconds (simulated).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{volume: {label: "Volume (kg)", color: "hsl(var(--primary))"}}} className="h-[250px] sm:h-[300px] w-full">
              <LineChart data={realTimeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                <Line
                  dataKey="volume"
                  type="monotone"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={500}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <PieChartIconLucide className="h-5 w-5 text-primary" />
              E-Waste Category Distribution
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Proportion of different e-waste types.</CardDescription>
          </CardHeader>
          <CardContent>
            {eWasteDistribution.length > 0 ? (
              <ChartContainer config={pieChartConfig} className="mx-auto aspect-square min-h-[250px] max-h-[250px] sm:max-h-[300px]">
                <RechartsPieChart>
                  <RechartsTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie
                    data={eWasteDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={({ name, percent, ...entry }) => {
                        if (percent * 100 < 5) return ''; // Hide small labels
                        return `${(percent * 100).toFixed(0)}%`;
                    }}
                  >
                    {eWasteDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsLegend
                    content={<ChartLegendContent 
                        nameKey="name" 
                        className="text-xs sm:text-sm [&>div]:gap-1 [&>div>svg]:size-3 mt-2" 
                        payload={eWasteDistribution.map(entry => ({
                            value: entry.name,
                            type: 'square',
                            id: entry.name,
                            color: entry.fill,
                            payload: { icon: eWasteCategoryConfig[Object.keys(eWasteCategoryConfig).find(k => eWasteCategoryConfig[k as EWasteCategory | 'others'].label === entry.name) as EWasteCategory | 'others']?.icon }
                        }))}
                    />}
                  />
                </RechartsPieChart>
              </ChartContainer>
            ) : (
              <div className="text-center py-10 text-muted-foreground">Loading distribution data...</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <BarChartIcon className="h-5 w-5 text-primary" />
              Monthly Collection Volume
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">E-waste volume collected over the last 6 months (kg).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{volume: {label: "Volume (kg)", color: "hsl(var(--chart-3))"}}} className="h-[250px] sm:h-[300px] w-full">
              <RechartsBarChart data={monthlyVolume} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
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
                    {monthlyVolume.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="hsl(var(--chart-3))" />
                    ))}
                </Bar>
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
