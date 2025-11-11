import { Type, FunctionDeclaration } from "@google/genai";

export const travelAgentSystemInstruction = `You are a master travel agent orchestrator. Your primary role is to act as a project manager, delegating tasks to a team of specialized AI agents to build a comprehensive and personalized travel itinerary.

Your Team of AI Agents:
1.  **Flight Agent**: Finds the best flight options. MUST use the 'searchAndVerifyFlights' tool for every option.
2.  **Railway Agent**: Finds the best train options. MUST use the 'searchAndVerifyRailways' tool for every option.
3.  **Roadway Agent**: Finds bus or car options.
4.  **Other Transport Agent**: Finds niche transport like ferries or private transfers.
5.  **Accommodation Agent**: Researches and recommends places to stay.
6.  **Daily Planner Agent**: Creates the day-by-day schedule.
7.  **Essentials Advisor Agent**: Provides crucial travel advice.

Your Workflow:
1.  **Analyze Request**: Understand the user's destination, budget, dates, and preferences.
2.  **MANDATORY Tool Use**: Your first step is ALWAYS to use tools to search for transport.
    *   For flights, you MUST call the \`searchAndVerifyFlights\` tool for each potential flight.
    *   For railways, you MUST call the \`searchAndVerifyRailways\` tool for each potential train journey.
    *   You must wait for the verification data from these tools before proceeding.
3.  **Delegate & Synthesize**: Instruct your other agents to generate their content based on the verified transport and user preferences.
4.  **Compile Final Itinerary**: Your final task is to compile all agent data into a single, cohesive JSON object that strictly follows the provided schema.

Critical Rules:
- **Tool use is not optional.** You MUST call the appropriate search/verification tool for ALL flight and railway options.
- **Logical Planning**: Do not suggest flights for short distances where road or rail is clearly superior (e.g., Siliguri to Gangtok). Prioritize the most logical mode of transport.
- **Adhere to Budget**: If a transport mode (especially flights) does not fit the user's budget, do not include it. Focus on what is affordable.
- **User Context is Key**: Pay close attention to keywords like "family", "solo", "romantic" to tailor the trip's title and suggestions.
- **Provide Options**: ALWAYS provide at least three options for accommodation per location and at least two for transport, unless the budget is extremely restrictive. Sort options by price (lowest to highest).
- **Round Trips**: If the trip has a return date or duration, providing inbound options for transport is MANDATORY.
- **Schema Adherence**: The final output MUST strictly be the JSON object defined in the schema.`;

export const flightAgentSchema = {
    type: Type.OBJECT,
    description: "Flight details for the trip. Only include this section if flights are a logical and budget-friendly option.",
    properties: {
        outboundOptions: {
            type: Type.ARRAY,
            description: "List of flight options for the outbound journey.",
            items: {
                type: Type.OBJECT,
                properties: {
                    departureAirport: { type: Type.STRING, description: "3-letter IATA code of the departure airport." },
                    arrivalAirport: { type: Type.STRING, description: "3-letter IATA code of the arrival airport." },
                    airline: { type: Type.STRING },
                    flightNumber: { type: Type.STRING },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    price: { type: Type.NUMBER, description: "Estimated price of the flight." },
                    bookingLink: { type: Type.STRING, description: "A deep link to a Google Flights search result for this specific flight. e.g., 'https://www.google.com/flights?q=JFK+to+LHR+on+2024-12-15'" },
                    seatType: { type: Type.STRING, enum: ['Economy', 'Business', 'First'] },
                    verificationStatus: { type: Type.STRING, enum: ['Verified', 'Not Found'], description: "Status from the flight verification tool." }
                },
                required: ['departureAirport', 'arrivalAirport', 'airline', 'flightNumber', 'departureTime', 'arrivalTime', 'price', 'bookingLink', 'seatType', 'verificationStatus']
            }
        },
        inboundOptions: {
            type: Type.ARRAY,
            description: "List of flight options for the return journey. This is mandatory for round trips.",
            items: {
                type: Type.OBJECT,
                properties: {
                    departureAirport: { type: Type.STRING, description: "3-letter IATA code of the departure airport." },
                    arrivalAirport: { type: Type.STRING, description: "3-letter IATA code of the arrival airport." },
                    airline: { type: Type.STRING },
                    flightNumber: { type: Type.STRING },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    price: { type: Type.NUMBER, description: "Estimated price of the flight." },
                    bookingLink: { type: Type.STRING, description: "A deep link to a Google Flights search result for this specific flight." },
                    seatType: { type: Type.STRING, enum: ['Economy', 'Business', 'First'] },
                    verificationStatus: { type: Type.STRING, enum: ['Verified', 'Not Found'], description: "Status from the flight verification tool." }
                },
                required: ['departureAirport', 'arrivalAirport', 'airline', 'flightNumber', 'departureTime', 'arrivalTime', 'price', 'bookingLink', 'seatType', 'verificationStatus']
            }
        }
    }
};

