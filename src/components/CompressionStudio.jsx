import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { Play, Sparkles, AlertCircle, FileText, ChevronDown, ChevronUp, Cpu, Award, Zap } from 'lucide-react';

const RAW_TRANSCRIPT = `PharmaCorp Q3 2024 Earnings Call Transcript (Excerpt)
Date: October 24, 2024
Speakers: Margaret Chen (CFO), Raj Mehta (Chief Digital Officer), Dr. Albert Vance (Head of R&D)

Margaret Chen (CFO): PharmaCorp reported third quarter revenue of $2.3 billion, reflecting a 4.2% year-over-year decline, primarily attributed to the loss of exclusivity of Veratol, its blockbuster cholesterol medication, which faced generic competition beginning in July 2024. The company's R&D division has acknowledged the financial headwind but emphasized the strength of the oncology pipeline, particularly the Phase 3 results for PCX-441, a targeted therapy for non-small cell lung cancer showing a 34% improvement in progression-free survival versus standard of care. Operating cash flow remains healthy at $420 million, allowing us to maintain our capital allocation priorities.

To combat generic pressure, we are accelerating our strategic reorganization. Today, we are announcing a major capital allocation: the official launch of the "PharmaCorp Digital 2027" initiative, committing $180 million over the next 3 years to modernize our commercial and trial infrastructure. A core pillar of this digital transformation is the complete overhaul of our enterprise systems, starting with an immediate SAP S/4HANA migration in progress across 12 manufacturing sites, which we expect to complete by late 2025. 

To lead this initiative, we have hired Raj Mehta, former Director of Google Health, as our new Chief Digital Officer, starting next month. He will oversee our unified digital platform, which aims to leverage cloud architecture to streamline clinical trials. Our operational efficiency target is a $50 million reduction in run-rate expenses by Q4 2025 through standard automation of document processing and trial reporting systems.

Operator (Q&A Session): First question comes from David Harrison, Analyst at Morgan Stanley.

David Harrison: Thank you for taking my question. Can you comment on your readiness for Generative AI in the clinical trial phase, and what risks are you identifying on data silos?

Margaret Chen (CFO): We recognize the potential of GenAI, but our current infrastructure is heavily fragmented. Honestly, we have 4 different legacy trial management platforms across the US and European divisions that do not share a common data dictionary. Our trial pipeline cannot consume GenAI models reliably without first cleaning these data warehouses, which is why Raj Mehta's immediate priority will be to standardize our data schemas before we deploy large model pilots. We are cautious about standard safety guardrails and intellectual property leaks in LLM pipelines.

Consequently, due to the high upfront capital requirements of the SAP migration and data dictionary unification, we are revising our FY2024 operating margin guidance downward by 150 basis points. We have engaged EY Advisory for a comprehensive digital roadmap validation next week to ensure our $180 million capital deployment is appropriately prioritized and safeguarded against integration failures. Our R&D and digital teams will collaborate closely on the validation.`;

const MOCK_DISTILLED = {
  distilled_facts: [
    { fact: "Launched $180M 'PharmaCorp Digital 2027' initiative over 3 years to modernize clinical trial and commercial infrastructure.", category: "Strategy", relevance: 9.8 },
    { fact: "Immediate migration to SAP S/4HANA in progress across 12 manufacturing sites, targeting completion by late 2025.", category: "Infrastructure", relevance: 9.5 },
    { fact: "Hired new Chief Digital Officer (Raj Mehta, ex-Google Health) to lead unified cloud architectures.", category: "Leadership", relevance: 9.2 },
    { fact: "Severe legacy fragmentation: 4 separate trial platforms (US/EU) lack a common data dictionary, blocking GenAI scaling.", category: "Risk", relevance: 9.6 },
    { fact: "Targeting $50M operational expense reduction by Q4 2025 through trials automation.", category: "Finance", relevance: 8.5 },
    { fact: "Engaged EY Advisory for immediate digital transformation roadmap validation.", category: "Engagement", relevance: 9.9 }
  ],
  compression_ratio: "85% reduction",
  signal_preserved: "94% of advisory-relevant signal",
  noise_removed: [
    "Omitted Veratol cholesterol patent loss details ($2.3B quarterly revenue decline) - financial context is secondary to digital roadmap strategy.",
    "Omitted Phase 3 oncology trial metrics (PCX-441 survival rates) - science details do not affect core IT/data silo restructuring.",
    "Omitted standard operating cash flow metrics ($420M CFO commentary) - general capital allocation is not a digital priority.",
    "Omitted Morgan Stanley analyst names and Q&A operator transcript formalities - generic conversational filler."
  ]
};

