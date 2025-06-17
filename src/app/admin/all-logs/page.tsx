
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import type { LogEntry } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Explicitly define AdminLogEntry if it needs to be different, 
// but LogEntry from '@/types' already includes userId
// interface AdminLogEntry extends LogEntry {}

interface GroupedLogs {
  [userId: string]: LogEntry[];
}

async function getAllLogs(): Promise<GroupedLogs> {
  const logsCollectionRef = collection(db, 'logs');
  // Order by userId first to help with grouping, then by timestamp for chronological order within each group.
  const q = query(logsCollectionRef, orderBy('userId'), orderBy('timestamp', 'desc'));
  
  const querySnapshot = await getDocs(q);
  const groupedLogs: GroupedLogs = {};

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    // Ensure data.userId exists, otherwise skip or handle as an anomaly
    if (!data.userId) {
        // console.warn(`Log document ${doc.id} is missing userId.`);
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


export default async function AllLogsPage() {
  const groupedLogs = await getAllLogs();
  const userIds = Object.keys(groupedLogs);

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
          <Button asChild variant="outline" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to App
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 space-y-8">
        {userIds.length === 0 ? (
          <div className="text-center py-10">
            <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No logs found for any user yet.</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]"> {/* Adjust height as needed */}
            <div className="space-y-6">
              {userIds.map((userId) => (
                <Card key={userId} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">User ID: <span className="font-mono text-sm text-accent">{userId}</span></CardTitle>
                    <CardDescription>{groupedLogs[userId].length} log(s) found for this user.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Separator className="my-2" />
                    <ul className="space-y-3 pt-2">
                      {groupedLogs[userId].map((log) => (
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
