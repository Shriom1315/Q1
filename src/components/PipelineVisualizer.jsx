import React from 'react';
import { 
  FileText, 
  Search, 
  Code2, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export default function PipelineVisualizer({ 
  preparation, 
  extractedData, 
  validation, 
  executionTimeMs = 14,
  selectedStage,
  onSelectStage
}) {
  const steps = [
    {
      id: 'step-a',
      stepNumber: 'a',
      title: 'Sample Preparation',
      icon: FileText,
      badge: preparation.isWorkshop ? 'Relevant' : 'Negative Case',
      badgeClass: preparation.isWorkshop ? 'badge-emerald' : 'badge-rose',
      summary: `${preparation.wordCount} words • ${preparation.signals.length} signals`,
      details: preparation.isWorkshop
        ? `Signals: ${preparation.signals.slice(0, 3).join(', ')} (Relevance: ${preparation.relevanceScore}%)`
        : 'Zero workshop signals detected. Routing to negative case default handler.'
    },
    {
      id: 'step-b',
      stepNumber: 'b',
      title: 'Extraction Logic',
      icon: Search,
      badge: `${Object.values(extractedData).filter(v => v !== null && (!Array.isArray(v) || v.length > 0)).length} Fields Grounded`,
      badgeClass: 'badge-indigo',
      summary: 'Entity & Topic Span Parsing',
      details: 'Identifies Title, Date, Venue, Speaker & Topics with zero-hallucination boundaries.'
    },
    {
      id: 'step-c',
      stepNumber: 'c',
      title: 'Schema Formatting',
      icon: Code2,
      badge: 'Strict JSON',
      badgeClass: 'badge-cyan',
      summary: '5 Required Schema Keys',
      details: 'Pure strongly-typed JSON payload without conversational commentary.'
    },
    {
      id: 'step-d',
      stepNumber: 'd',
      title: 'Validation Check',
      icon: ShieldCheck,
      badge: validation?.isValid ? '100% Passed' : 'Validation Issues',
      badgeClass: validation?.isValid ? 'badge-emerald' : 'badge-rose',
      summary: `${validation?.checks?.filter(c => c.status === 'pass').length || 0}/4 Guardrails Passed`,
      details: 'Post-extraction audit verifying strict key parity, typing & null-handling.'
    }
  ];

  return (
    <div className="pipeline-container">
      <div className="pipeline-header">
        <div className="pipeline-title-group">
          <span className="section-eyebrow">SYSTEM EXECUTION PIPELINE</span>
          <h3 className="pipeline-title">4-Stage Deterministic Extraction Lifecycle</h3>
        </div>
        <div className="pipeline-telemetry">
          <Clock size={14} />
          <span>Execution Latency: <strong>{executionTimeMs}ms</strong></span>
        </div>
      </div>

      <div className="pipeline-steps-grid">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isSelected = selectedStage === step.id;
          return (
            <React.Fragment key={step.id}>
              <div 
                className={`pipeline-step-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectStage(step.id)}
                role="button"
                tabIndex={0}
              >
                <div className="step-card-header">
                  <div className="step-number-pill">Step {step.stepNumber}</div>
                  <span className={`step-badge ${step.badgeClass}`}>
                    {step.badge}
                  </span>
                </div>

                <div className="step-card-body">
                  <div className="step-icon-box">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="step-title">{step.title}</h4>
                    <span className="step-summary">{step.summary}</span>
                  </div>
                </div>

                <p className="step-details">{step.details}</p>
                <div className="step-indicator-bar"></div>
              </div>

              {idx < steps.length - 1 && (
                <div className="pipeline-connector" aria-hidden="true">
                  <ArrowRight size={18} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
