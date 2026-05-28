import React, { useState, useEffect } from 'react';
import MaturityLadder from './components/MaturityLadder';
import IntentDecomp from './components/IntentDecomp';
import BudgetOptimizer from './components/BudgetOptimizer';
import CompressionStudio from './components/CompressionStudio';
import AgentPropagation from './components/AgentPropagation';
import ObservabilityDashboard from './components/ObservabilityDashboard';
import { Network, Key, ShieldAlert, CheckCircle, ArrowRight, Eye, Play, Sun, Moon } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('maturity'); // 'maturity', 'decomp', 'budget', 'compress', 'agents', 'observe'
  
  // Theme state switcher
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  // API Key management
  const [apiKey, setApiKey] = useState(() => {
    return window.__ANTHROPIC_KEY__ || '';
  });
  const [keyInput, setKeyInput] = useState('');
  const [keyCollapsed, setKeyCollapsed] = useState(false);

  // Tab completion checklist for presentation progress
  const [completedTabs, setCompletedTabs] = useState({
    maturity: true, // Started
    decomp: false,
    budget: false,
    compress: false,
    agents: false,
    observe: false
  });

  // Track shared states across modules for cohesive scenario consistency
  const [decompData, setDecompData] = useState(null);
  const [optimizerStats, setOptimizerStats] = useState(null);

  // Sync window.__ANTHROPIC_KEY__
  useEffect(() => {
    if (apiKey) {
      window.__ANTHROPIC_KEY__ = apiKey;
      setKeyCollapsed(true);
    } else {
      setKeyCollapsed(false);
    }
  }, [apiKey]);

  const handleSaveKey = () => {
    if (keyInput.trim()) {
      setApiKey(keyInput.trim());
    }
  };

  const handleUseMockMode = () => {
    setApiKey('DEMO_MOCK_MODE');
  };

  const navigateToTab = (tabId) => {
    setActiveTab(tabId);
    // Mark as visited/completed
    setCompletedTabs(prev => ({
      ...prev,
      [tabId]: true
    }));
  };

  // Callback from Module 2 Intent Decomposition
  const handleDecompComplete = (data) => {
    setDecompData(data);
    setCompletedTabs(prev => ({ ...prev, decomp: true }));
  };

  // Callback from Module 3 Budget Optimizer
  const handleOptimizerComplete = (stats) => {
    setOptimizerStats(stats);
    setCompletedTabs(prev => ({ ...prev, budget: true }));
  };

  const tabs = [
    { id: 'maturity', label: '01 · Maturity' },
    { id: 'decomp', label: '02 · Intent Decomp' },
    { id: 'budget', label: '03 · Budget' },
    { id: 'compress', label: '04 · Compress' },
    { id: 'agents', label: '05 · Agents' },
    { id: 'observe', label: '06 · Observe' }
  ];

  return (
    <div className="min-h-screen font-sans relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-dark)',
        backgroundImage: theme === 'dark' 
          ? 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.1) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(34, 211, 238, 0.08) 0, transparent 50%)'
          : 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.05) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(34, 211, 238, 0.04) 0, transparent 50%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        color: 'var(--text-primary)'
      }}
    >
      
      {/* BACKGROUND NEON GLOW EFFECTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] pointer-events-none rounded-full" />

      {/* TOP HEADER & NAVIGATION */}
      <header className="border-b backdrop-blur-md z-30" style={{ borderBottom: '1px solid var(--panel-border)', backgroundColor: theme === 'dark' ? 'rgba(5, 7, 12, 0.4)' : 'rgba(255, 255, 255, 0.4)' }}>
        <div className="max-w-[1920px] mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          
          {/* Logo Brandmark */}
          <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-600/30"
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)',
                display: 'flex', alignItems: 'center', justify: 'center',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
              }}
            >
              <Network className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="font-bold text-sm tracking-wide uppercase" style={{ fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                Context Engineering Studio
              </span>
              <span className="text-[9px] font-mono" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                 discipline // presentation-platform
              </span>
            </div>
          </div>

          {/* Module tabs and Theme Toggle Row */}
          <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <nav className="flex items-center gap-1 p-1 border rounded-xl"
              style={{
                display: 'flex', gap: '4px', padding: '4px',
                backgroundColor: theme === 'dark' ? 'rgba(5, 7, 12, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                border: '1px solid var(--panel-border)',
                borderRadius: '12px'
              }}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const isCompleted = completedTabs[tab.id];
                return (
                  <button
                    key={tab.id}
                    onClick={() => navigateToTab(tab.id)}
                    className={`px-4 py-2 text-xs font-bold font-mono tracking-wide rounded-lg flex items-center gap-1.5 transition-all duration-300 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                    }`}
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.75rem',
                      fontFamily: 'JetBrains Mono',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: isActive ? '#6366f1' : 'transparent',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{tab.label}</span>
                    {isCompleted && (
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/10" style={{ color: '#22d3ee' }} />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* LIGHT/DARK MODE TOGGLE BUTTON */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105"
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundColor: theme === 'dark' ? 'rgba(5, 7, 12, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                border: '1px solid var(--panel-border)',
                color: 'var(--text-secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* COLLAPSIBLE API KEY INPUT ROW */}
      {!keyCollapsed && (
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-2.5 z-20 transition-all duration-300"
          style={{
            backgroundColor: 'rgba(5, 7, 12, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '10px 24px',
            zIndex: 20
          }}
        >
          <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4 flex-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div className="flex items-center gap-2 text-xs text-slate-400" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#9ca3af' }}>
              <Key className="w-4 h-4 text-indigo-400" />
              <span>Enter Anthropic API Key for live Claude-Sonnet requests. No key? Choose Demo Mock Mode.</span>
            </div>
            
            <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="password"
                className="bg-slate-900 border border-slate-800 text-xs rounded px-3 py-1.5 w-64 outline-none text-white focus:border-indigo-500"
                style={{
                  width: '260px', padding: '6px 12px', fontSize: '0.75rem',
                  backgroundColor: 'rgba(5, 7, 12, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px', outline: 'none', color: '#fff'
                }}
                placeholder="sk-ant-v1-..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
              />
              <button
                onClick={handleSaveKey}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded transition-all"
                style={{ padding: '6px 14px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#6366f1', border: 'none', borderRadius: '4px', cursor: 'pointer', color: '#fff' }}
              >
                Apply Key
              </button>
              <button
                onClick={handleUseMockMode}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs px-3.5 py-1.5 rounded transition-all"
                style={{ padding: '6px 14px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', cursor: 'pointer', color: '#d1d5db' }}
              >
                Demo Mock Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KEY COLLAPSED STATUS STRIP */}
      {keyCollapsed && (
        <div className="bg-slate-950/60 border-b border-slate-900/60 px-6 py-1.5 flex justify-between items-center text-[10px] text-slate-500 font-mono z-20"
          style={{
            backgroundColor: 'rgba(5, 7, 12, 0.3)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
            padding: '6px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'JetBrains Mono',
            fontSize: '0.62rem',
            color: '#6b7280',
            zIndex: 20
          }}
        >
          <span>
            {apiKey === 'DEMO_MOCK_MODE' 
              ? '⚡ ENVIRONMENT: Presentation-Grade Simulation (Zero-API Cost Fail-safe)' 
              : '⚡ ENVIRONMENT: Live Anthropic API Connection (claude-sonnet-4-20250514)'}
          </span>
          <button
            onClick={() => {
              setApiKey('');
              setKeyCollapsed(false);
            }}
            className="text-indigo-400 hover:underline cursor-pointer"
            style={{ background: 'none', border: 'none', fontFamily: 'inherit', color: '#818cf8', cursor: 'pointer' }}
          >
            [Change Key / Mode]
          </button>
        </div>
      )}

      {/* MAIN VIEWPORT LAYOUT COMPONENTS */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-6 py-6 overflow-hidden flex flex-col z-10" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div className="flex-1 overflow-hidden transition-opacity duration-300" style={{ flexGrow: 1, overflow: 'hidden' }}>
          
          {activeTab === 'maturity' && (
            <MaturityLadder onNavigateTab={navigateToTab} />
          )}

          {activeTab === 'decomp' && (
            <IntentDecomp apiKey={apiKey} onDecompositionComplete={handleDecompComplete} />
          )}

          {activeTab === 'budget' && (
            <BudgetOptimizer onOptimizerSelect={handleOptimizerComplete} />
          )}

          {activeTab === 'compress' && (
            <CompressionStudio apiKey={apiKey} />
          )}

          {activeTab === 'agents' && (
            <AgentPropagation />
          )}

          {activeTab === 'observe' && (
            <ObservabilityDashboard initialStats={optimizerStats} />
          )}

        </div>
      </main>

    </div>
  );
}
