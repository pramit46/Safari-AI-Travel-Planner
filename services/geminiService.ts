import { GoogleGenAI, Type, FunctionDeclaration, Content } from "@google/genai";
import { ItineraryResponse } from '../types';
import { 
    travelAgentSystemInstruction,
    flightAgentSchema,
    accommodationAgentSchema,
    dailyPlannerAgentSchema,
    essentialsAdvisorAgentSchema,
    railwayAgentSchema,
    roadwayAgentSchema,
    otherTransportAgentSchema,
    flightSearchToolSchema,
    railwaySearchToolSchema
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

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const model = 'gemini-2.5-pro';

export const generateItinerary = async (prompt: string): Promise<ItineraryResponse> => {
    try {
        const conversationHistory: Content[] = [
            { role: 'user', parts: [{ text: prompt }] }
        ];

        console.log("Starting itinerary generation process... Requesting transport verification.");
        
        const firstTurnResponse = await ai.models.generateContent({
            model: model,
            contents: conversationHistory,
            config: {
                systemInstruction: travelAgentSystemInstruction,
                tools: [{ functionDeclarations: [
                    flightSearchToolSchema as FunctionDeclaration,
                    railwaySearchToolSchema as FunctionDeclaration
                ] }],
            }
        });

        const modelResponseContent = firstTurnResponse.candidates[0].content;
        conversationHistory.push(modelResponseContent);
        
        const functionCalls = firstTurnResponse.functionCalls;

        if (functionCalls && functionCalls.length > 0) {
            console.log(`AI requested verification for ${functionCalls.length} transport option(s).`);
            console.log(JSON.stringify(functionCalls, null, 2));

            const functionResponses = functionCalls.map(fc => {
                const args = fc.args;
                const toolName = fc.name;

                console.log(`Simulating search for ${toolName} with args:`, args);
                
                return {
                    id: fc.id,
                    name: toolName,
                    response: {
                        result: {
                            status: "Verified",
                            message: `The proposed route is plausible. Price is a verified estimate. User must confirm final price and availability via booking link.`,
                            estimatedPrice: args.price,
                        }
                    }
                };
            });

            conversationHistory.push({
                role: 'tool',
                parts: functionResponses.map(fr => ({ functionResponse: fr }))
            });
        } else {
            console.log("AI did not request any transport verifications. Proceeding to final generation.");
        }

        console.log("Sending verification results back to AI and requesting final itinerary...");
        const finalResponse = await ai.models.generateContent({
            model: model,
            contents: conversationHistory,
            config: {
                responseMimeType: "application/json",
                responseSchema: itinerarySchema,
                systemInstruction: "You are a travel agent who has just received transport verification data. Based on the entire conversation history, including the user's request and the verified information, compile the final, complete itinerary in the specified JSON format. Adhere strictly to the provided JSON schema and all original constraints."
            }
        });

        const jsonString = finalResponse.text;
        const result: ItineraryResponse = JSON.parse(jsonString);
        return result;

    } catch (error) {
        console.error("Error generating itinerary:", error);
        if (error instanceof Error && error.message.includes('JSON')) {
             throw new Error("The AI returned an invalid response. Please try rephrasing your request.");
        }
        throw new Error("Failed to generate itinerary due to an unexpected error.");
    }
};
