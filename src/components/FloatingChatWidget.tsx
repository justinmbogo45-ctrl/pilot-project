import React, { useState, useEffect, useRef } from 'react';
import { 
 MessageSquare, 
 X, 
 Send, 
 Sparkles, 
 Bot, 
 ArrowRight, 
 ExternalLink, 
 Globe, 
 RefreshCw,
 Search
} from 'lucide-react';
import { PropFirm } from '../types';

interface FloatingChatWidgetProps {
 firms: PropFirm[];
 onSelectFirm: (firm: PropFirm) => void;
}

interface ChatMessage {
 sender: 'bot' | 'user';
 text: string;
 firmRecommendation?: string;
 sources?: Array<{ title: string; uri: string }>;
 webSearchQueries?: string[];
 isGrounded?: boolean;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({ firms, onSelectFirm }) => {
 const [isOpen, setIsOpen] = useState(false);
 const [loading, setLoading] = useState(false);
 const [messages, setMessages] = useState<ChatMessage[]>([
 {
 sender: 'bot',
 text: "👋 Hi Trader! Welcome to Prop Firm Match. Ask me anything about prop firms, live 2026 coupon discounts, payout proof, or EOD vs trailing rules—grounded with real-time Google Search.",
 isGrounded: true,
 },
 ]);
 const [input, setInput] = useState('');
 const messagesEndRef = useRef<HTMLDivElement>(null);

 // Close on Escape key
 useEffect(() => {
 if (!isOpen) return;
 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key === 'Escape') setIsOpen(false);
 };
 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, [isOpen]);

 // Scroll to bottom on new message
 useEffect(() => {
 if (isOpen) {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }
 }, [messages, loading, isOpen]);

