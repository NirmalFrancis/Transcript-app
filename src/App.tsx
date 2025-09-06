import React, { useState } from "react";
import { AudioUploader } from "./components/AudioUploader";

function App() {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleTranscript = (
    transcriptText: string,
    uploadedAudioUrl?: string
  ) => {
    setTranscript(transcriptText);
    if (uploadedAudioUrl) {
      setAudioUrl(uploadedAudioUrl);
    }
  };

  return (
    <div className="App p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Audio Transcription</h1>

      <AudioUploader onTranscript={handleTranscript} />

      {/* Show audio player */}
      {audioUrl && (
        <div className="mt-4">
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}

      {/* Show transcript */}
      {transcript && (
        <pre className="bg-gray-100 p-4 mt-4 rounded-lg text-sm">
          {transcript}
        </pre>
      )}
    </div>
  );
}

export default App;
