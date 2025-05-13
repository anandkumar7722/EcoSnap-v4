'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, LineChart, PieChart, Info, Recycle, Package, Atom, Edit } from 'lucide-react';
import Link from 'next/link';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Pie } from "recharts";


const placeholderMonthlyData = [
  { month: "Jan", ewaste: 1, plastic: 5, biowaste: 3, cardboard: 2, paper: 4, glass: 1, other: 1 },
  { month: "Feb", ewaste: 2, plastic: 4, biowaste: 4, cardboard: 3, paper: 3, glass: 2, other: 1 },
  { month: "Mar", ewaste: 1, plastic: 6, biowaste: 2, cardboard: 4, paper: 5, glass: 1, other: 2 },
  { month: "Apr", ewaste: 3, plastic: 3, biowaste: 5, cardboard: 2, paper: 2, glass: 3, other: 1 },
];

const placeholderCategoryDistribution = [
  { name: 'E-Waste', value: 25, fill: 'var(--color-ewaste)' },
  { name: 'Plastic', value: 180, fill: 'var(--color-plastic)' },
  { name: 'Bio-Waste', value: 150, fill: 'var(--color-biowaste)' },
  { name: 'Cardboard', value: 120, fill: 'var(--color-cardboard)' },
  { name: 'Paper', value: 100, fill: 'var(--color-paper)' },
  { name: 'Glass', value: 90, fill: 'var(--color-glass)' },
  { name: 'Other', value: 30, fill: 'var(--color-other)' },
];

const chartConfig = {
  items: { label: "Items" },
  ewaste: { label: "E-Waste", color: "hsl(var(--chart-1))" },
  plastic: { label: "Plastic", color: "hsl(var(--chart-2))" },
  biowaste: { label: "Bio-Waste", color: "hsl(var(--chart-3))" },
  cardboard: { label: "Cardboard", color: "hsl(var(--chart-4))" },
  paper: { label: "Paper", color: "hsl(var(--chart-5))" },
  glass: { label: "Glass", color: "hsl(var(--chart-1))" }, // Re-use colors for simplicity
  other: { label: "Other", color: "hsl(var(--muted))" },
} satisfies import("@/components/ui/chart").ChartConfig;


export default function DetailedDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Detailed Waste Dashboard</h1>
        <Button variant="outline" asChild>
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

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Waste Category Distribution
            </CardTitle>
            <CardDescription>Overall breakdown of classified items by category.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <Pie
                  data={placeholderCategoryDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                </Pie>
              </ResponsiveContainer>
            </ChartContainer>
             <ChartLegend content={<ChartLegendContent />} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              Monthly Classification Volume
            </CardTitle>
            <CardDescription>Number of items classified each month across categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={placeholderMonthlyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="ewaste" stackId="a" fill="var(--color-ewaste)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="plastic" stackId="a" fill="var(--color-plastic)" />
                  <Bar dataKey="biowaste" stackId="a" fill="var(--color-biowaste)" />
                  <Bar dataKey="cardboard" stackId="a" fill="var(--color-cardboard)" />
                  <Bar dataKey="paper" stackId="a" fill="var(--color-paper)" />
                  <Bar dataKey="glass" stackId="a" fill="var(--color-glass)" />
                  <Bar dataKey="other" stackId="a" fill="var(--color-other)" radius={[0,0,4,4]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            Category Trends Over Time (Placeholder)
          </CardTitle>
          <CardDescription>Track how your classification of specific waste types changes over time.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-72 w-full bg-muted/50 rounded-md flex items-center justify-center border border-dashed">
            <p className="text-sm text-muted-foreground">Line chart for individual category trends will appear here.</p>
            </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total E-Waste</CardTitle>
                <Atom className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">7 items</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Plastic</CardTitle>
                <Recycle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">62 items</div>
                <p className="text-xs text-muted-foreground">-5 from last month</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bio-Waste</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">41 items</div>
                <p className="text-xs text-muted-foreground">+10 from last month</p>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
