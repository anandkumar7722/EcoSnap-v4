
'use client';

import { AuthForm } from '@/components/auth-form';
import { useToast } from '@/hooks/use-toast';
import type { LoginFormInputs } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = (data: LoginFormInputs) => {
    console.log('Login data:', data);
    // Simulate successful login
    toast({
      title: 'Login Successful',
      description: `Welcome back, ${data.email}!`,
    });
    // In a real app, you'd set some auth state here
    // For now, just redirect to home
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', data.email);
    router.push('/');
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">Welcome Back!</CardTitle>
          <CardDescription>Log in to continue your eco-journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="login" onSubmit={handleLogin} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
