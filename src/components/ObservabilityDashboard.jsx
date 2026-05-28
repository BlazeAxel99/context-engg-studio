import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ReferenceLine 
} from 'recharts';
import { RefreshCw, Play, TrendingUp, ShieldCheck, Zap, Layers, AlertCircle, Clock } from 'lucide-react';

const RUN_1_DECISIONS = [
  { time: '09:42:01', text: 'Intent decomposed → 6 context requirements identified', status: 'pass' },
  { time: '09:42:02', text: '14 chunks retrieved from 4 sources using standardized MCP endpoints', status: 'pass' },
  { time: '09:42:03', text: '0-1 knapsack budget optimizer selected 9 chunks (3,847 tokens)', status: 'pass' },
  { time: '09:42:04', text: '3 high-volume raw chunks sent for context distillation (>500 tokens each)', status: 'pass' },
  { time: '09:42:05', text: 'Freshness threshold validation passed: all chunks within designated TTL limits', status: 'pass' },
  { time: '09:42:06', text: 'Context assembly and sorting complete: recency-first for news, relevance-first for docs', status: 'pass' },
  { time: '09:42:07', text: 'Prompt payloads sent to Claude-3.5-Sonnet core · Judge evaluation score: 8.4', status: 'pass' }
];

const INITIAL_RUNS_DATA = [
  { run: 'Run 1', Greedy: 6.2, Optimized: 8.1 },
  { run: 'Run 2', Greedy: 6.5, Optimized: 8.4 },
  { run: 'Run 3', Greedy: 5.9, Optimized: 7.9 },
  { run: 'Run 4', Greedy: 6.1, Optimized: 8.5 },
  { run: 'Run 5', Greedy: 6.4, Optimized: 8.3 },
  { run: 'Run 6', Greedy: 6.3, Optimized: 8.7 }
];

// Decays to ~0.3 at Day 2 to match the spec
const DECAY_DATA = [
  { day: 'Day 1', CRM: 1.0, News: 0.95, StaticDocs: 0.98 },
  { day: 'Day 2', CRM: 0.98, News: 0.30, StaticDocs: 0.98 }, // news reaches ~0.3 at Day 2
  { day: 'Day 3', CRM: 0.95, News: 0.10, StaticDocs: 0.98 }, // Day 3 vertical line (Meeting date)
  { day: 'Day 4', CRM: 0.92, News: 0.05, StaticDocs: 0.98 },
  { day: 'Day 5', CRM: 0.88, News: 0.02, StaticDocs: 0.98 },
  { day: 'Day 6', CRM: 0.85, News: 0.00, StaticDocs: 0.98 },
  { day: 'Day 7', CRM: 0.82, News: 0.00, StaticDocs: 0.98 }
];

const HEALTH_RADAR = [
  { subject: 'Coverage', Optimized: 95, Greedy: 75, fullMark: 100 },
  { subject: 'Freshness', Optimized: 87, Greedy: 65, fullMark: 100 },
  { subject: 'Compression', Optimized: 85, Greedy: 0, fullMark: 100 },
  { subject: 'Budget Eff.', Optimized: 96, Greedy: 82, fullMark: 100 },
  { subject: 'Diversity', Optimized: 90, Greedy: 60, fullMark: 100 },
  { subject: 'LLM Score', Optimized: 84, Greedy: 65, fullMark: 100 }
];

