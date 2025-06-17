'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Loader2, AlertTriangle, Info } from 'lucide-react';
import { transcribeAudioAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onTranscriptionComplete, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for microphone permission on component mount
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);


  const handleStartRecording = async () => {
    if (disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        // Convert Blob to data URI
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setIsTranscribing(true);
          try {
            const result = await transcribeAudioAction(base64Audio);
            if (result.transcription) {
              onTranscriptionComplete(result.transcription);
              toast({
                title: "Transcription Successful",
                description: "Your voice log has been added.",
              });
            } else if (result.error) {
              toast({
                variant: "destructive",
                title: "Transcription Failed",
                description: result.error,
              });
            }
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Error",
              description: "An unexpected error occurred during transcription.",
            });
          } finally {
            setIsTranscribing(false);
          }
        };
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setHasPermission(false);
      toast({
        variant: "destructive",
        title: "Microphone Access Denied",
        description: "Please allow microphone access in your browser settings to use voice recording.",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop microphone tracks to turn off the recording indicator in the browser
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const buttonDisabled = disabled || isTranscribing || hasPermission === false;

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-center">Record a Voice Log</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {hasPermission === false && (
           <Alert variant="destructive">
             <AlertTriangle className="h-4 w-4" />
             <AlertTitle>Microphone Access Required</AlertTitle>
             <AlertDescription>
               Please grant microphone permissions in your browser settings to record audio.
             </AlertDescription>
           </Alert>
        )}
         <Alert variant="default" className="bg-primary/10 border-primary/30">
            <Info className="h-4 w-4 text-accent" />
            <AlertTitle className="text-accent font-semibold">Voice Logging Information</AlertTitle>
            <AlertDescription className="text-foreground/80">
              This feature allows you to record voice notes. Continuous background recording or functionality when the app/browser is closed or the device is off is not supported in web applications.
            </AlertDescription>
          </Alert>
        <Button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={buttonDisabled}
          className={`w-full py-6 text-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-accent hover:bg-accent/90'
          } text-accent-foreground rounded-full shadow-xl`}
          aria-live="polite"
          aria-label={isRecording ? "Stop Recording" : "Start Recording"}
        >
          {isTranscribing ? (
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          ) : isRecording ? (
            <Square className="mr-2 h-6 w-6 animate-pulse" />
          ) : (
            <Mic className="mr-2 h-6 w-6" />
          )}
          {isTranscribing ? 'Transcribing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
      </CardContent>
    </Card>
  );
}