export const railwayAgentSchema = {
    type: Type.OBJECT,
    description: "Railway details for the trip. Only include if trains are a logical and budget-friendly option.",
    properties: {
        outboundOptions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    departureStation: { type: Type.STRING },
                    arrivalStation: { type: Type.STRING },
                    trainProvider: { type: Type.STRING },
                    trainNumber: { type: Type.STRING },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    price: { type: Type.NUMBER },
                    bookingLink: { type: Type.STRING, description: "A deep link to a booking page or search result." },
                    berthType: { type: Type.STRING, enum: ['EC', 'CC', 'Sleeper', '2AC', '3AC', '1AC', 'General'] },
                    verificationStatus: { type: Type.STRING, enum: ['Verified', 'Not Found'], description: "Status from the railway verification tool." }
                },
                required: ['departureStation', 'arrivalStation', 'trainProvider', 'trainNumber', 'departureTime', 'arrivalTime', 'price', 'bookingLink', 'berthType', 'verificationStatus']
            }
        },
        inboundOptions: {
            type: Type.ARRAY,
             description: "List of train options for the return journey. This is mandatory for round trips.",
            items: {
                type: Type.OBJECT,
                properties: {
                    departureStation: { type: Type.STRING },
                    arrivalStation: { type: Type.STRING },
                    trainProvider: { type: Type.STRING },
                    trainNumber: { type: Type.STRING },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    price: { type: Type.NUMBER },
                    bookingLink: { type: Type.STRING, description: "A deep link to a booking page or search result." },
                    berthType: { type: Type.STRING, enum: ['EC', 'CC', 'Sleeper', '2AC', '3AC', '1AC', 'General'] },
                    verificationStatus: { type: Type.STRING, enum: ['Verified', 'Not Found'], description: "Status from the railway verification tool." }
                },
                required: ['departureStation', 'arrivalStation', 'trainProvider', 'trainNumber', 'departureTime', 'arrivalTime', 'price', 'bookingLink', 'berthType', 'verificationStatus']
            }
        }
    }
};

export const roadwayAgentSchema = {
    type: Type.OBJECT,
    description: "Road travel details (bus, car rental). Include if it's the most logical transport mode.",
    properties: {
        outboundOptions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    departurePoint: { type: Type.STRING },
                    arrivalPoint: { type: Type.STRING },
                    serviceProvider: { type: Type.STRING, description: "e.g., 'Greyhound', 'Hertz'" },
                    vehicleType: { type: Type.STRING, description: "e.g., 'Bus', 'SUV Rental'" },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    price: { type: Type.NUMBER },
                    bookingLink: { type: Type.STRING },
                    seatType: { type: Type.STRING, description: "e.g., 'Standard Seat', 'Sleeper Berth'" }
                },
                required: ['departurePoint', 'arrivalPoint', 'serviceProvider', 'vehicleType', 'departureTime', 'arrivalTime', 'price', 'bookingLink', 'seatType']
            }
        },
        inboundOptions: {
            type: Type.ARRAY,
            description: "List of roadway options for the return journey. This is mandatory for round trips.",
            items: {
                type: Type.OBJECT,
                properties: {
                    departurePoint: { type: Type.STRING },
                    arrivalPoint: { type: Type.STRING },
                    serviceProvider: { type: Type.STRING },
                    vehicleType: { type: Type.STRING },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    price: { type: Type.NUMBER },
                    bookingLink: { type: Type.STRING },
                    seatType: { type: Type.STRING }
                },
                required: ['departurePoint', 'arrivalPoint', 'serviceProvider', 'vehicleType', 'departureTime', 'arrivalTime', 'price', 'bookingLink', 'seatType']
            }
        }
    }
};

export const otherTransportAgentSchema = {
    type: Type.OBJECT,
    description: "Other relevant transport options like ferries or private transfers. Include if highly relevant to the destination.",
    properties: {
        outboundOptions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    transportType: { type: Type.STRING, description: "e.g., 'Ferry', 'Private Transfer'" },
                    serviceProvider: { type: Type.STRING },
                    departurePoint: { type: Type.STRING },
                    arrivalPoint: { type: Type.STRING },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    price: { type: Type.NUMBER },
                    bookingLink: { type: Type.STRING },
                    details: { type: Type.STRING, description: "Optional extra details, e.g., 'Scenic coastal route'" }
                },
                 required: ['transportType', 'serviceProvider', 'departurePoint', 'arrivalPoint', 'departureTime', 'arrivalTime', 'price', 'bookingLink']
            }
        },
        inboundOptions: {
            type: Type.ARRAY,
            description: "List of other transport options for the return journey. This is mandatory for round trips.",
            items: {
                type: Type.OBJECT,
                properties: {
                    transportType: { type: Type.STRING },
                    serviceProvider: { type: Type.STRING },
                    departurePoint: { type: Type.STRING },
                    arrivalPoint: { type: Type.STRING },
                    departureTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    arrivalTime: { type: Type.STRING, description: "ISO 8601 format date and time." },
                    price: { type: Type.NUMBER },
                    bookingLink: { type: Type.STRING },
                    details: { type: Type.STRING }
                },
                required: ['transportType', 'serviceProvider', 'departurePoint', 'arrivalPoint', 'departureTime', 'arrivalTime', 'price', 'bookingLink']
            }
        }
    }
};

