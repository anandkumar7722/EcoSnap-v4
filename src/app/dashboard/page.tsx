'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, LineChart, Info } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  // In a real implementation, you would fetch and process data here
  // For now, this is a placeholder.

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Waste Tracking Dashboard</h1>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Coming Soon!</AlertTitle>
        <AlertDescription>
          This dashboard will visualize your waste classification trends. 
          Track your progress in reducing waste and see breakdowns by type and time.
          Make sure to classify some items on the <Link href="/" className="font-medium text-primary hover:underline">home page</Link> to populate data for the future dashboard.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              Waste Types (Placeholder)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">A chart showing distribution of recyclable, compostable, and non-recyclable items will appear here.</p>
            <div className="mt-4 h-48 w-full bg-muted rounded-md flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Chart Area</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              Trends Over Time (Placeholder)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">A chart showing your classification activity over time will appear here.</p>
             <div className="mt-4 h-48 w-full bg-muted rounded-md flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Chart Area</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Summary (Placeholder)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Key statistics and insights will be displayed here.</p>
             <div className="mt-4 h-20 w-full bg-muted rounded-md flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Stats Area</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
