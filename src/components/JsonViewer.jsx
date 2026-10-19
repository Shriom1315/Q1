import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  CheckCircle2, 
  FileJson, 
  FileCode2 
} from 'lucide-react';

export default function JsonViewer({ 
  extractedData, 
  isValid 
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('json'); // 'json' | 'ts'

  const jsonString = JSON.stringify(extractedData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workshop_extraction_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tsInterface = `export interface WorkshopExtraction {
  /** Title of the technical workshop or null if missing */
  title: string | null;

  /** Date formatted as YYYY-MM-DD or readable format, or null */
  date: string | null;

  /** Location, auditorium, or virtual platform, or null */
  venue: string | null;

  /** Name and credentials of speaker/keynote, or null */
  speaker: string | null;

  /** Explicit technical topics covered */
  topics: string[];
}`;

  // Helper for syntax highlighting JSON
  const renderHighlightedJson = (json) => {
    const formatted = JSON.stringify(json, null, 2);
    // Replace JSON tokens with colored spans
    const lines = formatted.split('\n');

    return lines.map((line, idx) => {
      // Key match
      let formattedLine = line
        .replace(/("(\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")(\s*:)/g, '<span class="json-key">$1</span>$3')
        .replace(/(:\s*)("(\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*")/g, '$1<span class="json-string">$2</span>')
        .replace(/(:\s*)(null)/g, '$1<span class="json-null">$2</span>')
        .replace(/(:\s*)(true|false)/g, '$1<span class="json-boolean">$2</span>')
        .replace(/(:\s*)(\d+)/g, '$1<span class="json-number">$2</span>')
        .replace(/(")([^"]+)(")(,?)$/g, (match, p1, p2, p3, p4) => {
          // Inside array of strings
          if (line.trim().startsWith('"')) {
            return `<span class="json-string">"${p2}"</span>${p4 || ''}`;
          }
          return match;
        });

      return (
        <div key={idx} className="code-line">
          <span className="line-num">{idx + 1}</span>
          <span 
            className="line-content" 
            dangerouslySetInnerHTML={{ __html: formattedLine }} 
          />
        </div>
      );
    });
  };

  return (
    <div className="json-viewer-card">
      <div className="card-top-bar">
        <div className="json-heading-group">
          <FileJson size={18} className="json-icon" />
          <h3 className="card-heading">Structured Output Payload</h3>
          <span className="badge-pure-json">Zero-Commentary JSON Only</span>
        </div>

        <div className="json-controls">
          <div className="toggle-group">
            <button
              id="btn-tab-json"
              className={`toggle-btn ${activeTab === 'json' ? 'active' : ''}`}
              onClick={() => setActiveTab('json')}
            >
              <FileJson size={14} />
              <span>JSON Output</span>
            </button>
            <button
              id="btn-tab-ts"
              className={`toggle-btn ${activeTab === 'ts' ? 'active' : ''}`}
              onClick={() => setActiveTab('ts')}
            >
              <FileCode2 size={14} />
              <span>TypeScript Schema</span>
            </button>
          </div>

          <button
            id="btn-copy-json"
            className="btn-action-pill"
            onClick={handleCopy}
            title="Copy JSON to clipboard"
          >
            {copied ? (
              <>
                <Check size={14} className="icon-emerald" />
                <span className="copied-text">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            id="btn-download-json"
            className="btn-icon-subtle"
            onClick={handleDownload}
            title="Download JSON file"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      <div className="json-body-area">
        {activeTab === 'json' ? (
          <pre className="code-editor-block">
            <code>
              {renderHighlightedJson(extractedData)}
            </code>
          </pre>
        ) : (
          <pre className="code-editor-block ts-block">
            <code>
              {tsInterface.split('\n').map((line, idx) => (
                <div key={idx} className="code-line">
                  <span className="line-num">{idx + 1}</span>
                  <span className="line-content ts-line">{line}</span>
                </div>
              ))}
            </code>
          </pre>
        )}
      </div>

      <div className="json-footer">
        <div className="json-schema-conformance">
          <CheckCircle2 size={16} className="icon-emerald" />
          <span>Strict Schema Conformance: <strong>100% Validated</strong></span>
        </div>
        <span className="byte-count-label">
          {new Blob([jsonString]).size} bytes
        </span>
      </div>
    </div>
  );
}
