import { GoogleGenAI, Type } from "@google/genai";
import { ItineraryResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        itineraries: {
            type: Type.ARRAY,
            description: "A list of potential travel itineraries. Usually just one.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A catchy title for the itinerary." },
                    totalEstimatedCost: { type: Type.NUMBER, description: "Total estimated cost for the trip in USD." },
                    flights: {
                        type: Type.OBJECT,
                        properties: {
                            outbound: {
                                type: Type.OBJECT,
                                properties: {
                                    departureAirport: { type: Type.STRING },
                                    arrivalAirport: { type: Type.STRING },
                                    airline: { type: Type.STRING },
                                    flightNumber: { type: Type.STRING },
                                    departureTime: { type: Type.STRING, description: "ISO 8601 format" },
                                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format" },
                                    price: { type: Type.NUMBER },
                                    bookingLink: { type: Type.STRING },
                                },
                            },
                            inbound: {
                                type: Type.OBJECT,
                                properties: {
                                    departureAirport: { type: Type.STRING },
                                    arrivalAirport: { type: Type.STRING },
                                    airline: { type: Type.STRING },
                                    flightNumber: { type: Type.STRING },
                                    departureTime: { type: Type.STRING, description: "ISO 8601 format" },
                                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format" },
                                    price: { type: Type.NUMBER },
                                    bookingLink: { type: Type.STRING },
                                },
                            },
                        },
                    },
                    accommodation: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            type: { type: Type.STRING, description: "e.g., Hotel, Airbnb, Hostel" },
                            checkInDate: { type: Type.STRING },
                            checkOutDate: { type: Type.STRING },
                            pricePerNight: { type: Type.NUMBER },
                            totalPrice: { type: Type.NUMBER },
                            bookingLink: { type: Type.STRING },
                        },
                    },
                    dailyPlan: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: { type: Type.INTEGER },
                                date: { type: Type.STRING },
                                title: { type: Type.STRING, description: "A summary for the day's plan." },
                                activities: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            time: { type: Type.STRING, description: "e.g., '09:00 AM'" },
                                            type: {
                                                type: Type.STRING,
                                                enum: ['Sightseeing', 'Meal', 'Travel', 'Activity', 'Other'],
                                            },
                                            description: { type: Type.STRING, description: "What the activity is." },
                                            details: { type: Type.STRING, description: "Optional extra details like address or tips." },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};


export const generateItinerary = async (prompt: string): Promise<ItineraryResponse> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Generate a complete travel plan for the following request: ${prompt}`,
            config: {
                systemInstruction: "You are an expert AI travel agent. Your goal is to generate a complete and detailed travel itinerary based on the user's request. You MUST adhere strictly to the provided JSON schema and fill out ALL fields, including flights, accommodation, and a comprehensive daily plan. Do not leave any sections empty. If you cannot find specific real-time data (like a flight number or a specific hotel), use realistic and plausible placeholders (e.g., 'Budget Airline', 'City Center Hotel'). Be creative and provide rich descriptions and details for all activities. The user's budget is a critical constraint.",
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                thinkingConfig: { thinkingBudget: 8192 },
            }
        });

        const jsonText = response.text.trim();
        // The model can sometimes wrap the JSON in markdown, so we remove it
        const cleanedJsonText = jsonText.replace(/^```json\s*|```$/g, '').trim();

        // The model can also sometimes add conversational text. Let's find the main JSON object.
        const startIndex = cleanedJsonText.indexOf('{');
        const endIndex = cleanedJsonText.lastIndexOf('}');

        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
            throw new Error("Could not find a valid JSON object in the response.");
        }

        const jsonSubstring = cleanedJsonText.substring(startIndex, endIndex + 1);

        const parsedResponse = JSON.parse(jsonSubstring);
        
        if (!parsedResponse.itineraries || !Array.isArray(parsedResponse.itineraries)) {
            throw new Error("Invalid itinerary format received from API.");
        }

        return parsedResponse;

    } catch (error) {
        console.error("Error generating itinerary:", error);
        if (error instanceof Error) {
            // Re-throw specific JSON parsing errors to be more informative
            if (error.message.includes("JSON")) {
                 throw new Error(`There was an issue parsing the itinerary from the AI. Please try again. Details: ${error.message}`);
            }
            throw new Error(`Failed to generate itinerary: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the itinerary.");
    }
};