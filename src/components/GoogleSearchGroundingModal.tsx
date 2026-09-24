import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { PropFirm } from '../types';

interface GoogleSearchGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  firms?: PropFirm[];
  onSelectFirm?: (firm: PropFirm) => void;
  initialQuery?: string;
}

interface SourceCitation {
  title: string;
  uri: string;
}

interface SearchGroundingResult {
  text: string;
  sources: SourceCitation[];
  webSearchQueries: string[];
  model: string;
  grounded: boolean;
}

export const GoogleSearchGroundingModal: React.FC<GoogleSearchGroundingModalProps> = ({
  isOpen,
  onClose,
  firms = [],
  onSelectFirm,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchGroundingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync initial query
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  if (!isOpen) return null;

  const quickPresets = [
    {
      label: '🔥 Active Promo Codes 2026',
      query: 'What are the best active coupon codes and discounts for futures and forex prop firms like Lucid Trading, Tradeify, and Apex in 2026?',
    },
    {
      label: '⚡ Same-Day Payout Firms',
      query: 'Which prop firms have verified same-day or 24-hour payouts and positive Trustpilot proof in 2026?',
    },
    {
      label: '🛡️ EOD vs Trailing Rules',
      query: 'Explain the difference between End-of-Day (EOD) drawdown and intraday trailing drawdown in prop firms like Lucid Trading and Topstep.',
    },
    {
      label: '🇺🇸 US Citizen Friendly',
      query: 'What are the top prop firms that legally accept United States traders without CFD restrictions?',
    },
  ];

  const handleSearch = async (searchPrompt?: string) => {
    const q = (searchPrompt || query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    if (searchPrompt) setQuery(searchPrompt);

    try {
      const response = await fetch('/api/ai/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch search-grounded intelligence');
      }

      setResult({
        text: data.text,
        sources: data.sources || [],
        webSearchQueries: data.webSearchQueries || [],
        model: data.model || 'gemini-3.5-flash',
        grounded: Boolean(data.grounded),
      });
    } catch (err: any) {
      console.error('Google search grounding error:', err);
      setError(err.message || 'Unable to connect to Google Search Grounding service.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.text) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to extract clean domain name from URL
  const getDomain = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    } catch {
      return 'web';
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div 
        className="bg-[#0e1322] border border-blue-500/40 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-blue-950/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-[#101935] to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Google Search Icon badge */}
            <div className="w-10 h-10 rounded-xl bg-[#1a233d] border border-blue-500/40 flex items-center justify-center shadow-inner">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">Google Search Grounded Intelligence</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/40">
                  gemini-3.5-flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live web search data, 2026 coupon codes, payout verification & community sentiment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-[#090d18] space-y-3">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about prop firms, live discounts, payout proofs, or trading rules..."
                className="w-full bg-[#12182b] border border-blue-500/30 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-900/40 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching Google...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Search Live Web</span>
                </>
              )}
            </button>
          </form>

          {/* Preset Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Suggested:</span>
            {quickPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(preset.query)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-blue-900/40 border border-slate-700/80 hover:border-blue-500/50 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-all cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin flex items-center justify-center"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-blue-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-white">Querying Google Search Engine...</div>
                <div className="text-xs text-slate-400 max-w-sm">
                  Grounding realtime intelligence with gemini-3.5-flash and verifying web sources
                </div>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="font-bold text-rose-300">Grounding Notice</div>
                <div className="text-rose-200/80">{error}</div>
                <div className="text-slate-400 pt-1">
                  Tip: Make sure you have set a valid Gemini API key in Settings &gt; Secrets, or try rephrasing your search query.
                </div>
              </div>
            </div>
          )}

          {!loading && !result && !error && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Search className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">Real-Time Search Grounding</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Search across verified 2026 data on proprietary trading firms, flash discounts, EOD vs trailing drawdown mechanics, and payout proofs.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2">
                {quickPresets.slice(0, 4).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(p.query)}
                    className="p-2.5 rounded-xl bg-[#13182b] hover:bg-[#1a223d] border border-slate-800 hover:border-blue-500/40 text-left text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <div className="font-bold">{p.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              
              {/* Grounding Status Bar */}
              <div className="p-3 rounded-xl bg-[#12182b] border border-blue-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white">Google Search Grounded</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-400">Model: <strong className="text-blue-300">{result.model}</strong></span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                  <button
                    onClick={() => handleSearch()}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-check Web</span>
                  </button>
                </div>
              </div>

              {/* Google Queries Executed */}
              {result.webSearchQueries && result.webSearchQueries.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-400" />
                    <span>Google Search Queries Executed</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.webSearchQueries.map((q, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-[#161d36] border border-blue-500/30 text-blue-300 text-xs font-mono"
                      >
                        "{q}"
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Synthesized Grounded Text */}
              <div className="p-5 rounded-2xl bg-[#101526] border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line shadow-inner">
                {result.text}
              </div>

              {/* Grounding Source Citations */}
              {result.sources && result.sources.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Web Sources ({result.sources.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-[#12182b] hover:bg-[#182038] border border-slate-800 hover:border-blue-500/50 transition-all flex items-start justify-between gap-2 group"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold text-xs text-white group-hover:text-blue-300 truncate">
                            {src.title || getDomain(src.uri)}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                            <span className="text-emerald-400 font-mono text-[10px]">{getDomain(src.uri)}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 flex-shrink-0 mt-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#090d18] flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Search Grounding enforced with gemini-3.5-flash</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
