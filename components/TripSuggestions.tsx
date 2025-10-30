import React from 'react';

interface TripSuggestionsProps {
    onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
    "A 1-week cultural trip to Kyoto, Japan in spring for under $3000.",
    "A 10-day adventure tour in Costa Rica, focusing on wildlife and hiking.",
    "A romantic 4-day weekend getaway to Paris from London by train.",
    "Family-friendly beach vacation in the Maldives for 5 days in July.",
];

const TripSuggestions: React.FC<TripSuggestionsProps> = ({ onSuggestionClick }) => {
    return (
        <div className="mt-4 animate-fade-in">
            <p className="text-sm text-slate-400 mb-2 text-center">Or try one of these ideas:</p>
            <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onSuggestionClick(suggestion)}
                        className="bg-slate-700 text-slate-300 text-sm py-1.5 px-3 rounded-full hover:bg-slate-600 hover:text-white transition-colors duration-200"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TripSuggestions;
