import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  RotateCcw, 
  Trash2, 
  Eye, 
  Edit3, 
  Check, 
  Layers 
} from 'lucide-react';

export default function TextEditor({
  text,
  onChangeText,
  onResetText,
  onTriggerExtract,
  isLoading,
  spans = [],
  highlightedField,
  onHoverField
}) {
  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'grounded'

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const tokenEstimate = Math.round(charCount / 4);

  // Function to render text with highlighted spans
  const renderHighlightedText = () => {
    if (!text || spans.length === 0) {
      return <p className="grounded-text-empty">No entities grounded in this text.</p>;
    }

    // Sort spans by start index
    const sortedSpans = [...spans].sort((a, b) => a.start - b.start);
    const elements = [];
    let lastIndex = 0;

    sortedSpans.forEach((span, i) => {
      // Add text before span
      if (span.start > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>{text.slice(lastIndex, span.start)}</span>
        );
      }

      // Add highlighted span
      const isFieldHovered = highlightedField === span.field;
      elements.push(
        <mark
          key={`span-${i}`}
          className={`entity-mark mark-${span.field} ${isFieldHovered ? 'active-pulse' : ''}`}
          onMouseEnter={() => onHoverField && onHoverField(span.field)}
          onMouseLeave={() => onHoverField && onHoverField(null)}
          title={`Grounded Entity: [${span.field.toUpperCase()}] "${span.value}"`}
        >
          {text.slice(span.start, span.end)}
          <span className="mark-label">{span.field}</span>
        </mark>
      );

      lastIndex = span.end;
    });

    // Add trailing text
    if (lastIndex < text.length) {
      elements.push(
        <span key={`text-end`}>{text.slice(lastIndex)}</span>
      );
    }

    return elements;
  };

  return (
    <div className="text-editor-card">
      <div className="card-top-bar">
        <div className="editor-heading-group">
          <FileText size={18} className="editor-icon" />
          <h3 className="card-heading">Source Unstructured Text</h3>
          <span className="status-chip chip-live">Live Grounding</span>
        </div>

        <div className="editor-controls">
          <div className="toggle-group">
            <button
              id="btn-mode-editor"
              className={`toggle-btn ${viewMode === 'editor' ? 'active' : ''}`}
              onClick={() => setViewMode('editor')}
              title="Edit source text"
            >
              <Edit3 size={14} />
              <span>Editor</span>
            </button>
            <button
              id="btn-mode-grounded"
              className={`toggle-btn ${viewMode === 'grounded' ? 'active' : ''}`}
              onClick={() => setViewMode('grounded')}
              title="View grounded entity highlights"
            >
              <Eye size={14} />
              <span>Grounded Spans ({spans.length})</span>
            </button>
          </div>

          <button
            id="btn-reset-text"
            className="btn-icon-subtle"
            onClick={onResetText}
            title="Reset to scenario default"
          >
            <RotateCcw size={15} />
          </button>
          <button
            id="btn-clear-text"
            className="btn-icon-subtle"
            onClick={() => onChangeText('')}
            title="Clear text"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="editor-content-area">
        {viewMode === 'editor' ? (
          <textarea
            id="unstructured-input-textarea"
            className="raw-textarea"
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder="Paste or write unstructured workshop details here (e.g., date, speaker, title, venue, topics)..."
            rows={7}
          />
        ) : (
          <div className="grounded-display-box">
            <div className="grounded-legend">
              <span className="legend-chip chip-title">Title</span>
              <span className="legend-chip chip-date">Date</span>
              <span className="legend-chip chip-venue">Venue</span>
              <span className="legend-chip chip-speaker">Speaker</span>
              <span className="legend-chip chip-topics">Topics</span>
            </div>
            <div className="grounded-paragraph">
              {renderHighlightedText()}
            </div>
          </div>
        )}
      </div>

      <div className="editor-footer">
        <div className="metrics-group">
          <span className="metric-pill">
            Words: <strong>{wordCount}</strong>
          </span>
          <span className="metric-pill">
            Characters: <strong>{charCount}</strong>
          </span>
          <span className="metric-pill">
            Est. Tokens: <strong>~{tokenEstimate}</strong>
          </span>
        </div>

        <button
          id="btn-trigger-extract"
          className="btn-extract-primary"
          onClick={onTriggerExtract}
          disabled={isLoading || !text.trim()}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              <span>Extracting Elements...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Extract & Validate</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
