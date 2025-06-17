
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { LogEntry } from '@/types';
import Header from './Header';
import VoiceRecorder from './VoiceRecorder';
import LogList from './LogList';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';

const LOGS_COLLECTION = 'logs';

export default function VoiceTaskerApp() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    setIsLoading(true);
    const logsCollectionRef = collection(db, LOGS_COLLECTION);
    const q = query(logsCollectionRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedLogs: LogEntry[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedLogs.push({
            id: doc.id,
            text: data.text,
            timestamp: (data.timestamp as Timestamp).toDate(),
          });
        });
        setLogs(fetchedLogs);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching logs from Firestore:", error);
        toast({
          variant: "destructive",
          title: "Error Loading Logs",
          description: "Could not fetch logs from the database. Please check your connection or Firebase setup.",
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [isClient, toast]);

  const addLog = useCallback(async (text: string) => {
    if (!isClient) return;
    const newLog = {
      text,
      timestamp: Timestamp.fromDate(new Date()), // Use Firestore Timestamp
    };
    try {
      await addDoc(collection(db, LOGS_COLLECTION), newLog);
      // Toast is now part of VoiceRecorder completion
    } catch (error) {
      console.error("Error adding log to Firestore:", error);
      toast({
        variant: "destructive",
        title: "Error Saving Log",
        description: "Could not save the log to the database.",
      });
    }
  }, [isClient, toast]);

  const toggleSelectLog = (id: string) => {
    setSelectedLogIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((logId) => logId !== id)
        : [...prevSelected, id]
    );
  };

  const deleteLog = useCallback(async (id: string) => {
    if (!isClient) return;
    try {
      await deleteDoc(doc(db, LOGS_COLLECTION, id));
      setSelectedLogIds((prevSelected) => prevSelected.filter((logId) => logId !== id));
      toast({ title: "Log Deleted", description: "The log entry has been removed." });
    } catch (error) {
      console.error("Error deleting log from Firestore:", error);
      toast({
        variant: "destructive",
        title: "Error Deleting Log",
        description: "Could not delete the log from the database.",
      });
    }
  }, [isClient, toast]);
  
  const deleteSelectedLogs = useCallback(async () => {
    if (!isClient || selectedLogIds.length === 0) return;
    const batch = writeBatch(db);
    selectedLogIds.forEach((id) => {
      batch.delete(doc(db, LOGS_COLLECTION, id));
    });
    try {
      await batch.commit();
      toast({ title: "Selected Logs Deleted", description: `${selectedLogIds.length} log(s) have been removed.` });
      setSelectedLogIds([]);
    } catch (error) {
      console.error("Error deleting selected logs from Firestore:", error);
      toast({
        variant: "destructive",
        title: "Error Deleting Logs",
        description: "Could not delete all selected logs from the database.",
      });
    }
  }, [isClient, selectedLogIds, toast]);

  const selectAllLogs = () => {
    setSelectedLogIds(logs.map(log => log.id));
  };

  const deselectAllLogs = () => {
    setSelectedLogIds([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6 space-y-8">
        <VoiceRecorder onTranscriptionComplete={addLog} disabled={!isClient || isLoading} />
        {isLoading && isClient ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading logs from database...</p>
          </div>
        ) : isClient ? (
          <LogList
            logs={logs}
            selectedLogIds={selectedLogIds}
            onToggleSelectLog={toggleSelectLog}
            onDeleteSelectedLogs={deleteSelectedLogs}
            onDeleteLog={deleteLog}
            onSelectAllLogs={selectAllLogs}
            onDeselectAllLogs={deselectAllLogs}
          />
        ) : (
           <div className="text-center py-10">
            <p className="text-muted-foreground">Initializing...</p>
          </div>
        )}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} VoiceTasker. All rights reserved.</p>
      </footer>
    </div>
  );
}
