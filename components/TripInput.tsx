
import React from 'react';

interface TripInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

const TripInput: React.FC<TripInputProps> = ({ value, onChange, onSubmit, isLoading }) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading) {
                onSubmit();
            }
        }
    };

    return (
        <div className="relative w-full">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Plan my trip to Bhutan from Dec 15th to Dec 31st with a budget of $2000"
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl p-4 pr-32 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-none shadow-lg"
                rows={3}
                disabled={isLoading}
            />
            <button
                onClick={onSubmit}
                disabled={isLoading || !value.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 shadow-md disabled:shadow-none flex items-center justify-center"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-t-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                ) : (
                    'Plan Trip'
                )}
            </button>
        </div>
    );
};

export default TripInput;
