
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIconLucide, Info, Recycle, Package, Atom, Edit } from 'lucide-react';
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


const placeholderMonthlyData = [
  { month: "Jan", ewaste: 1, plastic: 5, biowaste: 3, cardboard: 2, paper: 4, glass: 1, other: 1 },
  { month: "Feb", ewaste: 2, plastic: 4, biowaste: 4, cardboard: 3, paper: 3, glass: 2, other: 1 },
  { month: "Mar", ewaste: 1, plastic: 6, biowaste: 2, cardboard: 4, paper: 5, glass: 1, other: 2 },
  { month: "Apr", ewaste: 3, plastic: 3, biowaste: 5, cardboard: 2, paper: 2, glass: 3, other: 1 },
];

const placeholderCategoryDistribution = [
  { name: 'E-Waste', value: 25, fill: 'hsl(var(--chart-1))' },
  { name: 'Plastic', value: 180, fill: 'hsl(var(--chart-2))' },
  { name: 'Bio-Waste', value: 150, fill: 'hsl(var(--chart-3))' },
  { name: 'Cardboard', value: 120, fill: 'hsl(var(--chart-4))' },
  { name: 'Paper', value: 100, fill: 'hsl(var(--chart-5))' },
  { name: 'Glass', value: 90, fill: 'hsl(var(--chart-1))' },
  { name: 'Other', value: 30, fill: 'hsl(var(--muted))' },
];


const chartConfig = {
  items: { label: "Items" },
  ewaste: { label: "E-Waste", color: "hsl(var(--chart-1))" },
  plastic: { label: "Plastic", color: "hsl(var(--chart-2))" },
  biowaste: { label: "Bio-Waste", color: "hsl(var(--chart-3))" },
  cardboard: { label: "Cardboard", color: "hsl(var(--chart-4))" },
  paper: { label: "Paper", color: "hsl(var(--chart-5))" },
  glass: { label: "Glass", color: "hsl(var(--chart-1))" }, 
  other: { label: "Other", color: "hsl(var(--muted))" },
} satisfies import("@/components/ui/chart").ChartConfig;


export default function DetailedDashboardPage() {
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768); // md breakpoint
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const pieOuterRadius = isMobileView ? 60 : 90;
  const barChartLeftMargin = isMobileView ? -25 : -25; // Adjusted for mobile if needed, default is fine

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
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };


  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Detailed Waste Dashboard</h1>
        <Button variant="outline" asChild size="sm">
            <Link href="/"><Edit className="mr-2 h-4 w-4" /> Back to Main Dashboard</Link>
        </Button>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Data Visualization Center</AlertTitle>
        <AlertDescription>
          This section provides a deeper dive into your waste classification trends. Track your progress in reducing waste and see breakdowns by type and time.
          Classify items on the <Link href="/" className="font-medium text-primary hover:underline">home page</Link> to populate data. (Currently showing placeholder data).
        </AlertDescription>
      </Alert>

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
            <ChartContainer config={chartConfig} className="mx-auto aspect-square min-h-[250px] max-h-[250px] sm:max-h-[300px] md:max-h-[350px]">
              <RechartsPieChart>
                <RechartsTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={placeholderCategoryDistribution}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <BarChartIcon className="h-5 w-5 text-primary" />
              Monthly Classification Volume
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Number of items classified each month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[250px] h-[250px] sm:h-[300px] md:h-[350px] w-full">
              <RechartsBarChart data={placeholderMonthlyData} margin={{ top: 5, right: isMobileView ? 0 : 5, left: barChartLeftMargin, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize="0.65rem" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize="0.65rem" />
                  <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                  <RechartsLegend content={<ChartLegendContent nameKey="name" className="text-xs sm:text-sm [&>div]:gap-1 [&>div>svg]:size-3"/>} />
                  <Bar dataKey="ewaste" stackId="a" fill={chartConfig.ewaste.color} radius={[4, 4, 0, 0]} name={chartConfig.ewaste.label as string} />
                  <Bar dataKey="plastic" stackId="a" fill={chartConfig.plastic.color} name={chartConfig.plastic.label as string} />
                  <Bar dataKey="biowaste" stackId="a" fill={chartConfig.biowaste.color} name={chartConfig.biowaste.label as string} />
                  <Bar dataKey="cardboard" stackId="a" fill={chartConfig.cardboard.color} name={chartConfig.cardboard.label as string} />
                  <Bar dataKey="paper" stackId="a" fill={chartConfig.paper.color} name={chartConfig.paper.label as string} />
                  <Bar dataKey="glass" stackId="a" fill={chartConfig.glass.color} name={chartConfig.glass.label as string} />
                  <Bar dataKey="other" stackId="a" fill={chartConfig.other.color} radius={[0,0,4,4]} name={chartConfig.other.label as string} />
              </RechartsBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <LineChartIcon className="h-5 w-5 text-primary" />
            Category Trends Over Time (Placeholder)
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Track how your classification of specific waste types changes over time.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="min-h-[200px] h-[200px] sm:h-60 md:h-72 w-full bg-muted/50 rounded-md flex items-center justify-center border border-dashed">
            <p className="text-sm text-muted-foreground p-4 text-center">Line chart for individual category trends will appear here when data is available.</p>
            </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total E-Waste</CardTitle>
                <Atom className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-xl sm:text-2xl font-bold">7 items</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Plastic</CardTitle>
                <Recycle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-xl sm:text-2xl font-bold">62 items</div>
                <p className="text-xs text-muted-foreground">-5 from last month</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bio-Waste</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-xl sm:text-2xl font-bold">41 items</div>
                <p className="text-xs text-muted-foreground">+10 from last month</p>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

