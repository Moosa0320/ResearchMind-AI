import React, { useState, useRef } from 'react';
import { ArrowRight, Mic, MicOff, Loader2 } from 'lucide-react';

interface LandingProps {
  onStart: (query: string) => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioForTranscription(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioForTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/transcribe`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.text) {
        setInputQuery(data.text);
      }
    } catch (err) {
      console.error('Groq transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleQuickStart = (sample: string) => {
    onStart(sample);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      onStart(inputQuery);
    }
  };


  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', background: 'rgba(11,13,16,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="ResearchMind AI Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
          <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>ResearchMind AI</span>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle Gradient Glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(110,231,183,0.08) 0%, rgba(11,13,16,0) 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '840px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', zIndex: 10 }}>


          <h1 className="font-serif" style={{ fontSize: '64px', fontWeight: 600, lineHeight: 1.1, margin: 0, textAlign: 'center' }}>
            Five agents. One answer.<br />
            <span style={{ opacity: 0.85, fontWeight: 400 }}>Verified & cited in real time.</span>
          </h1>

          <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '640px', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
            An autonomous multi-agent research suite that plans, web searches, cross-verifies facts, and synthesizes structured reports with zero hallucinated sources.
          </p>

          {/* Query Bar */}
          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '720px', marginTop: '16px', display: 'flex', gap: '8px', padding: '6px', background: 'var(--surface-elevated)', border: isRecording ? '1px solid #EF4444' : '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.5)', transition: 'border-color 0.2s' }}>
            <input
              type="text"
              placeholder={isRecording ? "Listening... Speak your research topic..." : isTranscribing ? "Working..." : "e.g., Quantum Computing Commercialization Roadmap 2026..."}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '15px', outline: 'none' }}
            />
            
            {/* Groq Voice STT Button */}
            <button
              type="button"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              disabled={isTranscribing}
              style={{
                background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: isRecording ? '1px solid #EF4444' : '1px solid var(--border)',
                color: isRecording ? '#EF4444' : 'var(--text-primary)',
                padding: '0 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
              title="Groq Whisper Voice Input"
            >
              {isTranscribing ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Working...</span>
                </>
              ) : isRecording ? (
                <>
                  <MicOff size={16} className="animate-pulse" />
                  <span style={{ fontWeight: 600 }}>Recording...</span>
                </>
              ) : (
                <>
                  <Mic size={16} color="var(--primary-accent)" />
                  <span>Voice</span>
                </>
              )}
            </button>

            <button type="submit" className="btn-primary">
              Research <ArrowRight size={18} />
            </button>
          </form>


          {/* Quick Prompts */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', alignSelf: 'center' }}>Try sample:</span>
            {["Solid-State Battery Tech 2026", "Generative AI Agents in Healthcare", "Nuclear Fusion Energy Scaling"].map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleQuickStart(prompt)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: 'border-color 0.15s' }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};
