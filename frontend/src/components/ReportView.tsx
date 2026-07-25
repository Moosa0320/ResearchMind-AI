import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Citation } from '../hooks/useResearchSocket';
import { Download, ExternalLink, FileText, FileImage, FileType } from 'lucide-react';

interface ReportViewProps {
  report: string | null;
  citations: Citation[];
  sessionId: string | null;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, citations, sessionId }) => {
  if (!report) {
    return (
      <div className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', color: 'var(--text-muted)' }}>
        <FileText size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
        <p style={{ margin: 0, fontSize: '15px' }}>Research synthesis will appear here once agents finish processing...</p>
      </div>
    );
  }

  const handleExport = (format: 'md' | 'pdf' | 'docx') => {
    if (!sessionId) return;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.open(`${baseUrl}/export/${sessionId}?format=${format}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Export Toolbar */}
      <div className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={20} color="var(--primary-accent)" />
          <span style={{ fontSize: '15px', fontWeight: 600 }}>Synthesized Research Report</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => handleExport('md')}>
            <Download size={13} /> MD
          </button>
          <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--secondary-accent)', borderColor: 'var(--secondary-accent)' }} onClick={() => handleExport('pdf')}>
            <FileImage size={13} /> PDF
          </button>
          <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-accent)', borderColor: 'var(--primary-accent)' }} onClick={() => handleExport('docx')}>
            <FileType size={13} /> DOCX
          </button>
        </div>
      </div>

      {/* Report Body */}
      <div className="card-elevated" style={{ padding: '32px 40px', lineHeight: 1.7, fontSize: '15px' }}>
        <ReactMarkdown
          components={{
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--primary-accent)',
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(110,231,183,0.4)',
                  fontWeight: 500,
                  transition: 'color 0.15s',
                }}
              >
                {children}
              </a>
            ),
            h1: ({ children }) => <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>{children}</h1>,
            h2: ({ children }) => <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '20px 0 8px 0', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>{children}</h2>,
            h3: ({ children }) => <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-muted)', margin: '16px 0 6px 0' }}>{children}</h3>,
            p: ({ children }) => <p style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>{children}</p>,
            li: ({ children }) => <li style={{ margin: '4px 0', color: 'var(--text-primary)' }}>{children}</li>,
            strong: ({ children }) => <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{children}</strong>,
            code: ({ children }) => <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: '4px', fontSize: '13px', color: 'var(--primary-accent)' }}>{children}</code>,
          }}
        >
          {report}
        </ReactMarkdown>
      </div>

      {/* Citations Footer */}
      {citations.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600 }}>Verified Citations & Sources</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {citations.map((c) => (
              <div key={c.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <span className="font-mono" style={{ color: 'var(--secondary-accent)', fontWeight: 600 }}>[{c.id}]</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 500, fontSize: '14px' }}>{c.title}</span>
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noreferrer" style={{ color: 'var(--secondary-accent)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', textDecoration: 'none' }}>
                        Source <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{c.snippet}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
