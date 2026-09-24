import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI client with User-Agent header per gemini-api guidelines
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface GroundingWebChunk {
  uri?: string;
  title?: string;
}

interface GroundingChunk {
  web?: GroundingWebChunk;
}

/**
 * Route: POST /api/ai/search-grounding
 * Uses gemini-3.5-flash with googleSearch tool to fetch real-time grounded intelligence.
 */
app.post('/api/ai/search-grounding', async (req: Request, res: Response) => {
  try {
    const { query, firmName } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }

    const systemInstruction = 
      "You are the official PropFirm Match AI Market Intelligence Engine. " +
      "Provide accurate, up-to-date information on proprietary trading firms, challenge rules (EOD vs trailing drawdown, profit splits, daily loss limits), " +
      "latest promo discounts, payout speeds, and trader sentiment. " +
      "Always ground your insights using Google Search to provide verified, recent facts. Format clearly with bullet points and bold highlights.";

    const promptText = firmName 
      ? `Research the prop firm '${firmName}'. Query: ${query}` 
      : query;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const groundingChunks = (groundingMetadata?.groundingChunks as GroundingChunk[]) || [];
    const webSearchQueries = (groundingMetadata?.webSearchQueries as string[]) || [];

    // Extract valid web links
    const sources = groundingChunks
      .filter((chunk) => chunk.web && chunk.web.uri)
      .map((chunk) => ({
        title: chunk.web?.title || 'Web Source',
        uri: chunk.web?.uri || '',
      }));

    // Deduplicate sources by URI
    const uniqueSources = Array.from(new Map(sources.map((s) => [s.uri, s])).values());

    res.json({
      text: response.text || 'No response text generated.',
      sources: uniqueSources,
      webSearchQueries,
      model: 'gemini-3.5-flash',
      grounded: true,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/search-grounding:', error);
    const isQuotaError = error?.message?.includes('RESOURCE_EXHAUSTED') || error?.status === 429;
    
    res.status(isQuotaError ? 429 : 500).json({
      error: error?.message || 'Failed to generate search-grounded response',
      isQuotaError,
      message: isQuotaError 
        ? 'Gemini Search Grounding quota exceeded. Check your plan in Settings > Secrets or try again shortly.'
        : 'An error occurred while contacting the Gemini Search Grounding service.',
    });
  }
});

/**
 * Route: POST /api/ai/chat
 * Interactive assistant with Google Search Grounding for live prop firm inquiries.
 */
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message parameter is required' });
      return;
    }

    const systemInstruction = 
      "You are the expert PropFirm Match Interactive Trading Assistant. " +
      "Traders come to you to compare proprietary trading firms, understand evaluation rules (End-of-Day drawdown vs trailing drawdown, consistency rules, news trading), " +
      "find current active promo discount codes, and verify payout reliability. " +
      "Use Google Search to find current 2026 data. Be concise, objective, encouraging, and structured. " +
      "When appropriate, mention top firms like Lucid Trading, Tradeify, Apex Trader Funding, Topstep, FundedNext, TradeDay, or My Funded Futures.";

    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-6)) {
        if (item.sender === 'user' && item.text) {
          contents.push({ role: 'user', parts: [{ text: item.text }] });
        } else if (item.sender === 'bot' && item.text) {
          contents.push({ role: 'model', parts: [{ text: item.text }] });
        }
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const groundingChunks = (groundingMetadata?.groundingChunks as GroundingChunk[]) || [];
    const webSearchQueries = (groundingMetadata?.webSearchQueries as string[]) || [];

    const sources = groundingChunks
      .filter((chunk) => chunk.web && chunk.web.uri)
      .map((chunk) => ({
        title: chunk.web?.title || 'Web Source',
        uri: chunk.web?.uri || '',
      }));

    const uniqueSources = Array.from(new Map(sources.map((s) => [s.uri, s])).values());

    // Detect recommended firm if mentioned
    let recommendedFirmId: string | undefined = undefined;
    const lowerText = (response.text || '').toLowerCase();
    if (lowerText.includes('lucid')) recommendedFirmId = 'lucid-trading';
    else if (lowerText.includes('tradeify')) recommendedFirmId = 'tradeify';
    else if (lowerText.includes('apex')) recommendedFirmId = 'apex-trader-funding';
    else if (lowerText.includes('topstep')) recommendedFirmId = 'topstep';
    else if (lowerText.includes('fundednext')) recommendedFirmId = 'fundednext';
    else if (lowerText.includes('tradeday')) recommendedFirmId = 'tradeday';

    res.json({
      text: response.text || '',
      sources: uniqueSources,
      webSearchQueries,
      recommendedFirmId,
      model: 'gemini-3.5-flash',
      grounded: true,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    const isQuotaError = error?.message?.includes('RESOURCE_EXHAUSTED') || error?.status === 429;

    res.status(isQuotaError ? 429 : 500).json({
      error: error?.message || 'Chat generation error',
      isQuotaError,
      message: isQuotaError 
        ? 'Gemini Search Grounding rate limit reached. Please check API quota or try again in a few moments.'
        : 'Failed to process chat message with Google Search Grounding.',
    });
  }
});

/**
 * Route: POST /api/ai/firm-intel
 * Detailed Google Search-grounded live audit for a specific prop firm.
 */
app.post('/api/ai/firm-intel', async (req: Request, res: Response) => {
  try {
    const { firmName } = req.body;

    if (!firmName || typeof firmName !== 'string') {
      res.status(400).json({ error: 'firmName parameter is required' });
      return;
    }

    const prompt = 
      `Conduct a real-time web intelligence audit for the proprietary trading firm "${firmName}". ` +
      `Use Google Search to find verified 2026 data. ` +
      `Provide:\n` +
      `1. Current Active Promo Codes & Discounts (e.g. coupon codes, discount %, flash sales)\n` +
      `2. Payout Reputation & Speed (recent Trustpilot rating, payout frequency, same-day payouts, any reported delays or complaints)\n` +
      `3. Key Trading Rules & Drawdown Model (End of Day vs trailing drawdown, daily loss limits, news trading rules, consistency requirements)\n` +
      `4. Verdict & Key Highlights for Traders.\n` +
      `Be crisp, objective, and specific. Include numbers and exact terms.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an independent prop trading auditor verifying real-time web intelligence via Google Search.",
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const groundingChunks = (groundingMetadata?.groundingChunks as GroundingChunk[]) || [];
    const webSearchQueries = (groundingMetadata?.webSearchQueries as string[]) || [];

    const sources = groundingChunks
      .filter((chunk) => chunk.web && chunk.web.uri)
      .map((chunk) => ({
        title: chunk.web?.title || 'Web Source',
        uri: chunk.web?.uri || '',
      }));

    const uniqueSources = Array.from(new Map(sources.map((s) => [s.uri, s])).values());

    res.json({
      firmName,
      text: response.text || '',
      sources: uniqueSources,
      webSearchQueries,
      model: 'gemini-3.5-flash',
      grounded: true,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/ai/firm-intel:', error);
    const isQuotaError = error?.message?.includes('RESOURCE_EXHAUSTED') || error?.status === 429;

    res.status(isQuotaError ? 429 : 500).json({
      error: error?.message || 'Firm intel error',
      isQuotaError,
      message: isQuotaError
        ? 'Gemini Search Grounding quota reached. Please check your API quota.'
        : 'Failed to retrieve live firm intelligence.',
    });
  }
});

// Server boot: Mount Vite in development or static dist in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PropFirm Match server running on http://0.0.0.0:${PORT} [${isProduction ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
