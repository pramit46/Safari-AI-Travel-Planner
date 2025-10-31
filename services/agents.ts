import { Type } from "@google/genai";

export const travelAgentSystemInstruction = `You are a master travel agent orchestrating a team of specialist agents to create a comprehensive and personalized travel itinerary. Your team includes:
- Flight Agent: Finds the best flight options (outbound and inbound).
- Railway Agent: Finds the best train options (outbound and inbound).
- Accommodation Agent: Finds suitable accommodation options for each location.
- Daily Planner Agent: Creates a detailed day-by-day plan of activities.
- Essentials Advisor Agent: Provides crucial travel advice like weather, packing, and warnings.

Your primary role is to:
1.  Receive the user's travel request.
2.  Analyze the request for all mentioned locations and ensure your agents provide options for each leg of the journey.
3.  Coordinate with your specialist agents to gather all necessary information.
4.  Compile the information into a single, detailed, and coherent itinerary option.
5.  Intelligently manage the user's budget. For accommodations, you must maintain price parity across different locations on a budget trip. Suggesting a luxury hotel in one city and a hostel in another is not acceptable. For transportation, if the user's budget is too low for flights, prioritize more affordable options like railways and omit the flights section.
6.  Ensure all monetary values are in the currency requested by the user, defaulting to USD if unspecified.
7.  Strictly adhere to the provided JSON schema for the final output. Do not add any extra text or markdown formatting outside of the JSON structure.
8.  For flights, railways and accommodations, provide at least three options for each location, sorted by price (cheapest first).
9.  CRITICAL: For the 'isPureVeg' tag, you MUST be absolutely certain. You must find explicit, verifiable proof from a reliable source (like the hotel's official website, a menu, or a reputable travel review site). If you cannot find this proof, you MUST set 'isPureVeg' to false. DO NOT guess or infer this information. Providing no tag is better than providing an incorrect tag. If you do set it to true, you MUST provide the source URL in 'pureVegSourceLink'.
10. Calculate the \`totalEstimatedCost\` by summing up the costs of the cheapest flight/railway options, the total cost of the cheapest accommodation for each location, and a reasonable buffer for daily activities, meals, and local transport.`;

export const flightAgentSchema = {
    type: Type.OBJECT,
    description: "Flight details for the trip, including outbound and inbound options. Provide at least two options for each, sorted by price (cheapest first).",
    properties: {
        outboundOptions: {
            type: Type.ARRAY,
            description: "List of outbound flight options.",
            items: {
                type: Type.OBJECT,
                properties: {
                    departureAirport: { type: Type.STRING, description: "3-letter IATA code for the departure airport." },
                    arrivalAirport: { type: Type.STRING, description: "3-letter IATA code for the arrival airport." },
                    airline: { type: Type.STRING },
                    flightNumber: { type: Type.STRING },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    price: { type: Type.NUMBER, description: "Price of the flight ticket." },
                    bookingLink: { type: Type.STRING, description: "A direct link to book the flight." }
                },
                required: ['departureAirport', 'arrivalAirport', 'airline', 'flightNumber', 'departureTime', 'arrivalTime', 'price']
            }
        },
        inboundOptions: {
            type: Type.ARRAY,
            description: "List of inbound flight options.",
            items: {
                type: Type.OBJECT,
                properties: {
                    departureAirport: { type: Type.STRING, description: "3-letter IATA code for the departure airport." },
                    arrivalAirport: { type: Type.STRING, description: "3-letter IATA code for the arrival airport." },
                    airline: { type: Type.STRING },
                    flightNumber: { type: Type.STRING },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    price: { type: Type.NUMBER, description: "Price of the flight ticket." },
                    bookingLink: { type: Type.STRING, description: "A direct link to book the flight." }
                },
                required: ['departureAirport', 'arrivalAirport', 'airline', 'flightNumber', 'departureTime', 'arrivalTime', 'price']
            }
        }
    },
    required: ['outboundOptions', 'inboundOptions']
};

