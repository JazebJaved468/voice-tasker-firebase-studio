'use server';
import { transcribeVoiceLog, type TranscribeVoiceLogInput, type TranscribeVoiceLogOutput } from '@/ai/flows/transcribe-voice-log';

export async function transcribeAudioAction(audioDataUri: string): Promise<{ transcription?: string; error?: string }> {
  try {
    if (!audioDataUri || !audioDataUri.startsWith('data:audio')) {
      return { error: "Invalid audio data URI." };
    }
    const input: TranscribeVoiceLogInput = { voiceRecordingDataUri: audioDataUri };
    const result: TranscribeVoiceLogOutput = await transcribeVoiceLog(input);
    return { transcription: result.transcription };
  } catch (err) {
    console.error("Transcription error:", err);
    const errorMessage = err instanceof Error ? err.message : "Transcription failed due to an unknown error.";
    if (errorMessage.includes('gemini-2.0-flash')) {
        return { error: "The AI model is currently unavailable. Please try again later."};
    }
    return { error: errorMessage };
  }
}
