import React from 'react';
import type { AgentEvent } from '../hooks/useResearchSocket';
import { CheckCircle2, Loader2, ArrowRightLeft, Square } from 'lucide-react';

interface AgentTimelineProps {
  events: AgentEvent[];
  activeAgent: string | null;
  confidenceScore: number;
  isStopped?: boolean;
}

const AGENTS = [
  { id: 'planner', label: 'Planner Agent', desc: 'Decomposing query into subtasks & outline' },
  { id: 'researcher', label: 'Researcher Agent', desc: 'Executing live web search & ChromaDB RAG' },
  { id: 'fact_checker', label: 'Fact Checker', desc: 'Validating cross-source citation confidence' },
  { id: 'writer', label: 'Writer Agent', desc: 'Synthesizing verified notes into draft' },
  { id: 'reviewer', label: 'Reviewer Agent', desc: 'Formatting markdown output & citations' }
];

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ events, activeAgent, confidenceScore, isStopped = false }) => {
  const getAgentStatus = (agentId: string) => {
    const agentEvents = events.filter((e) => e.agent === agentId);
    if (activeAgent === agentId) return 'active';
    if (agentEvents.some((e) => e.status === 'completed')) return 'completed';
    if (agentEvents.some((e) => e.status === 'in_progress')) return 'loopback';
    return 'pending';
  };

  return (
    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Multi-Agent Orchestration Graph</h3>
        {isStopped ? (
          <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '4px', background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Square size={11} fill="#EF4444" /> Stopped
          </span>
        ) : (
          <span className="font-mono" style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', background: confidenceScore < 0.7 ? 'rgba(245,158,11,0.15)' : 'rgba(110,231,183,0.15)', color: confidenceScore < 0.7 ? 'var(--warning)' : 'var(--primary-accent)', border: '1px solid var(--border)' }}>
            Confidence Score: {(confidenceScore * 100).toFixed(0)}%
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
        {AGENTS.map((agent) => {
          const status = getAgentStatus(agent.id);
          return (
            <div key={agent.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ marginTop: '2px' }}>
                {status === 'completed' && <CheckCircle2 size={20} color="var(--primary-accent)" />}
                {status === 'active' && <Loader2 size={20} color="var(--secondary-accent)" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
                {status === 'loopback' && <ArrowRightLeft size={20} color="var(--warning)" />}
                {status === 'pending' && <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--border)', margin: '1px' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: status === 'active' ? 600 : 500, color: status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {agent.label}
                  </span>
                  {status === 'active' && <span style={{ fontSize: '11px', background: 'rgba(124,156,255,0.2)', color: 'var(--secondary-accent)', padding: '2px 6px', borderRadius: '4px' }}>EXECUTING</span>}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>{agent.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graph Steps rendered cleanly above */}
    </div>
  );
};
