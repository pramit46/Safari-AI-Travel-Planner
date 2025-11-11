import React from 'react';

export const SafariLogoIcon = ({ className = 'w-16 h-16' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor" className={className}>
      {/* Outer ring */}
      <path d="M32,5C17.1,5,5,17.1,5,32s12.1,27,27,27s27-12.1,27-27S46.9,5,32,5z M32,55C19.3,55,9,44.7,9,32 S19.3,9,32,9s23,10.3,23,23S44.7,55,32,55z"/>
      
      {/* Subtle Marks */}
      <g opacity="0.4">
          <path d="M32 12 L36 20 L28 20 Z" /> {/* North */}
          <path d="M44 28 L52 32 L44 36 Z" /> {/* East */}
          <path d="M36 44 L32 52 L28 44 Z" /> {/* South */}
          <path d="M20 36 L12 32 L20 28 Z" /> {/* West */}
      </g>
      
      {/* Needle Group - Rotated to NE */}
      <g transform="rotate(45 32 32)">
        {/* North-pointing part (Cyan) */}
        <path fill="#06b6d4" d="M32 14 L38 32 L26 32 Z" />
        {/* South-pointing part (White) */}
        <path fill="#f1f5f9" d="M32 50 L38 32 L26 32 Z" />
      </g>
      
      {/* Center Pin */}
      <circle cx="32" cy="32" r="3" fill="currentColor" />
    </svg>
);

export const PlaneIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);

export const RailwayIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M4.5 5.25a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 .75.75V15a3 3 0 0 1-3 3H7.5a3 3 0 0 1-3-3V5.25Z" />
        <path d="M5.25 19.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm10.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z" />
        <path fillRule="evenodd" d="M9 6a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V6.75h-1.5v3.75a.75.75 0 0 1-1.5 0V6.75H9.75V10.5a.75.75 0 0 1-1.5 0V6A.75.75 0 0 1 9 6Z" clipRule="evenodd" />
    </svg>
);

export const BedIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M7 7h10v3l-5 2-5-2V7Z" />
        <path fillRule="evenodd" d="M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8Zm3-1a1 1 0 0 0-1 1v.763l.001.002.002.004.004.007.006.01.01.018.016.026.023.033.03.04.04.045.05.048.06.05.07.05.08.047.09.043.1.037.1.03.11.022.12.013.12.005h7.326a23.65 23.65 0 0 1 1.09-.224c.04-.008.08-.017.12-.026a1 1 0 0 0 .89-1.282A1 1 0 0 0 18 6H6Z" clipRule="evenodd" />
    </svg>
);

export const SightseeingIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 0 0 0 1.5v16.5a.75.75 0 0 0 1.5 0V3.75a.75.75 0 0 0-1.5 0ZM7.5 12a.75.75 0 0 1 .75-.75h11.25a.75.75 0 0 1 0 1.5H8.25a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
        <path d="M8.25 4.5A.75.75 0 0 0 7.5 3H6a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 .75-.75ZM6 7.5A.75.75 0 0 1 6.75 6h1.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 7.5ZM6 16.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75Zm.75 1.5a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Z" />
        <path d="M12.75 19.5a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Zm.75-15a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm-3 15a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Zm.75-15a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm6 15a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Zm.75-15a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm-3 15a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75Zm.75-15a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Z" />
    </svg>
);

export const MealIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M11.25 4.533A9.708 9.708 0 0 0 6 3a9.708 9.708 0 0 0-5.25 1.533v16.195A2.25 2.25 0 0 0 3 22.5h1.5a2.25 2.25 0 0 0 2.25-2.25v-1.504A9.707 9.707 0 0 0 12 21a9.707 9.707 0 0 0 5.25-1.759V20.25a2.25 2.25 0 0 0 2.25 2.25H21a2.25 2.25 0 0 0 2.25-2.25v-16.2a9.708 9.708 0 0 0-5.25-1.533A9.708 9.708 0 0 0 12 3a9.708 9.708 0 0 0-5.25 1.533v16.195A2.25 2.25 0 0 0 9 22.5h.375v-1.571a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 .75.75V22.5H15a2.25 2.25 0 0 0 2.25-2.25v-16.2a9.708 9.708 0 0 0-5.25-1.533A9.708 9.708 0 0 0 12 3c-1.79 0-3.442.484-4.875 1.305" />
    </svg>
);

export const TravelIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-.53 14.03a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V8.25a.75.75 0 0 0-1.5 0v5.69l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3Z" clipRule="evenodd" />
    </svg>
);

export const OtherIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
    </svg>
);

export const ExternalLinkIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.665l3-3Z" />
      <path d="M8.603 14.602a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 0 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.665l-3 3Z" />
    </svg>
);

export const DownloadIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
);

export const NewPlanIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5ZM10 8a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5V8.75A.75.75 0 0 1 10 8Z" clipRule="evenodd" />
    </svg>
);

export const WeatherIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.25 10.193V5.034a.75.75 0 0 1 1.5 0v5.159a2.25 2.25 0 1 0-1.5 0Z" />
      <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM6.31 6.31a.75.75 0 0 1 1.06 0l1.591 1.591a.75.75 0 1 1-1.06 1.06L6.31 7.37a.75.75 0 0 1 0-1.06Zm12.758 1.06a.75.75 0 0 1-1.06-1.06l-1.591 1.591a.75.75 0 1 1-1.06 1.06l1.59-1.59a.75.75 0 0 1 1.06 0ZM5.25 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75Zm12.75 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H18a.75.75 0 0 1-.75-.75ZM12 6.562c-1.636 0-3.18.523-4.493 1.481A5.25 5.25 0 0 0 2.25 12.75c0 2.9 2.35 5.25 5.25 5.25h10.5A4.5 4.5 0 0 0 22.5 13.5c0-2.31-1.782-4.223-4.068-4.453A6.743 6.743 0 0 0 12 6.562Z" clipRule="evenodd" />
    </svg>
);

export const ClothingIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.5 1.5a1.5 1.5 0 0 1 1.415 1.025L21 10.5v10.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 21V10.5l3.085-7.975A1.5 1.5 0 0 1 7.5 1.5h9Z" />
      <path d="M8.25 4.5a.75.75 0 0 0-1.5 0v.158a.75.75 0 0 0 1.5 0V4.5Zm3.75 0a.75.75 0 0 0-1.5 0v.158a.75.75 0 0 0 1.5 0V4.5Zm3.75 0a.75.75 0 0 0-1.5 0v.158a.75.75 0 0 0 1.5 0V4.5Z" />
    </svg>
);

export const WarningIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
    </svg>
);

export const InfoIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
    </svg>
);