import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, Cell } from 'recharts';
import { Sliders, Award, Zap, CheckCircle2, ChevronRight, Play, RefreshCw, BarChart2, Check, Info } from 'lucide-react';

const INITIAL_CHUNKS = [
  { id: 1, label: "PharmaCorp Q3 Earnings Call Transcript", category: "Financial", tokens: 820, relevance: 0.92, freshness: 0.95, source: "CRM" },
  { id: 2, label: "PharmaCorp CEO LinkedIn Post (this week)", category: "News", tokens: 120, relevance: 0.78, freshness: 0.99, source: "Web" },
  { id: 3, label: "Pharma Industry Digital Transformation Report 2024", category: "Industry", tokens: 1100, relevance: 0.85, freshness: 0.60, source: "Docs" },
  { id: 4, label: "EY Prior Engagement Notes — PharmaCorp 2023", category: "Engagement", tokens: 450, relevance: 0.96, freshness: 0.70, source: "CRM" },
  { id: 5, label: "PharmaCorp Competitor Analysis (Roche, Novartis)", category: "Competitive", tokens: 680, relevance: 0.88, freshness: 0.65, source: "Docs" },
  { id: 6, label: "EY Digital Health Practice Credentials Deck", category: "Credentials", tokens: 540, relevance: 0.72, freshness: 0.55, source: "Docs" },
  { id: 7, label: "PharmaCorp Key Stakeholders — CRM Profile", category: "People", tokens: 230, relevance: 0.94, freshness: 0.88, source: "CRM" },
  { id: 8, label: "FDA Regulatory Updates Q4 2024", category: "Regulatory", tokens: 390, relevance: 0.80, freshness: 0.92, source: "Web" },
  { id: 9, label: "PharmaCorp Annual Report 2023 (Full)", category: "Financial", tokens: 1800, relevance: 0.75, freshness: 0.50, source: "Docs" },
  { id: 10, label: "Meeting Agenda Draft (from user's calendar)", category: "Meeting", tokens: 95, relevance: 0.99, freshness: 1.0, source: "Profile" },
  { id: 11, label: "EY Thought Leadership: AI in Pharma 2025", category: "Credentials", tokens: 470, relevance: 0.68, freshness: 0.82, source: "Docs" },
  { id: 12, label: "PharmaCorp LinkedIn Company Page Summary", category: "News", tokens: 180, relevance: 0.70, freshness: 0.95, source: "Web" },
  { id: 13, label: "Prior Meeting Notes — PharmaCorp April 2024", category: "Engagement", tokens: 310, relevance: 0.91, freshness: 0.75, source: "CRM" },
  { id: 14, label: "Digital Transformation Benchmarks — Mid-cap Pharma", category: "Industry", tokens: 560, relevance: 0.83, freshness: 0.62, source: "Docs" }
];