export const accommodationAgentSchema = {
    type: Type.ARRAY,
    description: "List of accommodation options, grouped by location. Provide at least three distinct hotel options per location, sorted by price (cheapest first).",
    items: {
        type: Type.OBJECT,
        properties: {
            location: { type: Type.STRING, description: "The city or area where the accommodation is located." },
            options: {
                type: Type.ARRAY,
                description: "List of accommodation choices for this location.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        type: { type: Type.STRING, description: "e.g., 'Hotel', 'Hostel', 'Resort', 'Homestay'" },
                        pricePerNight: { type: Type.NUMBER },
                        totalPrice: { type: Type.NUMBER, description: "Total price for the duration of the stay at this location." },
                        bookingLink: { type: Type.STRING, description: "A deep link to a Google Hotels search result or a direct booking page." },
                        rating: { type: Type.NUMBER, description: "Star rating, e.g., 4.5" },
                        reviewCount: { type: Type.NUMBER },
                        isPureVeg: { type: Type.BOOLEAN, description: "Indicates if the hotel is strictly vegetarian." },
                        pureVegSourceLink: { type: Type.STRING, description: "URL source for the pure-veg claim, if available." }
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
    description: "A detailed day-by-day plan for the trip.",
    items: {
        type: Type.OBJECT,
        properties: {
            day: { type: Type.INTEGER },
            date: { type: Type.STRING, description: "The date for this day's plan in 'YYYY-MM-DD' format." },
            title: { type: Type.STRING, description: "A short, catchy title for the day's activities, e.g., 'Exploring Old Town'." },
            activities: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        time: { type: Type.STRING, description: "e.g., '09:00 AM'" },
                        type: { type: Type.STRING, enum: ['Sightseeing', 'Meal', 'Travel', 'Activity', 'Other'] },
                        description: { type: Type.STRING, description: "A concise description of the activity." },
                        details: { type: Type.STRING, description: "Optional extra details or tips about the activity." }
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
    properties: {
        weatherInfo: { type: Type.STRING, description: "A brief summary of the expected weather conditions during the trip." },
        clothingSuggestions: { type: Type.STRING, description: "Recommendations on what type of clothing to pack." },
        travelWarnings: { type: Type.STRING, description: "A bulleted list of advisories. Each point MUST start with '*' or '-'. Cover topics like: health/weather impact, permit needs, road conditions, social/political unrest, local festivals, restricted areas (military/forests), time restrictions, and general safety (thefts)." }
    },
    required: ['weatherInfo', 'clothingSuggestions', 'travelWarnings']
};

export const flightSearchToolSchema: FunctionDeclaration = {
    name: "searchAndVerifyFlights",
    description: "Searches a real-time database for available flights and verifies their plausibility. This tool MUST be called for every flight option you intend to suggest.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            departureAirport: { type: Type.STRING, description: "3-letter IATA code of the departure airport." },
            arrivalAirport: { type: Type.STRING, description: "3-letter IATA code of the arrival airport." },
            departureDate: { type: Type.STRING, description: "The date of departure in 'YYYY-MM-DD' format." },
            airline: { type: Type.STRING, description: "The airline carrier." },
            price: { type: Type.NUMBER, description: "The estimated price you have for this flight before verification." },
        },
        required: ['departureAirport', 'arrivalAirport', 'departureDate', 'airline', 'price']
    }
};

export const railwaySearchToolSchema: FunctionDeclaration = {
    name: "searchAndVerifyRailways",
    description: "Searches a real-time database for available train routes and verifies their plausibility. This tool MUST be called for every train option you intend to suggest.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            departureStation: { type: Type.STRING, description: "Name of the departure station." },
            arrivalStation: { type: Type.STRING, description: "Name of the arrival station." },
            departureDate: { type: Type.STRING, description: "The date of departure in 'YYYY-MM-DD' format." },
            trainProvider: { type: Type.STRING, description: "The train operator or company." },
            price: { type: Type.NUMBER, description: "The estimated price you have for this train before verification." },
        },
        required: ['departureStation', 'arrivalStation', 'departureDate', 'trainProvider', 'price']
    }
};
