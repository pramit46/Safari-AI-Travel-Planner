import { GoogleGenAI, Type } from "@google/genai";
import { ItineraryResponse } from '../types';
import { 
    travelAgentSystemInstruction,
    flightAgentSchema,
    accommodationAgentSchema,
    dailyPlannerAgentSchema,
    essentialsAdvisorAgentSchema,
    railwayAgentSchema
} from './agents';

// Define the master JSON schema by composing the schemas from individual agents.
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
                        description: "A creative and descriptive title for the trip plan. e.g., 'An Adventurous 10-Day Journey Through Costa Rica'."
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
                    accommodation: accommodationAgentSchema,
                    dailyPlan: dailyPlannerAgentSchema,
                    tripEssentials: essentialsAdvisorAgentSchema
                },
                required: ['title', 'totalEstimatedCost', 'currency', 'flights', 'railways', 'accommodation', 'dailyPlan', 'tripEssentials']
            }
        }
    },
    required: ['itineraries']
};

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

export const generateItinerary = async (prompt: string): Promise<ItineraryResponse> => {
    // Use a model suitable for complex reasoning and JSON output as per guidelines.
    const model = 'gemini-2.5-pro';

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: itinerarySchema,
                systemInstruction: travelAgentSystemInstruction,
                temperature: 0.7,
            }
        });

        const jsonText = response.text.trim();
        // A simple robust guard against markdown fences
        const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '');
        const result: ItineraryResponse = JSON.parse(cleanedJsonText);
        return result;

    } catch (e) {
        console.error("Error generating or parsing itinerary:", e);
        if (e instanceof Error && e.message.includes('JSON')) {
             throw new Error("The AI returned an invalid response format. Please try refining your request.");
        }
        throw new Error("Failed to generate an itinerary due to an unexpected issue. Please try again later.");
    }
};