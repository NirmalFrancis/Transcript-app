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
import { TranscriptionResult } from './services/apiService';

interface AudioData {
  url: string;
  duration: number;
  name: string;
}

export default function App() {
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
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
  const animationFrameRef = useRef<number >();

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

  // Handle transcription completion
  const handleTranscriptionComplete = (result: TranscriptionResult) => {
    setTranscriptionResult(result);
    console.log('Transcription completed:', result);
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

  const handleExportCSV = () => {
    if (!mom) return;

    const rows = mom.action_items.map(
      (item: any) => `${item.owner},${item.task},${item.deadline || "N/A"}`
    );
    const csvContent = "Owner,Task,Deadline\n" + rows.join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "action_items.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  //   return (
  //     <div className="App p-4 max-w-xl mx-auto">
  //       <h1 className="text-2xl font-bold mb-4">Audio Transcription</h1>

  //       <AudioUploader onTranscript={handleTranscript} />

  //       {/* Show audio player */}
  //       {audioUrl && (
  //         <div className="mt-4">
  //           <audio controls src={audioUrl} className="w-full" />
  //         </div>
  //       )}

  //       {/* Show transcript */}
  //       {transcript && (
  //         <pre className="bg-gray-100 p-4 mt-4 rounded-lg text-sm">
  //           {transcript}
  //         </pre>
  //       )}
  //     </div>
  //   );
  // }

  return (
    <div className="App p-4 max-w-xl mx-auto">
      <h1 className="text-7xl font-bold mb-4"></h1>
      <h1
        className="text-7xl
       font-bold mb-4"
      ></h1>

      {/* 👇 This is the correct place */}
      <AudioUploader onTranscript={handleTranscript} />

      {/* Show audio player */}
      {audioUrl && (
        <div className="mt-4">
          <audio controls src={audioUrl} className="w-full" />
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
            
            <AudioUploader 
              onAudioLoad={handleAudioLoad} 
              onTranscriptionComplete={handleTranscriptionComplete}
            />

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
                        transcript={transcriptionResult?.transcription.transcript}
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
                        summaryData={transcriptionResult?.summary}
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

      {/* Show transcript */}
      {transcript && (
        <div className="mx-2 overflow-x-hidden whitespace-pre-wrap break-words ">
          {transcript}
        </div>
      )}

      {/* 👇 Add MoM display here */}
      {mom && (
        <div className="bg-white p-4 mt-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Minutes of Meeting</h2>
          <p>
            <strong>Date:</strong> {mom.date}
          </p>
          <p>
            <strong>Participants:</strong> {mom.participants.join(", ")}
          </p>
          <p>
            <strong>Agenda:</strong> {mom.agenda}
          </p>
          <p>
            <strong>Action Items:</strong>
          </p>
          <ul className="list-disc ml-6">
            {mom.action_items.map((item: any, idx: number) => (
              <li key={idx}>
                {item.owner} will do <em>{item.task}</em> by{" "}
                {item.deadline || "N/A"}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={handleExportCSV}
        className="mt-2 px-4 py-2 bg-white text-blue-600 borderborder-blue-600 rounded hover:bg-blue-50"
      >
        Export Action Items as CSV
      </button>
    </div>
  );
}

export default App;
