import { useState, useEffect, useRef, useCallback } from 'react';

export interface AgentEvent {
  agent: string;
  status: string;
  message: string;
  timestamp: number;
}

export interface Citation {
  id: number;
  title: string;
  url: string;
  snippet: string;
}

export function useResearchSocket(sessionId: string | null) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [finalReport, setFinalReport] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [confidenceScore, setConfidenceScore] = useState<number>(1.0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isStopped, setIsStopped] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    setEvents([]);
    setFinalReport(null);
    setCitations([]);
    setIsCompleted(false);
    setIsStopped(false);

    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const apiHost = rawApiUrl.replace(/^https?:\/\//, '');
    const isHttps = rawApiUrl.startsWith('https:');
    const wsProtocol = isHttps ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${apiHost}/ws/${sessionId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'agent_event') {
          setActiveAgent(data.agent);
          setConfidenceScore(data.confidence_score ?? 1.0);
          setEvents((prev) => [...prev, data.event]);
        } else if (data.type === 'done') {
          setActiveAgent(null);
          setFinalReport(data.final_report);
          setCitations(data.citations || []);
          setIsCompleted(true);
        }
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    return () => {
      ws.close();
    };
  }, [sessionId]);

  const stopResearch = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setActiveAgent(null);
    setIsStopped(true);
  }, []);

  return { events, activeAgent, finalReport, citations, confidenceScore, isCompleted, isStopped, stopResearch };
}
