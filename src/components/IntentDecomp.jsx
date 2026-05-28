import React, { useState } from 'react';
import { Search, Compass, Sliders, Play, CheckCircle2, AlertCircle, ArrowRight, Server, Shield, Layers, HelpCircle } from 'lucide-react';

export default function IntentDecomp({ apiKey, onDecompositionComplete }) {
  const defaultQuery = "Prepare me for tomorrow's advisory meeting with PharmaCorp on their digital transformation roadmap.";
  const [query, setQuery] = useState(defaultQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Pre-compiled high fidelity presentation fallback data
  const defaultFallbackResult = {
    context_needs: [
      {
        category: 'Client Financial Health',
        requirement: 'Assess latest quarterly earnings decline (Veratol generic competition) and Q4 revised financial guidance.',
        source_type: 'CRM',
        freshness_required: '24h',
        priority: 'critical',
        token_budget: 820
      },
      {
        category: 'Executive Stakeholder Alignment',
        requirement: 'Map key stakeholder profiles and recent priorities, including the new Chief Digital Officer Raj Mehta.',
        source_type: 'CRM',
        freshness_required: '7d',
        priority: 'critical',
        token_budget: 230
      },
      {
        category: 'Recent News & Public Strategy',
        requirement: 'Retrieve the CEO\'s recent public statements on LinkedIn regarding AI acceleration and pipeline updates.',
        source_type: 'Web Search',
        freshness_required: 'real-time',
        priority: 'high',
        token_budget: 120
      },
      {
        category: 'Regulatory Environment',
        requirement: 'Evaluate latest FDA Q4 regulatory constraints affecting targeted oncology therapies.',
        source_type: 'Web Search',
        freshness_required: 'real-time',
        priority: 'high',
        token_budget: 390
      },
      {
        category: 'Industry Digital Benchmarks',
        requirement: 'Analyze standard digital transformation benchmarks for mid-cap pharma companies migrating to SAP S/4HANA.',
        source_type: 'Document Store',
        freshness_required: 'static',
        priority: 'medium',
        token_budget: 560
      },
      {
        category: 'Internal Meeting Logistics',
        requirement: 'Retrieve upcoming PharmaCorp advisory prep meeting agenda drafts and calendar invites.',
        source_type: 'User Profile',
        freshness_required: 'real-time',
        priority: 'critical',
        token_budget: 95
      }
    ],
    total_estimated_tokens: 2215,
    decomposition_rationale: 'To deliver an effective advisory prep document, the context window must integrate both internal CRM historical context, live competitive web updates, regulatory standards, and logistics. A standard vector search query on "digital transformation roadmap" would only retrieve generalized static documentation, entirely missing critical details like the Q3 financial drop or CDO Raj Mehta\'s hiring context.'
  };

  const handleDecompose = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const systemPrompt = `You are a Context Requirements Analyst. Your job is to decompose a user's query into an explicit JSON schema of information requirements needed to answer it well. Return ONLY a JSON object with this structure:
{
  "context_needs": [
    {
      "category": string,        // e.g. 'Client Financial Health'
      "requirement": string,     // what specifically is needed
      "source_type": string,     // e.g. 'CRM', 'Web Search', 'Document Store', 'User Profile'
      "freshness_required": string, // 'real-time', '24h', '7d', 'static'
      "priority": "critical" | "high" | "medium" | "low",
      "token_budget": number     // estimated tokens this context will use
    }
  ],
  "total_estimated_tokens": number,
  "decomposition_rationale": string
}
Return ONLY valid JSON. No preamble, no markdown.`;

    // If API key is empty or looks like standard placeholder, run simulation
    if (!apiKey || apiKey.trim() === '' || apiKey === 'DEMO_MOCK_MODE') {
      setTimeout(() => {
        setResult(defaultFallbackResult);
        setLoading(false);
        if (onDecompositionComplete) {
          onDecompositionComplete(defaultFallbackResult);
        }
      }, 1500); // 1.5 second beautiful pulse animation
      return;
    }

    try {
      // Call Anthropic API directly
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-the-dangerous-api-key': 'true' // Client side direct call
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: systemPrompt,
          messages: [
            { role: 'user', content: query }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API returned status ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data.content[0].text;
      
      // Parse the JSON output
      const jsonStart = textResponse.indexOf('{');
      const jsonEnd = textResponse.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Could not parse JSON response from LLM");
      }
      
      const parsed = JSON.parse(textResponse.substring(jsonStart, jsonEnd + 1));
      setResult(parsed);
      if (onDecompositionComplete) {
        onDecompositionComplete(parsed);
      }
    } catch (err) {
      console.error("Direct API call failed:", err);
      setError("API call failed — check your key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSourceBadgeColor = (source) => {
    const s = source.toLowerCase();
    if (s.includes('crm')) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' };
    if (s.includes('web')) return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' };
    if (s.includes('doc') || s.includes('store') || s.includes('kb')) return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' };
    return { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' };
  };

  const getFreshnessColor = (freshness) => {
    const f = freshness.toLowerCase();
    if (f.includes('real-time') || f.includes('live')) return { bg: 'bg-rose-500/10', text: 'text-rose-400' };
    if (f.includes('24h')) return { bg: 'bg-orange-500/10', text: 'text-orange-400' };
    if (f.includes('7d')) return { bg: 'bg-yellow-500/10', text: 'text-yellow-400' };
    return { bg: 'bg-slate-500/10', text: 'text-slate-400' };
  };

  const getPriorityColor = (priority) => {
    const p = priority.toLowerCase();
    if (p === 'critical') return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (p === 'high') return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
  };

  return (
    <div className="module-container flex flex-col justify-between h-full" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.3fr 0.85fr', gap: '20px', flexGrow: 1, overflow: 'auto' }}>
        
        {/* LEFT PANEL: Input Panel */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 className="font-bold text-slate-200" style={{ fontSize: '0.98rem', color: '#f3f4f6', margin: 0 }}>Step 1 · User Objective</h4>
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              className="text-area-input w-full p-4 rounded-xl text-sm border border-slate-800 bg-slate-950/80 focus:border-indigo-500 outline-none font-sans"
              style={{
                flexGrow: 1,
                minHeight: '160px',
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(5, 7, 12, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontSize: '0.85rem',
                lineHeight: '1.45',
                resize: 'none',
                outline: 'none'
              }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your advisory planning query here..."
            />
            
            <button
              onClick={handleDecompose}
              disabled={loading}
              className={`decompose-btn py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/25 active:scale-95'
              }`}
              style={{
                padding: '12px 16px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.8px',
                borderRadius: '10px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                backgroundColor: loading ? 'rgba(255, 255, 255, 0.04)' : '#6366f1',
                backgroundImage: loading ? 'none' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(99, 102, 241, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-indigo-400 rounded-full animate-spin"></div>
                  <span>Analyzing Intent...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Decompose Intent →</span>
                </>
              )}
            </button>
          </div>

          {/* Explanation Box */}
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 text-xs text-slate-400 leading-relaxed"
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backgroundColor: 'rgba(5, 7, 12, 0.2)',
              fontSize: '0.75rem',
              color: '#9ca3af',
              lineHeight: '1.45'
            }}
          >
            Most systems jump straight to vector search after this query. Context engineering asks: <strong>what information do we actually need before we retrieve anything?</strong>
          </div>
        </div>

        {/* CENTER PANEL: Live AI Decompiled Output */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div className="flex justify-between items-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 className="font-bold text-slate-200" style={{ fontSize: '0.98rem', color: '#f3f4f6', margin: 0 }}>Step 2 · Decompiled Context Requirements</h4>
            {result && (
              <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 border border-indigo-500/20 rounded" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#818cf8', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                Budgeted: {result.total_estimated_tokens} tokens
              </span>
            )}
          </div>

          {error && (
            <div className="p-4 mb-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-300 flex flex-col gap-3" style={{ border: '1px solid rgba(239, 68, 68, 0.15)', backgroundColor: 'rgba(239, 68, 68, 0.04)', borderRadius: '8px', color: '#f87171' }}>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleDecompose}
                  className="py-1 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold rounded-md transition-all cursor-pointer"
                >
                  Retry Call
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setResult(defaultFallbackResult);
                    if (onDecompositionComplete) {
                      onDecompositionComplete(defaultFallbackResult);
                    }
                  }}
                  className="py-1 px-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-md transition-all cursor-pointer"
                >
                  Use Demo Mode (Simulation)
                </button>
              </div>
            </div>
          )}

          {/* State 1: Idle state */}
          {!loading && !result && (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/20"
              style={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '30px',
                border: '1px dashed rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                backgroundColor: 'rgba(5, 7, 12, 0.1)',
                color: '#6b7280'
              }}
            >
              <Compass className="w-10 h-10 text-slate-700 mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-slate-400 mb-1" style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600 }}>Engine Awaiting Execution</p>
              <p className="text-xs text-slate-500 max-w-[200px]" style={{ fontSize: '0.72rem', color: '#6b7280' }}>Click "Decompose Intent" to trigger the Claude parser model.</p>
            </div>
          )}

          {/* State 2: Loading State */}
          {loading && (
            <div className="flex-1 flex flex-col gap-3 justify-center" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="border border-slate-800 bg-slate-900/20 rounded-xl p-4 flex flex-col gap-2 animate-pulse"
                  style={{ border: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(13, 16, 26, 0.1)', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                  <div className="flex gap-2 mt-2">
                    <div className="h-5 bg-slate-800 rounded w-16"></div>
                    <div className="h-5 bg-slate-800 rounded w-16"></div>
                  </div>
                </div>
              ))}
              <div className="text-center font-mono text-[10px] text-indigo-400 mt-2 tracking-wide" style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#6366f1' }}>
                Decomposing intent into context requirements...
              </div>
            </div>
          )}

          {/* State 3: Loaded Results */}
          {!loading && result && (
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              {result.context_needs?.map((need, idx) => {
                const srcTheme = getSourceBadgeColor(need.source_type);
                const freshTheme = getFreshnessColor(need.freshness_required);
                const prioClass = getPriorityColor(need.priority);
                
                return (
                  <div
                    key={idx}
                    className="border border-slate-800/80 bg-slate-900/10 hover:bg-slate-900/20 rounded-xl p-3.5 flex flex-col gap-2.5 transition-all duration-300 hover:border-slate-700/60"
                    style={{
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      backgroundColor: 'rgba(13, 16, 26, 0.15)',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="font-bold text-slate-200 text-sm" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e5e7eb' }}>
                        {need.category}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/30" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: '#9ca3af', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1px 6px', borderRadius: '4px' }}>
                        {need.token_budget} tokens
                      </span>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed" style={{ color: '#9ca3af', fontSize: '0.78rem', lineHeight: '1.4' }}>
                      {need.requirement}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-1" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                      {/* Source Type Badge */}
                      <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-md ${srcTheme.bg} ${srcTheme.border} ${srcTheme.text}`}
                        style={{
                          fontSize: '0.65rem', fontWeight: 600, border: '1px solid', padding: '2px 8px', borderRadius: '6px',
                          borderColor: srcTheme.border.replace('border-', '').replace('/20', '') || 'rgba(255,255,255,0.08)',
                          color: srcTheme.text.replace('text-', '') || '#fff',
                          backgroundColor: 'rgba(255,255,255,0.03)'
                        }}
                      >
                        {need.source_type}
                      </span>

                      {/* Freshness Badge */}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${freshTheme.bg} ${freshTheme.text}`}
                        style={{
                          fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: '6px',
                          color: freshTheme.text.replace('text-', '') || '#fff',
                          backgroundColor: 'rgba(255,255,255,0.03)'
                        }}
                      >
                        {need.freshness_required}
                      </span>

                      {/* Priority Badge */}
                      <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-md ${prioClass}`}
                        style={{
                          fontSize: '0.65rem', fontWeight: 600, border: '1px solid', padding: '2px 8px', borderRadius: '6px',
                          backgroundColor: 'rgba(255,255,255,0.03)'
                        }}
                      >
                        {need.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Aha Insights & MCP Mapping */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4 className="font-bold text-slate-200 mb-4" style={{ fontSize: '0.98rem', color: '#f3f4f6', marginBottom: '14px', margin: 0 }}>What just happened?</h4>
            
            <div className="flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="insight-block" style={{ display: 'flex', gap: '10px' }}>
                <div className="insight-ico text-cyan-400 mt-0.5" style={{ color: '#22d3ee' }}>🔍</div>
                <div>
                  <h5 className="text-xs font-bold text-slate-300" style={{ fontSize: '0.78rem', color: '#d1d5db', margin: 0 }}>This happened BEFORE any retrieval</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5" style={{ fontSize: '0.72rem', color: '#9ca3af', lineHeight: '1.35', margin: 0 }}>
                    The system hasn't touched a vector database yet. It first asked: what do we need? This step is absent in most RAG implementations.
                  </p>
                </div>
              </div>

              <div className="insight-block" style={{ display: 'flex', gap: '10px' }}>
                <div className="insight-ico text-cyan-400 mt-0.5" style={{ color: '#22d3ee' }}>🎯</div>
                <div>
                  <h5 className="text-xs font-bold text-slate-300" style={{ fontSize: '0.78rem', color: '#d1d5db', margin: 0 }}>Intent ≠ Query</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5" style={{ fontSize: '0.72rem', color: '#9ca3af', lineHeight: '1.35', margin: 0 }}>
                    The user said 7 words. The system identified 6+ distinct information requirements across multiple source types with different freshness constraints. A vector search would have missed most of these.
                  </p>
                </div>
              </div>

              <div className="insight-block" style={{ display: 'flex', gap: '10px' }}>
                <div className="insight-ico text-cyan-400 mt-0.5" style={{ color: '#22d3ee' }}>⚡</div>
                <div>
                  <h5 className="text-xs font-bold text-slate-300" style={{ fontSize: '0.78rem', color: '#d1d5db', margin: 0 }}>This schema drives everything downstream</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5" style={{ fontSize: '0.72rem', color: '#9ca3af', lineHeight: '1.35', margin: 0 }}>
                    Every retrieval, every compression decision, every token allocation in modules 3 and 4 flows from this decomposition. This is the architectural root.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MCP Diagram */}
          <div className="border border-slate-800 bg-slate-950/40 rounded-xl p-3.5 flex flex-col gap-3"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backgroundColor: 'rgba(5, 7, 12, 0.25)',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginTop: 'auto'
            }}
          >
            <span className="font-semibold text-xs text-indigo-300" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a5b4fc' }}>The MCP Connection</span>
            <p className="text-[10px] text-slate-400 leading-normal" style={{ fontSize: '0.7rem', color: '#9ca3af', lineHeight: '1.3' }}>
              In production, each source_type maps to a standardized interface (Model Context Protocol). CRM data, live web search, document stores — each is a context provider with a contract. The decomposition tells you which providers to invoke.
            </p>
            
            {/* Visual Mini diagram */}
            <div className="flex items-center justify-between gap-1 border border-slate-800/80 bg-slate-950/80 p-2 rounded-lg"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: 'rgba(5, 7, 12, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.62rem'
              }}
            >
              <div className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1 border border-cyan-500/20 rounded" style={{ fontFamily: 'JetBrains Mono', color: '#22d3ee' }}>Decomp JSON</div>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <div className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1 border border-indigo-500/20 rounded" style={{ fontFamily: 'JetBrains Mono', color: '#818cf8' }}>MCP</div>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <div className="flex gap-1.5 animate-pulse" style={{ display: 'flex', gap: '6px' }}>
                <span className="bg-emerald-500/20 text-emerald-400 p-0.5 rounded font-bold" style={{ padding: '2px 4.5px' }}>CRM</span>
                <span className="bg-blue-500/20 text-blue-400 p-0.5 rounded font-bold" style={{ padding: '2px 4.5px' }}>Web</span>
                <span className="bg-amber-500/20 text-amber-400 p-0.5 rounded font-bold" style={{ padding: '2px 4.5px' }}>Docs</span>
                <span className="bg-purple-500/20 text-purple-400 p-0.5 rounded font-bold" style={{ padding: '2px 4.5px' }}>Profile</span>
              </div>
            </div>
          </div>
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
          <p className="insight-text text-sm leading-relaxed" style={{ fontSize: '0.88rem', color: '#d1d5db', margin: 0, lineHeight: '1.5' }}>
            <strong>Intent ≠ Query:</strong> A naive RAG search takes the query literally and conducts a single vector match. Intent Decomposition maps the user signal to a structured blueprint of diverse queries, freshness limits, and priority weights across multiple source domains.
          </p>
        </div>
      </div>
    </div>
  );
}
