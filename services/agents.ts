import { Type } from "@google/genai";

export const travelAgentSystemInstruction = `You are a master travel agent orchestrating a team of specialist agents. Your output MUST be a complete, logical, and budget-conscious travel itinerary. You will follow a strict, multi-step reasoning process. Deviation from this process is a critical failure.

**CORE DIRECTIVE: AVOID HALLUCINATION. PRIORITIZE REALISM AND VERIFIABILITY.**
- **You do NOT have access to real-time flight, train, or hotel booking systems.** Do not invent specific flight numbers, train numbers, or precise, non-verifiable prices.
- **Your Role:** You are a *planner*, not a booking engine. Your goal is to provide a realistic, well-structured travel plan with verifiable links.
- **Transport Details:** For flights and trains, provide representative airlines/providers for the route. Prices should be reasonable **estimates**. The most critical field is the 'bookingLink', which **MUST** be a valid Google Search URL (e.g., Google Flights, Google Search for trains) that allows the user to find real-time options. It is a CRITICAL FAILURE to invent a direct booking link to an airline's website.
- **Accommodation:** Follow the same principle for booking links. Provide a Google Search link if a direct link to a major booking platform isn't known and verifiable.

**USER LOCATION CONTEXT:**
- The user's prompt may be appended with a "[System Note]" providing location context.
- **If the note contains Latitude/Longitude:** The user has granted precise location access. You MUST use these coordinates as the default origin if no starting location is specified in the prompt. Identify the nearest major city or transport hub to these coordinates for planning.
- **If the note contains an "Inferred start location":** The user denied precise location access. This location is an educated guess based on their timezone. You should use this city (e.g., a country's capital) as the default origin if no starting location is specified in the prompt.
- In both cases, this context is only a fallback. If the user explicitly writes "a trip from Paris", you MUST use Paris as the origin.

**CRITICAL REASONING PROCESS:**

**Step 1: Analyze Core Request & Budget.**
- Identify ALL destinations, the total trip duration, and the total budget. This context is paramount for all subsequent steps.

**Step 2: Determine Transport for the FULL JOURNEY (MANDATORY).**
- This is your most important task. You must find a way for the user to get **TO** their first destination, **BETWEEN** all subsequent destinations, and **BACK** from their final destination.
- **"Full Journey" Mandate:** If a user requests a trip to "Siliguri & Gangtok", you MUST provide transport options for three distinct legs: 1. Origin to Siliguri/nearby transport hub. 2. Siliguri to Gangtok. 3. Gangtok back to Origin. You will list these sequential legs within the 'outboundOptions' and the final return journey in 'inboundOptions'. It is a CRITICAL FAILURE to only plan transport to the first city.
- **Mode Evaluation:** Based on the budget and specific route, you MUST evaluate both flights and railways. For certain routes like those in the Himalayas (e.g., Siliguri to Gangtok), road or specific rail options are highly relevant and must be considered.
- **Resourcefulness:** If you struggle to find budget-appropriate flights from one source, you must broaden your search across your knowledge of different airlines and booking platforms.
- **Schema Adherence:** You MUST return both the 'flights' and 'railways' keys. If a transport mode is not feasible for a leg, you MUST return empty arrays for its options. It is a CRITICAL FAILURE to omit these keys.

**Step 3: Allocate & Enforce Accommodation Budget (THE MOST CRITICAL RULE).**
- **A. Calculate Remaining Budget:** Subtract your estimated transport costs from the user's total budget.
- **B. Calculate the "Hard Price Cap Per Night":** Divide the Remaining Budget by the total number of nights. This number is your absolute maximum average price per night.
- **C. Enforce the "Hard Cap":** For EVERY accommodation option you suggest, in EVERY location, the 'pricePerNight' **CANNOT EXCEED** this calculated "Hard Price Cap". There are no exceptions. This is the highest priority rule. It is a CRITICAL FAILURE to suggest luxury hotels in one city and budget hotels in another on the same trip.
- **D. Success Condition:** It is a SUCCESS to return only one or two hotels for a location if those are the only ones that meet the strict budget cap. It is a FAILURE to include expensive hotels just to meet the 'three options' goal.
- **E. Broaden Your Search if Necessary:** If you struggle to find at least three budget-compliant options for a location, you must broaden your search. Consider a wider variety of sources in your knowledge base, including major international booking sites, local or regional travel portals (e.g., MakeMyTrip for India), and alternative lodging types like guesthouses or well-rated budget inns. Do not give up easily. The goal is to find viable options that respect the user's budget.

**Step 4: Compile Final Plan & Adhere to Data Accuracy Rules.**
- Assemble the results. Ensure 'totalEstimatedCost' is accurate.
- **"Pure-Veg" Status:** You are FORBIDDEN to set 'isPureVeg' to true unless you find undeniable, explicit proof on the hotel's OFFICIAL website. If in ANY doubt, it MUST be false. When true, 'pureVegSourceLink' MUST be provided.
- **Booking Links:** All 'bookingLink' URLs MUST be functional. If a direct link from an official/major site is unavailable, you MUST provide a formatted Google Search URL as a fallback.`;

