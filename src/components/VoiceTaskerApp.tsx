'use client';

import React, { useState, useEffect } from 'react';
import type { LogEntry } from '@/types';
import Header from './Header';
import VoiceRecorder from './VoiceRecorder';
import LogList from './LogList';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY = 'voiceTaskerLogs';

export default function VoiceTaskerApp() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const storedLogs = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedLogs) {
      try {
        const parsedLogs = JSON.parse(storedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp) // Ensure timestamp is a Date object
        }));
        setLogs(parsedLogs);
      } catch (error) {
        console.error("Failed to parse logs from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
      }
    }
  }, []);

  useEffect(() => {
    if(isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
    }
  }, [logs, isClient]);

  const addLog = (text: string) => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      text,
      timestamp: new Date(),
    };
    setLogs((prevLogs) => [newLog, ...prevLogs]); // Add to beginning for reverse chronological
  };

  const toggleSelectLog = (id: string) => {
    setSelectedLogIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((logId) => logId !== id)
        : [...prevSelected, id]
    );
  };

  const deleteLog = (id: string) => {
    setLogs((prevLogs) => prevLogs.filter((log) => log.id !== id));
    setSelectedLogIds((prevSelected) => prevSelected.filter((logId) => logId !== id));
    toast({ title: "Log Deleted", description: "The log entry has been removed." });
  };
  
  const deleteSelectedLogs = () => {
    setLogs((prevLogs) => prevLogs.filter((log) => !selectedLogIds.includes(log.id)));
    setSelectedLogIds([]);
    toast({ title: "Selected Logs Deleted", description: `${selectedLogIds.length} log(s) have been removed.` });
  };

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
        <VoiceRecorder onTranscriptionComplete={addLog} disabled={!isClient} />
        {isClient ? (
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
            <p className="text-muted-foreground">Loading logs...</p>
          </div>
        )}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} VoiceTasker. All rights reserved.</p>
      </footer>
    </div>
  );
}
