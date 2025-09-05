import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Upload, Mic, MicOff, Play, Pause } from 'lucide-react';

interface AudioUploaderProps {
  onAudioLoad: (audioData: { url: string; duration: number; name: string }) => void;
}

export function AudioUploader({ onAudioLoad }: AudioUploaderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        onAudioLoad({
          url,
          duration: audio.duration,
          name: file.name
        });
      });
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
          >
            <Upload className="w-4 h-4" />
            <span>Upload Audio</span>
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
          Supported formats: MP3, WAV, M4A, OGG
        </p>
      </div>
    </Card>
  );
}