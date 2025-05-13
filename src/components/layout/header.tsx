import Link from 'next/link';
import { History, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-auto flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">EcoSnap</span>
        </Link>
        <nav>
          <Button variant="ghost" asChild>
            <Link href="/history">
              <History className="mr-2 h-4 w-4" />
              History
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
