import React, { useState } from 'react';
import { Landing } from './pages/Landing';
import { AgentTimeline } from './components/AgentTimeline';
import { ReportView } from './components/ReportView';
import { useResearchSocket } from './hooks/useResearchSocket';
import { Search, ArrowLeft, Loader2, FileUp, Square, Pencil, Check, X } from 'lucide-react';

export function App() {
  const [currentQuery, setCurrentQuery] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isEditingQuery, setIsEditingQuery] = useState<boolean>(false);
  const [editQueryValue, setEditQueryValue] = useState<string>('');

  const { events, activeAgent, finalReport, citations, confidenceScore, isCompleted, isStopped, stopResearch } =
    useResearchSocket(sessionId);

  const isRunning = !!activeAgent && !isCompleted && !isStopped;

  const handleStartResearch = async (query: string) => {
    setSessionId(null);
    setCurrentQuery(query);
    setIsInitializing(true);
    setUploadStatus(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setSessionId(data.session_id);
    } catch (err) {
      console.error('Failed to initiate research session', err);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleStop = () => {
    stopResearch();
  };

  const handleEditQuery = () => {
    setEditQueryValue(currentQuery ?? '');
    setIsEditingQuery(true);
  };

  const handleEditConfirm = () => {
    if (editQueryValue.trim() && editQueryValue.trim() !== currentQuery) {
      stopResearch();
      setIsEditingQuery(false);
      handleStartResearch(editQueryValue.trim());
    } else {
      setIsEditingQuery(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditingQuery(false);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !sessionId) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);

    setUploadStatus('Uploading & Indexing PDF...');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/documents/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploadStatus(`✓ ${data.chunks_indexed} sections indexed`);
    } catch (err) {
      setUploadStatus('PDF upload failed');
    }
  };

  if (!currentQuery) {
    return <Landing onStart={handleStartResearch} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* App Navigation Bar */}
      <header style={{ padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', background: 'var(--surface-elevated)', position: 'sticky', top: 0, zIndex: 50, gap: '16px' }}>

        {/* Left: Back + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          <button className="btn-ghost" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => { stopResearch(); setCurrentQuery(null); setSessionId(null); }}>
            <ArrowLeft size={15} /> Landing
          </button>
          <div style={{ height: '20px', width: '1px', background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '24px', height: '24px', borderRadius: '6px' }} />
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Research Workspace</span>
          </div>
        </div>

        {/* Center: Query Display / Editor */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {isEditingQuery ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '480px' }}>
              <input
                autoFocus
                value={editQueryValue}
                onChange={(e) => setEditQueryValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleEditConfirm(); if (e.key === 'Escape') handleEditCancel(); }}
                style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--primary-accent)', borderRadius: '6px', padding: '6px 12px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
              />
              <button onClick={handleEditConfirm} style={{ background: 'var(--primary-accent)', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Check size={14} color="#000" />
              </button>
              <button onClick={handleEditCancel} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={14} color="var(--text-muted)" />
              </button>
            </div>
          ) : (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '6px', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '13px', maxWidth: '480px', width: '100%', cursor: 'text' }}
              onClick={!isRunning ? handleEditQuery : undefined}
              title={isRunning ? 'Stop research to edit query' : 'Click to edit query'}
            >
              <Search size={13} color="var(--primary-accent)" style={{ flexShrink: 0 }} />
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Query:</span>
              <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{currentQuery}</span>
              {!isRunning && (
                <Pencil size={12} color="var(--text-muted)" style={{ flexShrink: 0, opacity: 0.6 }} />
              )}
            </div>
          )}
        </div>

        {/* Right: Stop + Upload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Stop Button — only visible while running */}
          {isRunning && (
            <button
              onClick={handleStop}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.5)',
                color: '#EF4444', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <Square size={13} fill="#EF4444" /> Stop
            </button>
          )}

          {uploadStatus && <span style={{ fontSize: '12px', color: 'var(--primary-accent)' }}>{uploadStatus}</span>}
          <label className="btn-ghost" style={{ padding: '6px 12px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileUp size={14} /> Upload PDF Context
            <input type="file" accept=".pdf" onChange={handlePdfUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main style={{ flex: 1, padding: '32px', display: 'grid', gridTemplateColumns: '360px 1fr', gap: '28px', maxWidth: '1440px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Left Column: Multi-Agent Live Stepper */}
        <div>
          <AgentTimeline events={events} activeAgent={activeAgent} confidenceScore={confidenceScore} isStopped={isStopped} />
        </div>

        {/* Right Column: Synthesized Report View */}
        <div>
          {isInitializing ? (
            <div className="card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Loader2 size={32} color="var(--primary-accent)" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Initializing Graph Engine session...</span>
            </div>
          ) : isStopped && !finalReport ? (
            <div className="card" style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
              <Square size={32} style={{ opacity: 0.4 }} />
              <span style={{ fontSize: '15px' }}>Research stopped.</span>
              <span style={{ fontSize: '13px' }}>Edit the query above or go back to Landing to start over.</span>
            </div>
          ) : (
            <ReportView report={finalReport} citations={citations} sessionId={sessionId} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
