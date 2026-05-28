# 🚀 Context Engineering Studio

A premium, presentation-grade single-page React application designed for delivering a 1-hour technical presentation on the **Context Engineering** discipline. This studio guides an audience upstream-to-downstream through the entire lifecycle of LLM context windows, contrasting naive prompting with rigorous architectural planning.

Built using **React 19**, **Vite**, **Recharts**, **Lucide Icons**, and a highly polished custom **Vanilla CSS** dark obsidian theme.

---

## 🎨 Design & Aesthetic System
*   **Obsidian Widescreen Layout**: Designed explicitly for 1080p slide projection displays, featuring harmonious deep obsidian color tones (`#0f1117` base) and custom glassmorphism panels.
*   **Vibrant Accent Systems**: High-contrast, tailored electric indigo (`#6366f1`) and glowing cyan (`#22d3ee`) visual markers representing signal flows and system health.
*   **Dynamic Micro-Animations**: Smooth hover-state transitions, fading interactive views, pulsing glows, and live cascading warning alerts representing stale context propagation.

---

## 📦 App Architecture & The 6 Modules

The application is fully client-side and standalone, organized into six interactive modules accessible via the top-level progress navigation bar:

### 1. 01 · Maturity (Maturity Ladder)
*   **Three-Rung Ladder**: Visual progression mapping standard Prompt Engineering, Retrieval-Augmented Generation (RAG), and advanced Context Engineering.
*   **Where Are You Survey**: Real-time presenter-led audience poll detailing custom technical maturity feedback cards.
*   **10-Stage Pipeline Flow**: An interactive, clickable flow visualization showing the context lifecycle from query intent to generation. Stages 3 & 4 map dynamically to the subsequent intent analysis tabs.

### 2. 02 · Intent Decomp (Intent Decomposition)
*   **Claude Analyst**: Connects directly to the Anthropic API (`claude-sonnet-4-20250514`) to deconstruct raw enterprise advisory queries into a structured JSON requirements schema.
*   **MCP Mapping**: Displays vector requirement chips (CRM, Doc Store, Web Search, User Profile) accompanied by a custom, premium Model Context Protocol (MCP) data provider visual diagram.
*   **Fail-Safe Demo Mode**: Built-in connection error warning banners allowing seamless switching to local streaming simulations if network connectivity or keys fail during the presentation.

### 3. 03 · Budget (Budget Optimizer)
*   **Gauge Capacity**: Real-time capacity bar displaying token consumption against a strict `4,000 tokens` cap.
*   **Knapsack Token Scheduler**: An exact dynamic programming knapsack optimizer that scores 14 enterprise chunks (spanning relevance, freshness, and priority) to select the highest-quality subset.
*   **Greedy vs Optimal Matrix**: An interactive comparison dashboard illustrating how optimal knapsack scheduling replaces noisy overhead files with fresh, high-impact files.

### 4. 04 · Compress (Compression Studio)
*   **Distillation Core**: Interactive Claude distillation showing how high-volume documents (e.g., corporate earnings, advisory briefs) are compressed by over 80% while preserving critical guidance signals.
*   **Noise Removed Accordion**: A styled diff panel showing the exact scientific noise and fluff stripped from the context window.
*   **LLM Judge Radar**: A parallel evaluation interface pitting raw text against distilled text across 4 axes (conciseness, accuracy, actionability, specificity) using a Recharts Radar chart.

### 5. 05 · Agents (Agent Propagation)
*   **Agent Runway**: A multi-agent context pipeline showing tokens flowing sequentially (Orchestrator → Research → Analysis → Drafting).
*   **Freshness Sliders**: Interactive data TTL manipulation. Lowering the Research Agent freshness below 40% triggers a live cascading yellow/orange/red warning animation, illustrating how stale data propagates silently.
*   **Isolation Boundaries**: Toggle switches demonstrating the risk of raw context leakage vs. optimal read-only memory barriers.

### 6. 06 · Observe (Observability Dashboard)
*   **Executive Cockpit**: Real-time analytics tracking Context Coverage (green), Budget Efficiency (cyan), Compression Ratio (indigo), Freshness (green/yellow), Latency (amber), and Judge Score (green with live Recharts trend sparklines).
*   **Run Simulator**: Interactive new run simulator with realistic deviations and custom stale-run warning checks.
*   **Dual Data Curves**: 
  - Bar chart comparing Greedy vs Optimized scores over multiple runs.
  - Line decay chart showing 7-day live data decay crossing a vertical red reference line at **Day 3 (Meeting date)**.
*   **Close the Loop RL Weights**: Clickable reinforcement learning simulation that dynamically swaps low-impact competitive dossiers for real-time compliance chunks, elevating the pipeline quality score from `8.4` to `9.2`.

---

## ⚡ Quick Start

### 1. Requirements
Ensure you have **Node.js** (v18+) installed.

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Launch Development Server
Launch the hot-reloading development server:
```bash
npm run dev
```
Open your browser and navigate to:  
🌐 **`http://localhost:5173/`**

### 4. Build Production Bundle
To compile and optimize the assets for production deployment:
```bash
npm run build
```
The optimized bundle will be generated under the `dist/` directory.
