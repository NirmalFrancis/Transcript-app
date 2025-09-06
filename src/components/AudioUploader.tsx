import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Upload, Mic, MicOff, Play, Pause, Loader2 } from 'lucide-react';
import { apiService, TranscriptionResult } from '../services/apiService';

interface AudioUploaderProps {
  onAudioLoad: (audioData: { url: string; duration: number; name: string }) => void;
  onTranscriptionComplete?: (result: TranscriptionResult) => void;
}

export function AudioUploader({ onAudioLoad, onTranscriptionComplete }: AudioUploaderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setIsProcessing(true);
      setError(null);
      
      try {
        // Create audio URL for immediate playback
        const url = URL.createObjectURL(file);
        const audio = new Audio(url);
        
        audio.addEventListener('loadedmetadata', () => {
          onAudioLoad({
            url,
            duration: audio.duration,
            name: file.name
          });
        });

        // Send to backend for transcription
        const result = await apiService.uploadAndTranscribe(file);
        
        if (onTranscriptionComplete) {
          onTranscriptionComplete(result);
        }
        
      } catch (err) {
        console.error('Upload/transcription error:', err);
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    
    // Simulate recording completion with demo data
    onAudioLoad({
      url: '/demo-audio.mp3', // This would be the actual recording
      duration: recordingTime,
      name: `Recording ${new Date().toLocaleString()}`
    });
  };

  const loadDemoAudio = () => {
    onAudioLoad({
      url: '/demo-audio.mp3',
      duration: 1847, // ~30 minutes
      name: 'Team Standup - March 15th.mp3'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
      <div className="text-center space-y-4">
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{isProcessing ? 'Processing...' : 'Upload Audio'}</span>
          </Button>
          
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="lg"
            onClick={isRecording ? stopRecording : startRecording}
            className="flex items-center space-x-2"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isRecording ? `Recording ${formatTime(recordingTime)}` : 'Record Audio'}</span>
          </Button>
        </div>

        {/* <div className="text-muted-foreground">
          or
        </div> */}

        {/* <Button
          variant="default"
          size="lg"
          onClick={loadDemoAudio}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          Load Demo Meeting
        </Button> */}

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <p className="text-sm text-muted-foreground">
          Supported formats: MP3, WAV, M4A, OGG, WebM, MP4, AAC
        </p>
        
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            Error: {error}
          </div>
        )}
      </div>
    </Card>
  );
}