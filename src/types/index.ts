
export interface LogEntry {
  id: string; // Document ID from Firestore
  text: string;
  timestamp: Date; // JavaScript Date object, converted from Firestore Timestamp
  selected?: boolean; // UI state, not stored in Firestore
  userId: string; // Identifier for the user who created the log
}
