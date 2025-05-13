
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Store, PackageSearch, Filter } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import Link from 'next/link';

// Placeholder marketplace items
const placeholderItems = [
  { id: '1', title: 'Old Textbooks', category: 'Books', imageUrl: 'https://picsum.photos/seed/books/300/200', description: 'Collection of university textbooks.', dataAiHint: 'books pile' },
  { id: '2', title: 'Winter Jacket', category: 'Clothing', imageUrl: 'https://picsum.photos/seed/jacket/300/200', description: 'Barely used, size M.', dataAiHint: 'winter jacket' },
  { id: '3', title: 'Unused E-Reader', category: 'Electronics', imageUrl: 'https://picsum.photos/seed/ereader/300/200', description: 'Kindle Paperwhite, good condition.', dataAiHint: 'e-reader device' },
];

export default function MarketplacePage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">Community Reuse Marketplace</h1>
        <Button disabled> {/* Replace with Link to /marketplace/new when implemented */}
          <PlusCircle className="mr-2 h-4 w-4" /> List an Item (Coming Soon)
        </Button>
      </div>

      <Alert>
        <Store className="h-4 w-4" />
        <AlertTitle>Give Your Items a Second Life!</AlertTitle>
        <AlertDescription>
          This marketplace is for donating, exchanging, or selling used goods within the community. Reduce waste by finding new homes for your pre-loved items.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Button variant="outline" disabled className="w-full md:w-auto">
            <Filter className="mr-2 h-4 w-4" /> Filter Items (Coming Soon)
        </Button>
        {/* Search input can be added here later */}
      </div>
      
      {placeholderItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="aspect-video w-full relative bg-muted">
                  {item.imageUrl && (
                    <Image 
                        src={item.imageUrl} 
                        alt={item.title} 
                        layout="fill" 
                        objectFit="cover" 
                        data-ai-hint={item.dataAiHint}
                    />
                  )}
                   {!item.imageUrl && <div className="flex items-center justify-center h-full"><PackageSearch className="w-12 h-12 text-muted-foreground"/></div> }
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>Category: {item.category}</CardDescription>
                <p className="text-sm mt-2 truncate text-muted-foreground">{item.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" disabled>View Details (Coming Soon)</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
            <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">No items listed yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Check back soon or be the first to list an item!</p>
        </div>
      )}
    </div>
  );
}
