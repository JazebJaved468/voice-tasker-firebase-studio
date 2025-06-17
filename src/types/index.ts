
import type { Timestamp } from 'firebase/firestore';

export interface LogEntry {
  id: string; // Document ID from Firestore
  text: string;
  timestamp: Date; // JavaScript Date object, converted from Firestore Timestamp
  selected?: boolean; // UI state, not stored in Firestore
  userId: string; // Identifier for the user who created the log
}

export interface GuestUserProfile {
  id: string; // Document ID from Firestore (same as userId)
  userId: string; // The guest user's unique identifier
  userAgent?: string;
  language?: string;
  languages?: string[];
  screenWidth?: number;
  screenHeight?: number;
  timezone?: string;
  referrer?: string;
  firstVisitTimestamp: Timestamp | Date; // Firestore Timestamp on read, or Date in JS logic
  lastVisitTimestamp: Timestamp | Date;  // Firestore Timestamp on read, or Date in JS logic
}