export const railwayAgentSchema = {
    type: Type.OBJECT,
    description: "Railway details for the trip, if applicable. Includes outbound and inbound options. Provide at least two options for each, sorted by price (cheapest first).",
    properties: {
        outboundOptions: {
            type: Type.ARRAY,
            description: "List of outbound train options.",
            items: {
                type: Type.OBJECT,
                properties: {
                    departureStation: { type: Type.STRING },
                    arrivalStation: { type: Type.STRING },
                    trainProvider: { type: Type.STRING },
                    trainNumber: { type: Type.STRING },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    price: { type: Type.NUMBER, description: "Price of the train ticket." },
                    bookingLink: { type: Type.STRING, description: "A direct link to book the train ticket." }
                },
                required: ['departureStation', 'arrivalStation', 'trainProvider', 'trainNumber', 'departureTime', 'arrivalTime', 'price']
            }
        },
        inboundOptions: {
            type: Type.ARRAY,
            description: "List of inbound train options.",
            items: {
                type: Type.OBJECT,
                properties: {
                    departureStation: { type: Type.STRING },
                    arrivalStation: { type: Type.STRING },
                    trainProvider: { type: Type.STRING },
                    trainNumber: { type: Type.STRING },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    price: { type: Type.NUMBER, description: "Price of the train ticket." },
                    bookingLink: { type: Type.STRING, description: "A direct link to book the train ticket." }
                },
                required: ['departureStation', 'arrivalStation', 'trainProvider', 'trainNumber', 'departureTime', 'arrivalTime', 'price']
            }
        }
    },
    required: ['outboundOptions', 'inboundOptions']
};

export const accommodationAgentSchema = {
    type: Type.ARRAY,
    description: "List of accommodation options, grouped by location. For each location, provide at least three options sorted by total price (cheapest first).",
    items: {
        type: Type.OBJECT,
        properties: {
            location: { type: Type.STRING, description: "The city or area where the accommodation is located." },
            options: {
                type: Type.ARRAY,
                description: "List of accommodation options for this location.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING, description: "e.g., Hotel, Hostel, Resort, Guesthouse" },
                        pricePerNight: { type: Type.NUMBER },
                        totalPrice: { type: Type.NUMBER, description: "Total price for the duration of the stay at this location." },
                        bookingLink: { type: Type.STRING, description: "A direct link to book the accommodation." },
                        rating: { type: Type.NUMBER, description: "Star rating, e.g., 4.5" },
                        reviewCount: { type: Type.INTEGER },
                        isPureVeg: { type: Type.BOOLEAN, description: "CRITICAL: Set to true ONLY if you can find explicit, verifiable proof that the hotel is exclusively vegetarian. If there is any doubt, set to false. Do not guess." },
                        pureVegSourceLink: { type: Type.STRING, description: "Mandatory URL to a reliable source (official website, menu) that explicitly confirms the pure-veg status. Required if 'isPureVeg' is true." }
                    },
                    required: ['name', 'type', 'pricePerNight', 'totalPrice']
                }
            }
        },
        required: ['location', 'options']
    }
};

export const dailyPlannerAgentSchema = {
    type: Type.ARRAY,
    description: "A detailed day-by-day plan for the entire trip.",
    items: {
        type: Type.OBJECT,
        properties: {
            day: { type: Type.INTEGER, description: "The day number, starting from 1." },
            date: { type: Type.STRING, description: "The specific date for this day's plan in 'YYYY-MM-DD' format." },
            title: { type: Type.STRING, description: "A short, descriptive title for the day's theme or main event. e.g., 'Arrival and Kyoto Exploration'." },
            activities: {
                type: Type.ARRAY,
                description: "A list of activities planned for the day, in chronological order.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        time: { type: Type.STRING, description: "Approximate time for the activity, e.g., '09:00 AM' or 'Afternoon'." },
                        type: { type: Type.STRING, description: "The category of the activity. Must be one of: 'Sightseeing', 'Meal', 'Travel', 'Activity', 'Other'." },
                        description: { type: Type.STRING, description: "A brief description of the activity." },
                        details: { type: Type.STRING, description: "Optional extra details, tips, or context about the activity." }
                    },
                    required: ['time', 'type', 'description']
                }
            }
        },
        required: ['day', 'date', 'title', 'activities']
    }
};

export const essentialsAdvisorAgentSchema = {
    type: Type.OBJECT,
    description: "Essential pre-trip information and advice.",
    properties: {
        weatherInfo: { type: Type.STRING, description: "A summary of the expected weather conditions during the trip." },
        clothingSuggestions: { type: Type.STRING, description: "Recommendations on what clothing to pack based on the weather and planned activities." },
        travelWarnings: { type: Type.STRING, description: "Any relevant travel warnings, health advisories, or safety tips for the destination. If none, state 'No major travel warnings at this time.'." }
    },
    required: ['weatherInfo', 'clothingSuggestions', 'travelWarnings']
};