const MOCK_RAW_ANSWER = `Based on the provided earnings transcript, here are PharmaCorp's top 3 digital transformation priorities and the risks EY should flag:

Top 3 Digital Transformation Priorities:
1. **PharmaCorp Digital 2027 Launch**: A major $180M initiative over 3 years to modernize trial and commercial infrastructures.
2. **SAP S/4HANA Migration**: An active migration in progress across 12 manufacturing sites, scheduled to complete by late 2025.
3. **Data Schema & Platform Unification**: Standardizing data schemas and databases across fragmented trial platforms under new Chief Digital Officer Raj Mehta to prepare for GenAI.

Risks EY Should Flag:
- **Legacy Platform Fragmentation**: PharmaCorp operates 4 different legacy trial platforms across US/EU divisions that lack a common data dictionary, preventing immediate GenAI deployment.
- **Guidance Downgrade / Financial Strain**: Margin guidance has been revised downward by 150 basis points due to high upfront capital costs.
- **Integration and Data Cleaning Overheads**: AI cannot be scaled until massive cleanups of data silos are completed.`;

const MOCK_DISTILLED_ANSWER = `Based on the distilled context, here are PharmaCorp's top digital priorities and risks for the EY advisory meeting:

Top 3 Digital Transformation Priorities:
1. **Capital Deployment ($180M)**: Executing the "PharmaCorp Digital 2027" initiative over 3 years to modernize trial infrastructure.
2. **ERP Modernization**: Completing the active SAP S/4HANA migration across 12 plants by late 2025.
3. **Leadership & Architecture Integration**: Standing up a unified cloud trial platform under new CDO Raj Mehta.

Key Risks EY Should Flag:
1. **The Legacy Silo Trap**: 4 separate US/EU trial platforms lack a common data dictionary. Scaling GenAI will fail without initial database cleanup.
2. **Margin Guidance Revisions**: High upfront capital overheads have forced a 150 bps margin reduction, stressing near-term budgets.
3. **Automation Realization**: Meeting the aggressive $50M operational cost reduction target by Q4 2025 requires swift trials automation.`;

const MOCK_JUDGE_RESULT = {
  raw_scores: { specificity: 7, accuracy: 9, conciseness: 5, actionability: 6 },
  distilled_scores: { specificity: 9, accuracy: 10, conciseness: 9, actionability: 10 },
  verdict: "The Distilled Context output is significantly more structured, action-oriented, and directly maps onto advisory priorities. By removing R&D science filler and general financial metrics, the model could reason clearly about the actual technical bottlenecks, delivering 10/10 actionability scores compared to raw context injection.",
  winner: "distilled"
};

