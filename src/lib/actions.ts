'use server';
import { transcribeVoiceLog, type TranscribeVoiceLogInput, type TranscribeVoiceLogOutput } from '@/ai/flows/transcribe-voice-log';

export async function transcribeAudioAction(audioDataUri: string): Promise<{ transcription?: string; error?: string }> {
  try {
    if (!audioDataUri || !audioDataUri.startsWith('data:audio')) {
      return { error: "Invalid audio data URI." };
    }
    const input: TranscribeVoiceLogInput = { voiceRecordingDataUri: audioDataUri };
    const result: TranscribeVoiceLogOutput = await transcribeVoiceLog(input);
    // For now, we'll use the English transcription for the main 'transcription' field.
    // The other transcriptions (romanUrduTranscription, urduTranscription) are in the 'result' object
    // and can be used by modifying the calling components if needed in the future.
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
