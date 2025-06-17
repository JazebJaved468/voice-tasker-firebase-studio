
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import type { LogEntry } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Users, Loader2, ShieldAlert } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ADMIN_AUTH_KEY = 'isAdminAuthenticated';

interface GroupedLogs {
  [userId: string]: LogEntry[];
}

async function getAllLogs(): Promise<GroupedLogs> {
  const logsCollectionRef = collection(db, 'logs');
  const q = query(logsCollectionRef, orderBy('userId'), orderBy('timestamp', 'desc'));
  
  const querySnapshot = await getDocs(q);
  const groupedLogs: GroupedLogs = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (!data.userId) {
        return; 
    }
    const log: LogEntry = {
      id: doc.id,
      text: data.text,
      timestamp: (data.timestamp as Timestamp).toDate(),
      userId: data.userId as string, 
    };

    if (!groupedLogs[log.userId]) {
      groupedLogs[log.userId] = [];
    }
    groupedLogs[log.userId].push(log);
  });
  return groupedLogs;
}


export default function AllLogsPage() {
  const router = useRouter();
  const [groupedLogs, setGroupedLogs] = useState<GroupedLogs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = sessionStorage.getItem(ADMIN_AUTH_KEY);
      if (authStatus !== 'true') {
        router.replace('/admin/login');
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      getAllLogs()
        .then(data => {
          setGroupedLogs(data);
        })
        .catch(error => {
          console.error("Failed to fetch logs:", error);
          // Potentially set an error state here to display to the user
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isAuthenticated]);

  const handleBackToApp = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    }
    router.push('/');
  };

  if (!isAuthenticated && isLoading) { // Still checking auth or about to redirect
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }
  
  // If not authenticated and no longer loading (means redirect should have happened or is happening)
  if (!isAuthenticated) {
     return (
       <div className="flex flex-col min-h-screen items-center justify-center bg-background p-6 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You are not authorized to view this page. Redirecting to login...</p>
        <Button onClick={() => router.replace('/admin/login')}>Go to Login</Button>
      </div>
     );
  }
  
  const userIds = groupedLogs ? Object.keys(groupedLogs) : [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-primary shadow-md">
        <div className="container mx-auto px-4 py-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Users className="h-8 w-8 text-primary-foreground" />
            <h1 className="text-3xl font-bold text-primary-foreground font-headline">
              All User Logs (Admin View)
            </h1>
          </div>
          <Button 
            onClick={handleBackToApp} 
            variant="outline" 
            className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to App & Logout
          </Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 space-y-8">
        {isLoading && !groupedLogs ? (
           <div className="flex justify-center items-center py-10">
            <div className="flex space-x-2">
              <div className="h-3 w-3 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
              <div className="h-3 w-3 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
              <div className="h-3 w-3 bg-primary rounded-full animate-pulse"></div>
            </div>
            <p className="ml-3 text-muted-foreground">Loading all user logs...</p>
          </div>
        ) : userIds.length === 0 ? (
          <div className="text-center py-10">
            <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No logs found for any user yet.</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6">
              {userIds.map((userId) => (
                <Card key={userId} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">User ID: <span className="font-mono text-sm text-accent">{userId}</span></CardTitle>
                    <CardDescription>{groupedLogs && groupedLogs[userId].length} log(s) found for this user.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Separator className="my-2" />
                    <ul className="space-y-3 pt-2">
                      {groupedLogs && groupedLogs[userId].map((log) => (
                        <li key={log.id} className="p-3 bg-card-foreground/5 rounded-md border">
                          <p className="text-foreground text-base leading-relaxed">{log.text}</p>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })} (Log ID: {log.id})
                          </p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </main>
       <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} VoiceTasker Admin Panel.</p>
      </footer>
    </div>
  );
}
