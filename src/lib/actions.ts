
'use server';
import { transcribeVoiceLog, type TranscribeVoiceLogInput, type TranscribeVoiceLogOutput } from '@/ai/flows/transcribe-voice-log';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { AdminCredentials } from '@/types';

export async function transcribeAudioAction(audioDataUri: string): Promise<{ transcription?: string; error?: string }> {
  try {
    if (!audioDataUri || !audioDataUri.startsWith('data:audio')) {
      return { error: "Invalid audio data URI." };
    }
    const input: TranscribeVoiceLogInput = { voiceRecordingDataUri: audioDataUri };
    const result: TranscribeVoiceLogOutput = await transcribeVoiceLog(input);
    return { transcription: result.englishTranscription };
  } catch (err) {
    console.error("Transcription error:", err);
    const errorMessage = err instanceof Error ? err.message : "Transcription failed due to an unknown error.";
    if (errorMessage.includes('gemini-2.0-flash')) {
        return { error: "The AI model is currently unavailable. Please try again later."};
    }
    return { error: errorMessage };
  }
}

interface VerifyAdminCredentialsInput {
  username?: string;
  password?: string;
}

export async function verifyAdminCredentials(
  credentials: VerifyAdminCredentialsInput
): Promise<{ success: boolean; error?: string }> {
  const { username, password } = credentials;

  if (!username || !password) {
    return { success: false, error: 'Username and password are required.' };
  }

  try {
    // IMPORTANT: For a prototype. In a real app, 'defaultAdmin' might be configurable or a more robust system used.
    // The password comparison here is direct and INSECURE for production.
    // Passwords should be hashed server-side (e.g., bcrypt) before storage and during comparison.
    const adminDocRef = doc(db, 'adminCredentials', 'defaultAdmin');
    const adminDocSnap = await getDoc(adminDocRef);

    if (!adminDocSnap.exists()) {
      console.error('Admin credentials document (adminCredentials/defaultAdmin) not found in Firestore.');
      return { success: false, error: 'Admin configuration error. Please contact support.' };
    }

    const adminData = adminDocSnap.data() as AdminCredentials;

    if (adminData.username === username && adminData.password === password) {
      return { success: true };
    } else {
      return { success: false, error: 'Invalid username or password.' };
    }
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return { success: false, error: 'An server error occurred during login. Please try again.' };
  }
}
