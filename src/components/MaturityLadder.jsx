import React, { useState, useEffect } from 'react';
import { Pencil, Database, Network, ArrowRight, Zap, Target, Search, Sliders, Scissors, Award, CheckCircle2, ChevronRight } from 'lucide-react';

export default function MaturityLadder({ onNavigateTab }) {
  const [selectedRung, setSelectedRung] = useState(3); // Default Context Engineer glowing
  const [pollResult, setPollResult] = useState('');
  const [animateLadder, setAnimateLadder] = useState(false);

  useEffect(() => {
    // Mount entry animation trigger
    const t = setTimeout(() => setAnimateLadder(true), 100);
    return () => clearTimeout(t);
  }, []);

  const rungs = [
    {
      id: 1,
      title: 'Prompt Engineer',
      icon: <Pencil className="w-5 h-5 text-amber-400" />,
      label: 'You craft better questions',
      description: 'You focus on how you ask. You iterate on phrasing, add examples, use chain-of-thought. The context window is a black box you fill manually.',
      color: 'amber',
      borderColor: 'border-amber-500/30',
      glowColor: 'shadow-amber-500/20',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/5',
    },
    {
      id: 2,
      title: 'RAG Practitioner',
      icon: (
        <div className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Database className="w-5 h-5 text-blue-400" />
          <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
        </div>
      ),
      label: 'You retrieve relevant documents',
      description: 'You connect a vector store. You embed documents, retrieve top-K chunks by similarity, inject them into the prompt. The context window is a container you fill from a retrieval system.',
      color: 'blue',
      borderColor: 'border-blue-500/30',
      glowColor: 'shadow-blue-500/20',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/5',
    },
    {
      id: 3,
      title: 'Context Engineer',
      icon: <Network className="w-5 h-5 text-cyan-400 animate-pulse" />,
      label: 'You architect the information lifecycle',
      description: 'You decompose intent into explicit information requirements. You treat context selection as a budget optimization problem. You compress, order, score, and propagate context across agents deliberately. The context window is an engineered artifact.',
      color: 'indigo-cyan',
      borderColor: 'border-cyan-500/50',
      glowColor: 'shadow-cyan-500/40',
      textColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  const handlePoll = (rungId) => {
    setSelectedRung(rungId);
    if (rungId === 1) {
      setPollResult("Most people start here. Today you'll see what's above.");
    } else if (rungId === 2) {
      setPollResult("You've got retrieval. But upstream of retrieval, there's a whole engineering layer invisible to most teams.");
    } else if (rungId === 3) {
      setPollResult("You're ahead. Today we make this systematic and measurable.");
    }
  };

  const pipelineStages = [
    { id: 1, label: '1. User Signal', isClickable: false, subtitle: 'User input/query' },
    { id: 2, label: '2. Intent Decomposition', isClickable: true, tab: 'decomp', subtitle: 'Identify information needs', annotation: '← Module 2' },
    { id: 3, label: '3. Context Need Specification', isClickable: true, tab: 'decomp', subtitle: 'Standardize requirements schema' },
    { id: 4, label: '4. Multi-Source Aggregation', isClickable: true, tab: 'decomp', subtitle: 'MCP-driven multi-source query' },
    { id: 5, label: '5. Budget-Constrained Selection', isClickable: true, tab: 'budget', subtitle: 'Optimize token budgets', annotation: '← Module 3' },
    { id: 6, label: '6. Compression & Distillation', isClickable: true, tab: 'compress', subtitle: 'Maximize signal-to-noise ratio', annotation: '← Module 4' },
    { id: 7, label: '7. Assembly & Ordering', isClickable: false, subtitle: 'Context token sorting/position' },
    { id: 8, label: '8. THE PROMPT WINDOW', isHighlight: true, subtitle: 'Where most demos start', annotation: '← Where most demos start' },
    { id: 9, label: '9. LLM Processing', isClickable: false, subtitle: 'LLM reasoning core' },
    { id: 10, label: '10. Quality Scoring + Feedback Loop', isClickable: true, tab: 'observe', subtitle: 'Module 6 observability loop', annotation: '← Module 6' },
  ];

  return (
    <div className="module-container flex flex-col justify-between h-full" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px', flexGrow: 1, overflow: 'auto' }}>
        
        {/* LEFT COLUMN: Maturity Ladder & Poll */}
        <div className="flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
            <h3 className="section-title text-xl font-bold mb-6 flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1.25rem', marginBottom: '20px' }}>
              <Award className="w-6 h-6 text-indigo-400" />
              The Context Maturity Ladder
            </h3>
            
            {/* Vertical Ladder Structure with entry animation */}
            <div className="vertical-ladder" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px', 
                position: 'relative',
                transform: animateLadder ? 'translateY(0)' : 'translateY(20px)',
                opacity: animateLadder ? 1 : 0,
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {rungs.map((rung) => {
                const isSelected = selectedRung === rung.id;
                const isRung3 = rung.id === 3;
                return (
                  <div
                    key={rung.id}
                    className={`rung-card border rounded-xl p-5 transition-all duration-300 ${isSelected ? `${rung.borderColor} ${rung.bgColor} shadow-lg ${rung.glowColor} scale-[1.02]` : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/60'}`}
                    style={{
                      borderWidth: '1px',
                      borderRadius: '12px',
                      padding: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      borderColor: isSelected 
                        ? (isRung3 ? 'rgba(34, 211, 238, 0.5)' : '') 
                        : 'rgba(255, 255, 255, 0.08)',
                      backgroundColor: isSelected 
                        ? (isRung3 ? 'transparent' : '') 
                        : 'rgba(13, 16, 26, 0.3)',
                      backgroundImage: isSelected && isRung3 
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(34, 211, 238, 0.18) 100%)' 
                        : '',
                      boxShadow: isSelected 
                        ? (isRung3 ? '0 8px 30px rgba(34, 211, 238, 0.25)' : '0 8px 30px rgba(99, 102, 241, 0.15)') 
                        : 'none'
                    }}
                    onClick={() => handlePoll(rung.id)}
                  >
                    <div className="flex items-start gap-4" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div className="rung-icon-wrapper p-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '10px' }}>
                        {rung.icon}
                      </div>
                      <div className="rung-content">
                        <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="font-mono text-xs uppercase opacity-60" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', opacity: 0.5 }}>Level 0{rung.id}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                          <h4 className="text-lg font-bold" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{rung.title}</h4>
                        </div>
                        <p className={`font-semibold mt-1 mb-2 ${rung.textColor}`} style={{ fontSize: '0.88rem', fontWeight: 600, marginTop: '4px', marginBottom: '8px' }}>
                          {rung.label}
                        </p>
                        <p className="text-slate-400 text-sm leading-relaxed" style={{ color: '#9ca3af', fontSize: '0.82rem', lineHeight: '1.45' }}>
                          {rung.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* POLL COMPONENT */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 className="text-md font-bold mb-3" style={{ fontSize: '0.98rem', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>Where are you?</h4>
            <div className="poll-buttons flex gap-3 mb-4" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={() => handlePoll(1)}
                className={`flex-1 py-2.5 px-4 font-semibold text-xs border rounded-lg transition-all ${selectedRung === 1 ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-md shadow-amber-500/10' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-900'}`}
                style={{
                  flex: 1, padding: '10px 16px', fontSize: '0.78rem', fontWeight: 600, borderRadius: '8px', border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                  borderColor: selectedRung === 1 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                  backgroundColor: selectedRung === 1 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(13, 16, 26, 0.4)',
                  color: selectedRung === 1 ? '#fbbf24' : '#9ca3af'
                }}
              >
                Rung 1
              </button>
              <button
                onClick={() => handlePoll(2)}
                className={`flex-1 py-2.5 px-4 font-semibold text-xs border rounded-lg transition-all ${selectedRung === 2 ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-md shadow-blue-500/10' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-900'}`}
                style={{
                  flex: 1, padding: '10px 16px', fontSize: '0.78rem', fontWeight: 600, borderRadius: '8px', border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                  borderColor: selectedRung === 2 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                  backgroundColor: selectedRung === 2 ? 'rgba(59, 130, 246, 0.08)' : 'rgba(13, 16, 26, 0.4)',
                  color: selectedRung === 2 ? '#60a5fa' : '#9ca3af'
                }}
              >
                Rung 2
              </button>
              <button
                onClick={() => handlePoll(3)}
                className={`flex-1 py-2.5 px-4 font-semibold text-xs border rounded-lg transition-all ${selectedRung === 3 ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-md shadow-indigo-500/10' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-900'}`}
                style={{
                  flex: 1, padding: '10px 16px', fontSize: '0.78rem', fontWeight: 600, borderRadius: '8px', border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                  borderColor: selectedRung === 3 ? 'rgba(34, 211, 238, 0.5)' : 'rgba(255, 255, 255, 0.08)',
                  backgroundColor: selectedRung === 3 ? 'rgba(34, 211, 238, 0.08)' : 'rgba(13, 16, 26, 0.4)',
                  color: selectedRung === 3 ? '#22d3ee' : '#9ca3af'
                }}
              >
                Rung 3
              </button>
            </div>

            {/* Poll Feedback Banner */}
            <div className="poll-feedback p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 flex items-start gap-3 shadow-inner"
              style={{
                borderRadius: '10px',
                padding: '14px',
                backgroundColor: 'rgba(99, 102, 241, 0.04)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <Zap className="w-5 h-5 text-indigo-400 flex-shrink-0 animate-pulse" />
              <p className="text-sm font-semibold text-indigo-200" style={{ fontSize: '0.85rem', color: '#e0e7ff', margin: 0 }}>
                {pollResult || "Click one of the survey buttons above to see our maturity insights."}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Pipeline Flowchart */}
        <div className="glass-panel" style={{ padding: '24px', overflowY: 'auto' }}>
          <h3 className="section-title text-xl font-bold mb-4 flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1.25rem', marginBottom: '16px' }}>
            <Target className="w-6 h-6 text-cyan-400" />
            Context Engineering Pipeline
          </h3>
          <p className="text-slate-400 text-xs mb-5 leading-relaxed" style={{ color: '#9ca3af', fontSize: '0.78rem', lineHeight: '1.45', marginBottom: '16px' }}>
            Upstream components systematically specify and select context. Downstream components observe the feedback loop. Click the highlighted stages to inspect their modules.
          </p>

          <div className="pipeline-flow-vertical" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* UPSTREAM LABEL */}
            <div className="text-[10px] font-mono tracking-widest text-slate-500 mb-1" style={{ letterSpacing: '2px', textAlign: 'center' }}>[UPSTREAM]</div>

            {pipelineStages.map((stage) => {
              // RENDER DOWNSTREAM LABEL BEFORE STAGE 10
              const renderDownstream = stage.id === 10;

              if (stage.isHighlight) {
                return (
                  <div
                    key={stage.id}
                    className="pipeline-boundary py-2 border-y text-amber-400/90 bg-amber-500/5 my-2 border-dashed border-amber-500/30"
                    style={{
                      borderTop: '1px dashed rgba(245, 158, 11, 0.3)',
                      borderBottom: '1px dashed rgba(245, 158, 11, 0.3)',
                      padding: '10px 14px',
                      margin: '10px 0',
                      backgroundColor: 'rgba(245, 158, 11, 0.04)',
                    }}
                  >
                    <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-bold text-sm" style={{ fontWeight: 800, fontSize: '0.85rem' }}>8. THE PROMPT WINDOW</span>
                      <span className="font-mono text-xs text-amber-400/80" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}>← Where most demos start</span>
                    </div>
                    <div className="text-[10px] text-amber-500/70 mt-1" style={{ fontSize: '0.68rem', opacity: 0.7, textAlign: 'left' }}>Where most demos start</div>
                  </div>
                );
              }

              return (
                <React.Fragment key={stage.id}>
                  {renderDownstream && (
                    <div className="text-[10px] font-mono tracking-widest text-slate-500 my-2" style={{ letterSpacing: '2px', textAlign: 'center' }}>[DOWNSTREAM]</div>
                  )}
                  <div
                    onClick={() => stage.isClickable && onNavigateTab(stage.tab)}
                    className={`pipeline-row-item border rounded-lg p-3 flex justify-between items-center transition-all ${
                      stage.isClickable
                        ? 'border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 cursor-pointer shadow-md hover:scale-[1.01]'
                        : 'border-slate-800/40 bg-slate-950/20 opacity-80'
                    }`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      transition: 'all 0.2s',
                      borderColor: stage.isClickable ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      backgroundColor: stage.isClickable ? 'rgba(99, 102, 241, 0.04)' : 'rgba(13, 16, 26, 0.15)',
                      cursor: stage.isClickable ? 'pointer' : 'default',
                      transform: 'scale(1)'
                    }}
                  >
                    <div className="flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className={`text-sm font-semibold ${stage.isClickable ? 'text-indigo-200' : 'text-slate-400'}`} style={{ fontSize: '0.85rem', fontWeight: 600, color: stage.isClickable ? '#e0e7ff' : '#9ca3af' }}>
                        {stage.label}
                      </span>
                      <span className="text-[11px] text-slate-500" style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '2px' }}>
                        {stage.subtitle}
                      </span>
                    </div>
                    {stage.isClickable && (
                      <div className="flex items-center gap-1.5 text-xs font-mono font-semibold" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'JetBrains Mono', fontSize: '0.72rem' }}>
                        {stage.annotation && (
                          <span className="text-[11px] text-indigo-400/80 mr-1.5" style={{ color: '#818cf8', fontWeight: 'normal' }}>
                            {stage.annotation}
                          </span>
                        )}
                        <span style={{ color: '#6366f1' }}>INSPECT</span>
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
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
            <strong>The Paradigm Shift:</strong> Context engineering isn't just about asking better questions. It is a systematic process of intent decomposition, multi-source budget selection, distillation, and validation that treats the context window as a structured, quantifiable runtime environment.
          </p>
        </div>
      </div>
    </div>
  );
}
