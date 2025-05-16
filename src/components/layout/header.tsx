
'use client';

import Link from 'next/link';
import { Home, History, LayoutDashboard, Trophy, MapPin, Store, Bot, Users, LogIn, UserPlus, LogOut, UserCircle, Menu, ChevronDown, Leaf, Server } from 'lucide-react'; // Added Leaf and Server
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export function AppHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        setUserName(localStorage.getItem('userName') || localStorage.getItem('userEmail'));
      } else {
        setUserName(null);
      }
    };
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('authChange', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('authChange', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUserName(null);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    window.dispatchEvent(new Event('authChange'));
    router.push('/login');
  };

  const primaryNavLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/history", label: "History", icon: History },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const secondaryNavLinks = [
    { href: "/dashboard/ewaste", label: "E-Waste Dashboard", icon: Server },
    { href: "/challenges", label: "Challenges", icon: Trophy },
    { href: "/recycling-centers", label: "Recycling Hub", icon: MapPin },
    { href: "/marketplace", label: "Marketplace", icon: Store },
    { href: "/assistant", label: "AI Assistant", icon: Bot },
    { href: "/leaderboard", label: "Leaderboard", icon: Users },
  ];

  const allNavLinks = [...primaryNavLinks, ...secondaryNavLinks];


  const getAvatarFallback = (name: string | null) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) {
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    }
    if (name.length > 0) {
     return name.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center gap-2 shrink-0">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">EcoSnap</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 flex-grow">
          {primaryNavLinks.map((link) => (
            <Button variant="ghost" asChild key={link.href} className="text-sm px-3">
              <Link href={link.href}>
                <link.icon className="mr-1.5 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          ))}
          {secondaryNavLinks.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm px-3">
                  More <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {secondaryNavLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="flex items-center">
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Auth buttons for desktop */}
        <div className="hidden md:flex items-center space-x-2 ml-auto shrink-0">
           {isLoggedIn ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://placehold.co/40x40.png?text=${getAvatarFallback(userName)}`} alt={userName || 'User'} data-ai-hint="avatar person" />
                      <AvatarFallback>{getAvatarFallback(userName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="truncate max-w-[150px]">{userName || 'My Account'}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-sm">
                <Link href="/login">
                  <LogIn className="mr-1.5 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button variant="default" asChild size="sm" className="text-sm">
                <Link href="/signup">
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>


        {/* Mobile Navigation Trigger */}
        <div className="md:hidden ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isLoggedIn && userName && (
                <>
                   <DropdownMenuLabel className="flex items-center gap-2">
                     <Avatar className="h-7 w-7">
                       <AvatarImage src={`https://placehold.co/30x30.png?text=${getAvatarFallback(userName)}`} alt={userName || 'User'} data-ai-hint="avatar person" />
                       <AvatarFallback>{getAvatarFallback(userName)}</AvatarFallback>
                     </Avatar>
                     <span className="truncate max-w-[120px] font-medium">{userName}</span>
                   </DropdownMenuLabel>
                   <DropdownMenuSeparator />
                </>
              )}
              {allNavLinks.map((link, index) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className="flex items-center text-sm py-2">
                    <link.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {isLoggedIn ? (
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center text-sm py-2">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="flex items-center text-sm py-2">
                      <LogIn className="mr-2 h-4 w-4 text-muted-foreground" />
                      Login
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup" className="flex items-center text-sm py-2">
                      <UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
                      Sign Up
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
