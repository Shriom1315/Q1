# WorkshopIE — Workshop Information Extraction System
> **Principal AI Systems Engineering • Natural Language Information Extraction & Schema Conformance**

A robust, enterprise-grade Information Extraction system built with React that ingests unstructured natural language text describing technical workshops and converts it into a validated, strongly-typed JSON object with zero hallucinations.

---

## 🎯 Task Objective & Constraints

### 1. Strict Schema Enforcement
The extracted output strictly adheres to the following strongly-typed JSON structure:
```json
{
  "title": "String or null",
  "date": "String (YYYY-MM-DD or readable format) or null",
  "venue": "String or null",
  "speaker": "String or null",
  "topics": ["Array of Strings"]
}
```

### 2. Zero Hallucination & Missing Field Policy
- **Source Grounding Only**: Extracts only facts explicitly stated in the input paragraph.
- **Explicit Null Assignment**: If a specific field (e.g., speaker, date, or venue) is absent or cannot be inferred, it is strictly assigned `null`.
- **Zero Outside Knowledge**: No outside knowledge or speculative guessing is permitted.
- **Negative Case Guardrail**: For non-workshop text, all scalar fields default to `null` and `topics` defaults to `[]`.

### 3. Four-Stage Execution Pipeline
- **Step a (Sample Preparation)**: Ingests unstructured text, sanitizes input, computes token/word metrics, and classifies workshop domain relevance.
- **Step b (Extraction Logic)**: Parses key entities (`title`, `date`, `venue`, `speaker`, `topics`) and tracks grounding offset spans `[start, end]`.
- **Step c (Schema Formatting)**: Emits pure, strongly-typed JSON conforming strictly to the 5 keys with zero extraneous conversational commentary.
- **Step d (Validation Check)**: Automated post-extraction audit verifying strict key parity, type correctness, zero-hallucination source grounding, and explicit null handling.

---

## 🧪 Test Scenarios Handled

| Scenario | Description | Key Extraction Behavior |
| :--- | :--- | :--- |
| **Scenario A** (Complete Info) | Full technical workshop details provided | All 5 fields grounded and extracted (`title`, `date`, `venue`, `speaker`, `topics`) |
| **Scenario B** (Partial Info) | Missing speaker and venue | `speaker: null`, `venue: null`, `title`, `date`, and `topics` extracted |
| **Scenario C** (Irrelevant Case) | Cafeteria inventory audit (non-workshop) | `title: null`, `date: null`, `venue: null`, `speaker: null`, `topics: []` |
| **Scenario D** (Enterprise Seminar) | Multi-sentence technical seminar | Full grounding with auditorium venue and keynote credentials |
| **Scenario E** (Informal Announcement) | Informal room reservation Slack message | `venue` and `topics` extracted; `date: null`, `speaker: null` |

---

## 🚀 Features

- **Interactive Dual-Mode Workbench**:
  - Raw Text Editor with live word, character, and token estimators.
  - Visual Entity Grounding Spans displaying color-coded highlight badges directly over source text.
- **Dual Extraction Engines**:
  - **Deterministic AI Parser**: Zero latency (<15ms), completely offline, guaranteed zero hallucinations.
  - **Live Gemini API**: Optional live LLM execution powered by Gemini 1.5 Flash / 2.0 Flash via user API key.
- **Interactive JSON Inspector**:
  - Pure zero-commentary JSON view with real-time syntax highlighting.
  - One-click "Copy JSON" and "Download .json".
  - Interactive TypeScript Schema preview.
- **Automated Benchmark Test Harness**:
  - One-click runner executing Scenarios A, B, C, D, and E with latency metrics and conformance audit reporting.
- **Prompt Engineering Specification Modal**:
  - Full display of system instructions, constraints, and JSON Schema Draft-07 contract.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS (Tailwind-free) with custom dark mode glassmorphism design system
- **Icons**: Lucide React
- **Typography**: Plus Jakarta Sans & JetBrains Mono

---

## 💻 Local Setup & Execution

1. Clone or navigate to the repository directory:
   ```bash
   cd Q1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. Run production build:
   ```bash
   npm run build
   ```
