import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Upload } from "lucide-react";

interface AudioUploaderProps {
  //onTranscript: (transcript: string, audioUrl?: string) => void;
  onTranscript: (transcript: string, audioUrl?: string, momData?: any) => void;
}

export function AudioUploader({ onTranscript }: AudioUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      // Extract a clean transcript from Whisper response
      const transcript =
        data.text || data.segments?.map((seg: any) => seg.text).join(" ") || "";

      // Send transcript and audio URL to parent
      onTranscript(data.transcript, URL.createObjectURL(file), data.mom);

      console.log("Transcript:", transcript);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <Card className="p-6 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
      <div className="text-center space-y-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center justify-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>{isUploading ? "Uploading..." : "Upload Audio"}</span>
        </Button>

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
