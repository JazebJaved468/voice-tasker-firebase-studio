
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { verifyAdminCredentials } from '@/lib/actions';
import { AlertTriangle, Loader2, LogIn, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ADMIN_AUTH_KEY = 'isAdminAuthenticated';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If already authenticated, redirect to all-logs
    if (typeof window !== 'undefined' && sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true') {
      router.replace('/admin/all-logs');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!username || !password) {
      setError('Please enter both username and password.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await verifyAdminCredentials({ username, password });
      if (result.success) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
        }
        router.push('/admin/all-logs');
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login submission error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                disabled={isLoading}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
                className="text-base"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Login Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full py-3 text-lg" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
           <Button variant="link" asChild>
             <Link href="/">Back to App</Link>
           </Button>
        </CardFooter>
      </Card>
       <p className="mt-6 text-xs text-muted-foreground text-center max-w-md">
        Note: For this prototype, admin credentials (username: "admin", password: "adminpassword")
        should be manually created in Firestore under 'adminCredentials/defaultAdmin'.
        This login mechanism is for demonstration only and is not secure for production.
      </p>
    </div>
  );
}
