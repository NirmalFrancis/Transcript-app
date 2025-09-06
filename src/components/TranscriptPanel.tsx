// src/components/TranscriptPanel.tsx
import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Clock, User } from "lucide-react";

type TranscriptSegment = {
  speaker: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
};

type Props = {
  transcript?: TranscriptSegment[];
  currentTime?: number;
  onTimeJump?: (t: number) => void;
};

export const TranscriptPanel: React.FC<Props> = ({ transcript, currentTime, onTimeJump }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSpeakerColor = (speaker: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200'
    ];
    
    const speakerIndex = parseInt(speaker.replace('Speaker ', '')) - 1;
    return colors[speakerIndex % colors.length] || colors[0];
  };

  const isCurrentSegment = (segment: TranscriptSegment) => {
    if (!currentTime) return false;
    return currentTime >= segment.startTime && currentTime <= segment.endTime;
  };

  if (!transcript || transcript.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-medium mb-3">Transcript</h3>
        <div className="whitespace-pre-wrap text-sm leading-relaxed bg-muted p-3 rounded-md overflow-auto max-h-[60vh] text-center text-muted-foreground">
          Upload an audio file to see the transcript here
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">Transcript</h3>
        <Badge variant="secondary">
          {transcript.length} segments
        </Badge>
      </div>
      
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {transcript.map((segment, index) => (
          <Card 
            key={index}
            className={`p-3 transition-colors cursor-pointer ${
              isCurrentSegment(segment) 
                ? 'bg-primary/10 border-primary/20' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onTimeJump?.(segment.startTime)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getSpeakerColor(segment.speaker)}`}
                >
                  {segment.speaker}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {Math.round(segment.confidence * 100)}% confidence
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTimeJump?.(segment.startTime);
                  }}
                >
                  {formatTime(segment.startTime)}
                </Button>
              </div>
            </div>
            
            <p className="text-sm leading-relaxed">{segment.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TranscriptPanel;
