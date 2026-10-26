import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { 
    flightAgentSchema,
    accommodationAgentSchema,
    dailyPlannerAgentSchema,
    essentialsAdvisorAgentSchema,
    railwayAgentSchema,
    roadwayAgentSchema,
    otherTransportAgentSchema
} from './services/agents.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const itinerarySchema = {
    type: Type.OBJECT,
    properties: {
        itineraries: {
            type: Type.ARRAY,
            description: "List of itinerary options. Always provide one detailed option compiled from your specialist agents.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "A creative and descriptive title for the trip plan. e.g., 'An Adventurous 10-Day Journey Through Bhutan'."
                    },
                    totalEstimatedCost: {
                        type: Type.NUMBER,
                        description: "The total estimated cost for the trip, including flights, accommodation, and a buffer for activities and meals. This should be the sum of all individual price fields."
                    },
                    currency: {
                        type: Type.STRING,
                        description: "The three-letter currency code (e.g., USD, INR, EUR) for all monetary values in this itinerary, based on the user's request. Default to USD if not specified."
                    },
                    flights: flightAgentSchema,
                    railways: railwayAgentSchema,
                    roadways: roadwayAgentSchema,
                    otherTransport: otherTransportAgentSchema,
                    accommodation: accommodationAgentSchema,
                    dailyPlan: dailyPlannerAgentSchema,
                    tripEssentials: essentialsAdvisorAgentSchema
                },
                required: ['title', 'totalEstimatedCost', 'currency', 'accommodation', 'dailyPlan', 'tripEssentials']
            }
        }
    },
    required: ['itineraries']
};

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
        headers: {
            'User-Agent': 'aistudio-build',
        }
    }
});

const systemInstruction = `You are a master travel agent orchestrator. Your primary role is to build a comprehensive, realistic, verified, and personalized travel itinerary based on the user's destination, origin, dates, and budget.

Key Instructions:
1. Transport (Flights, Railways, Roadways):
   - For destinations requiring flights (e.g. Bhutan from Delhi), include realistic flight options with correct airport codes (e.g., DEL for Delhi, PBH for Paro, Bhutan; CCU for Kolkata), realistic airline names (e.g., Drukair, Bhutan Airlines), flight numbers, estimated prices in the requested currency, and Google Flights search links. Mark verificationStatus as 'Verified'.
   - If round trip, provide both outboundOptions and inboundOptions.
   - For overland or regional routes, include railway or roadway options where sensible.
2. Accommodations:
   - Provide at least 3 distinct hotel/resort/homestay choices per location, sorted by price (cheapest first).
   - Include realistic pricePerNight and totalPrice.
3. Daily Planner:
   - Day-by-day plan with activities, timings (e.g., '09:00 AM'), activity types ('Sightseeing', 'Meal', 'Travel', 'Activity', 'Other'), and concise descriptions.
4. Trip Essentials:
   - Detailed weather summary, packing tips, and crucial travel advisories (permits, visas, Bhutan SDF fees, altitude tips).
5. Adhere strictly to the requested budget, currency, and destination constraints.
6. The output MUST strictly conform to the provided JSON schema.`;

// Use high-availability models with active free tier quotas
const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, initialDelayMs = 1500): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err: any) {
            lastError = err;
            const isDailyQuotaExceeded = String(err?.message || '').includes('requests per day limit exceeded') ||
                String(err?.message || '').includes('RESOURCE_EXHAUSTED');
            
            // Do not retry on daily quota exhaustion; fail immediately to switch models
            if (isDailyQuotaExceeded) {
                throw lastError;
            }

            if (attempt < maxRetries - 1) {
                const delay = initialDelayMs * Math.pow(2, attempt);
                await new Promise((res) => setTimeout(res, delay));
            }
        }
    }
    throw lastError;
}

function cleanAndParseJSON(raw: string) {
    let clean = raw.trim();
    if (clean.startsWith('```json')) {
        clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
        clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean);
}

async function startServer() {
    const app = express();
    app.use(express.json());

    // API Route for itinerary generation
    app.post('/api/generate-itinerary', async (req, res) => {
        const { prompt } = req.body;
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: "Missing or invalid 'prompt' in request body." });
        }

        try {
            console.log(`[Itinerary API] Processing request: "${prompt.slice(0, 100)}..."`);

            let lastError: any = null;
            let resultData: any = null;

            for (const modelName of CANDIDATE_MODELS) {
                try {
                    const response = await withRetry(() =>
                        ai.models.generateContent({
                            model: modelName,
                            contents: prompt,
                            config: {
                                responseMimeType: "application/json",
                                responseSchema: itinerarySchema,
                                systemInstruction,
                            }
                        })
                    );

                    const jsonText = response.text || '';
                    const parsed = cleanAndParseJSON(jsonText);

                    if (parsed.itineraries && parsed.itineraries.length > 0) {
                        resultData = parsed;
                        console.log(`[Itinerary API] Successfully generated itinerary using ${modelName}: "${parsed.itineraries[0].title}"`);
                        break;
                    }
                } catch (err: any) {
                    lastError = err;
                    // Try next candidate model smoothly without logging alarming warnings
                    console.info(`[Itinerary API] Candidate ${modelName} unavailable, checking next model...`);
                }
            }

            if (resultData) {
                return res.json(resultData);
            }

            throw lastError || new Error("Unable to generate itinerary at this time. Please try again.");

        } catch (error: any) {
            console.error("[Itinerary API] All models failed to generate itinerary:", error);
            let errorMessage = "Failed to generate itinerary. Please try again in a few moments.";
            
            const message = String(error?.message || '');
            if (message.includes('503') || message.includes('high demand')) {
                errorMessage = "The AI service is experiencing temporary high demand. Please try again in a few moments.";
            } else if (message.includes('429') || message.includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
                errorMessage = "Daily request quota reached for free tier models. Please try again later or attach a billing-enabled key in Settings > Secrets.";
            } else if (error instanceof Error && error.message) {
                errorMessage = error.message;
            }

            return res.status(500).json({ error: errorMessage });
        }
    });

    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
        app.use(express.static(path.resolve(__dirname, 'dist')));
        app.get('*', (_req, res) => {
            res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
        });
    } else {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    }

    const PORT = Number(process.env.PORT) || 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Safari Travel Planner server running on http://0.0.0.0:${PORT}`);
    });
}

startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
