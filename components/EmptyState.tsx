import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-16 flex flex-col items-center animate-fade-in text-slate-500">
      <style>
        {`
          @keyframes rotate-globe {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .animate-rotate-globe {
            animation: rotate-globe 30s linear infinite;
            transform-origin: center;
          }
        `}
      </style>
      <div className="w-56 h-56 mb-6">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Group for the rotating globe elements */}
          <g className="animate-rotate-globe">
            {/* Globe */}
            <circle cx="100" cy="100" r="70" stroke="currentColor" strokeOpacity="0.6" strokeWidth="2" />
            
            {/* Globe lines */}
            <path d="M100 30V170" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M30 100H170" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="100" cy="100" rx="35" ry="68" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" />
            <ellipse cx="100" cy="100" rx="60" ry="69" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" />

            {/* Continents */}
            <path d="M80 70C70 80 75 110 90 120S110 115 115 100 100 60 80 70Z" fill="currentColor" fillOpacity="0.25" />
            <path d="M120 75C125 85 130 100 120 110" stroke="currentColor" strokeOpacity="0.4" strokeWidth="8" strokeLinecap="round" />
          </g>

          {/* Plane Path - Non-rotating */}
          <path d="M60 60 C 20, 100, 180, 100, 140, 140" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Paper Plane - Non-rotating */}
          <g transform="translate(48, 48) rotate(-15)">
            <path d="M0 0 L25 10 L0 20 L5 10 Z" fill="#06b6d4" />
          </g>
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-slate-300">Ready to Explore?</h3>
      <p className="text-slate-400 mt-2">
        Describe your dream trip and let's make it a reality.
      </p>
    </div>
  );
};

export default EmptyState;