export default function BudgetOptimizer({ onOptimizerSelect }) {
  const BUDGET_LIMIT = 4000;
  const [chunks, setChunks] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set([10, 7, 4, 13, 1])); // Default pre-selected
  const [mode, setMode] = useState('manual'); // 'manual', 'greedy', 'optimized'
  const [animating, setAnimating] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [activeSourceFilter, setActiveSourceFilter] = useState('All');
  
  // Calculate composite scores
  useEffect(() => {
    const formatted = INITIAL_CHUNKS.map(chunk => {
      const isPriorityCategory = ["Meeting", "Engagement", "People"].includes(chunk.category);
      const priorityBonus = isPriorityCategory ? 1.0 : 0.6;
      const compositeScore = (chunk.relevance * 0.5) + (chunk.freshness * 0.3) + (priorityBonus * 0.2);
      return {
        ...chunk,
        compositeScore: parseFloat(compositeScore.toFixed(3))
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore);
    
    setChunks(formatted);
  }, []);

  const totalTokens = chunks
    .filter(c => selectedIds.has(c.id))
    .reduce((sum, c) => sum + c.tokens, 0);

  const averageScore = chunks.filter(c => selectedIds.has(c.id)).length > 0
    ? parseFloat((chunks.filter(c => selectedIds.has(c.id)).reduce((sum, c) => sum + c.compositeScore, 0) / chunks.filter(c => selectedIds.has(c.id)).length).toFixed(3))
    : 0.000;

  const toggleChunk = (id) => {
    if (mode !== 'manual') return;
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // GREEDY TOP-K
  const runGreedy = () => {
    if (animating) return;
    setMode('greedy');
    setAnimating(true);
    
    // Sort by composite score
    const sorted = [...chunks].sort((a, b) => b.compositeScore - a.compositeScore);
    const newSelected = new Set();
    let currentTokens = 0;
    
    // Create an animation queue
    let queue = [];
    for (let c of sorted) {
      if (currentTokens + c.tokens <= BUDGET_LIMIT) {
        newSelected.add(c.id);
        currentTokens += c.tokens;
        queue.push(new Set(newSelected));
      }
    }

    let i = 0;
    const animateNext = () => {
      if (i < queue.length) {
        setSelectedIds(queue[i]);
        i++;
        setTimeout(animateNext, 200);
      } else {
        setAnimating(false);
        // Calculate greedy scores for comparison later
        const greedyAverage = sorted.filter(c => newSelected.has(c.id)).reduce((sum, c) => sum + c.compositeScore, 0) / newSelected.size;
        setComparison(prev => ({
          ...prev,
          greedy: {
            score: parseFloat(greedyAverage.toFixed(3)),
            tokens: currentTokens,
            chunks: newSelected.size,
            ids: newSelected
          }
        }));
      }
    };
    animateNext();
  };

  // KNAPSACK OPTIMIZER
  const runKnapsack = () => {
    if (animating) return;
    setMode('optimized');
    setAnimating(true);

    const n = chunks.length;
    const dp = Array(n + 1).fill(0).map(() => Array(BUDGET_LIMIT + 1).fill(0));
    
    // Scale value to integer for DP mapping
    for (let i = 1; i <= n; i++) {
      const chunk = chunks[i - 1];
      const weight = chunk.tokens;
      const val = Math.round(chunk.compositeScore * 1000); // Scale up
      
      for (let w = 0; w <= BUDGET_LIMIT; w++) {
        if (weight <= w) {
          dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weight] + val);
        } else {
          dp[i][w] = dp[i - 1][w];
        }
      }
    }

    let w = BUDGET_LIMIT;
    const selected = [];
    for (let i = n; i > 0; i--) {
      const chunk = chunks[i - 1];
      const scaledVal = Math.round(chunk.compositeScore * 1000);
      if (dp[i][w] !== dp[i - 1][w]) {
        selected.push(chunk);
        w -= chunk.tokens;
      }
    }

    // Animate the selections
    const newSelected = new Set();
    let queue = [];
    let cumulative = 0;
    
    // Sort selected by score descending for pleasant presentation
    selected.sort((a,b) => b.compositeScore - a.compositeScore);

    for (let c of selected) {
      newSelected.add(c.id);
      cumulative += c.tokens;
      queue.push(new Set(newSelected));
    }

    let i = 0;
    const animateNext = () => {
      if (i < queue.length) {
        setSelectedIds(queue[i]);
        i++;
        setTimeout(animateNext, 200);
      } else {
        setAnimating(false);
        const optAverage = selected.reduce((sum, c) => sum + c.compositeScore, 0) / selected.length;
        
        // Calculate greedy scores if not already run
        const greedyIds = new Set();
        let greedyTokens = 0;
        const sorted = [...chunks].sort((a, b) => b.compositeScore - a.compositeScore);
        for (let c of sorted) {
          if (greedyTokens + c.tokens <= BUDGET_LIMIT) {
            greedyIds.add(c.id);
            greedyTokens += c.tokens;
          }
        }
        const greedyAverage = sorted.filter(c => greedyIds.has(c.id)).reduce((sum, c) => sum + c.compositeScore, 0) / greedyIds.size;

        const improvement = ((optAverage - greedyAverage) / greedyAverage) * 100;
        
        setComparison({
          greedy: {
            score: parseFloat(greedyAverage.toFixed(3)),
            tokens: greedyTokens,
            chunks: greedyIds.size,
            ids: greedyIds
          },
          opt: {
            score: parseFloat(optAverage.toFixed(3)),
            tokens: cumulative,
            chunks: selected.length,
            ids: newSelected
          },
          improvement: parseFloat(improvement.toFixed(1))
        });

        // Trigger callback to propagate optimal configuration to Module 6
        if (onOptimizerSelect) {
          onOptimizerSelect({
            coverage: 100, // Satisfies all 6 decomp elements
            tokensUsed: cumulative,
            averageScore: optAverage,
            selectedCount: selected.length
          });
        }
      }
    };
    animateNext();
  };

  const resetToManual = () => {
    setMode('manual');
    setSelectedIds(new Set([10, 7, 4, 13, 1]));
    setComparison(null);
  };

  // Setup stacked data for Recharts stacked bar
  const selectedChunksData = chunks
    .filter(c => selectedIds.has(c.id))
    .map(c => ({
      name: 'Budget Allocation',
      [c.label]: c.tokens,
      id: c.id,
      category: c.category
    }));

  const stackedBarData = [
    selectedChunksData.reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, { name: 'Allocation' })
  ];

  const categoryColors = {
    Financial: '#3b82f6', // blue
    News: '#60a5fa', // light-blue
    Industry: '#818cf8', // indigo-light
    Engagement: '#10b981', // emerald
    Competitive: '#34d399', // emerald-light
    Credentials: '#6b7280', // gray
    People: '#a78bfa', // purple
    Regulatory: '#f59e0b', // amber
    Meeting: '#ec4899' // pink
  };

  const sourceColors = {
    CRM: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    Web: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    Docs: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    Profile: 'text-purple-400 border-purple-500/20 bg-purple-500/5'
  };

  return (
    <div className="module-container flex flex-col justify-between h-full" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* TOP ROW: Gauges, counters, optimization controls */}
      <div className="glass-panel mb-5" style={{ padding: '18px 24px', marginBottom: '16px' }}>
        <div className="flex justify-between items-center flex-wrap gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Budget fill gauge */}
          <div className="flex-1 min-w-[280px]" style={{ flex: '1 1 280px' }}>
            <div className="flex justify-between text-xs font-mono mb-1.5" style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', marginBottom: '6px' }}>
              <span className="text-slate-400">Token Budget: 4000</span>
              <span className={totalTokens > BUDGET_LIMIT ? 'text-red-400 font-bold' : 'text-cyan-400'}>
                Selected Tokens: {totalTokens.toLocaleString()} / 4,000
              </span>
            </div>
            
            {/* Horizontal progress bar */}
            <div className="progress-bg w-full h-3 rounded-full bg-slate-950/80 border border-slate-800/80 overflow-hidden"
              style={{
                width: '100%', height: '12px', borderRadius: '6px', backgroundColor: 'rgba(5, 7, 12, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden', position: 'relative'
              }}
            >
              <div className={`progress-fill h-full rounded-full transition-all duration-300 ${totalTokens > BUDGET_LIMIT ? 'bg-red-500' : 'bg-cyan-400'}`}
                style={{
                  height: '100%',
                  width: `${Math.min((totalTokens / BUDGET_LIMIT) * 100, 100)}%`,
                  backgroundColor: totalTokens > BUDGET_LIMIT ? '#ef4444' : '#22d3ee',
                  boxShadow: totalTokens > BUDGET_LIMIT ? '0 0 10px rgba(239,68,68,0.4)' : '0 0 10px rgba(34,211,238,0.4)',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Average Composite Quality Score counter */}
          <div className="text-center px-6 border-x border-slate-800/80" style={{ textAlign: 'center', padding: '0 24px', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500" style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono', color: '#6b7280', letterSpacing: '0.5px' }}>
              Composite Quality
            </div>
            <div className="text-2xl font-bold text-white font-mono mt-0.5" style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'JetBrains Mono', color: '#fff' }}>
              {averageScore.toFixed(3)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={resetToManual}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                mode === 'manual'
                  ? 'bg-slate-800 text-white border-slate-700 shadow-md shadow-black/30'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
              style={{
                padding: '8px 14px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                borderColor: mode === 'manual' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                backgroundColor: mode === 'manual' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(13, 16, 26, 0.2)',
                color: mode === 'manual' ? '#fff' : '#9ca3af'
              }}
            >
              Manual Mode
            </button>
            
            <button
              onClick={runGreedy}
              disabled={animating}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                mode === 'greedy'
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-md shadow-blue-500/5'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
              style={{
                padding: '8px 14px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid', borderRadius: '8px', cursor: animating ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                borderColor: mode === 'greedy' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.04)',
                backgroundColor: mode === 'greedy' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(13, 16, 26, 0.2)',
                color: mode === 'greedy' ? '#60a5fa' : '#9ca3af',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Greedy Top-K
            </button>
            
            <button
              onClick={runKnapsack}
              disabled={animating}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                mode === 'optimized'
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-indigo-400'
              }`}
              style={{
                padding: '8px 14px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid', borderRadius: '8px', cursor: animating ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                borderColor: mode === 'optimized' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.04)',
                backgroundColor: mode === 'optimized' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(13, 16, 26, 0.2)',
                color: mode === 'optimized' ? '#a5b4fc' : '#9ca3af',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Zap className="w-3.5 h-3.5" />
              Optimizer
            </button>
          </div>

        </div>
      </div>

      {/* MAIN TWO-COLUMN VIEW */}
      <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', flexGrow: 1, overflow: 'auto' }}>
        
        {/* LEFT COLUMN: 14 Chunks Library */}
        <div className="glass-panel" style={{ padding: '20px', overflowY: 'auto' }}>
          <div className="flex justify-between items-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 className="font-bold text-slate-200" style={{ fontSize: '0.98rem', color: '#f3f4f6', margin: 0 }}>Available Chunks Library ({chunks.length})</h4>
            <span className="text-[10px] font-mono text-slate-500" style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: '#6b7280' }}>Sorted by Composite Score</span>
          </div>

          {totalTokens > BUDGET_LIMIT && (
            <div className="p-3 mb-4 rounded-xl border border-red-500/10 bg-red-500/5 text-xs text-red-300 flex items-center gap-2 animate-bounce" style={{ padding: '10px 12px', marginBottom: '12px', border: '1px solid rgba(239, 68, 68, 0.15)', backgroundColor: 'rgba(239, 68, 68, 0.04)', borderRadius: '8px', color: '#f87171', display: 'flex', gap: '8px' }}>
              <Info className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>Over budget — remove a chunk.</span>
            </div>
          )}

          {/* Source Tabs Filter */}
          <div className="flex gap-1.5 mb-4" style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['All', 'CRM', 'Web', 'Docs', 'Profile'].map((source) => {
              const count = source === 'All' 
                ? chunks.length 
                : chunks.filter(c => c.source === source).length;
              const isActive = activeSourceFilter === source;
              return (
                <button
                  key={source}
                  onClick={() => setActiveSourceFilter(source)}
                  className={`px-3 py-1 text-[10px] font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold' 
                      : 'bg-slate-950/20 border-slate-800/80 text-slate-500 hover:text-slate-400'
                  }`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.68rem',
                    fontFamily: 'JetBrains Mono',
                    borderRadius: '6px',
                    border: '1px solid',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderColor: isActive ? 'rgba(99, 102, 241, 0.3)' : 'var(--panel-border)',
                    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.05)' : 'rgba(5, 7, 12, 0.3)',
                    color: isActive ? '#a5b4fc' : 'var(--text-muted)'
                  }}
                >
                  {source} ({count})
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2.5" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {chunks
              .filter(chunk => activeSourceFilter === 'All' || chunk.source === activeSourceFilter)
              .map((chunk) => {
              const isSelected = selectedIds.has(chunk.id);
              const srcTheme = sourceColors[chunk.source] || 'text-slate-400';
              
              return (
                <div
                  key={chunk.id}
                  onClick={() => toggleChunk(chunk.id)}
                  className={`chunk-card p-3.5 border rounded-xl flex items-center gap-4 transition-all duration-300 ${
                    isSelected
                      ? 'border-indigo-500/50 bg-indigo-500/5 shadow-md shadow-indigo-500/5 scale-[1.005]'
                      : 'border-slate-800 bg-slate-900/10 hover:bg-slate-900/30'
                  } ${mode !== 'manual' ? 'cursor-not-allowed opacity-85' : 'cursor-pointer hover:border-slate-700/60'}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 14px',
                    border: '1px solid',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    borderColor: isSelected ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.03)' : 'rgba(13, 16, 26, 0.15)',
                    boxShadow: isSelected ? '0 4px 15px rgba(99,102,241,0.05)' : 'none',
                    opacity: mode !== 'manual' && !isSelected ? 0.6 : 1
                  }}
                >
                  {/* Select Checkbox */}
                  <div className="checkbox-holder flex-shrink-0" style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-950/80'
                      }`}
                      style={{
                        width: '20px', height: '20px', borderRadius: '4px', border: '1px solid',
                        borderColor: isSelected ? '#6366f1' : 'rgba(255, 255, 255, 0.15)',
                        backgroundColor: isSelected ? '#6366f1' : 'rgba(5, 7, 12, 0.8)',
                        display: 'flex', alignItems: 'center', justify: 'center',
                        color: '#fff'
                      }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Chunk content details */}
                  <div className="flex-grow min-w-0" style={{ flexGrow: 1, minWidth: 0 }}>
                    <div className="flex justify-between items-start gap-2 mb-1" style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                      <span className="font-semibold text-slate-200 text-xs" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e5e7eb', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.4em', lineHeight: '1.2em' }}>
                        {chunk.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px]" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.68rem' }}>
                      <span className="font-semibold px-1.5 py-0.5 rounded text-[9px]"
                        style={{
                          backgroundColor: `${categoryColors[chunk.category]}15`,
                          border: `1px solid ${categoryColors[chunk.category]}30`,
                          color: categoryColors[chunk.category],
                          borderRadius: '4px'
                        }}
                      >
                        {chunk.category}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                      
                      <span className={`font-semibold border px-1.5 py-0.2 rounded ${srcTheme}`}
                        style={{
                          fontSize: '0.62rem', border: '1px solid', padding: '1px 4px', borderRadius: '4px',
                          borderColor: srcTheme.includes('border') ? '' : 'rgba(255,255,255,0.08)',
                          color: srcTheme.includes('text') ? '' : '#fff'
                        }}
                      >
                        {chunk.source}
                      </span>
                      
                      {/* Technical metric bars */}
                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                      <div className="flex items-center gap-1.5" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="text-slate-500">Rel:</span>
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden" style={{ width: '48px', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div className="bg-blue-400 h-full" style={{ width: `${chunk.relevance * 100}%`, height: '100%', backgroundColor: '#60a5fa' }} />
                        </div>
                      </div>
                      
                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                      <div className="flex items-center gap-1.5" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="text-slate-500">Fresh:</span>
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden" style={{ width: '48px', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div className="bg-emerald-400 h-full" style={{ width: `${chunk.freshness * 100}%`, height: '100%', backgroundColor: '#34d399' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Composite value bubble */}
                  <div className="flex-shrink-0 text-right font-mono" style={{ fontFamily: 'JetBrains Mono', textAlign: 'right' }}>
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest" style={{ fontSize: '0.58rem', color: '#6b7280' }}>Score</div>
                    <div className="text-sm font-bold text-indigo-300" style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#a5b4fc' }}>
                      {chunk.compositeScore.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Selection Visualizer */}
        <div className="flex flex-col gap-5" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* GREEDY SELECTION COMPLETED CARD */}
          {mode === 'greedy' && comparison?.greedy && !comparison?.opt && (
            <div className="glass-panel animate-fade-in" style={{ padding: '20px', border: '1px solid rgba(59, 130, 246, 0.3)', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
              <div className="flex items-start gap-2.5 text-xs text-blue-200">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5 animate-pulse" />
                <span>
                  Greedy selected <strong>{comparison.greedy.chunks}</strong> chunks. Quality score: <strong>{comparison.greedy.score.toFixed(2)}</strong>. Tokens used: <strong>{comparison.greedy.tokens.toLocaleString()}</strong>
                </span>
              </div>
            </div>
          )}

          {/* COMPARISON RESULTS SCREEN */}
          {comparison && comparison.opt && (
            <div className="glass-panel animate-fade-in" style={{ padding: '20px', border: '1px solid rgba(99, 102, 241, 0.25)', backgroundColor: 'rgba(99, 102, 241, 0.03)' }}>
              <div className="text-center mb-3" style={{ textAlign: 'center', marginBottom: '12px' }}>
                <span className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#818cf8', letterSpacing: '1px' }}>
                  SELECTION COMPARISON
                </span>
              </div>
              
              <table className="w-full text-xs text-left text-slate-400 border-collapse mb-4" style={{ width: '100%', fontSize: '0.75rem', color: '#9ca3af', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <thead>
                  <tr className="border-b border-slate-800" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th className="pb-2 font-semibold text-slate-200" style={{ paddingBottom: '8px', color: '#e5e7eb' }}>Method</th>
                    <th className="pb-2 font-semibold text-slate-200 text-center" style={{ paddingBottom: '8px', color: '#e5e7eb', textAlign: 'center' }}>Quality</th>
                    <th className="pb-2 font-semibold text-slate-200 text-center" style={{ paddingBottom: '8px', color: '#e5e7eb', textAlign: 'center' }}>Tokens</th>
                    <th className="pb-2 font-semibold text-slate-200 text-center" style={{ paddingBottom: '8px', color: '#e5e7eb', textAlign: 'center' }}>Chunks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-900" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td className="py-2.5 font-medium" style={{ padding: '10px 0' }}>Greedy</td>
                    <td className="py-2.5 font-mono text-center" style={{ padding: '10px 0', fontFamily: 'JetBrains Mono', textAlign: 'center' }}>{comparison.greedy.score.toFixed(2)}</td>
                    <td className="py-2.5 font-mono text-center text-blue-400" style={{ padding: '10px 0', fontFamily: 'JetBrains Mono', textAlign: 'center', color: '#60a5fa' }}>{comparison.greedy.tokens}</td>
                    <td className="py-2.5 font-mono text-center" style={{ padding: '10px 0', fontFamily: 'JetBrains Mono', textAlign: 'center' }}>{comparison.greedy.chunks}</td>
                  </tr>
                  <tr className="border-b border-slate-900" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td className="py-2.5 font-bold text-indigo-300" style={{ padding: '10px 0', color: '#a5b4fc', fontWeight: 'bold' }}>Optimizer</td>
                    <td className="py-2.5 font-mono text-center font-bold text-indigo-300" style={{ padding: '10px 0', fontFamily: 'JetBrains Mono', textAlign: 'center', color: '#a5b4fc', fontWeight: 'bold' }}>{comparison.opt.score.toFixed(2)}</td>
                    <td className="py-2.5 font-mono text-center font-bold text-cyan-400" style={{ padding: '10px 0', fontFamily: 'JetBrains Mono', textAlign: 'center', color: '#22d3ee', fontWeight: 'bold' }}>{comparison.opt.tokens}</td>
                    <td className="py-2.5 font-mono text-center font-bold text-indigo-300" style={{ padding: '10px 0', fontFamily: 'JetBrains Mono', textAlign: 'center', color: '#a5b4fc', fontWeight: 'bold' }}>{comparison.opt.chunks}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-cyan-400" style={{ padding: '10px 0', color: '#22d3ee', fontWeight: 'bold' }}>Improvement</td>
                    <td className="py-2.5 font-mono text-center font-bold text-cyan-400" style={{ padding: '10px 0', fontFamily: 'JetBrains Mono', textAlign: 'center', color: '#22d3ee', fontWeight: 'bold' }}>+{comparison.improvement}%</td>
                    <td className="py-2.5 font-mono text-center text-slate-600" style={{ padding: '10px 0', textAlign: 'center' }}>-</td>
                    <td className="py-2.5 font-mono text-center text-slate-600" style={{ padding: '10px 0', textAlign: 'center' }}>-</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/10 flex items-start gap-2.5 text-xs text-indigo-200"
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(99, 102, 241, 0.04)',
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  gap: '10px',
                  fontSize: '0.75rem',
                  lineHeight: '1.4'
                }}
              >
                <Zap className="w-4 h-4 text-indigo-400 flex-shrink-0 animate-pulse mt-0.5" />
                <span>
                  The optimizer found a <strong>{comparison.improvement}%</strong> quality improvement by swapping <strong>"{chunks.find(c => comparison.greedy.ids.has(c.id) && !comparison.opt.ids.has(c.id))?.label || 'larger documents'}"</strong> for <strong>"{chunks.find(c => comparison.opt.ids.has(c.id) && !comparison.greedy.ids.has(c.id))?.label || 'targeted elements'}"</strong> — same token budget, better signal.
                </span>
              </div>
            </div>
          )}

          {/* VISUALIZER CHARTS PANEL */}
          <div className="glass-panel" style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <h4 className="font-bold text-slate-200 mb-3" style={{ fontSize: '0.98rem', color: '#f3f4f6', marginBottom: '12px', margin: 0 }}>Allocation Breakdown</h4>
            
            {/* Horizontal visual allocation bar */}
            <div className="flex-1 flex flex-col justify-center min-h-[140px]" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {selectedIds.size === 0 ? (
                <div className="text-center text-xs text-slate-500 p-6 border border-dashed border-slate-800 rounded-xl"
                  style={{
                    textAlign: 'center', fontSize: '0.75rem', color: '#6b7280', padding: '20px', border: '1px dashed rgba(255, 255, 255, 0.08)', borderRadius: '10px'
                  }}
                >
                  Select context chunks on the left to review the relative budget allocation map.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Proportional Recharts stacked bar */}
                  <div className="flex-col gap-1.5" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span className="text-[10px] font-mono text-slate-500" style={{ fontSize: '0.65rem', fontFamily: 'JetBrains Mono', color: '#6b7280' }}>Token Allocation Map (Recharts Stacked Bar)</span>
                    <div className="w-full bg-slate-950/80 rounded-lg p-1 border border-slate-800" style={{ width: '100%', height: '48px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={stackedBarData}
                          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                        >
                          <XAxis type="number" domain={[0, BUDGET_LIMIT]} hide />
                          <YAxis type="category" dataKey="name" hide />
                          {chunks
                            .filter(c => selectedIds.has(c.id))
                            .map((chunk) => (
                              <Bar
                                key={chunk.id}
                                dataKey={chunk.label}
                                stackId="a"
                                fill={categoryColors[chunk.category] || '#6366f1'}
                                isAnimationActive={false}
                              />
                            ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Tiny color legend for categories */}
                  <div className="flex flex-wrap gap-2 justify-center" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                    {Array.from(new Set(chunks.filter(c => selectedIds.has(c.id)).map(c => c.category))).map((cat) => {
                      const color = categoryColors[cat] || '#6366f1';
                      return (
                        <div key={cat} className="flex items-center gap-1 text-[9px] text-slate-400" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.58rem', color: '#9ca3af' }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }} />
                          <span>{cat}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SELECTION TABLE */}
            {selectedIds.size > 0 && (
              <div className="mt-4 border border-slate-900 rounded-lg overflow-hidden overflow-y-auto max-h-[220px]"
                style={{
                  marginTop: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  overflowY: 'auto',
                  maxHeight: '200px'
                }}
              >
                <table className="w-full text-[10px] text-left text-slate-400 border-collapse" style={{ width: '100%', fontSize: '0.7rem', color: '#9ca3af', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-900 font-mono" style={{ backgroundColor: 'rgba(5, 7, 12, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'JetBrains Mono', color: '#6b7280' }}>
                      <th className="p-2 text-center" style={{ padding: '8px', width: '40px', textAlign: 'center' }}>Rank</th>
                      <th className="p-2" style={{ padding: '8px' }}>Chunk</th>
                      <th className="p-2 text-right" style={{ padding: '8px', textAlign: 'right' }}>Tokens</th>
                      <th className="p-2 text-right" style={{ padding: '8px', textAlign: 'right' }}>Score</th>
                      <th className="p-2 text-right" style={{ padding: '8px', textAlign: 'right' }}>Cont. %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunks
                      .filter(c => selectedIds.has(c.id))
                      .map((chunk) => {
                        const contributionPct = ((chunk.tokens / totalTokens) * 100).toFixed(1);
                        const rankIndex = chunks.findIndex(c => c.id === chunk.id) + 1;
                        return (
                          <tr key={chunk.id} className="border-b border-slate-950/60" style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td className="p-2 text-center font-mono text-slate-500" style={{ padding: '8px', textAlign: 'center', fontFamily: 'JetBrains Mono' }}>#{rankIndex}</td>
                            <td className="p-2 font-medium text-slate-300 truncate max-w-[140px]" style={{ padding: '8px', color: '#d1d5db', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={chunk.label}>
                              {chunk.label}
                            </td>
                            <td className="p-2 text-right font-mono" style={{ padding: '8px', textAlign: 'right', fontFamily: 'JetBrains Mono' }}>{chunk.tokens}</td>
                            <td className="p-2 text-right font-mono text-indigo-400" style={{ padding: '8px', textAlign: 'right', fontFamily: 'JetBrains Mono', color: '#818cf8' }}>{chunk.compositeScore.toFixed(2)}</td>
                            <td className="p-2 text-right font-mono text-cyan-400" style={{ padding: '8px', textAlign: 'right', fontFamily: 'JetBrains Mono', color: '#22d3ee' }}>{contributionPct}%</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

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
            Context selection isn't a search problem — it's an optimization problem. Greedy top-K selection by relevance alone is provably suboptimal when chunks have different token costs and freshness profiles.
          </p>
        </div>
      </div>
    </div>
  );
}
