
'use client';

import { db } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp, type FieldValue } from 'firebase/firestore';
import type { GuestUserProfile } from '@/types';

const USER_ID_KEY = 'voiceTaskerGuestUserId';

/**
 * Retrieves the guest user ID from localStorage.
 * If not found, generates a new UUID, stores it, and returns it.
 * This function is intended for client-side use only.
 * @returns {string} The guest user ID.
 */
export function getGuestUserId(): string {
  if (typeof window === 'undefined') {
    // This case should ideally not be reached if used correctly in client components.
    // console.warn('getGuestUserId called on the server. Returning a placeholder.');
    return 'server-side-placeholder-user-id'; // Fallback or throw error
  }

  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

interface GuestUserProfileWriteData {
  userId: string;
  userAgent?: string;
  language?: string;
  languages?: string[];
  screenWidth?: number;
  screenHeight?: number;
  timezone?: string;
  referrer?: string;
  firstVisitTimestamp?: FieldValue;
  lastVisitTimestamp: FieldValue;
}

/**
 * Tracks a guest user's visit by storing or updating their profile data in Firestore.
 * Collects browser information like user agent, language, screen resolution, etc.
 * @param {string} userId - The guest user's unique ID.
 */
export async function trackGuestUserVisit(userId: string): Promise<void> {
  if (
    typeof window === 'undefined' ||
    typeof navigator === 'undefined' ||
    typeof document === 'undefined' ||
    typeof screen === 'undefined' ||
    typeof Intl === 'undefined'
  ) {
    // console.warn('trackGuestUserVisit called in an environment missing required browser globals.');
    return;
  }

  const userProfileRef = doc(db, 'guestUserProfiles', userId);
  const nowServerTimestamp = serverTimestamp();

  const profileWriteData: GuestUserProfileWriteData = {
    userId: userId,
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages ? Array.from(navigator.languages) : [],
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer,
    lastVisitTimestamp: nowServerTimestamp,
  };

  try {
    const docSnap = await getDoc(userProfileRef);
    if (!docSnap.exists()) {
      // If the document doesn't exist, this is the first time we're recording this user.
      // So, set the firstVisitTimestamp.
      profileWriteData.firstVisitTimestamp = nowServerTimestamp;
    }
    // Upsert the data.
    // If it's a new document, all fields (including firstVisitTimestamp if set above) are written.
    // If it's an existing document, fields are merged:
    //  - lastVisitTimestamp is updated.
    //  - firstVisitTimestamp (if already present and not in profileWriteData) remains untouched.
    //  - Other fields are updated with new values.
    await setDoc(userProfileRef, profileWriteData, { merge: true });
    // console.log(`Guest user visit tracked/updated for ${userId}`);
  } catch (error) {
    console.error('Error tracking guest user visit:', error);
    // Optionally, you could use a toast notification here if it's critical for the user to know.
    // However, this is typically a background task.
  }
}
