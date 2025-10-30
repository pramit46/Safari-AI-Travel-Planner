import React, { useState, useRef, useEffect } from 'react';
import TripInput from './components/TripInput';
import ItineraryDisplay from './components/ItineraryDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { ItineraryResponse } from './types';
import { generateItinerary } from './services/geminiService';
import EmptyState from './components/EmptyState';

const App: React.FC = () => {
    const [userInput, setUserInput] = useState<string>('');
    const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>("Crafting your perfect journey...");
    const intervalRef = useRef<number | null>(null);

    const agentStatuses = [
        "Initializing agents...",
        "Flight agent is searching for tickets...",
        "Accommodation agent is finding hotels...",
        "Activity agent is scouting sights & eateries...",
        "Planner agent is building your itinerary...",
    ];

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const handleSubmit = async () => {
        if (!userInput.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setItinerary(null);

        let statusIndex = 0;
        setLoadingMessage(agentStatuses[0]);
        intervalRef.current = window.setInterval(() => {
            statusIndex++;
            setLoadingMessage(agentStatuses[statusIndex % agentStatuses.length]);
        }, 2500);

        try {
            const result = await generateItinerary(userInput);
            if (result.itineraries && result.itineraries.length > 0) {
                setItinerary(result);
            } else {
                setError("Sorry, I couldn't generate an itinerary for that request. Please try being more specific.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen font-sans text-slate-200">
            <div className="min-h-screen bg-slate-900/70 backdrop-blur-sm p-4 sm:p-6 lg:p-8">
                <style>
                    {`
                    @keyframes fade-in {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }

                    @keyframes fade-in-down {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
                    `}
                </style>
                <main className="max-w-4xl mx-auto flex flex-col items-center space-y-8">
                    <header className="text-center w-full">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                            <span className="text-white">Safari</span>
                            <span className="text-cyan-400"> Trip Planner</span>
                        </h1>
                        <p className="mt-4 text-lg text-slate-300">
                            Your personal AI travel agent. Describe your dream trip, and we'll handle the details.
                        </p>
                    </header>

                    <div className="w-full sticky top-4 z-10 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-700/50">
                        <TripInput
                            value={userInput}
                            onChange={setUserInput}
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                        />
                    </div>

                    <div className="w-full">
                        {isLoading && <LoadingSpinner statusText={loadingMessage} />}
                        {error && (
                            <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center animate-fade-in">
                                <p className="font-bold">Oops! Something went wrong.</p>
                                <p>{error}</p>
                            </div>
                        )}
                        {itinerary && itinerary.itineraries.length > 0 && (
                            <ItineraryDisplay itineraryData={itinerary.itineraries[0]} />
                        )}
                        {!isLoading && !error && !itinerary && (
                            <EmptyState />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;