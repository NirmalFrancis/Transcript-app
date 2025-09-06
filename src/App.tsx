import React, { useState } from "react";
import { AudioUploader } from "./components/AudioUploader";

function App() {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [mom, setMom] = useState<any | null>(null); // 👈 Add this here

  // const handleTranscript = (
  //   transcriptText: string,
  //   uploadedAudioUrl?: string
  // ) => {
  //   setTranscript(transcriptText);
  //   if (uploadedAudioUrl) {
  //     setAudioUrl(uploadedAudioUrl);
  //   }
  // };

  const handleTranscript = (
    transcriptText: string,
    uploadedAudioUrl?: string,
    momData?: any
  ) => {
    setTranscript(transcriptText);
    setMom(momData || null); // 👈 Store MoM data
    if (uploadedAudioUrl) {
      setAudioUrl(uploadedAudioUrl);
    }
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
      <h1 className="text-2xl font-bold mb-4">Audio Transcription</h1>

      {/* 👇 This is the correct place */}
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
    </div>
  );
}

export default App;
