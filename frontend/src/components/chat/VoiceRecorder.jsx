import { useState, useRef } from 'react';
import { Mic, Square, Send } from 'lucide-react';

export default function VoiceRecorder({ onSend }) {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
      };

      mediaRecorder.current.start();
      setRecording(true);
      setDuration(0);
      const interval = setInterval(() => setDuration(d => d + 1), 1000);
      mediaRecorder.current._interval = interval;
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop();
      clearInterval(mediaRecorder.current._interval);
      setRecording(false);
    }
  };

  const sendVoiceNote = () => {
    if (audioURL) {
      onSend(audioURL);
      setAudioURL(null);
      setDuration(0);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {recording ? (
        <>
          <span className="text-sm text-bloom animate-pulse">
            🔴 Recording {duration}s
          </span>
          <button onClick={stopRecording} className="p-2 bg-bloom rounded-full text-white">
            <Square className="w-4 h-4" />
          </button>
        </>
      ) : audioURL ? (
        <>
          <audio controls className="h-8 w-32">
            <source src={audioURL} />
          </audio>
          <button onClick={sendVoiceNote} className="p-2 bg-primary rounded-full text-white">
            <Send className="w-4 h-4" />
          </button>
          <button onClick={() => setAudioURL(null)} className="p-2 bg-text-muted rounded-full text-white">
            ✕
          </button>
        </>
      ) : (
        <button onClick={startRecording} className="p-2 bg-primary rounded-full text-white hover:bg-primary-dark transition">
          <Mic className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}