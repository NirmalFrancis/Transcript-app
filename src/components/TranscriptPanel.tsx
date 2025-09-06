// src/components/TranscriptPanel.tsx
import React from "react";

type Props = {
  // fullTranscript: string might be provided by parent or fetched from backend
  fullTranscript?: string | null;
  // keep compatibility with previous props - optional
  currentTime?: number;
  onTimeJump?: (t: number) => void;
};

export const TranscriptPanel: React.FC<Props> = ({ fullTranscript }) => {
  // IMPORTANT: The transcript will be provided by backend.
  // Where to connect to backend (fetch / websocket): see commented section below.
  //
  // Example (to be implemented in your app):
  // // fetch('/api/transcript?audioId=123')
  // //   .then(res => res.json())
  // //   .then(data => setFullTranscript(data.text))
  //
  // The backend integration should replace the mock below.

  // Placeholder text while backend is not connected.
  const placeholder =
    fullTranscript ??
    "Transcript will appear here once the backend provides it.";

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-3">Transcript</h3>
      <div
        className="whitespace-pre-wrap break-words text-sm leading-relaxed bg-muted p-3 rounded-md overflow-auto max-h-[60vh]"
        aria-live="polite"
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
        {placeholder}
      </div>
    </div>
  );
};

export default TranscriptPanel;