export const flightAgentSchema = {
    type: Type.OBJECT,
    description: "Flight details. This key is REQUIRED. If no flights are feasible within the budget, return empty arrays for options.",
    properties: {
        outboundOptions: {
            type: Type.ARRAY,
            description: "List of all sequential flight options for the forward journey, including legs between destinations.",
            items: {
                type: Type.OBJECT,
                properties: {
                    departureAirport: { type: Type.STRING, description: "3-letter IATA code for the departure airport." },
                    arrivalAirport: { type: Type.STRING, description: "3-letter IATA code for the arrival airport." },
                    airline: { type: Type.STRING },
                    flightNumber: { type: Type.STRING, description: "A representative flight number for the airline and route. e.g., 'AI-101'." },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    price: { type: Type.NUMBER, description: "Estimated price of the flight ticket for one adult." },
                    bookingLink: { type: Type.STRING, description: "CRITICAL: MUST be a valid Google Flights search URL. Example: 'https://www.google.com/flights?q=flights+from+DEL+to+IXB'. Do NOT invent direct booking links." },
                    seatType: { type: Type.STRING, description: "The class of the seat, determined by the trip's budget. e.g., 'Economy', 'Business'."}
                },
                required: ['departureAirport', 'arrivalAirport', 'airline', 'flightNumber', 'departureTime', 'arrivalTime', 'price', 'bookingLink', 'seatType']
            }
        },
        inboundOptions: {
            type: Type.ARRAY,
            description: "List of flight options for the final return journey.",
            items: {
                type: Type.OBJECT,
                properties: {
                    departureAirport: { type: Type.STRING, description: "3-letter IATA code for the departure airport." },
                    arrivalAirport: { type: Type.STRING, description: "3-letter IATA code for the arrival airport." },
                    airline: { type: Type.STRING },
                    flightNumber: { type: Type.STRING, description: "A representative flight number for the airline and route. e.g., 'AI-102'." },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    price: { type: Type.NUMBER, description: "Estimated price of the flight ticket for one adult." },
                    bookingLink: { type: Type.STRING, description: "CRITICAL: MUST be a valid Google Flights search URL. Example: 'https://www.google.com/flights?q=flights+from+IXB+to+DEL'. Do NOT invent direct booking links." },
                    seatType: { type: Type.STRING, description: "The class of the seat, determined by the trip's budget. e.g., 'Economy', 'Business'."}
                },
                required: ['departureAirport', 'arrivalAirport', 'airline', 'flightNumber', 'departureTime', 'arrivalTime', 'price', 'bookingLink', 'seatType']
            }
        }
    },
    required: ['outboundOptions', 'inboundOptions']
};

export const railwayAgentSchema = {
    type: Type.OBJECT,
    description: "Railway details. This key is REQUIRED. If no trains are feasible or applicable, return empty arrays for options.",
    properties: {
        outboundOptions: {
            type: Type.ARRAY,
            description: "List of all sequential train options for the forward journey, including legs between destinations.",
            items: {
                type: Type.OBJECT,
                properties: {
                    departureStation: { type: Type.STRING },
                    arrivalStation: { type: Type.STRING },
                    trainProvider: { type: Type.STRING },
                    trainNumber: { type: Type.STRING, description: "A representative train number for the route." },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    price: { type: Type.NUMBER, description: "Estimated price of the train ticket." },
                    bookingLink: { type: Type.STRING, description: "CRITICAL: MUST be a valid Google Search URL for the train route. Example: 'https://www.google.com/search?q=trains+from+New+Jalpaiguri+to+Sealdah'. Do NOT invent direct booking links." },
                    berthType: { type: Type.STRING, description: "The class of the berth, determined by the trip's budget. e.g., 'Sleeper', '3AC', '2AC', 'CC'."}
                },
                required: ['departureStation', 'arrivalStation', 'trainProvider', 'trainNumber', 'departureTime', 'arrivalTime', 'price', 'bookingLink', 'berthType']
            }
        },
        inboundOptions: {
            type: Type.ARRAY,
            description: "List of train options for the final return journey.",
            items: {
                type: Type.OBJECT,
                properties: {
                    departureStation: { type: Type.STRING },
                    arrivalStation: { type: Type.STRING },
                    trainProvider: { type: Type.STRING },
                    trainNumber: { type: Type.STRING, description: "A representative train number for the route." },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date-time string." },
                    price: { type: Type.NUMBER, description: "Estimated price of the train ticket." },
                    bookingLink: { type: Type.STRING, description: "CRITICAL: MUST be a valid Google Search URL for the train route. Example: 'https://www.google.com/search?q=trains+from+Sealdah+to+New+Jalpaiguri'. Do NOT invent direct booking links." },
                    berthType: { type: Type.STRING, description: "The class of the berth, determined by the trip's budget. e.g., 'Sleeper', '3AC', '2AC', 'CC'."}
                },
                required: ['departureStation', 'arrivalStation', 'trainProvider', 'trainNumber', 'departureTime', 'arrivalTime', 'price', 'bookingLink', 'berthType']
            }
        }
    },
    required: ['outboundOptions', 'inboundOptions']
};

export const accommodationAgentSchema = {
    type: Type.ARRAY,
    description: "List of accommodation options, grouped by location. For each location, provide at least three options that adhere to the budget parity rule, sorted by total price (cheapest first).",
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
                        bookingLink: { type: Type.STRING, description: "A direct, working link to book the accommodation, or a Google Search URL as a fallback." },
                        rating: { type: Type.NUMBER, description: "Star rating, e.g., 4.5" },
                        reviewCount: { type: Type.INTEGER },
                        isPureVeg: { type: Type.BOOLEAN, description: "CRITICAL: Set to true ONLY if you can find explicit, verifiable proof on the hotel's OFFICIAL website that it is a '100% vegetarian' hotel. If there is ANY doubt, this MUST be false." },
                        pureVegSourceLink: { type: Type.STRING, description: "Mandatory URL to the official hotel page that explicitly confirms the pure-veg status. Required if 'isPureVeg' is true." }
                    },
                    required: ['name', 'type', 'pricePerNight', 'totalPrice', 'bookingLink']
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