import Link from 'next/link';
import { History, Leaf, LayoutDashboard, Trophy, MapPin, Store, Bot, Users, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from 'lucide-react';


export function AppHeader() {
  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/history", label: "History", icon: History },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/challenges", label: "Challenges", icon: Trophy },
    { href: "/recycling-centers", label: "Recycling Centers", icon: MapPin },
    { href: "/marketplace", label: "Marketplace", icon: Store },
    { href: "/assistant", label: "AI Assistant", icon: Bot },
    { href: "/leaderboard", label: "Leaderboard", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-auto flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">EcoRecycle</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Button variant="ghost" asChild key={link.href}>
              <Link href={link.href}>
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className="flex items-center">
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