export default function ObservabilityDashboard({ initialStats }) {
  const [runNumber, setRunNumber] = useState(1);
  const [timestamp, setTimestamp] = useState('');
  
  // Dynamic metrics states
  const [metrics, setMetrics] = useState({
    coverage: 94,
    tokens: 3847,
    compression: 85,
    freshness: 0.87,
    judgeScore: 8.4,
    latency: 1.8
  });

  const [runsData, setRunsData] = useState(INITIAL_RUNS_DATA);
  const [radarData, setRadarData] = useState(HEALTH_RADAR);
  const [decisions, setDecisions] = useState(RUN_1_DECISIONS);
  
  // Reinforcement learning reinforcement state
  const [closedLoopActive, setClosedLoopActive] = useState(false);
  const [closedLoopApplied, setClosedLoopApplied] = useState(false);

  useEffect(() => {
    updateTimestamp();
  }, []);

  const updateTimestamp = () => {
    const d = new Date();
    setTimestamp(d.toLocaleTimeString() + ' (Local GMT)');
  };

  const handleSimulateRun = () => {
    const nextRun = runNumber + 1;
    setRunNumber(nextRun);
    updateTimestamp();
    
    // Reset closed loop
    setClosedLoopApplied(false);
    setClosedLoopActive(false);

    // Generate random, consistent metrics
    const coverage = Math.floor(Math.random() * 8) + 92; // 92% to 99%
    const tokens = Math.floor(Math.random() * 200) + 3750; // 3750 to 3950
    const compression = Math.floor(Math.random() * 6) + 80; // 80% to 86%
    
    // 25% chance of simulating a stale run!
    const isStaleRun = Math.random() < 0.25;
    const freshness = isStaleRun 
      ? parseFloat((Math.random() * 0.1 + 0.60).toFixed(2)) // 0.60 to 0.70 (stale)
      : parseFloat((Math.random() * 0.1 + 0.82).toFixed(2)); // 0.82 to 0.92 (fresh)

    const judgeScore = parseFloat((Math.random() * 0.6 + 8.2).toFixed(1));
    const latency = parseFloat((Math.random() * 0.4 + 1.6).toFixed(1));

    setMetrics({ coverage, tokens, compression, freshness, judgeScore, latency });

    // Update Runs Data
    const updatedRuns = [...runsData];
    updatedRuns.shift(); // Remove first element
    updatedRuns.push({
      run: `Run ${nextRun}`,
      Greedy: parseFloat((Math.random() * 0.6 + 6.0).toFixed(1)),
      Optimized: judgeScore
    });
    setRunsData(updatedRuns);

    // Update Radar Health
    const newRadar = HEALTH_RADAR.map(item => {
      if (item.subject === 'LLM Score') return { ...item, Optimized: Math.round(judgeScore * 10) };
      if (item.subject === 'Coverage') return { ...item, Optimized: coverage };
      if (item.subject === 'Freshness') return { ...item, Optimized: Math.round(freshness * 100) };
      if (item.subject === 'Compression') return { ...item, Optimized: compression };
      return item;
    });
    setRadarData(newRadar);

    // Update Decisions Log with random shifted logs
    const formatTime = (secondsShift) => {
      const d = new Date();
      d.setSeconds(d.getSeconds() + secondsShift);
      return d.toLocaleTimeString();
    };

    const newDecisions = [
      { time: formatTime(-7), text: `Intent decomposed → ${Math.floor(Math.random() * 2) + 5} requirements identified`, status: 'pass' },
      { time: formatTime(-6), text: 'MCP query dispatched: retrieved 14 context elements successfully', status: 'pass' },
      { time: formatTime(-5), text: `Dynamic 0-1 optimizer mapped and scheduled ${tokens} tokens`, status: 'pass' },
      { time: formatTime(-4), text: 'Stage-2 Compression Engine completed: 83% average distillation ratio', status: 'pass' },
      { 
        time: formatTime(-3), 
        text: freshness < 0.75 
          ? `⚠️ Active TTL validation warning: some live indexes are stale (${Math.round(freshness * 100)}%)` 
          : `Active TTL validation passed: all weighted values within refresh threshold (${Math.round(freshness * 100)}%)`, 
        status: freshness < 0.75 ? 'warning' : 'pass' 
      },
      { time: formatTime(-2), text: 'Ordered sequence indexing complete: recency-first configuration', status: 'pass' },
      { time: formatTime(-1), text: `Parallel pipeline validated · Judge output verified (Score: ${judgeScore})`, status: 'pass' }
    ];
    setDecisions(newDecisions);
  };

  // 'CLOSE THE LOOP' weights adaptation simulation
  const handleCloseLoop = () => {
    if (closedLoopActive) return;
    setClosedLoopActive(true);

    setTimeout(() => {
      setClosedLoopApplied(true);
      
      // Adapt quality stats upwards
      setMetrics(prev => ({
        ...prev,
        coverage: 100,
        freshness: 0.96,
        judgeScore: 9.2,
        tokens: 3912
      }));

      // Adjust Radar Chart to demonstrate reinforced optimization
      setRadarData(prev => prev.map(item => {
        if (item.subject === 'LLM Score') return { ...item, Optimized: 92 };
        if (item.subject === 'Freshness') return { ...item, Optimized: 96 };
        if (item.subject === 'Coverage') return { ...item, Optimized: 100 };
        return item;
      }));

      // Add a reinforced entry to the decision timeline
      const newD = [...decisions];
      newD.push({
        time: new Date().toLocaleTimeString(),
        text: "🔄 Reinforcement Loop: Swapped 'Roche Competitor Analysis' [-480t] for 'FDA Regulatory Updates' [+350t] based on Judge feedback. Net quality improved to 9.2.",
        status: 'reinforce'
      });
      setDecisions(newD);
      setClosedLoopActive(false);
    }, 1500); // 1.5s beautiful weight adjustment animation
  };

  const isFreshnessStale = metrics.freshness < 0.75;
  const freshnessColor = isFreshnessStale ? '#fbbf24' : '#34d399'; // yellow vs green
  const freshnessBorderClass = isFreshnessStale ? 'border-amber-500/30' : 'border-slate-800/80';

  return (
    <div className="module-container flex flex-col justify-between h-full" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      
      {/* DASHBOARD HEADER */}
      <div className="flex justify-between items-center mb-5" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="flex flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="section-title text-xl font-bold" style={{ color: '#fff', fontSize: '1.25rem', margin: 0 }}>
            PharmaCorp Advisory Prep · Context Pipeline Run #{runNumber}
          </h3>
          <span className="text-[10px] font-mono text-slate-500 mt-1" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: '#6b7280' }}>
            System Runtime Timestamp: {timestamp}
          </span>
        </div>
        
        <div className="flex gap-2.5" style={{ display: 'flex', gap: '10px' }}>
          {/* Close the loop button */}
          <button
            onClick={handleCloseLoop}
            disabled={closedLoopActive || closedLoopApplied}
            className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
              closedLoopApplied
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
            }`}
            style={{
              padding: '8px 14px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid', borderRadius: '8px', cursor: (closedLoopActive || closedLoopApplied) ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              borderColor: closedLoopApplied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)',
              backgroundColor: closedLoopApplied ? 'rgba(16, 185, 129, 0.04)' : 'rgba(99, 102, 241, 0.04)',
              color: closedLoopApplied ? '#34d399' : '#a5b4fc',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {closedLoopActive ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Adjusting Weights...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{closedLoopApplied ? 'Weights Reinforced! ✓' : 'Close the Loop (RL Weighting)'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleSimulateRun}
            className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-900 transition-all flex items-center gap-1.5"
            style={{
              padding: '8px 14px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: 'rgba(13, 16, 26, 0.2)', color: '#d1d5db', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Simulate New Run →</span>
          </button>
        </div>
      </div>

      {/* CLOSE THE LOOP OPTIMIZATION DELTA ANNOTATION */}
      {closedLoopApplied && (
        <div className="mb-5 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-slate-300 animate-fadeIn" style={{
          padding: '14px 18px',
          borderRadius: '12px',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          backgroundColor: 'rgba(16, 185, 129, 0.04)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          marginBottom: '16px'
        }}>
          <div className="flex items-center gap-2 mb-1.5" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
              Reinforcement Weights Applied (Optimization Delta)
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400" style={{ fontSize: '0.78rem', margin: 0, color: '#9ca3af', lineHeight: '1.4' }}>
            System adjusted Module 3 knapsack weight heuristics based on LLM Judge feedback. In the next run, low-impact competitive dossiers are automatically swapped out in favor of fresh regulatory guidelines to prevent silent compliance errors:
          </p>
          <div className="flex items-center gap-6 mt-3 font-mono text-[10px]" style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '12px', fontFamily: 'JetBrains Mono', fontSize: '0.68rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}>
              <span style={{ textDecoration: 'line-through' }}>Roche Competitor Analysis</span>
              <span className="bg-red-950/40 px-1.5 py-0.5 rounded border border-red-500/20" style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(127, 29, 29, 0.2)' }}>-480 tokens</span>
            </div>
            <span style={{ color: '#4b5563' }}>→</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
              <span style={{ fontWeight: 'bold' }}>FDA Regulatory Updates (Live)</span>
              <span className="bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20" style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)', backgroundColor: 'rgba(6, 78, 59, 0.2)' }}>+350 tokens</span>
            </div>
            <span className="text-[10px] text-emerald-400 ml-auto font-sans" style={{ fontSize: '0.72rem', color: '#34d399', fontFamily: 'system-ui', marginLeft: 'auto' }}>
              Net Quality Improvement: <strong>+9.5% accuracy</strong>
            </span>
          </div>
        </div>
      )}

      {/* 6 METRIC CARDS GRID (3x2) */}
      <div className="grid-layout mb-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        
        {/* Card 1: Context Coverage */}
        <div className="glass-panel group relative border border-slate-800/80 hover:border-emerald-500/20 transition-all" style={{ padding: '16px' }} title="Coverage = % of intent-decomposed context requirements satisfied by selected chunks">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1" style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Context Coverage Score</span>
          <div className="text-2xl font-bold font-mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'JetBrains Mono', color: '#34d399' }}>{metrics.coverage}%</div>
          <p className="text-[10px] text-slate-400 mt-1" style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '4px' }}>6 of 6 decomposed needs addressed</p>
          <span className="text-[9px] font-mono text-emerald-400 block mt-2" style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono', color: '#34d399', display: 'block', marginTop: '8px' }}>↑ +12% vs baseline (greedy)</span>
        </div>

        {/* Card 2: Token Budget Efficiency */}
        <div className="glass-panel group relative border border-slate-800/80 hover:border-cyan-500/20 transition-all" style={{ padding: '16px' }} title="Optimizer recovered 153 tokens vs. greedy selection — used for higher-quality chunks">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1" style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Token Budget Utilization</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'JetBrains Mono', color: '#22d3ee' }}>
            {metrics.tokens} / 4,000
          </div>
          <p className="text-[10px] text-slate-400 mt-1" style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '4px' }}>{((metrics.tokens / 4000) * 100).toFixed(1)}% efficiency</p>
          <div className="w-full h-1 bg-slate-900 rounded-full mt-2 overflow-hidden" style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
            <div className="bg-cyan-400 h-full" style={{ width: `${(metrics.tokens / 4000) * 100}%`, height: '100%', backgroundColor: '#22d3ee' }} />
          </div>
        </div>

        {/* Card 3: Compression Ratio */}
        <div className="glass-panel group relative border border-slate-800/80 hover:border-indigo-500/20 transition-all" style={{ padding: '16px' }} title="Compression ratio with signal preservation score. Target: >80% compression, >90% signal.">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1" style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Compression Ratio</span>
          <div className="text-2xl font-bold text-indigo-400 font-mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'JetBrains Mono', color: '#818cf8' }}>{metrics.compression}%</div>
          <p className="text-[10px] text-slate-400 mt-1" style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '4px' }}>780 → 118 tokens (quality preserved: 94%)</p>
          <span className="text-[9px] font-mono text-indigo-400 block mt-2" style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono', color: '#818cf8', display: 'block', marginTop: '8px' }}>✓ Preserving key advisory parameters</span>
        </div>

        {/* Card 4: Freshness Index */}
        <div className={`glass-panel group relative border ${freshnessBorderClass} transition-all`} style={{ padding: '16px' }} title="Weighted freshness across selected chunks. 0.0 = all stale, 1.0 = all real-time.">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1" style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Freshness Index</span>
          <div className="text-2xl font-bold font-mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'JetBrains Mono', color: freshnessColor }}>{metrics.freshness.toFixed(2)}</div>
          <p className="text-[10px] text-slate-400 mt-1" style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '4px' }}>
            {isFreshnessStale ? '⚠️ Warning: Some live chunks crossed TTL threshold' : 'All critical chunks within TTL'}
          </p>
          <span className="text-[9px] font-mono block mt-2" style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono', color: freshnessColor, display: 'block', marginTop: '8px' }}>
            {isFreshnessStale ? '⚠️ Stale context in propagation layer' : '✓ Validated CRM/Web indexes'}
          </span>
        </div>

        {/* Card 5: LLM Judge Score */}
        <div className="glass-panel group relative border border-slate-800/80 hover:border-emerald-500/20 transition-all" style={{ padding: '16px' }} title="Evaluation score from Claude LLM Judge step on prompt responsiveness.">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1" style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono', color: '#6b7280', display: 'block', marginBottom: '4px' }}>LLM Judge Score (Post-Output)</span>
          <div className="text-2xl font-bold font-mono flex items-center gap-1.5" style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'JetBrains Mono', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{metrics.judgeScore} / 10</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1" style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '4px' }}>+1.9 vs unoptimized context</p>
          
          {/* Trend sparkline of the last 5 runs using mini-Recharts */}
          <div style={{ width: '100%', height: '20px', marginTop: '8px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={runsData.slice(-5)}>
                <Line type="monotone" dataKey="Optimized" stroke="#34d399" strokeWidth={1.5} dot={{ r: 1.5, fill: '#34d399', strokeWidth: 0 }} activeDot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 6: Pipeline Latency */}
        <div className="glass-panel group relative border border-slate-800/80 hover:border-amber-500/20 transition-all" style={{ padding: '16px' }}>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1" style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Pipeline Latency</span>
          <div className="text-2xl font-bold text-amber-400 font-mono flex items-center gap-1.5" style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'JetBrains Mono', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock className="w-5 h-5 text-amber-400" />
            <span>{metrics.latency}s</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1" style={{ fontSize: '0.68rem', color: '#9ca3af', marginTop: '4px' }}>Intent decomp: 0.4s · Retrieval: 0.6s · Compression: 0.8s</p>
          <span className="text-[9px] font-mono text-slate-500 block mt-2" style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono', color: '#6b7280', display: 'block', marginTop: '8px' }}>Within 2.0s SLA target</span>
        </div>

      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid-layout mb-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        
        {/* Left: Quality by Run Bar chart */}
        <div className="glass-panel" style={{ padding: '20px', height: '260px' }}>
          <span className="text-xs font-semibold text-slate-300 block mb-4" style={{ fontSize: '0.78rem', color: '#d1d5db', fontWeight: 600, display: 'block', marginBottom: '16px' }}>Context Quality Score by Run</span>
          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={runsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="run" stroke="#9ca3af" fontSize={10} />
                <YAxis domain={[0, 10]} stroke="#9ca3af" fontSize={10} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', fontSize: '10px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Greedy" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Greedy Selection" />
                <Bar dataKey="Optimized" fill="#6366f1" radius={[4, 4, 0, 0]} name="Context Optimized" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Freshness Decay Line chart */}
        <div className="glass-panel" style={{ padding: '20px', height: '260px' }}>
          <span className="text-xs font-semibold text-slate-300 block mb-4" style={{ fontSize: '0.78rem', color: '#d1d5db', fontWeight: 600, display: 'block', marginBottom: '16px' }}>Freshness Decay Over Time (7-Day Metric)</span>
          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DECAY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} />
                <YAxis domain={[0.0, 1.0]} stroke="#9ca3af" fontSize={10} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', fontSize: '10px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="CRM" stroke="#10b981" name="CRM Core (Weighted)" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="News" stroke="#ef4444" name="Web/News (Live TTL)" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="StaticDocs" stroke="#6b7280" name="Static Reference" strokeWidth={1} dot={false} strokeDasharray="3 3" />
                {/* Vertical red dashed line at Day 3 matching the spec */}
                <ReferenceLine x="Day 3" stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Meeting date', fill: '#ef4444', fontSize: 10, position: 'top' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[8px] font-mono text-slate-500 block text-right mt-1" style={{ fontSize: '0.58rem', fontFamily: 'JetBrains Mono', color: '#6b7280', textAlign: 'right', display: 'block', marginTop: '4px' }}>
            ⚠️ Day 3 vertical threshold: Live data decays to critical margin. Context that crossed the TTL threshold before meeting day would have caused silent data errors.
          </span>
        </div>

      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid-layout mb-6" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '20px', marginBottom: '20px' }}>
        
        {/* Left: Health Radar Chart */}
        <div className="glass-panel" style={{ padding: '20px', height: '320px' }}>
          <span className="text-xs font-semibold text-slate-300 block mb-4" style={{ fontSize: '0.78rem', color: '#d1d5db', fontWeight: 600, display: 'block', marginBottom: '16px' }}>Pipeline Health</span>
          <div style={{ width: '100%', height: '240px', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4b5563" fontSize={7} />
                {/* Renamed Radar labels to match the spec */}
                <Radar name="Baseline (no optimization)" dataKey="Greedy" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                <Radar name="This run" dataKey="Optimized" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                <Legend wrapperStyle={{ fontSize: '9px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Decision timeline log */}
        <div className="glass-panel flex flex-col" style={{ padding: '20px', height: '320px', display: 'flex', flexDirection: 'column' }}>
          <span className="text-xs font-semibold text-slate-300 block mb-4" style={{ fontSize: '0.78rem', color: '#d1d5db', fontWeight: 600, display: 'block', marginBottom: '16px' }}>Context Decisions Log</span>
          
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3" style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {decisions.map((log, index) => (
              <div key={index} className="flex items-start gap-3 text-xs leading-normal" style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', lineHeight: '1.4' }}>
                <span className="font-mono text-slate-500 text-[10px] mt-0.5" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: '#6b7280', marginTop: '2px' }}>
                  {log.time}
                </span>
                
                {/* Dot coloring: green=pass, amber=warning, red=fail, cyan=reinforce */}
                {log.status === 'reinforce' ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22d3ee', marginTop: '6px' }} />
                ) : log.status === 'warning' ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fbbf24', marginTop: '6px' }} />
                ) : log.status === 'fail' ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', marginTop: '6px' }} />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', marginTop: '6px' }} />
                )}
                
                <span className={log.status === 'reinforce' ? 'text-cyan-300 font-semibold' : log.status === 'warning' ? 'text-amber-400 font-medium' : 'text-slate-300'} style={{ color: log.status === 'reinforce' ? '#22d3ee' : log.status === 'warning' ? '#fbbf24' : '#d1d5db', fontWeight: log.status === 'reinforce' ? 'bold' : 'normal' }}>
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FINAL QUOTE PANEL AND TAKEAWAYS */}
      <div className="border border-indigo-500/20 bg-indigo-500/5 rounded-xl p-6 text-center shadow-lg mb-4"
        style={{
          border: '1px solid rgba(99, 102, 241, 0.15)',
          backgroundColor: 'rgba(99, 102, 241, 0.03)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          marginBottom: '16px'
        }}
      >
        <blockquote className="text-lg italic font-semibold text-slate-200 mb-4" style={{ fontSize: '1.15rem', color: '#f3f4f6', fontStyle: 'italic', fontWeight: 600, margin: '0 0 16px 0' }}>
          "Context is not what you put in the prompt. Context is what you architect before the prompt."
        </blockquote>
        
        <div className="flex justify-center gap-3 flex-wrap" style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 rounded-full uppercase" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', fontWeight: 'bold', border: '1px solid rgba(99,102,241,0.2)', backgroundColor: 'rgba(99,102,241,0.03)', color: '#818cf8', padding: '6px 14px', borderRadius: '30px', letterSpacing: '1px' }}>
            Context has a lifecycle
          </span>
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 rounded-full uppercase" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', fontWeight: 'bold', border: '1px solid rgba(99,102,241,0.2)', backgroundColor: 'rgba(99,102,241,0.03)', color: '#818cf8', padding: '6px 14px', borderRadius: '30px', letterSpacing: '1px' }}>
            Selection is optimization
          </span>
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 rounded-full uppercase" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', fontWeight: 'bold', border: '1px solid rgba(99,102,241,0.2)', backgroundColor: 'rgba(99,102,241,0.03)', color: '#818cf8', padding: '6px 14px', borderRadius: '30px', letterSpacing: '1px' }}>
            Quality is measurable
          </span>
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
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        marginBottom: '10px'
      }}>
        <div className="flex gap-3" style={{ display: 'flex', gap: '12px' }}>
          <div className="insight-indicator text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#6366f1', letterSpacing: '1px' }}>KEY INSIGHT</div>
          <p className="insight-text text-sm leading-relaxed" style={{ fontSize: '0.88rem', color: '#d1d5db', margin: 0, lineHeight: '1.5' }}>
            Observability is the final layer of context engineering. By measuring coverage, compression, freshness, and LLM judge scores, we transform context assembly from an ad-hoc art into a rigorous, closed-loop software engineering discipline.
          </p>
        </div>
      </div>

    </div>
  );
}
