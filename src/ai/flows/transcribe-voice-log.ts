// 'use server';

/**
 * @fileOverview This file defines a Genkit flow for transcribing voice recordings into text logs using AI.
 * It provides transcriptions in English, Roman Urdu, and native Urdu script.
 *
 * - transcribeVoiceLog - A function that transcribes voice recordings to text.
 * - TranscribeVoiceLogInput - The input type for the transcribeVoiceLog function.
 * - TranscribeVoiceLogOutput - The return type for the transcribeVoiceLog function, including English, Roman Urdu, and Urdu transcriptions.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeVoiceLogInputSchema = z.object({
  voiceRecordingDataUri: z
    .string()
    .describe(
      "A voice recording as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type TranscribeVoiceLogInput = z.infer<typeof TranscribeVoiceLogInputSchema>;

const TranscribeVoiceLogOutputSchema = z.object({
  englishTranscription: z
    .string()
    .describe('The transcribed text from the voice recording, in English.'),
  romanUrduTranscription: z
    .string()
    .describe('The transcribed text from the voice recording, in Roman Urdu (Urdu written using the Latin/English alphabet).'),
  urduTranscription: z
    .string()
    .describe('The transcribed text from the voice recording, in native Urdu script (e.g., Nastaliq).'),
});

export type TranscribeVoiceLogOutput = z.infer<typeof TranscribeVoiceLogOutputSchema>;

export async function transcribeVoiceLog(
  input: TranscribeVoiceLogInput
): Promise<TranscribeVoiceLogOutput> {
  return transcribeVoiceLogFlow(input);
}

const transcribeVoiceLogPrompt = ai.definePrompt({
  name: 'transcribeVoiceLogPrompt',
  input: {schema: TranscribeVoiceLogInputSchema},
  output: {schema: TranscribeVoiceLogOutputSchema},
  prompt: `You are an expert multilingual transcriptionist. Your task is to transcribe the provided voice recording.

If the spoken language is primarily English, provide the transcription in English for all three requested output fields (englishTranscription, romanUrduTranscription, urduTranscription).
If the spoken language is Urdu, or a mix of Urdu and English (often called Urdish or Roman Urdu), then provide the transcription in all three distinct formats as requested by the output schema:
1.  For 'englishTranscription': Provide a clear English translation or transcription of the spoken content. If the original is a mix, transcribe the English parts as English and translate the Urdu parts to English.
2.  For 'romanUrduTranscription': Transcribe the spoken content into Roman Urdu (Urdu written using the Latin/English alphabet). This should accurately reflect the original pronunciation and words used if in Urdu or Urdish.
3.  For 'urduTranscription': Transcribe the spoken content into native Urdu script (e.g., Nastaliq). This should accurately reflect the original Urdu words.

Ensure accuracy for each format. The voice recording is provided below.

Voice Recording: {{media url=voiceRecordingDataUri}}`,
});

const transcribeVoiceLogFlow = ai.defineFlow(
  {
    name: 'transcribeVoiceLogFlow',
    inputSchema: TranscribeVoiceLogInputSchema,
    outputSchema: TranscribeVoiceLogOutputSchema,
  },
  async input => {
    const {output} = await transcribeVoiceLogPrompt(input);
    return output!;
  }
);
