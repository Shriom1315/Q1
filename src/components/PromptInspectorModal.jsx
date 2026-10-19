import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  FileCode, 
  Terminal, 
  BookOpen, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';
import { SYSTEM_PROMPT, JSON_SCHEMA } from '../services/extractionEngine';

export default function PromptInspectorModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState('prompt'); // 'prompt' | 'schema'

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(tab === 'prompt' ? SYSTEM_PROMPT : JSON.stringify(JSON_SCHEMA, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Terminal size={18} />
            </div>
            <div>
              <span className="modal-eyebrow">SYSTEM & PROMPT ARCHITECTURE</span>
              <h3 className="modal-title">Prompt Engineering Specification</h3>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} title="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-tabs-bar">
          <div className="modal-tab-group">
            <button 
              className={`modal-tab ${tab === 'prompt' ? 'active' : ''}`}
              onClick={() => setTab('prompt')}
            >
              <BookOpen size={15} />
              <span>System Prompt & Directives</span>
            </button>
            <button 
              className={`modal-tab ${tab === 'schema' ? 'active' : ''}`}
              onClick={() => setTab('schema')}
            >
              <Layers size={15} />
              <span>JSON Schema (Draft-07)</span>
            </button>
          </div>

          <button className="btn-copy-modal" onClick={handleCopy}>
            {copied ? (
              <>
                <Check size={14} className="icon-emerald" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy {tab === 'prompt' ? 'Prompt' : 'Schema'}</span>
              </>
            )}
          </button>
        </div>

        <div className="modal-body-scroll">
          {tab === 'prompt' ? (
            <div className="prompt-spec-wrapper">
              <div className="spec-callout">
                <ShieldCheck size={16} className="icon-emerald" />
                <span>
                  <strong>Zero-Hallucination Directive:</strong> This system prompt guarantees deterministic extraction, explicit null resolution for missing fields, and strict rejection of outside knowledge.
                </span>
              </div>
              <pre className="code-display-block">
                <code>{SYSTEM_PROMPT}</code>
              </pre>
            </div>
          ) : (
            <div className="schema-spec-wrapper">
              <pre className="code-display-block">
                <code>{JSON.stringify(JSON_SCHEMA, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <span className="footer-meta-text">
            Prompt Type: Role-Based Few-Shot System Prompt with Zero-Shot Output Schema
          </span>
          <button className="btn-primary-modal" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
