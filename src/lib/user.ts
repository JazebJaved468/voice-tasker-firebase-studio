
'use client';

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