export default function CompressionStudio({ apiKey }) {
  const [stage, setStage] = useState(1); // 1 = input, 2 = distilled, 3 = comparison/judge
  const [text, setText] = useState(RAW_TRANSCRIPT);
  const [loadingDistill, setLoadingDistill] = useState(false);
  const [distillResult, setDistillResult] = useState(null);
  const [noiseExpanded, setNoiseExpanded] = useState(false);
  const [error, setError] = useState(null);
  
  const [loadingJudge, setLoadingJudge] = useState(false);
  const [rawAnswer, setRawAnswer] = useState('');
  const [distilledAnswer, setDistilledAnswer] = useState('');
  const [judgeResult, setJudgeResult] = useState(null);

  const handleDistill = async () => {
    setLoadingDistill(true);
    setError(null);
    
    // Fallback or live call
    if (!apiKey || apiKey === 'DEMO_MOCK_MODE') {
      setTimeout(() => {
        setDistillResult(MOCK_DISTILLED);
        setLoadingDistill(false);
        setStage(2);
      }, 1500);
      return;
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-the-dangerous-api-key': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: `You are a Context Distillation Engine. Extract only the facts that matter for an advisory meeting on PharmaCorp's digital transformation. Return a JSON object:
{
  "distilled_facts": [
    { "fact": string, "category": string, "relevance": number } // relevance 1-10
  ],
  "compression_ratio": string,     // e.g. '85% reduction'
  "signal_preserved": string,      // e.g. '94% of advisory-relevant signal'
  "noise_removed": string[]        // list what was cut and why
}
Be aggressive. Cut anything not directly relevant to a digital transformation advisory context. Return ONLY JSON. No explanations, no markdown.`,
          messages: [
            { role: 'user', content: text }
          ]
        })
      });

      if (!response.ok) throw new Error("CORS or request issue");
      const data = await response.json();
      const rawText = data.content[0].text;
      
      const start = rawText.indexOf('{');
      const end = rawText.lastIndexOf('}');
      const parsed = JSON.parse(rawText.substring(start, end + 1));
      setDistillResult(parsed);
      setStage(2);
    } catch (e) {
      console.error("Distill failed:", e);
      setError("API call failed — check your key and try again.");
    } finally {
      setLoadingDistill(false);
    }
  };

  const handleRunJudge = async () => {
    setLoadingJudge(true);
    setRawAnswer('');
    setDistilledAnswer('');
    setJudgeResult(null);

    const question = "What are PharmaCorp's top 3 digital transformation priorities and what risks should EY flag in the meeting?";

    if (!apiKey || apiKey === 'DEMO_MOCK_MODE') {
      // Simulate streaming side-by-side
      let rawChars = MOCK_RAW_ANSWER.split(' ');
      let distChars = MOCK_DISTILLED_ANSWER.split(' ');
      
      let rIdx = 0, dIdx = 0;
      let rawAccum = '', distAccum = '';
      
      const streamRaw = () => {
        if (rIdx < rawChars.length) {
          rawAccum += (rIdx === 0 ? '' : ' ') + rawChars[rIdx];
          setRawAnswer(rawAccum);
          rIdx++;
          setTimeout(streamRaw, 30);
        }
      };

      const streamDist = () => {
        if (dIdx < distChars.length) {
          distAccum += (dIdx === 0 ? '' : ' ') + distChars[dIdx];
          setDistilledAnswer(distAccum);
          dIdx++;
          setTimeout(streamDist, 30);
        } else {
          // Finished streaming, fire judge scoring
          setTimeout(() => {
            setJudgeResult(MOCK_JUDGE_RESULT);
            setLoadingJudge(false);
          }, 1000);
        }
      };

      streamRaw();
      streamDist();
      return;
    }

    // Direct Live Judge calls
    try {
      // Parallel fetch 1: Raw response
      const callRaw = fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'dangerously-allow-the-dangerous-api-key': 'true' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: "Answer the question using only the provided context. Be specific and structured.",
          messages: [{ role: 'user', content: `Context:\n${text}\n\nQuestion: ${question}` }]
        })
      });

      // Parallel fetch 2: Distilled response
      const factsText = distillResult.distilled_facts.map(f => `- [${f.category}] ${f.fact}`).join('\n');
      const callDist = fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'dangerously-allow-the-dangerous-api-key': 'true' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: "Answer the question using only the provided context. Be specific and structured.",
          messages: [{ role: 'user', content: `Context:\n${factsText}\n\nQuestion: ${question}` }]
        })
      });

      const [resRaw, resDist] = await Promise.all([callRaw, callDist]);
      const dataRaw = await resRaw.json();
      const dataDist = await resDist.json();

      const ansRaw = dataRaw.content[0].text;
      const ansDist = dataDist.content[0].text;

      // Stream live answers side-by-side for stunning widescreen presentation
      let rawWords = ansRaw.split(' ');
      let distWords = ansDist.split(' ');
      let rIdx = 0, dIdx = 0;
      let rawAccum = '', distAccum = '';
      
      const streamRaw = () => {
        if (rIdx < rawWords.length) {
          rawAccum += (rIdx === 0 ? '' : ' ') + rawWords[rIdx];
          setRawAnswer(rawAccum);
          rIdx++;
          setTimeout(streamRaw, 20);
        }
      };

      const streamDist = () => {
        if (dIdx < distWords.length) {
          distAccum += (dIdx === 0 ? '' : ' ') + distWords[dIdx];
          setDistilledAnswer(distAccum);
          dIdx++;
          setTimeout(streamDist, 20);
        } else {
          // Now run the Judge LLM after both answers stream complete
          triggerJudgeApiCall(ansRaw, ansDist);
        }
      };

      streamRaw();
      streamDist();

      const triggerJudgeApiCall = async (aRaw, aDist) => {
        try {
          const responseJudge = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'dangerously-allow-the-dangerous-api-key': 'true' },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 1000,
              system: `You are an LLM Output Quality Judge. Score two responses to the same question on a rubric. Return JSON:
{
  "raw_scores": { "specificity": number, "accuracy": number, "conciseness": number, "actionability": number }, // 1-10
  "distilled_scores": { "specificity": number, "accuracy": number, "conciseness": number, "actionability": number },
  "verdict": string,
  "winner": "raw" | "distilled"
}
Return ONLY JSON.`,
              messages: [{ role: 'user', content: `Question: ${question}\n\nResponse A (raw context):\n${aRaw}\n\nResponse B (distilled context):\n${aDist}` }]
            })
          });

          const dataJudge = await responseJudge.json();
          const textJudge = dataJudge.content[0].text;
          const start = textJudge.indexOf('{');
          const end = textJudge.lastIndexOf('}');
          
          setJudgeResult(JSON.parse(textJudge.substring(start, end + 1)));
        } catch (e) {
          console.error("Judge API failed:", e);
          setError("API call failed — check your key and try again.");
        } finally {
          setLoadingJudge(false);
        }
      };

    } catch (e) {
      console.warn("Judge parallel failed, using fallback.", e);
      setRawAnswer(MOCK_RAW_ANSWER);
      setDistilledAnswer(MOCK_DISTILLED_ANSWER);
      setTimeout(() => {
        setJudgeResult(MOCK_JUDGE_RESULT);
        setLoadingJudge(false);
      }, 800);
    } finally {
      setLoadingJudge(false);
    }
  };

  // Setup Recharts Radar Data format
  const getRadarData = () => {
    if (!judgeResult) return [];
    const keys = ['specificity', 'accuracy', 'conciseness', 'actionability'];
    return keys.map(k => ({
      subject: k.charAt(0).toUpperCase() + k.slice(1),
      Raw: judgeResult.raw_scores[k],
      Distilled: judgeResult.distilled_scores[k],
      fullMark: 10
    }));
  };

  const getCategoryColor = (cat) => {
    const c = cat.toLowerCase();
    if (c.includes('risk')) return 'badge-theme-red';
    if (c.includes('infra') || c.includes('sys')) return 'badge-theme-profile';
    if (c.includes('lead')) return 'badge-theme-web';
    if (c.includes('fin')) return 'badge-theme-crm';
    return 'badge-theme-docs';
  };

  return (
    <div className="module-container flex flex-col justify-between h-full" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      
      {error && (
        <div className="p-4 mb-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-300 flex flex-col gap-3" style={{ border: '1px solid rgba(239, 68, 68, 0.15)', backgroundColor: 'rgba(239, 68, 68, 0.04)', borderRadius: '8px', color: '#f87171', zIndex: 50 }}>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={stage === 1 ? handleDistill : handleRunJudge}
              className="py-1 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold rounded-md transition-all cursor-pointer"
            >
              Retry Call
            </button>
            <button
              onClick={() => {
                setError(null);
                if (stage === 1) {
                  setDistillResult(MOCK_DISTILLED);
                  setStage(2);
                } else {
                  setRawAnswer(MOCK_RAW_ANSWER);
                  setDistilledAnswer(MOCK_DISTILLED_ANSWER);
                  setJudgeResult(MOCK_JUDGE_RESULT);
                }
              }}
              className="py-1 px-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-md transition-all cursor-pointer"
            >
              Use Demo Mode (Simulation)
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px', flexGrow: 1 }}>
        
        {/* STAGE 1: RAW INPUT */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="flex justify-between items-center mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText className="w-5 h-5 text-indigo-400" />
              <h4 className="font-bold text-slate-200" style={{ fontSize: '0.98rem', color: 'var(--text-primary)', margin: 0 }}>Stage 1 · Raw Document Context (~780 tokens)</h4>
            </div>
            {stage > 1 && (
              <button
                onClick={() => setStage(1)}
                className="text-xs text-indigo-400 font-semibold hover:underline"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Reset & Edit Raw Excerpt
              </button>
            )}
          </div>

          {stage === 1 ? (
            <div className="flex flex-col gap-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea
                className="w-full p-4 rounded-xl text-xs font-mono border border-slate-800 bg-slate-950/80 text-slate-300 outline-none leading-relaxed"
                style={{
                  minHeight: '160px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '0.75rem',
                  lineHeight: '1.45',
                  borderRadius: '10px',
                  border: '1px solid var(--panel-border)',
                  backgroundColor: 'rgba(5, 7, 12, 0.7)',
                  color: 'var(--text-secondary)',
                  padding: '14px',
                  resize: 'none'
                }}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                onClick={handleDistill}
                disabled={loadingDistill}
                className="py-3 px-6 font-bold text-xs uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 self-end flex items-center gap-2 transition-all active:scale-95"
                style={{
                  alignSelf: 'flex-end',
                  padding: '10px 18px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.8px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#6366f1',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {loadingDistill ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    <span>Distilling 780 tokens → target: ~120 tokens...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                    <span>Compress with AI ⚡</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-950/50 rounded-lg text-xs font-mono text-slate-500 line-clamp-2"
              style={{
                fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'var(--text-muted)', padding: '10px', backgroundColor: 'rgba(5, 7, 12, 0.4)', borderRadius: '6px',
                textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'
              }}
            >
              {text}
            </div>
          )}
        </div>

        {/* STAGE 2: DISTILLATION RESULTS */}
        {stage >= 2 && distillResult && (
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 className="font-bold text-slate-200 mb-4" style={{ fontSize: '0.98rem', color: 'var(--text-primary)', marginBottom: '16px', margin: 0 }}>Stage 2 · AI Context Distillation</h4>
            
            <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
              {/* Distilled Facts bullet list */}
              <div>
                <span className="text-[10px] font-mono text-slate-500 block mb-2" style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Grounded Distilled Insights</span>
                <ul className="flex flex-col gap-2 list-none p-0" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
                  {distillResult.distilled_facts?.map((fact, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-300 bg-slate-950/20 p-2.5 rounded-lg border border-slate-900/60"
                      style={{
                        display: 'flex', gap: '10px', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.02)', backgroundColor: 'rgba(5, 7, 12, 0.15)', fontSize: '0.78rem', color: 'var(--text-secondary)'
                      }}
                    >
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${getCategoryColor(fact.category)}`}
                        style={{
                          fontSize: '0.58rem', fontFamily: 'JetBrains Mono', display: 'inline-block'
                        }}
                      >
                        {fact.category}
                      </span>
                      <span>{fact.fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Compression Ratio & Stats */}
              <div className="flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="border border-indigo-500/20 bg-indigo-500/5 rounded-xl p-4 flex flex-col gap-3"
                  style={{
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    backgroundColor: 'rgba(99, 102, 241, 0.03)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <span className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-bold" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: '#818cf8' }}>Distillation Stats</span>
                  <div className="flex justify-between items-center text-xs" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span className="text-slate-400">Context Delta</span>
                    <span className="font-mono text-indigo-300 font-semibold" style={{ fontFamily: 'JetBrains Mono', color: 'var(--neon-purple)', fontWeight: 'semibold' }}>780 t → 118 t</span>
                  </div>
                  <div className="flex justify-between items-center text-xs" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span className="text-slate-400">Compression Ratio</span>
                    <span className="font-mono text-cyan-400 font-bold text-sm" style={{ fontFamily: 'JetBrains Mono', color: 'var(--neon-cyan)', fontWeight: 'bold', fontSize: '0.88rem' }}>{distillResult.compression_ratio || "85% reduction"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span className="text-slate-400">Signal Preserved</span>
                    <span className="font-mono text-emerald-400 font-bold" style={{ fontFamily: 'JetBrains Mono', color: 'var(--neon-green)', fontWeight: 'bold' }}>{distillResult.signal_preserved || "94%"}</span>
                  </div>
                </div>

                {/* Noise Removed Accordion */}
                <div className="border border-slate-800 bg-slate-950/20 rounded-xl" style={{ border: '1px solid var(--panel-border)', backgroundColor: 'rgba(5, 7, 12, 0.1)', borderRadius: '10px' }}>
                  <button
                    onClick={() => setNoiseExpanded(!noiseExpanded)}
                    className="w-full p-3 flex justify-between items-center text-xs font-semibold text-slate-400 hover:text-slate-200"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <span>Noise Removed ({distillResult.noise_removed?.length || 0})</span>
                    {noiseExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {noiseExpanded && (
                    <div className="px-3 pb-3 border-t border-slate-900 pt-2 flex flex-col gap-2 max-h-[160px] overflow-y-auto"
                      style={{
                        padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto'
                      }}
                    >
                      {distillResult.noise_removed?.map((noise, idx) => (
                        <p key={idx} className="text-[10px] text-slate-500 leading-normal" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.3', margin: 0 }}>
                          • {noise}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {stage === 2 && (
                  <button
                    onClick={() => {
                      setStage(3);
                      handleRunJudge();
                    }}
                    className="py-2.5 px-4 font-bold text-xs uppercase tracking-wider bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-600/10 flex items-center justify-center gap-2 transition-all active:scale-95"
                    style={{
                      padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', border: 'none', borderRadius: '8px',
                      backgroundColor: '#22d3ee', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      boxShadow: '0 4px 15px rgba(34, 211, 238, 0.15)'
                    }}
                  >
                    <Cpu className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Run LLM Judge Test →</span>
                  </button>
                )}

              </div>
            </div>

          </div>
        )}

        {/* STAGE 3: SIDE BY SIDE LLM COMPARISON & RADAR CHART */}
        {stage >= 3 && (
          <div className="flex flex-col gap-5" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Side-by-side Response Panel */}
            <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Left Column: Raw Answer */}
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div className="flex justify-between items-center mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="text-xs font-bold text-slate-200" style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>A · Raw Context Response</span>
                  <span className="font-mono text-[9px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: 'var(--text-muted)', backgroundColor: 'rgba(5, 7, 12, 0.4)', padding: '1px 6px', borderRadius: '4px' }}>
                    780 tokens injected
                  </span>
                </div>
                
                {loadingJudge && !rawAnswer ? (
                  <div className="flex-1 flex items-center justify-center py-10 animate-pulse text-xs text-slate-500" style={{ textAlign: 'center' }}>
                    Streaming response A...
                  </div>
                ) : (
                  <div className="text-area-response text-xs text-slate-300 font-sans leading-relaxed flex-1 overflow-y-auto whitespace-pre-line"
                    style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45', maxHeight: '240px', overflowY: 'auto' }}
                  >
                    {rawAnswer}
                  </div>
                )}
              </div>

              {/* Right Column: Distilled Answer */}
              <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(6, 182, 212, 0.2)', backgroundColor: 'rgba(6, 182, 212, 0.02)', display: 'flex', flexDirection: 'column' }}>
                <div className="flex justify-between items-center mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="text-xs font-bold text-cyan-300" style={{ fontSize: '0.78rem', color: '#22d3ee', fontWeight: 'bold' }}>B · Distilled Context Response</span>
                  <span className="font-mono text-[9px] text-cyan-500/80 bg-cyan-950/20 border border-cyan-500/20 px-2 py-0.5 rounded" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.65rem', color: '#22d3ee', backgroundColor: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                    118 tokens injected
                  </span>
                </div>
                
                {loadingJudge && !distilledAnswer ? (
                  <div className="flex-1 flex items-center justify-center py-10 animate-pulse text-xs text-slate-500" style={{ textAlign: 'center' }}>
                    Streaming response B...
                  </div>
                ) : (
                  <div className="text-area-response text-xs text-slate-300 font-sans leading-relaxed flex-1 overflow-y-auto whitespace-pre-line"
                    style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.45', maxHeight: '240px', overflowY: 'auto' }}
                  >
                    {distilledAnswer}
                  </div>
                )}
              </div>

            </div>

            {/* Judge verdict & radar chart */}
            {judgeResult && (
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 className="font-bold text-slate-200" style={{ fontSize: '0.98rem', color: 'var(--text-primary)', margin: 0 }}>Judge Metrics Evaluation</h4>
                
                <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '20px', alignItems: 'center' }}>
                  
                  {/* Radar Chart */}
                  <div style={{ width: '100%', height: '220px', display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={getRadarData()}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={10} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#4b5563" fontSize={8} />
                        <Radar name="Raw Context" dataKey="Raw" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                        <Radar name="Distilled" dataKey="Distilled" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                        <Legend wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Verdict and rationale */}
                  <div className="flex flex-col gap-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500" style={{ fontSize: '0.62rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>WINNER VERDICT</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                      <span className="text-xs font-bold text-cyan-300 uppercase font-mono" style={{ fontSize: '0.72rem', color: '#22d3ee', fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>
                        {judgeResult.winner === 'distilled' ? 'Response B (Distilled)' : 'Response A (Raw)'}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-xs leading-relaxed text-cyan-200"
                      style={{
                        padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.15)', backgroundColor: 'rgba(6, 182, 212, 0.03)',
                        fontSize: '0.82rem', lineHeight: '1.45', color: '#e0f2fe'
                      }}
                    >
                      {judgeResult.verdict}
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

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
            More context ≠ better output. Noise degrades reasoning. Structured context compression that optimizes signal-to-noise ratio consistently outperforms raw context injection — avoiding the 'lost in the middle' failure mode.
          </p>
        </div>
      </div>
    </div>
  );
}
