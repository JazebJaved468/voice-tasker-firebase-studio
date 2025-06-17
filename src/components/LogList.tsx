'use client';

import type { LogEntry } from '@/types';
import LogItem from './LogItem';
import { Button } from '@/components/ui/button';
import { Trash2, ListChecks, CheckSquare, Square } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React, { useState } from 'react';

interface LogListProps {
  logs: LogEntry[];
  selectedLogIds: string[];
  onToggleSelectLog: (id: string) => void;
  onDeleteSelectedLogs: () => void;
  onDeleteLog: (id: string) => void;
  onSelectAllLogs: () => void;
  onDeselectAllLogs: () => void;
}

export default function LogList({
  logs,
  selectedLogIds,
  onToggleSelectLog,
  onDeleteSelectedLogs,
  onDeleteLog,
  onSelectAllLogs,
  onDeselectAllLogs
}: LogListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSingleDeleteDialogOpen, setIsSingleDeleteDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);

  const handleDeleteLog = (id: string) => {
    setLogToDelete(id);
    setIsSingleDeleteDialogOpen(true);
  };

  const confirmDeleteSingleLog = () => {
    if (logToDelete) {
      onDeleteLog(logToDelete);
    }
    setIsSingleDeleteDialogOpen(false);
    setLogToDelete(null);
  };
  
  const allSelected = logs.length > 0 && selectedLogIds.length === logs.length;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      onDeselectAllLogs();
    } else {
      onSelectAllLogs();
    }
  };


  if (logs.length === 0) {
    return (
      <div className="text-center py-10">
        <ListChecks className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">No voice logs yet.</p>
        <p className="text-muted-foreground">Start recording to add your first task!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-headline text-foreground">My Voice Logs</h2>
        <div className="flex items-center space-x-2">
           <Button
            variant="outline"
            size="sm"
            onClick={handleToggleSelectAll}
            disabled={logs.length === 0}
            aria-label={allSelected ? "Deselect All Logs" : "Select All Logs"}
            className="border-primary text-primary hover:bg-primary/10"
          >
            {allSelected ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
          {selectedLogIds.length > 0 && (
             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedLogIds.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete {selectedLogIds.length} selected log(s). This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onDeleteSelectedLogs();
                      setIsDeleteDialogOpen(false);
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-320px)] pr-3"> {/* Adjust height as needed */}
        {logs.map((log) => (
          <LogItem
            key={log.id}
            log={log}
            isSelected={selectedLogIds.includes(log.id)}
            onToggleSelect={onToggleSelectLog}
            onDelete={() => handleDeleteLog(log.id)}
          />
        ))}
      </ScrollArea>

      {/* Single delete confirmation dialog */}
      <AlertDialog open={isSingleDeleteDialogOpen} onOpenChange={setIsSingleDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Log?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this log entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLogToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSingleLog}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
