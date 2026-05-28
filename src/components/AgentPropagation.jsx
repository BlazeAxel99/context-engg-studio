import React, { useState, useEffect } from 'react';
import { Sliders, ToggleLeft, ToggleRight, AlertTriangle, ShieldAlert, CheckCircle2, ChevronRight, Server, Compass, Zap, HelpCircle } from 'lucide-react';

export default function AgentPropagation() {
  // Propagation Rule Toggles
  const [orchToResearch, setOrchToResearch] = useState(true);
  const [researchToAnalysis, setResearchToAnalysis] = useState(true);
  const [analysisToDrafting, setAnalysisToDrafting] = useState(true);
  const [researchToDrafting, setResearchToDrafting] = useState(false); // Default isolated (false means isolated, true means connected)

  // Freshness sliders
  const [researchFreshness, setResearchFreshness] = useState(85);
  const [industryFreshness, setIndustryFreshness] = useState(90);
  const [crmFreshness, setCrmFreshness] = useState(95);

  // Derived states with hysteresis
  const [staleActive, setStaleActive] = useState(false);
  
  useEffect(() => {
    if (researchFreshness < 40) {
      setStaleActive(true);
    } else if (researchFreshness > 70) {
      setStaleActive(false);
    }
  }, [researchFreshness]);

  const isResearchStale = staleActive;
  const isResearchStaleWarning = !staleActive && researchFreshness < 60;
  
  const getAgentStatus = (agentName) => {
    if (agentName === 'Orchestrator') return { label: 'HEALTHY', color: 'var(--neon-green)', border: 'rgba(16, 185, 129, 0.2)' };
    
    if (agentName === 'Research') {
      if (isResearchStale) return { label: `⚠️ Context stale (${researchFreshness}%)`, color: 'var(--neon-amber)', border: 'rgba(245, 158, 11, 0.3)' };
      if (isResearchStaleWarning) return { label: 'DEGRADED', color: 'var(--neon-amber)', border: 'rgba(245, 158, 11, 0.2)' };
      return { label: 'HEALTHY', color: 'var(--neon-green)', border: 'rgba(16, 185, 129, 0.2)' };
    }

    if (agentName === 'Analysis') {
      if (isResearchStale) return { label: '⚠️ Analysis based on stale data', color: 'var(--neon-amber)', border: 'rgba(245, 158, 11, 0.3)' };
      return { label: 'HEALTHY', color: 'var(--neon-green)', border: 'rgba(16, 185, 129, 0.2)' };
    }

    if (agentName === 'Drafting') {
      if (isResearchStale) return { label: '❌ Output quality compromised', color: 'var(--neon-red)', border: 'rgba(239, 68, 68, 0.3)' };
      if (researchToDrafting) return { label: 'OVER-SPECIFICATION', color: 'var(--neon-purple)', border: 'rgba(139, 92, 246, 0.3)' };
      return { label: 'HEALTHY', color: 'var(--neon-green)', border: 'rgba(16, 185, 129, 0.2)' };
    }

    return { label: 'HEALTHY', color: 'var(--neon-green)', border: 'rgba(16, 185, 129, 0.2)' };
  };

  return (
    <div className="module-container flex flex-col justify-between h-full" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* FRESHNESS SILENT FAILURE BANNER */}
      {isResearchStale && (
        <div className="p-4 mb-4 rounded-xl border border-rose-500/30 bg-rose-500/5 flex items-start gap-3 shadow-lg shadow-rose-950/20 animate-pulse"
          style={{
            padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.25)', backgroundColor: 'rgba(239, 68, 68, 0.04)',
            color: '#fca5a5', display: 'flex', gap: '12px', fontSize: '0.82rem', lineHeight: '1.45', marginBottom: '16px'
          }}
        >
          <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            Silent failure: The draft looks correct but is based on Q2 data. PharmaCorp's CDO hire happened in Q3 and is absent from the brief. This is how stale context causes hallucination-adjacent errors.
          </div>
        </div>
      )}

      {/* CONTEXT OVER-SPECIFICATION BANNER */}
      {researchToDrafting && !isResearchStale && (
        <div className="p-4 mb-4 rounded-xl border border-blue-500/30 bg-blue-500/5 flex items-start gap-3 shadow-lg shadow-blue-950/20"
          style={{
            padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.25)', backgroundColor: 'rgba(59, 130, 246, 0.04)',
            color: '#93c5fd', display: 'flex', gap: '12px', fontSize: '0.82rem', lineHeight: '1.45', marginBottom: '16px'
          }}
        >
          <ShieldAlert className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            Drafting Agent now has access to 780 tokens of raw research. This can cause over-specification in the output, reduced focus, and loss of the analytical layer's signal compression. Context isolation is a feature, not a limitation.
          </div>
        </div>
      )}

      {/* TOP ROW: Horizontal multi-agent workflow map */}
      <div className="glass-panel mb-5" style={{ padding: '24px', marginBottom: '16px' }}>
        <h4 className="font-bold text-slate-200 mb-4" style={{ fontSize: '0.98rem', color: 'var(--text-primary)', marginBottom: '16px', margin: 0 }}>Active Multi-Agent Runway Diagram</h4>
        
        <div className="flex justify-between items-center gap-2 overflow-x-auto py-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          
          {/* Agent 1: Orchestrator */}
          <div className="agent-node flex-1 min-w-[140px] border border-slate-800 bg-slate-950/40 p-4 rounded-xl text-center relative"
            style={{
              flex: 1, minWidth: '140px', padding: '14px', borderRadius: '12px', border: '1px solid var(--panel-border)', backgroundColor: 'rgba(5, 7, 12, 0.3)', textAlign: 'center', position: 'relative'
            }}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-2 text-indigo-400 font-bold text-sm" style={{ display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 8px auto' }}>
              AG
            </div>
            <h5 className="font-bold text-slate-200 text-xs" style={{ fontSize: '0.78rem', color: 'var(--text-primary)', margin: 0 }}>Orchestrator</h5>
            <div className="text-[9px] font-mono text-slate-500 mt-1" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              In: 180 t · Out: 1,840 t
            </div>
            <div className="mt-2.5 flex items-center justify-center gap-1.5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
              <div className="w-2 h-2 rounded-full" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--neon-green)' }} />
              <span className="text-[9px] font-mono font-bold" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.62rem', color: 'var(--neon-green)' }}>HEALTHY</span>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-700 flex-shrink-0" />

          {/* Agent 2: Research Agent */}
          {(() => {
            const status = getAgentStatus('Research');
            return (
              <div className={`agent-node flex-1 min-w-[140px] border p-4 rounded-xl text-center relative transition-all duration-300 ${status.border}`}
                style={{
                  flex: 1, minWidth: '140px', padding: '14px', borderRadius: '12px', border: '1px solid', backgroundColor: 'rgba(5, 7, 12, 0.3)', textAlign: 'center', position: 'relative',
                  borderColor: isResearchStale ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-2 text-blue-400 font-bold text-sm" style={{ display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 8px auto' }}>
                  RE
                </div>
                <h5 className="font-bold text-slate-200 text-xs" style={{ fontSize: '0.78rem', color: 'var(--text-primary)', margin: 0 }}>Research Agent</h5>
                <div className="text-[9px] font-mono text-slate-500 mt-1" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                  In: {orchToResearch ? '1,840 t' : '150 t'} · Out: 420 t
                </div>
                <div className="mt-2.5 flex items-center justify-center gap-1.5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
                  <div className="w-2 h-2 rounded-full" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: status.color }} />
                  <span className="text-[9px] font-mono font-bold" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.62rem', color: status.color }}>{status.label}</span>
                </div>
              </div>
            );
          })()}

          <ChevronRight className="w-5 h-5 text-slate-700 flex-shrink-0" />

          {/* Agent 3: Analysis Agent */}
          {(() => {
            const status = getAgentStatus('Analysis');
            return (
              <div className={`agent-node flex-1 min-w-[140px] border p-4 rounded-xl text-center relative transition-all duration-300 ${status.border}`}
                style={{
                  flex: 1, minWidth: '140px', padding: '14px', borderRadius: '12px', border: '1px solid', backgroundColor: 'rgba(5, 7, 12, 0.3)', textAlign: 'center', position: 'relative',
                  borderColor: isResearchStale ? 'rgba(249, 115, 22, 0.4)' : 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-2 text-purple-400 font-bold text-sm" style={{ display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 8px auto' }}>
                  AN
                </div>
                <h5 className="font-bold text-slate-200 text-xs" style={{ fontSize: '0.78rem', color: 'var(--text-primary)', margin: 0 }}>Analysis Agent</h5>
                <div className="text-[9px] font-mono text-slate-500 mt-1" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                  In: {researchToAnalysis ? '420 t' : '0 t'} · Out: 280 t
                </div>
                <div className="mt-2.5 flex items-center justify-center gap-1.5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
                  <div className="w-2 h-2 rounded-full" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: status.color }} />
                  <span className="text-[9px] font-mono font-bold" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.62rem', color: status.color }}>{status.label}</span>
                </div>
              </div>
            );
          })()}

          <ChevronRight className="w-5 h-5 text-slate-700 flex-shrink-0" />

          {/* Agent 4: Drafting Agent */}
          {(() => {
            const status = getAgentStatus('Drafting');
            return (
              <div className={`agent-node flex-1 min-w-[140px] border p-4 rounded-xl text-center relative transition-all duration-300 ${status.border}`}
                style={{
                  flex: 1, minWidth: '140px', padding: '14px', borderRadius: '12px', border: '1px solid', backgroundColor: 'rgba(5, 7, 12, 0.3)', textAlign: 'center', position: 'relative',
                  borderColor: isResearchStale ? 'rgba(239, 68, 68, 0.4)' : (researchToDrafting ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.05)')
                }}
              >
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-2 text-cyan-400 font-bold text-sm" style={{ display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 8px auto' }}>
                  DF
                </div>
                <h5 className="font-bold text-slate-200 text-xs" style={{ fontSize: '0.78rem', color: 'var(--text-primary)', margin: 0 }}>Drafting Agent</h5>
                <div className="text-[9px] font-mono text-slate-500 mt-1" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                  In: {analysisToDrafting ? (researchToDrafting ? '1,060 t' : '280 t') : '0 t'} · Out: 512 t
                </div>
                <div className="mt-2.5 flex items-center justify-center gap-1.5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
                  <div className="w-2 h-2 rounded-full" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: status.color }} />
                  <span className="text-[9px] font-mono font-bold" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.62rem', color: status.color }}>{status.label}</span>
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* MIDDLE: Rules Toggles & Sliders */}
      <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexGrow: 1, overflow: 'auto' }}>
        
        {/* Left: Propagation Rules */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="flex items-center gap-2 mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Server className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-slate-200" style={{ fontSize: '0.98rem', color: 'var(--text-primary)', margin: 0 }}>Context Propagation Rules</h4>
          </div>

          <div className="flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Rule 1 */}
            <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-xs font-semibold text-slate-300" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Orchestrator → Research</span>
                <span className="text-[10px] text-slate-400 mt-0.5" style={{ fontSize: '0.65rem', color: '#818cf8' }}>"Full shared context"</span>
              </div>
              <button
                onClick={() => setOrchToResearch(!orchToResearch)}
                className="text-indigo-400"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {orchToResearch ? <ToggleRight className="w-10 h-10 text-indigo-500" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
              </button>
            </div>

            {/* Rule 2 */}
            <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-xs font-semibold text-slate-300" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Research → Analysis</span>
                <span className="text-[10px] text-slate-400 mt-0.5" style={{ fontSize: '0.65rem', color: '#818cf8' }}>"Findings only (distilled)"</span>
              </div>
              <button
                onClick={() => setResearchToAnalysis(!researchToAnalysis)}
                className="text-indigo-400"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {researchToAnalysis ? <ToggleRight className="w-10 h-10 text-indigo-500" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
              </button>
            </div>

            {/* Rule 3 */}
            <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-xs font-semibold text-slate-300" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Analysis → Drafting</span>
                <span className="text-[10px] text-slate-400 mt-0.5" style={{ fontSize: '0.65rem', color: '#818cf8' }}>"Structured insights only"</span>
              </div>
              <button
                onClick={() => setAnalysisToDrafting(!analysisToDrafting)}
                className="text-indigo-400"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {analysisToDrafting ? <ToggleRight className="w-10 h-10 text-indigo-500" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
              </button>
            </div>

            {/* Rule 4: Context Isolation */}
            <div className="flex justify-between items-center border-t border-slate-900 pt-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
              <div className="flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="text-xs font-semibold text-slate-300" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Research → Drafting</span>
                <span className="text-[10px] text-slate-400 mt-0.5" style={{ fontSize: '0.65rem', color: '#818cf8' }}>"Isolated (drafting cannot see raw research)"</span>
              </div>
              <button
                onClick={() => setResearchToDrafting(!researchToDrafting)}
                className="text-indigo-400"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {researchToDrafting ? <ToggleLeft className="w-10 h-10 text-slate-600" /> : <ToggleRight className="w-10 h-10 text-indigo-500" />}
              </button>
            </div>

          </div>
        </div>

        {/* Right: Freshness Settings */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="flex items-center gap-2 mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-slate-200" style={{ fontSize: '0.98rem', color: 'var(--text-primary)', margin: 0 }}>Freshness Indicators (TTL Sliders)</h4>
          </div>

          <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Slider 1 */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '8px' }}>
                <span>Research Agent Context TTL</span>
                <span className={researchFreshness < 40 ? 'text-red-400 font-bold' : 'text-cyan-400'}>{researchFreshness}% Fresh</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={researchFreshness}
                onChange={(e) => setResearchFreshness(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                style={{ width: '100%', height: '6px', backgroundColor: 'var(--panel-bg)', borderRadius: '3px' }}
              />
              <span className="text-[9px] text-slate-500 mt-1 block" style={{ fontSize: '0.58rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                {researchFreshness < 40 ? '⚠️ Silent Failure Active - Cascading down the agent pipeline' : 'Research nodes caching metrics match requirements'}
              </span>
            </div>

            {/* Slider 2 */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '8px' }}>
                <span>Industry Data Freshness</span>
                <span className="text-cyan-400">{industryFreshness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={industryFreshness}
                onChange={(e) => setIndustryFreshness(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                style={{ width: '100%', height: '6px', backgroundColor: 'var(--panel-bg)', borderRadius: '3px' }}
              />
            </div>

            {/* Slider 3 */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '8px' }}>
                <span>CRM Database Freshness</span>
                <span className="text-cyan-400">{crmFreshness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={crmFreshness}
                onChange={(e) => setCrmFreshness(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                style={{ width: '100%', height: '6px', backgroundColor: 'var(--panel-bg)', borderRadius: '3px' }}
              />
            </div>

          </div>
        </div>

      </div>

      {/* BOTTOM: Context Flow Trace Table */}
      <div className="glass-panel mt-5" style={{ padding: '20px', marginTop: '16px' }}>
        <h4 className="font-bold text-slate-200 mb-3" style={{ fontSize: '0.98rem', color: 'var(--text-primary)', marginBottom: '12px', margin: 0 }}>Context Flow Trace Matrix</h4>
        
        <div className="border border-slate-900 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px' }}>
          <table className="w-full text-xs text-left text-slate-400 border-collapse" style={{ width: '100%', fontSize: '0.75rem', color: 'var(--text-secondary)', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-900 font-mono" style={{ backgroundColor: 'rgba(5, 7, 12, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                <th className="p-3" style={{ padding: '10px 12px' }}>Agent Node</th>
                <th className="p-3" style={{ padding: '10px 12px' }}>Context Received (Working Memory)</th>
                <th className="p-3" style={{ padding: '10px 12px' }}>Context Generated (Output State)</th>
                <th className="p-3" style={{ padding: '10px 12px' }}>Isolation Boundaries</th>
              </tr>
            </thead>
            <tbody>
              {/* Orchestrator Row */}
              <tr className="border-b border-slate-900" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td className="p-3 font-semibold text-slate-200" style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>Orchestrator</td>
                <td className="p-3" style={{ padding: '10px 12px' }}>User query, session state, task decomposition schema</td>
                <td className="p-3 font-mono text-[10px] text-indigo-400" style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontSize: '0.68rem' }}>Subtask assignments, shared context bundle (tokens: 1840)</td>
                <td className="p-3 text-slate-500 italic" style={{ padding: '10px 12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>None — coordinates all agents</td>
              </tr>
              
              {/* Research Row */}
              <tr className="border-b border-slate-900" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td className="p-3 font-semibold text-slate-200" style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>Research Agent</td>
                <td className="p-3" style={{ padding: '10px 12px' }}>
                  {orchToResearch ? 'Full shared context (1840 tokens)' : 'Static local index context (150 tokens)'}
                </td>
                <td className="p-3 font-mono text-[10px] text-indigo-400" style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontSize: '0.68rem' }}>
                  PharmaCorp research summary (6 key findings, 420 tokens)
                </td>
                <td className="p-3 text-slate-400" style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                  Cannot write to Analysis Agent working memory directly
                </td>
              </tr>

              {/* Analysis Row */}
              <tr className="border-b border-slate-900" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td className="p-3 font-semibold text-slate-200" style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>Analysis Agent</td>
                <td className="p-3" style={{ padding: '10px 12px' }}>
                  {!researchToAnalysis ? 'No research context available (0 tokens)' : (
                    researchFreshness < 50 ? (
                      <span className="text-yellow-400 font-semibold">⚠️ Receiving stale research data</span>
                    ) : 'Current research summary (420 tokens)'
                  )}
                </td>
                <td className="p-3 font-mono text-[10px] text-indigo-400" style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontSize: '0.68rem' }}>
                  Risk matrix, 3 priority recommendations (280 tokens)
                </td>
                <td className="p-3 text-slate-400" style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                  Cannot access raw CRM data directly
                </td>
              </tr>

              {/* Drafting Row */}
              <tr>
                <td className="p-3 font-semibold text-slate-200" style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>Drafting Agent</td>
                <td className="p-3 text-slate-300" style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                  {!analysisToDrafting ? 'No input context from analysis core (0 tokens)' : (
                    researchToDrafting ? 'Meeting brief + raw research data — potential over-specification risk' : 'Meeting brief based on analysis only'
                  )}
                </td>
                <td className="p-3 font-mono text-[10px] text-indigo-400" style={{ padding: '10px 12px', fontFamily: 'JetBrains Mono', fontSize: '0.68rem' }}>
                  Final meeting prep document
                </td>
                <td className="p-3 text-slate-400 font-semibold" style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                  {researchToDrafting ? 'None — raw research data bypassed' : 'Read-only access to Analysis output layer'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* GLOBAL INSIGHT BOX */}
      <div className="insight-box mt-6" style={{
        marginTop: '20px',
        padding: '16px 20px',
        borderRadius: '12px',
        backgroundColor: 'rgba(13, 16, 26, 0.6)',
        borderLeft: '4px solid #6366f1',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        borderRight: '1px solid rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}>
        <div className="flex gap-3" style={{ display: 'flex', gap: '12px' }}>
          <div className="insight-indicator text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#6366f1', letterSpacing: '1px' }}>KEY INSIGHT</div>
          <p className="insight-text text-sm leading-relaxed" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
            In multi-agent systems, what each agent knows is an architectural decision. Context propagation rules define agent behavior more than prompts do. Stale context propagates silently — it looks like hallucination but is actually an infrastructure failure.
          </p>
        </div>
      </div>
    </div>
  );
}
