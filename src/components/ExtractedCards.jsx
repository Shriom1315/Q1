import React from 'react';
import { 
  Heading1, 
  Calendar, 
  MapPin, 
  User, 
  Tag, 
  ShieldAlert, 
  CheckCircle, 
  MinusCircle 
} from 'lucide-react';

export default function ExtractedCards({ 
  extractedData, 
  highlightedField, 
  onHoverField 
}) {
  const fields = [
    {
      key: 'title',
      label: 'Workshop Title',
      type: 'String or null',
      icon: Heading1,
      colorClass: 'field-cyan',
      value: extractedData.title
    },
    {
      key: 'date',
      label: 'Scheduled Date',
      type: 'String (YYYY-MM-DD) or null',
      icon: Calendar,
      colorClass: 'field-emerald',
      value: extractedData.date
    },
    {
      key: 'venue',
      label: 'Venue / Location',
      type: 'String or null',
      icon: MapPin,
      colorClass: 'field-purple',
      value: extractedData.venue
    },
    {
      key: 'speaker',
      label: 'Speaker / Keynote',
      type: 'String or null',
      icon: User,
      colorClass: 'field-amber',
      value: extractedData.speaker
    }
  ];

  return (
    <div className="extracted-fields-container">
      <div className="fields-grid">
        {fields.map((f) => {
          const Icon = f.icon;
          const isNull = f.value === null;
          const isHovered = highlightedField === f.key;

          return (
            <div
              key={f.key}
              id={`card-field-${f.key}`}
              className={`field-card ${f.colorClass} ${isNull ? 'is-null' : 'is-grounded'} ${isHovered ? 'hover-active' : ''}`}
              onMouseEnter={() => onHoverField && onHoverField(f.key)}
              onMouseLeave={() => onHoverField && onHoverField(null)}
            >
              <div className="field-card-header">
                <div className="field-title-group">
                  <div className="field-icon-wrap">
                    <Icon size={16} />
                  </div>
                  <div>
                    <span className="field-key-name">"{f.key}"</span>
                    <span className="field-label-desc">{f.label}</span>
                  </div>
                </div>

                {isNull ? (
                  <span className="null-status-badge">
                    <MinusCircle size={12} />
                    <span>explicit null</span>
                  </span>
                ) : (
                  <span className="grounded-status-badge">
                    <CheckCircle size={12} />
                    <span>Grounded</span>
                  </span>
                )}
              </div>

              <div className="field-value-body">
                {isNull ? (
                  <div className="null-value-explanation">
                    <code className="null-keyword">null</code>
                    <p className="null-policy-note">
                      Zero Hallucination Guardrail: Not explicitly present in source text.
                    </p>
                  </div>
                ) : (
                  <div className="field-value-display">
                    <span className="field-val-text">{f.value}</span>
                  </div>
                )}
              </div>

              <div className="field-card-footer">
                <span className="field-type-spec">{f.type}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Topics Array Field Card */}
      <div 
        id="card-field-topics" 
        className={`field-card field-topics-card field-indigo ${extractedData.topics?.length === 0 ? 'is-null' : 'is-grounded'} ${highlightedField === 'topics' ? 'hover-active' : ''}`}
        onMouseEnter={() => onHoverField && onHoverField('topics')}
        onMouseLeave={() => onHoverField && onHoverField(null)}
      >
        <div className="field-card-header">
          <div className="field-title-group">
            <div className="field-icon-wrap">
              <Tag size={16} />
            </div>
            <div>
              <span className="field-key-name">"topics"</span>
              <span className="field-label-desc">Technical Workshop Topics</span>
            </div>
          </div>

          <div className="topics-count-badge">
            {extractedData.topics?.length || 0} Topics Extracted
          </div>
        </div>

        <div className="field-value-body">
          {extractedData.topics && extractedData.topics.length > 0 ? (
            <div className="topics-pill-grid">
              {extractedData.topics.map((t, idx) => (
                <span key={idx} className="topic-chip">
                  <span className="topic-dot"></span>
                  <span className="topic-text">{t}</span>
                </span>
              ))}
            </div>
          ) : (
            <div className="null-value-explanation">
              <code className="null-keyword">[]</code>
              <p className="null-policy-note">
                No technical workshop topics identified in source text. Empty array returned.
              </p>
            </div>
          )}
        </div>

        <div className="field-card-footer">
          <span className="field-type-spec">Array of Strings</span>
          <span className="grounded-status-badge">
            <CheckCircle size={12} />
            <span>Strict Array Format</span>
          </span>
        </div>
      </div>
    </div>
  );
}
