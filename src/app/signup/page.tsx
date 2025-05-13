
'use client';

import { AuthForm } from '@/components/auth-form';
import { useToast } from '@/hooks/use-toast';
import type { SignupFormInputs } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();

  const handleSignup = (data: SignupFormInputs) => {
    console.log('Signup data:', data);
    // Simulate successful signup
    toast({
      title: 'Signup Successful',
      description: `Welcome, ${data.name}! Your account has been created.`,
    });
    // In a real app, you'd create a user and set auth state
    // For now, just redirect to login
     localStorage.setItem('isLoggedIn', 'true');
     localStorage.setItem('userEmail', data.email);
     localStorage.setItem('userName', data.name);
    router.push('/');
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">Join EcoSnap!</CardTitle>
          <CardDescription>Create your account to start making a difference.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" onSubmit={handleSignup} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
