
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Store, PackageSearch, Filter } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

// Placeholder marketplace items
const placeholderItems = [
  { id: '1', title: 'Old Textbooks', category: 'Books', imageUrl: 'https://placehold.co/600x400.png', description: 'Collection of university textbooks.', dataAiHint: 'stacked textbooks' },
  { id: '2', title: 'Winter Jacket', category: 'Clothing', imageUrl: 'https://placehold.co/600x400.png', description: 'Barely used, size M.', dataAiHint: 'winter jacket clothing' },
  { id: '3', title: 'Unused E-Reader', category: 'Electronics', imageUrl: 'https://placehold.co/600x400.png', description: 'Kindle Paperwhite, good condition.', dataAiHint: 'e-reader device' },
  { id: '4', title: 'Vintage Ceramic Vase', category: 'Home Goods', imageUrl: 'https://placehold.co/600x400.png', description: 'Beautiful hand-painted vase.', dataAiHint: 'ceramic vase home' },
  { id: '5', title: 'Gardening Tools Set', category: 'Garden', imageUrl: 'https://placehold.co/600x400.png', description: 'Lightly used, includes spade and rake.', dataAiHint: 'gardening tools' },
  { id: '6', title: 'Board Game Collection', category: 'Toys & Games', imageUrl: 'https://placehold.co/600x400.png', description: 'Bundle of popular board games.', dataAiHint: 'board games collection' },
];

export default function MarketplacePage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Community Reuse Marketplace</h1>
        <Button disabled size="sm"> {/* Replace with Link to /marketplace/new when implemented */}
          <PlusCircle className="mr-2 h-4 w-4" /> List an Item (Soon)
        </Button>
      </div>

      <Alert>
        <Store className="h-4 w-4" />
        <AlertTitle>Give Your Items a Second Life!</AlertTitle>
        <AlertDescription>
          This marketplace is for donating, exchanging, or selling used goods within the community. Reduce waste by finding new homes for your pre-loved items. Feature under development.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
        <Input 
            type="search" 
            placeholder="Search items (e.g., 'bicycle', 'books')..." 
            className="w-full sm:flex-grow"
            disabled 
        />
        <Button variant="outline" disabled className="w-full sm:w-auto flex-shrink-0">
            <Filter className="mr-2 h-4 w-4" /> Filter (Soon)
        </Button>
      </div>
      
      {placeholderItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {placeholderItems.map((item) => (
            <Card key={item.id} className="overflow-hidden flex flex-col group">
              <CardHeader className="p-0">
                <div className="aspect-[3/2] w-full relative bg-muted"> {/* Adjusted aspect ratio */}
                  {item.imageUrl ? (
                    <Image 
                        src={item.imageUrl} 
                        alt={item.title} 
                        fill
                        className="group-hover:scale-105 transition-transform duration-300 object-cover"
                        data-ai-hint={item.dataAiHint}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                        <PackageSearch className="w-12 h-12 text-muted-foreground"/>
                    </div> 
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 flex-grow">
                <CardTitle className="text-base sm:text-lg mb-1">{item.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Category: {item.category}</CardDescription>
                <p className="text-xs sm:text-sm mt-2 text-muted-foreground line-clamp-2">{item.description}</p>
              </CardContent>
              <CardFooter className="p-3 sm:p-4 border-t">
                <Button variant="outline" size="sm" className="w-full" disabled>View Details (Soon)</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 sm:py-12">
            <PackageSearch className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm sm:text-base font-semibold text-foreground">No items listed yet</h3>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Check back soon or be the first to list an item!</p>
        </div>
      )}
    </div>
  );
}