 const handleSend = async (textToSend?: string) => {
 const query = (textToSend || input).trim();
 if (!query || loading) return;

 const newMsgs: ChatMessage[] = [...messages, { sender: 'user', text: query }];
 setMessages(newMsgs);
 if (!textToSend) setInput('');
 setLoading(true);

 try {
 const response = await fetch('/api/ai/chat', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 message: query,
 history: newMsgs.slice(-4),
 }),
 });

 const data = await response.json();

 if (!response.ok) {
 throw new Error(data.message || data.error || 'Server search grounding error');
 }

 setMessages((prev) => [
 ...prev,
 {
 sender: 'bot',
 text: data.text || 'Information retrieved.',
 firmRecommendation: data.recommendedFirmId,
 sources: data.sources || [],
 webSearchQueries: data.webSearchQueries || [],
 isGrounded: true,
 },
 ]);
 } catch (err: any) {
 console.error('Chat error:', err);
 // Fallback response with helpful prop firm matching
 const lower = query.toLowerCase();
 let fallbackText = "I encountered an issue reaching the live Google Search service. Based on our directory rules: ";
 let rec: string | undefined = undefined;

 if (lower.includes('eod') || lower.includes('drawdown') || lower.includes('lucid')) {
 fallbackText += "Lucid Trading and Tradeify offer End-of-Day (EOD) drawdown with no intraday trailing liquidation. Use code MATCH for top savings.";
 rec = 'lucid-trading';
 } else if (lower.includes('us') || lower.includes('citizen')) {
 fallbackText += "US citizens can trade Futures combines (Lucid, Tradeify, Topstep, TradeDay) without CFD restrictions.";
 rec = 'tradeify';
 } else if (lower.includes('discount') || lower.includes('code') || lower.includes('cheap') || lower.includes('apex')) {
 fallbackText += "Apex Trader Funding runs flash sales up to 90% OFF with code MATCH, while TradeDay offers up to 55% OFF.";
 rec = 'apex-trader-funding';
 } else {
 fallbackText += "Lucid Trading ($1.5M max allocation) and Tradeify ($750K max) lead the industry with verified same-day and 24h payouts.";
 rec = 'lucid-trading';
 }

 setMessages((prev) => [
 ...prev,
 {
 sender: 'bot',
 text: fallbackText,
 firmRecommendation: rec,
 isGrounded: false,
 },
 ]);
 } finally {
 setLoading(false);
 }
 };

 const getDomain = (url: string) => {
 try {
 return new URL(url).hostname.replace('www.', '');
 } catch {
 return 'source';
 }
 };

 return (
 <div className="fixed bottom-5 right-5 z-40">
 {isOpen ? (
 <div className="w-[340px] sm:w-[400px] h-[520px] bg-[#121528] border border-blue-500/50 rounded-2xl shadow-blue-950/60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
 
 {/* Header with Google Grounding Badge */}
 <div className="bg-gradient-to-r from-blue-700 via-emerald-700 to-emerald-700 p-3.5 flex items-center justify-between text-white">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
 <Bot className="w-4 h-4 text-white" />
 </div>
 <div>
 <div className="flex items-center gap-1.5">
 <span className="font-bold text-xs">PFM Match Assistant</span>
 <span className="px-1.5 py-0.2 rounded bg-blue-500/30 text-[9px] font-mono border border-blue-300/40">
 gemini-3.5-flash
 </span>
 </div>
 <div className="text-[10px] text-blue-200 flex items-center gap-1">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
 <span>Google Search Grounded</span>
 </div>
 </div>
 </div>
 <button 
 onClick={() => setIsOpen(false)} 
 className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors duration-150 cursor-pointer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Messages list */}
 <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs">
 {messages.map((m, idx) => (
 <div
 key={idx}
 className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
 >
 <div
 className={`p-3 rounded-xl max-w-[88%] leading-relaxed ${
 m.sender === 'user'
 ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-br-none shadow-sm'
 : 'bg-[#1a1f38] text-[#9a9e9b] border border-[#333633]/80 rounded-bl-none shadow-sm'
 }`}
 >
 <div className="whitespace-pre-line">{m.text}</div>

 {/* Google Queries badge if available */}
 {m.webSearchQueries && m.webSearchQueries.length > 0 && (
 <div className="mt-2 pt-2 border-t border-[#333633]/60 flex items-center gap-1 text-[10px] text-blue-300">
 <Search className="w-3 h-3 text-blue-400 flex-shrink-0" />
 <span className="truncate">Searched: {m.webSearchQueries[0]}</span>
 </div>
 )}

 {/* Grounded Source Citations */}
 {m.sources && m.sources.length > 0 && (
 <div className="mt-2 pt-2 border-t border-[#333633]/60 space-y-1">
 <div className="text-[10px] font-bold text-[#747976] flex items-center gap-1">
 <Globe className="w-3 h-3 text-[#3ecf8e]" />
 <span>Sources:</span>
 </div>
 <div className="flex flex-wrap gap-1">
 {m.sources.slice(0, 3).map((s, sIdx) => (
 <a
 key={sIdx}
 href={s.uri}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1d1f1e] hover:bg-[#222522] border border-[#333633] text-[10px] text-blue-300 hover:text-white transition-colors duration-150"
 >
 <span className="truncate max-w-[120px]">{s.title || getDomain(s.uri)}</span>
 <ExternalLink className="w-2.5 h-2.5" />
 </a>
 ))}
 </div>
 </div>
 )}
 </div>

 {m.firmRecommendation && (
 <button
 onClick={() => {
 const f = firms.find((item) => item.id === m.firmRecommendation);
 if (f) {
 onSelectFirm(f);
 setIsOpen(false);
 }
 }}
 className="mt-1.5 px-3 py-1 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
 >
 <span>Inspect Recommended Firm</span>
 <ArrowRight className="w-3 h-3" />
 </button>
 )}
 </div>
 ))}

 {loading && (
 <div className="flex items-start gap-2">
 <div className="p-3 rounded-xl bg-[#1a1f38] border border-blue-500/40 text-[#9a9e9b] text-xs flex items-center gap-2">
 <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
 <span className="text-[11px]">Grounding with Google Search (gemini-3.5-flash)...</span>
 </div>
 </div>
 )}

 <div ref={messagesEndRef} />
 </div>

 {/* Quick prompt suggestions */}
 <div className="px-3 py-1.5 bg-[#0e1120] border-t border-[#2b2e2c] flex items-center gap-1.5 overflow-x-auto text-[10px]">
 <button
 onClick={() => handleSend('Best active discounts right now')}
 className="px-2 py-1 rounded bg-[#222522] text-[#9a9e9b] hover:text-white hover:bg-slate-700 whitespace-nowrap cursor-pointer transition-colors duration-150"
 >
 🔥 2026 Discounts
 </button>
 <button
 onClick={() => handleSend('Which firms offer End-of-Day EOD drawdown?')}
 className="px-2 py-1 rounded bg-[#222522] text-[#9a9e9b] hover:text-white hover:bg-slate-700 whitespace-nowrap cursor-pointer transition-colors duration-150"
 >
 🛡️ EOD Drawdown
 </button>
 <button
 onClick={() => handleSend('Which prop firms have fastest verified payouts?')}
 className="px-2 py-1 rounded bg-[#222522] text-[#9a9e9b] hover:text-white hover:bg-slate-700 whitespace-nowrap cursor-pointer transition-colors duration-150"
 >
 ⚡ Fast Payouts
 </button>
 </div>

 {/* Input field */}
 <form 
 onSubmit={(e) => {
 e.preventDefault();
 handleSend();
 }}
 className="p-2.5 bg-[#121528] border-t border-[#2b2e2c] flex items-center gap-2"
 >
 <input
 type="text"
 value={input}
 onChange={(e) => setInput(e.target.value)}
 placeholder="Ask about live discounts, rules, payouts..."
 disabled={loading}
 className="flex-1 bg-[#1d1f1e] border border-[#333633] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-[#747976] focus:outline-none"
 />
 <button
 type="submit"
 disabled={loading || !input.trim()}
 className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors duration-150 cursor-pointer"
 >
 <Send className="w-3.5 h-3.5" />
 </button>
 </form>

 </div>
 ) : (
 <button
 onClick={() => setIsOpen(true)}
 id="floating-chat-bubble"
 className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 via-emerald-600 to-emerald-600 text-white shadow-blue-900/60 hover:scale-105 transition-all flex items-center justify-center cursor-pointer border border-blue-400/40 relative group"
 aria-label="Open Match Assistant"
 >
 <MessageSquare className="w-6 h-6" />
 <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#090b14] rounded-full"></span>
 </button>
 )}
 </div>
 );
};
