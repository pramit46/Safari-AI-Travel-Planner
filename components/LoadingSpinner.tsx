import React from 'react';

interface LoadingSpinnerProps {
    statusText: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ statusText }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-800/50 rounded-lg">
            <div className="w-16 h-16 border-4 border-t-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-300 font-semibold text-center">{statusText}</p>
        </div>
    );
};

export default LoadingSpinner;