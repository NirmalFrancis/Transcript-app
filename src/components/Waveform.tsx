import React, { useRef, useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformProps {
  audioUrl: string;
  duration: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export function Waveform({ audioUrl, duration, currentTime, onTimeChange, isPlaying, onPlayPause }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  // Generate waveform from actual audio using WaveSurfer built-in exportPeaks method
  useEffect(() => {
    if (!audioUrl) return;

    const ws = WaveSurfer.create({
      container: document.createElement('div'), // hidden container
      url: audioUrl,
      interact: false,
    });

    wavesurferRef.current = ws;

    ws.on('ready', () => {
      // Use the built-in exportPeaks method to get waveform data
      const peaks = ws.exportPeaks({ maxLength: 200 });
      if (peaks.length > 0) {
        // Take the first channel and normalize the values
        setWaveformData(peaks[0].map(Math.abs));
      }
    });

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
    };
  }, [audioUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const barWidth = width / waveformData.length;
    const progressRatio = currentTime / duration;

    ctx.clearRect(0, 0, width, height);

    waveformData.forEach((amplitude, index) => {
      const barHeight = amplitude * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      const isPlayed = index / waveformData.length <= progressRatio;
      const isDark = document.documentElement.classList.contains('dark');

      if (isPlayed) {
        ctx.fillStyle = '#d4183d';
      } else {
        ctx.fillStyle = isDark ? '#44403c' : '#e9ebef';
      }

      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    });

    const progressX = progressRatio * width;
    ctx.fillStyle = '#d4183d';
    ctx.fillRect(progressX - 1, 0, 2, height);

  }, [waveformData, currentTime, duration]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const clickRatio = x / rect.width;
    const newTime = clickRatio * duration;

    onTimeChange(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const skip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    onTimeChange(newTime);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(-10)}
            className="h-8 w-8 p-0"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onPlayPause}
            className="h-10 w-10 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(10)}
            className="h-8 w-8 p-0"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={80}
          className="w-full h-20 cursor-pointer rounded border"
          onClick={handleCanvasClick}
        />
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-t from-background/20 to-transparent rounded" />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Click anywhere on the waveform to jump to that timestamp</span>
        <span>{waveformData.length} sample points</span>
      </div>
    </Card>
  );
}