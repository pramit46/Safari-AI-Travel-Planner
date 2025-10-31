import React, { useState, useEffect } from 'react';
import { ItineraryOption, FlightInfo, AccommodationInfo, RailwayInfo } from './types';
import { generateItinerary } from './services/geminiService';
import TripInput from './components/TripInput';
import ItineraryDisplay from './components/ItineraryDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyState from './components/EmptyState';
import TripSuggestions from './components/TripSuggestions';

const App: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [itinerary, setItinerary] = useState<ItineraryOption | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingStatus, setLoadingStatus] = useState('');

    const [selectedFlights, setSelectedFlights] = useState<{ outbound: FlightInfo | null, inbound: FlightInfo | null }>({ outbound: null, inbound: null });
    const [selectedRailways, setSelectedRailways] = useState<{ outbound: RailwayInfo | null, inbound: RailwayInfo | null }>({ outbound: null, inbound: null });
    const [selectedAccommodations, setSelectedAccommodations] = useState<{ [location: string]: AccommodationInfo | null }>({});
    const [dynamicTotalCost, setDynamicTotalCost] = useState<number | null>(null);
    const [baseCost, setBaseCost] = useState<number>(0);

    const loadingMessages = [
        "Contacting our AI travel agents...",
        "Transport Agents are searching for routes...",
        "Accommodation Agent is finding hotels...",
        "Activity Agent is planning your days...",
        "Finalizing your personalized itinerary..."
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        if (isLoading) {
            setLoadingStatus(loadingMessages[0]);
            let i = 1;
            interval = setInterval(() => {
                setLoadingStatus(loadingMessages[i % loadingMessages.length]);
                i++;
            }, 3000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isLoading]);

    useEffect(() => {
        if (baseCost > 0 && Object.values(selectedAccommodations).every(Boolean)) {
            const flightCost = (selectedFlights.outbound?.price || 0) + (selectedFlights.inbound?.price || 0);
            const railwayCost = (selectedRailways.outbound?.price || 0) + (selectedRailways.inbound?.price || 0);
            const accommodationCost = Object.values(selectedAccommodations).reduce((sum, acc) => sum + (acc?.totalPrice || 0), 0);
            const newTotal = baseCost + flightCost + railwayCost + accommodationCost;
            setDynamicTotalCost(newTotal);
        }
    }, [selectedFlights, selectedRailways, selectedAccommodations, baseCost]);

    const handleSubmit = async (currentPrompt: string) => {
        if (!currentPrompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setItinerary(null);
        try {
            const result = await generateItinerary(currentPrompt);
            if (result.itineraries && result.itineraries.length > 0) {
                const initialItinerary = result.itineraries[0];
                setItinerary(initialItinerary);

                // Initialize flights
                const cheapestOutboundFlight = initialItinerary.flights?.outboundOptions?.[0];
                const cheapestInboundFlight = initialItinerary.flights?.inboundOptions?.[0];
                setSelectedFlights({ outbound: cheapestOutboundFlight || null, inbound: cheapestInboundFlight || null });

                 // Initialize railways
                 const cheapestOutboundRailway = initialItinerary.railways?.outboundOptions?.[0];
                 const cheapestInboundRailway = initialItinerary.railways?.inboundOptions?.[0];
                 setSelectedRailways({ outbound: cheapestOutboundRailway || null, inbound: cheapestInboundRailway || null });

                // Initialize accommodations
                const initialSelections: { [location: string]: AccommodationInfo | null } = {};
                initialItinerary.accommodation?.forEach(loc => {
                    if (loc.options && loc.options.length > 0) {
                        initialSelections[loc.location] = loc.options[0]; // Cheapest is first
                    }
                });
                setSelectedAccommodations(initialSelections);
                
                // Calculate base cost (total cost - transport - accommodation)
                const flightCost = (cheapestOutboundFlight?.price || 0) + (cheapestInboundFlight?.price || 0);
                const railwayCost = (cheapestOutboundRailway?.price || 0) + (cheapestInboundRailway?.price || 0);
                const accommodationCost = Object.values(initialSelections).reduce((sum, acc) => sum + (acc?.totalPrice || 0), 0);
                const calculatedBaseCost = initialItinerary.totalEstimatedCost - flightCost - railwayCost - accommodationCost;
                
                setBaseCost(calculatedBaseCost);
                setDynamicTotalCost(initialItinerary.totalEstimatedCost);
            } else {
                setError("Sorry, we couldn't generate an itinerary for that request. Please try being more specific.");
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setPrompt('');
        setItinerary(null);
        setError(null);
        setSelectedFlights({ outbound: null, inbound: null });
        setSelectedRailways({ outbound: null, inbound: null });
        setSelectedAccommodations({});
        setDynamicTotalCost(null);
        setBaseCost(0);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setPrompt(suggestion);
        handleSubmit(suggestion);
    };

    const handleFlightSelection = (flight: FlightInfo, direction: 'outbound' | 'inbound') => {
        setSelectedFlights(prev => ({
            ...prev,
            [direction]: flight,
        }));
    };

    const handleRailwaySelection = (railway: RailwayInfo, direction: 'outbound' | 'inbound') => {
        setSelectedRailways(prev => ({
            ...prev,
            [direction]: railway,
        }));
    };
    
    const handleAccommodationSelection = (accommodation: AccommodationInfo, location: string) => {
        setSelectedAccommodations(prev => ({
            ...prev,
            [location]: accommodation,
        }));
    };

    return (
        <div className="text-slate-300 min-h-screen font-sans">
            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <header className="text-center mb-8">
                    <h1 className="text-5xl font-extrabold text-white [text-shadow:1px_1px_3px_rgba(0,0,0,0.7)]">
                        <span className="text-cyan-400">Safari</span> Travel Planner
                    </h1>
                    <p className="mt-2 text-lg text-slate-400 [text-shadow:1px_1px_2px_rgba(0,0,0,0.8)]">
                        Your AI-powered guide to unforgettable journeys.
                    </p>
                </header>
                <div className="bg-slate-800/50 p-6 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-sm">
                    <TripInput
                        value={prompt}
                        onChange={setPrompt}
                        onSubmit={() => handleSubmit(prompt)}
                        isLoading={isLoading}
                    />
                    {!isLoading && !itinerary && !error && (
                        <TripSuggestions onSuggestionClick={handleSuggestionClick} />
                    )}
                </div>
                <div className="mt-8">
                    {isLoading && <LoadingSpinner statusText={loadingStatus} />}
                    {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">{error}</div>}
                    {!isLoading && !error && itinerary && (
                        <ItineraryDisplay 
                            itineraryData={itinerary} 
                            selectedFlights={selectedFlights}
                            onFlightSelect={handleFlightSelection}
                            selectedRailways={selectedRailways}
                            onRailwaySelect={handleRailwaySelection}
                            selectedAccommodations={selectedAccommodations}
                            onAccommodationSelect={handleAccommodationSelection}
                            dynamicTotalCost={dynamicTotalCost}
                            onReset={handleReset}
                        />
                    )}
                    {!isLoading && !error && !itinerary && <EmptyState />}
                </div>
            </main>
             <footer className="text-center py-6 text-slate-300 text-sm [text-shadow:1px_1px_2px_rgba(0,0,0,0.8)]">
                <p>Powered by Google Gemini. Itinerary details are generated by AI and may require verification.</p>
            </footer>
        </div>
    );
};

export default App;