import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Key, 
  Cpu, 
  Sparkles, 
  Check, 
  ExternalLink, 
  ShieldCheck 
} from 'lucide-react';

export default function ApiKeyModal({ 
  isOpen, 
  onClose, 
  engineMode, 
  onChangeEngineMode,
  apiKey,
  onSaveApiKey,
  model,
  onChangeModel
}) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(tempKey);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Settings size={18} />
            </div>
            <div>
              <span className="modal-eyebrow">ENGINE CONFIGURATION</span>
              <h3 className="modal-title">Extraction Engine Settings</h3>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} title="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Mode Selection */}
          <div className="engine-mode-select-group">
            <label className="form-label">Select Active Extraction Engine:</label>
            <div className="engine-options-grid">
              <div 
                className={`engine-option-card ${engineMode === 'deterministic' ? 'selected' : ''}`}
                onClick={() => onChangeEngineMode('deterministic')}
              >
                <div className="option-top">
                  <Cpu size={18} className="icon-cyan" />
                  <span className="badge-free">Offline / Built-in</span>
                </div>
                <h4 className="option-title">Deterministic AI Parser</h4>
                <p className="option-desc">
                  Instant execution (&lt;15ms), zero hallucination guarantee, rule-based span tracking. Does not require an API key.
                </p>
              </div>

              <div 
                className={`engine-option-card ${engineMode === 'gemini' ? 'selected' : ''}`}
                onClick={() => onChangeEngineMode('gemini')}
              >
                <div className="option-top">
                  <Sparkles size={18} className="icon-indigo" />
                  <span className="badge-cloud">Live LLM</span>
                </div>
                <h4 className="option-title">Google Gemini API</h4>
                <p className="option-desc">
                  Uses Gemini Generative Language API with strict structured output JSON Schema and system instructions.
                </p>
              </div>
            </div>
          </div>

          {/* Gemini API Key input (if Gemini mode selected) */}
          {engineMode === 'gemini' && (
            <div className="api-key-input-section">
              <div className="form-group">
                <label className="form-label">
                  <Key size={14} />
                  <span>Google Gemini API Key:</span>
                </label>
                <input
                  id="input-gemini-key"
                  type="password"
                  className="form-input"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AIzaSy..."
                />
                <span className="form-helper-text">
                  Your key is stored locally in your browser's localStorage and never transmitted elsewhere.{' '}
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer"
                    className="link-accent"
                  >
                    Get API Key <ExternalLink size={12} />
                  </a>
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Model Selection:</label>
                <select 
                  id="select-gemini-model"
                  className="form-select"
                  value={model}
                  onChange={(e) => onChangeModel(e.target.value)}
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fastest, High Precision)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-Gen)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                </select>
              </div>
            </div>
          )}

          <div className="engine-security-callout">
            <ShieldCheck size={16} className="icon-emerald" />
            <span>
              Both engines enforce the exact 5-field schema: <code>title</code>, <code>date</code>, <code>venue</code>, <code>speaker</code>, <code>topics</code> with zero outside knowledge.
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary-modal" onClick={onClose}>
            Cancel
          </button>
          <button 
            id="btn-save-engine-settings"
            className="btn-primary-modal" 
            onClick={handleSave}
          >
            {savedFeedback ? (
              <>
                <Check size={14} className="icon-emerald" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <span>Save & Apply</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
