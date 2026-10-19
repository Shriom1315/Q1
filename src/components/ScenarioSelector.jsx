import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Slash, 
  Layers, 
  MessageSquareCode, 
  Edit3 
} from 'lucide-react';

export default function ScenarioSelector({ 
  scenarios, 
  activeScenarioId, 
  onSelectScenario, 
  isCustom 
}) {
  const getIcon = (id) => {
    switch (id) {
      case 'scenario-a':
        return <CheckCircle2 size={16} className="icon-emerald" />;
      case 'scenario-b':
        return <AlertTriangle size={16} className="icon-amber" />;
      case 'scenario-c':
        return <Slash size={16} className="icon-rose" />;
      case 'scenario-d':
        return <Layers size={16} className="icon-purple" />;
      case 'scenario-e':
        return <MessageSquareCode size={16} className="icon-cyan" />;
      default:
        return <Edit3 size={16} />;
    }
  };

  return (
    <section className="scenario-selector-container">
      <div className="scenario-header-row">
        <div className="scenario-title-area">
          <span className="section-eyebrow">PRESET BENCHMARK SCENARIOS</span>
          <h2 className="section-heading">Select Test Scenario</h2>
        </div>
        <div className="scenario-legend">
          <span className="legend-item"><span className="legend-dot dot-emerald"></span> Complete</span>
          <span className="legend-item"><span className="legend-dot dot-amber"></span> Partial / Null</span>
          <span className="legend-item"><span className="legend-dot dot-rose"></span> Irrelevant / Negative</span>
        </div>
      </div>

      <div className="scenario-tabs-grid">
        {scenarios.map((sc) => {
          const isActive = !isCustom && activeScenarioId === sc.id;
          return (
            <button
              key={sc.id}
              id={`tab-${sc.id}`}
              className={`scenario-card-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectScenario(sc)}
            >
              <div className="scenario-card-top">
                <span className="scenario-icon-wrapper">
                  {getIcon(sc.id)}
                </span>
                <span className={`scenario-tag ${sc.badgeClass}`}>
                  {sc.tag}
                </span>
              </div>
              <h3 className="scenario-card-name">{sc.name}</h3>
              <p className="scenario-card-desc">{sc.description}</p>
            </button>
          );
        })}

        <button
          id="tab-custom"
          className={`scenario-card-btn custom-tab ${isCustom ? 'active' : ''}`}
          onClick={() => onSelectScenario(null)}
        >
          <div className="scenario-card-top">
            <span className="scenario-icon-wrapper">
              <Edit3 size={16} className="icon-cyan" />
            </span>
            <span className="scenario-tag badge-cyan">Custom Text</span>
          </div>
          <h3 className="scenario-card-name">Custom Paragraph</h3>
          <p className="scenario-card-desc">Type or paste any unstructured text to test extraction in real-time.</p>
        </button>
      </div>
    </section>
  );
}
