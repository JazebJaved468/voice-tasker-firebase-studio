'use client';

import type { LogEntry } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LogItemProps {
  log: LogEntry;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}

export default function LogItem({ log, onToggleSelect, onDelete, isSelected }: LogItemProps) {
  return (
    <Card className={`mb-4 shadow-md transition-all duration-300 ${isSelected ? 'bg-primary/20 border-accent' : 'bg-card'}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id={`log-${log.id}`}
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(log.id)}
            aria-labelledby={`log-text-${log.id}`}
            className="mt-1 border-primary data-[state=checked]:bg-accent data-[state=checked]:border-accent"
          />
          <div className="flex-1">
            <p id={`log-text-${log.id}`} className="text-foreground text-base leading-relaxed">
              {log.text}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-2 pt-0 flex justify-end">
         <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(log.id)}
            aria-label={`Delete log: ${log.text.substring(0,20)}...`}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
      </CardFooter>
    </Card>
  );
}
