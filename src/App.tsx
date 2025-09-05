import React, { useState, useRef, useEffect } from 'react';
import { AudioUploader } from './components/AudioUploader';
import { Waveform } from './components/Waveform';
import { TranscriptPanel } from './components/TranscriptPanel';
import { AISummary } from './components/AISummary';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Settings,
  Moon,
  Sun,
  Mic,
  FileAudio,
  Brain,
  MessageSquare
} from 'lucide-react';

interface AudioData {
  url: string;
  duration: number;
  name: string;
}

export default function App() {
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('darkMode');
      if (stored !== null) {
        return JSON.parse(stored);
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [activeTab, setActiveTab] = useState('transcript');

  const audioRef = useRef<HTMLAudioElement>(null);
  const animationFrameRef = useRef<number>();

  // Update current time while playing
  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current && isPlaying) {
        setCurrentTime(audioRef.current.currentTime);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Handle audio loading
  const handleAudioLoad = (data: AudioData) => {
    setAudioData(data);
    setCurrentTime(0);
    setIsPlaying(false);
    
    // Load audio element
    if (audioRef.current) {
      audioRef.current.src = data.url;
      audioRef.current.load();
    }
  };

  // Toggle play/pause
  const handlePlayPause = () => {
    if (!audioRef.current || !audioData) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Jump to specific time
  const handleTimeChange = (time: number) => {
    if (!audioRef.current || !audioData) return;
    
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  // Change playback rate
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Reset audio
  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
  };

  // Initialize dark mode on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Update HTML class and localStorage
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTabIcon = (tabValue: string) => {
    switch (tabValue) {
      case 'transcript': return <MessageSquare className="w-4 h-4" />;
      case 'summary': return <Brain className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                  <Mic className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-medium">MeetingMind</h1>
                  <p className="text-xs text-muted-foreground">AI-Powered Meeting Transcription</p>
                </div>
              </div>
              
              {audioData && (
                <>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="flex items-center space-x-2">
                    <FileAudio className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{audioData.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {formatTime(audioData.duration)}
                    </Badge>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {audioData && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-8"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlaybackRateChange(0.75)}
                      className={`h-7 px-2 text-xs ${playbackRate === 0.75 ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      0.75x
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlaybackRateChange(1)}
                      className={`h-7 px-2 text-xs ${playbackRate === 1 ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      1x
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlaybackRateChange(1.25)}
                      className={`h-7 px-2 text-xs ${playbackRate === 1.25 ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      1.25x
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlaybackRateChange(1.5)}
                      className={`h-7 px-2 text-xs ${playbackRate === 1.5 ? 'bg-primary text-primary-foreground' : ''}`}
                    >
                      1.5x
                    </Button>
                  </div>

                  <Separator orientation="vertical" className="h-6" />
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="h-8 w-8 p-0"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!audioData ? (
          /* Audio Upload State */
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2>Upload or Record Your Meeting</h2>
              <p className="text-muted-foreground">
                Get instant AI-powered transcriptions, summaries, and actionable insights from your meetings.
              </p>
            </div>
            
            <AudioUploader onAudioLoad={handleAudioLoad} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <Card className="p-4">
                <Mic className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium mb-1">Record Audio</h4>
                <p className="text-sm text-muted-foreground">
                  Start recording directly in your browser
                </p>
              </Card>
              
              <Card className="p-4">
                <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium mb-1">Smart Transcription</h4>
                <p className="text-sm text-muted-foreground">
                  Accurate speech-to-text with speaker identification
                </p>
              </Card>
              
              <Card className="p-4">
                <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium mb-1">AI Insights</h4>
                <p className="text-sm text-muted-foreground">
                  Automatic summaries and action items
                </p>
              </Card>
            </div>
          </div>
        ) : (
          /* Main Application Interface */
          <div className="space-y-6">
            {/* Waveform */}
            <Waveform
              audioUrl={audioData.url}
              duration={audioData.duration}
              currentTime={currentTime}
              onTimeChange={handleTimeChange}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
            />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Transcript/Summary */}
              <div className="lg:col-span-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="transcript" className="flex items-center space-x-2">
                      {getTabIcon('transcript')}
                      <span>Transcript</span>
                    </TabsTrigger>
                    <TabsTrigger value="summary" className="flex items-center space-x-2">
                      {getTabIcon('summary')}
                      <span>AI Summary</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="transcript" className="mt-4">
                    <div className="h-[600px]">
                      <TranscriptPanel
                        currentTime={currentTime}
                        onTimeJump={handleTimeChange}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="summary" className="mt-4">
                    <div className="h-[600px] overflow-y-auto">
                      <AISummary
                        audioName={audioData.name}
                        duration={audioData.duration}
                        onTimeJump={handleTimeChange}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Column - Controls & Info */}
              <div className="space-y-4">
                {/* Audio Controls */}
                {/* <Card className="p-4">
                  <h4 className="font-medium mb-3">Audio Controls</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <Button
                        size="lg"
                        onClick={handlePlayPause}
                        className="h-12 w-12 rounded-full"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Volume</span>
                        <span>{Math.round(volume * 100)}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleMute}
                          className="h-8 w-8 p-0"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </Card> */}

                {/* Meeting Stats */}
                {/* <Card className="p-4">
                  <h4 className="font-medium mb-3">Meeting Stats</h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{formatTime(audioData.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium">
                        {Math.round((currentTime / audioData.duration) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Speakers:</span>
                      <span className="font-medium">4 detected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Words/min:</span>
                      <span className="font-medium">165 avg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Action items:</span>
                      <span className="font-medium">4 found</span>
                    </div>
                  </div>
                </Card> */}

                {/* Quick Actions */}
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Export Transcript
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Brain className="w-4 h-4 mr-2" />
                      Export Summary
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <FileAudio className="w-4 h-4 mr-2" />
                      Export MoM
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.playbackRate = playbackRate;
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}