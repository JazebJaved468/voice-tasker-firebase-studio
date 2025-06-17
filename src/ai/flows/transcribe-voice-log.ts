// 'use server';

/**
 * @fileOverview This file defines a Genkit flow for transcribing voice recordings into text logs using AI.
 *
 * - transcribeVoiceLog - A function that transcribes voice recordings to text.
 * - TranscribeVoiceLogInput - The input type for the transcribeVoiceLog function.
 * - TranscribeVoiceLogOutput - The return type for the transcribeVoiceLog function.
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
  transcription: z
    .string()
    .describe('The transcribed text from the voice recording.'),
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
  prompt: `You are a transcription expert. Please transcribe the following voice recording into text.\n\nVoice Recording: {{media url=voiceRecordingDataUri}}`,
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
