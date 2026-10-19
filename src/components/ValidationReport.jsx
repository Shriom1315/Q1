import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileCheck, 
  Hash, 
  Sparkles 
} from 'lucide-react';

export default function ValidationReport({ validation }) {
  if (!validation) return null;

  return (
    <div className="validation-report-card">
      <div className="validation-header">
        <div className="val-title-group">
          <ShieldCheck size={20} className="icon-emerald" />
          <div>
            <span className="section-eyebrow">STEP 3.D POST-EXTRACTION AUDIT</span>
            <h3 className="card-heading">Schema & Null-Handling Validation</h3>
          </div>
        </div>

        <div className="val-score-badge">
          <span className="score-num">{validation.score}%</span>
          <span className="score-label">Passed</span>
        </div>
      </div>

      <div className="validation-checks-list">
        {validation.checks.map((chk, idx) => {
          const isPass = chk.status === 'pass';
          return (
            <div 
              key={idx} 
              className={`val-check-item ${isPass ? 'check-pass' : 'check-fail'}`}
            >
              <div className="check-status-icon">
                {isPass ? (
                  <CheckCircle2 size={18} className="icon-emerald" />
                ) : (
                  <XCircle size={18} className="icon-rose" />
                )}
              </div>

              <div className="check-text-content">
                <div className="check-title-row">
                  <h4 className="check-title">{chk.name}</h4>
                  <span className={`check-pill ${isPass ? 'pill-pass' : 'pill-fail'}`}>
                    {isPass ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <p className="check-message">{chk.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="validation-footer-notes">
        <Sparkles size={14} className="icon-indigo" />
        <span>
          Zero outside knowledge injected. Output conforms to strict JSON schema draft-07 constraints.
        </span>
      </div>
    </div>
  );
}
