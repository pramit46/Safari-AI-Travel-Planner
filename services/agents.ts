import { Type } from "@google/genai";

// Agent Schema for Flight Search
export const flightAgentSchema = {
    type: Type.OBJECT,
    description: "The flight agent's findings for round-trip flights. It should provide a few choices for both directions.",
    properties: {
        outboundOptions: {
            type: Type.ARRAY,
            description: "A list of outbound flight options. Provide a few choices within a 10% price deviation of the most optimal flight.",
            items: {
                type: Type.OBJECT,
                properties: {
                    departureAirport: { type: Type.STRING, description: "Departure airport code (e.g., SFO)." },
                    arrivalAirport: { type: Type.STRING, description: "Arrival airport code (e.g., LIR)." },
                    airline: { type: Type.STRING, description: "Name of the airline." },
                    flightNumber: { type: Type.STRING, description: "Flight number." },
                    departureTime: { type: Type.STRING, description: "Departure date and time in ISO 8601 format." },
                    arrivalTime: { type: Type.STRING, description: "Arrival date and time in ISO 8601 format." },
                    price: { type: Type.NUMBER, description: "Price for the one-way flight ticket." },
                    bookingLink: { type: Type.STRING, description: "A URL to a booking website for this flight." },
                },
                required: ['departureAirport', 'arrivalAirport', 'airline', 'flightNumber', 'departureTime', 'arrivalTime', 'price']
            }
        },
        inboundOptions: {
            type: Type.ARRAY,
            description: "A list of inbound flight options. Provide a few choices within a 10% price deviation of the most optimal flight.",
            items: {
                 type: Type.OBJECT,
                properties: {
                    departureAirport: { type: Type.STRING, description: "Departure airport code (e.g., LIR)." },
                    arrivalAirport: { type: Type.STRING, description: "Arrival airport code (e.g., SFO)." },
                    airline: { type: Type.STRING, description: "Name of the airline." },
                    flightNumber: { type: Type.STRING, description: "Flight number." },
                    departureTime: { type: Type.STRING, description: "Departure date and time in ISO 8601 format." },
                    arrivalTime: { type: Type.STRING, description: "Arrival date and time in ISO 8601 format." },
                    price: { type: Type.NUMBER, description: "Price for the one-way flight ticket." },
                    bookingLink: { type: Type.STRING, description: "A URL to a booking website for this flight." },
                },
                required: ['departureAirport', 'arrivalAirport', 'airline', 'flightNumber', 'departureTime', 'arrivalTime', 'price']
            }
        }
    },
    required: ['outboundOptions', 'inboundOptions']
};

// Agent Schema for Accommodation Search
export const accommodationAgentSchema = {
    type: Type.ARRAY,
    description: "The accommodation agent's findings, grouped by location. For each location, provide several options sorted by total price in ascending order.",
    items: {
        type: Type.OBJECT,
        properties: {
            location: { type: Type.STRING, description: "The city or area for this group of accommodation options (e.g., 'Kyoto', 'Hakone')." },
            options: {
                type: Type.ARRAY,
                description: "A list of accommodation options for this location, sorted by totalPrice.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "Name of the hotel or accommodation." },
                        type: { type: Type.STRING, description: "Type of accommodation (e.g., Hotel, Airbnb, Hostel)." },
                        pricePerNight: { type: Type.NUMBER, description: "Cost per night." },
                        totalPrice: { type: Type.NUMBER, description: "Total cost for the entire stay at this location." },
                        bookingLink: { type: Type.STRING, description: "A URL to a booking website for this accommodation." },
                    },
                    required: ['name', 'type', 'pricePerNight', 'totalPrice']
                }
            }
        },
        required: ['location', 'options']
    }
};

// Agent Schema for Daily Activity Planning
export const dailyPlannerAgentSchema = {
    type: Type.ARRAY,
    description: "The daily planner agent's day-by-day schedule of activities, including meals, sightseeing, etc. This plan should account for travel between different accommodation locations if applicable.",
    items: {
        type: Type.OBJECT,
        properties: {
            day: { type: Type.NUMBER, description: "The day number of the itinerary (e.g., 1, 2, 3)." },
            date: { type: Type.STRING, description: "The specific date for this day's plan in ISO 8601 format." },
            title: { type: Type.STRING, description: "A short, catchy title for the day's theme (e.g., 'Arrival and Kyoto Exploration')." },
            activities: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        time: { type: Type.STRING, description: "Estimated time for the activity (e.g., '9:00 AM', 'Afternoon')." },
                        type: { type: Type.STRING, description: "Type of activity. Must be one of: 'Sightseeing', 'Meal', 'Travel', 'Activity', 'Other'." },
                        description: { type: Type.STRING, description: "A short description of the activity." },
                        details: { type: Type.STRING, description: "Optional extra details, tips, or notes about the activity." },
                    },
                    required: ['time', 'type', 'description']
                }
            }
        },
        required: ['day', 'date', 'title', 'activities']
    }
};

// Agent Schema for Trip Essentials & Advisories
export const essentialsAdvisorAgentSchema = {
    type: Type.OBJECT,
    description: "The trip advisor agent's report on essential information.",
    properties: {
        weatherInfo: {
            type: Type.STRING,
            description: "A brief summary of the expected weather conditions for the destination during the travel dates."
        },
        clothingSuggestions: {
            type: Type.STRING,
            description: "Recommendations on what type of clothing to pack based on the weather and planned activities."
        },
        travelWarnings: {
            type: Type.STRING,
            description: "Any relevant travel warnings, a afty tips, or cultural etiquette to be aware of. If none, state that clearly."
        }
    },
    required: ['weatherInfo', 'clothingSuggestions', 'travelWarnings']
};


// System Instruction for the Master Travel Agent (Orchestrator)
export const travelAgentSystemInstruction = `You are an expert travel agent AI named "Safari". You are the orchestrator of a team of specialized agents.
Your goal is to create a single, detailed, and personalized travel itinerary based on the user's request.
Your process is as follows:
1.  **Currency Identification**: First, identify the user's preferred currency from their prompt (e.g., INR, EUR, USD). If no currency is specified, default to USD. All monetary values in your response MUST be in this currency.
2.  Consult your "Flight Agent" to find the best round-trip flight options. It should provide a few alternatives for both outbound and inbound flights, with prices deviating no more than 10% from the optimal choice.
3.  Consult your "Accommodation Agent" to find suitable places to stay. If the trip involves multiple locations, provide several options for each location. All options for a given location must be sorted by total price in ascending order.
4.  Consult your "Daily Planner Agent" to create a day-by-day schedule of activities, including sightseeing and eateries.
5.  Consult your "Trip Advisor Agent" to gather essential information on weather, packing, and safety warnings.
6.  Finally, compile all this information into a single, cohesive itinerary. Calculate the total estimated cost based on the CHEAPEST flight options and the CHEAPEST accommodation option for EACH location.

Ensure all costs are estimated and the total cost reflects the user's budget.
All dates and times should be in ISO 8601 format.
Your final output must be a JSON object that strictly adheres to the provided schema, containing the results from all your specialized agents. Do not output anything other than the JSON object.`;
