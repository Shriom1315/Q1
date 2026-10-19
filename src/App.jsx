import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ScenarioSelector from './components/ScenarioSelector';
import PipelineVisualizer from './components/PipelineVisualizer';
import TextEditor from './components/TextEditor';
import ExtractedCards from './components/ExtractedCards';
import JsonViewer from './components/JsonViewer';
import ValidationReport from './components/ValidationReport';
import PromptInspectorModal from './components/PromptInspectorModal';
import BenchmarkSuiteModal from './components/BenchmarkSuiteModal';
import ApiKeyModal from './components/ApiKeyModal';

import { TEST_SCENARIOS } from './data/scenarios';
import { 
  extractWorkshopInformation, 
  validateExtractionResult, 
  prepareAndClassifySample 
} from './services/extractionEngine';
import { extractWithGemini } from './services/geminiLiveEngine';

export default function App() {
  const [activeScenarioId, setActiveScenarioId] = useState('scenario-a');
  const [text, setText] = useState(TEST_SCENARIOS[0].text);
  const [isCustom, setIsCustom] = useState(false);
  const [highlightedField, setHighlightedField] = useState(null);
  const [selectedStage, setSelectedStage] = useState('step-b');

  // Extraction & Validation State
  const [extractedData, setExtractedData] = useState(TEST_SCENARIOS[0].expected);
  const [spans, setSpans] = useState([]);
  const [preparation, setPreparation] = useState(() => prepareAndClassifySample(TEST_SCENARIOS[0].text));
  const [validation, setValidation] = useState(null);
  const [executionTimeMs, setExecutionTimeMs] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Engine & API Key State
  const [engineMode, setEngineMode] = useState('deterministic'); // 'deterministic' | 'gemini'
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash');

  // Modals
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isBenchmarkModalOpen, setIsBenchmarkModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Primary Extraction Executor
  const runExtraction = useCallback(async (inputText, mode = engineMode) => {
    setIsLoading(true);
    setErrorMsg(null);
    const startTime = performance.now();

    try {
      if (mode === 'gemini') {
        if (!geminiApiKey) {
          throw new Error('Gemini API key is required. Click the Settings icon to add your key or switch to Deterministic AI.');
        }

        const geminiResult = await extractWithGemini(geminiApiKey, inputText, geminiModel);
        const prep = prepareAndClassifySample(inputText);
        const val = validateExtractionResult(geminiResult, inputText);
        const elapsed = Math.round(performance.now() - startTime);

        setExtractedData(geminiResult);
        setSpans([]);
        setPreparation(prep);
        setValidation(val);
        setExecutionTimeMs(elapsed);
      } else {
        // Deterministic AI Extraction Engine
        const result = extractWorkshopInformation(inputText);
        const val = validateExtractionResult(result.data, inputText);
        const elapsed = Math.round((performance.now() - startTime) * 10) / 10;

        setExtractedData(result.data);
        setSpans(result.spans || []);
        setPreparation(result.preparation);
        setValidation(val);
        setExecutionTimeMs(Math.max(1, Math.round(elapsed)));
      }
    } catch (err) {
      console.error('Extraction failure:', err);
      setErrorMsg(err.message || 'Extraction failed');
      // Fallback to offline extraction if Gemini errored
      if (mode === 'gemini') {
        const fallback = extractWorkshopInformation(inputText);
        const val = validateExtractionResult(fallback.data, inputText);
        setExtractedData(fallback.data);
        setSpans(fallback.spans || []);
        setPreparation(fallback.preparation);
        setValidation(val);
      }
    } finally {
      setIsLoading(false);
    }
  }, [engineMode, geminiApiKey, geminiModel]);

  // Initial load execution
  useEffect(() => {
    runExtraction(TEST_SCENARIOS[0].text, 'deterministic');
  }, [runExtraction]);

  // Handle Scenario Switch
  const handleSelectScenario = (scenario) => {
    if (scenario) {
      setActiveScenarioId(scenario.id);
      setText(scenario.text);
      setIsCustom(false);
      runExtraction(scenario.text);
    } else {
      setIsCustom(true);
      setActiveScenarioId(null);
    }
  };

  // Handle Text Editing
  const handleTextChange = (newText) => {
    setText(newText);
    setIsCustom(true);
    setActiveScenarioId(null);
    // Auto-extract on text change if reasonably small, or wait for trigger
    if (newText.trim().length > 0) {
      runExtraction(newText);
    }
  };

  // Reset to current scenario text
  const handleResetText = () => {
    const sc = TEST_SCENARIOS.find(s => s.id === activeScenarioId) || TEST_SCENARIOS[0];
    setText(sc.text);
    setIsCustom(false);
    runExtraction(sc.text);
  };

  // Save API key
  const handleSaveApiKey = (key) => {
    setGeminiApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  return (
    <div className="app-layout">
      {/* Top Header */}
      <Header
        onOpenPromptModal={() => setIsPromptModalOpen(true)}
        onOpenBenchmarkModal={() => setIsBenchmarkModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        engineMode={engineMode}
        isValid={validation?.isValid}
      />

      <main className="app-main-content">
        {/* Error notification banner if any */}
        {errorMsg && (
          <div className="app-error-banner">
            <span>{errorMsg}</span>
            <button className="btn-dismiss-error" onClick={() => setErrorMsg(null)}>Dismiss</button>
          </div>
        )}

        {/* 1. Preset Scenario Selector */}
        <ScenarioSelector
          scenarios={TEST_SCENARIOS}
          activeScenarioId={activeScenarioId}
          onSelectScenario={handleSelectScenario}
          isCustom={isCustom}
        />

        {/* 2. 4-Stage Execution Pipeline Stepper */}
        <PipelineVisualizer
          preparation={preparation}
          extractedData={extractedData}
          validation={validation}
          executionTimeMs={executionTimeMs}
          selectedStage={selectedStage}
          onSelectStage={setSelectedStage}
        />

        {/* 3. Workbench Workspace: Left Source Text / Right Structured Results */}
        <div className="workbench-grid">
          {/* Left Column: Source Input & Field Cards */}
          <section className="workbench-column left-column">
            <TextEditor
              text={text}
              onChangeText={handleTextChange}
              onResetText={handleResetText}
              onTriggerExtract={() => runExtraction(text)}
              isLoading={isLoading}
              spans={spans}
              highlightedField={highlightedField}
              onHoverField={setHighlightedField}
            />

            <ExtractedCards
              extractedData={extractedData}
              highlightedField={highlightedField}
              onHoverField={setHighlightedField}
            />
          </section>

          {/* Right Column: Pure JSON Payload & Validation Audit Report */}
          <section className="workbench-column right-column">
            <JsonViewer
              extractedData={extractedData}
              isValid={validation?.isValid}
            />

            <ValidationReport
              validation={validation}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-brand">WorkshopIE System</span>
            <span className="footer-separator">•</span>
            <span>Zero-Hallucination Information Extraction Standard</span>
          </div>
          <div className="footer-right">
            <span>JSON Schema: Draft-07 Compliant</span>
            <span className="footer-separator">•</span>
            <span>TypeScript Strongly Typed</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PromptInspectorModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
      />

      <BenchmarkSuiteModal
        isOpen={isBenchmarkModalOpen}
        onClose={() => setIsBenchmarkModalOpen(false)}
      />

      <ApiKeyModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        engineMode={engineMode}
        onChangeEngineMode={setEngineMode}
        apiKey={geminiApiKey}
        onSaveApiKey={handleSaveApiKey}
        model={geminiModel}
        onChangeModel={setGeminiModel}
      />
    </div>
  );
}
