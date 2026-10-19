import React from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  FileCode, 
  PlayCircle, 
  Settings, 
  Sparkles,
  Terminal,
  Activity
} from 'lucide-react';

export default function Header({ 
  onOpenPromptModal, 
  onOpenBenchmarkModal, 
  onOpenSettingsModal,
  engineMode,
  isValid
}) {
  return (
    <header className="app-header">
      <div className="header-brand-container">
        <div className="header-logo-badge">
          <Cpu className="header-icon" size={24} />
          <span className="logo-pulse"></span>
        </div>
        <div className="header-title-group">
          <div className="header-supertitle">
            <span className="ai-tag">PRINCIPAL AI SYSTEMS ENGINEER</span>
            <span className="system-pill">NLP EXTRACTION SUITE</span>
          </div>
          <h1 className="header-main-title">WorkshopIE <span className="highlight-text">Extraction Engine</span></h1>
        </div>
      </div>

      <div className="header-telemetry">
        <div className="telemetry-badge">
          <span className="telemetry-dot dot-emerald"></span>
          <span className="telemetry-label">Schema:</span>
          <span className="telemetry-value">Strict JSON</span>
        </div>
        <div className="telemetry-badge">
          <ShieldCheck size={14} className="telemetry-icon-shield" />
          <span className="telemetry-label">Zero-Hallucination:</span>
          <span className="telemetry-value">Enforced</span>
        </div>
        <div className="telemetry-badge">
          <Activity size={14} className="telemetry-icon-activity" />
          <span className="telemetry-label">Engine:</span>
          <span className="telemetry-value engine-pill">
            {engineMode === 'gemini' ? 'Gemini LLM Live' : 'Deterministic AI'}
          </span>
        </div>
      </div>

      <div className="header-actions">
        <button 
          id="btn-prompt-spec" 
          className="btn-header-secondary" 
          onClick={onOpenPromptModal}
          title="Inspect System Prompt & Constraints"
        >
          <FileCode size={16} />
          <span>Prompt Spec</span>
        </button>

        <button 
          id="btn-benchmark-suite" 
          className="btn-header-secondary" 
          onClick={onOpenBenchmarkModal}
          title="Run automated benchmark suite on Scenarios A, B, C"
        >
          <PlayCircle size={16} />
          <span>Run Test Suite</span>
        </button>

        <button 
          id="btn-engine-settings" 
          className="btn-header-icon" 
          onClick={onOpenSettingsModal}
          title="Configure Engine & API Key"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
