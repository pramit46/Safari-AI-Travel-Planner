import React, { useState, useRef, useEffect } from 'react';
import { ItineraryOption, Activity, FlightInfo, AccommodationInfo, RailwayInfo } from '../types';
import { PlaneIcon, BedIcon, SightseeingIcon, MealIcon, TravelIcon, OtherIcon, ExternalLinkIcon, DownloadIcon, WeatherIcon, ClothingIcon, WarningIcon, RailwayIcon, NewPlanIcon, InfoIcon } from './IconComponents';

// Add type definitions for the CDN libraries to the window object
declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

interface ItineraryDisplayProps {
    itineraryData: ItineraryOption;
    selectedFlights: { outbound: FlightInfo | null; inbound: FlightInfo | null };
    onFlightSelect: (flight: FlightInfo, direction: 'outbound' | 'inbound') => void;
    selectedRailways: { outbound: RailwayInfo | null; inbound: RailwayInfo | null };
    onRailwaySelect: (railway: RailwayInfo, direction: 'outbound' | 'inbound') => void;
    selectedAccommodations: { [location: string]: AccommodationInfo | null };
    onAccommodationSelect: (accommodation: AccommodationInfo, location: string) => void;
    dynamicTotalCost: number | null;
    onReset: () => void;
}

const getCurrencySymbol = (currencyCode: string): string => {
    const currencyMap: { [key: string]: string } = {
        USD: '$',
        EUR: '€',
        JPY: '¥',
        GBP: '£',
        INR: '₹',
    };
    return currencyMap[currencyCode.toUpperCase()] || `${currencyCode} `;
};

const ActivityTypeIcon: React.FC<{ type: Activity['type'] }> = ({ type }) => {
    const iconClass = "w-5 h-5 text-cyan-400";
    switch (type) {
        case 'Sightseeing': return <SightseeingIcon className={iconClass} />;
        case 'Meal': return <MealIcon className={iconClass} />;
        case 'Travel': return <TravelIcon className={iconClass} />;
        default: return <OtherIcon className={iconClass} />;
    }
};

const FlightOptionCard: React.FC<{ flight: FlightInfo, isSelected: boolean, onSelect: () => void, currencySymbol: string }> = ({ flight, isSelected, onSelect, currencySymbol }) => (
    <div
        onClick={onSelect}
        className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-cyan-900/50 border-cyan-500 ring-2 ring-cyan-500' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
    >
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
                 <span className="font-semibold text-slate-200">{flight.airline}</span>
                 <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{flight.seatType}</span>
            </div>
            <div className="flex items-center gap-1">
                <span className="font-bold text-white">{currencySymbol}{flight.price.toLocaleString()}</span>
                <div className="group relative flex items-center">
                    <InfoIcon className="w-4 h-4 text-slate-500 cursor-help" />
                    <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 text-center">
                        Price is an AI-generated estimate. Please verify.
                    </div>
                </div>
            </div>
        </div>
        <p className="text-sm text-slate-400 mt-1">
            <span className="font-bold text-cyan-400">{flight.departureAirport}</span> → <span className="font-bold text-cyan-400">{flight.arrivalAirport}</span>
            <span className="text-xs text-slate-500 ml-2">({flight.flightNumber})</span>
        </p>
        <p className="text-xs text-slate-500">{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
    </div>
);

const RailwayOptionCard: React.FC<{ railway: RailwayInfo, isSelected: boolean, onSelect: () => void, currencySymbol: string }> = ({ railway, isSelected, onSelect, currencySymbol }) => (
    <div
        onClick={onSelect}
        className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-cyan-900/50 border-cyan-500 ring-2 ring-cyan-500' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
    >
        <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">{railway.trainProvider}</span>
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{railway.berthType}</span>
            </div>
            <div className="flex items-center gap-1">
                <span className="font-bold text-white">{currencySymbol}{railway.price.toLocaleString()}</span>
                 <div className="group relative flex items-center">
                    <InfoIcon className="w-4 h-4 text-slate-500 cursor-help" />
                    <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 text-center">
                        Price is an AI-generated estimate. Please verify.
                    </div>
                </div>
            </div>
        </div>
        <p className="text-sm text-slate-400 mt-1 truncate">
            <span className="font-bold text-cyan-400">{railway.departureStation}</span> → <span className="font-bold text-cyan-400">{railway.arrivalStation}</span>
            <span className="text-xs text-slate-500 ml-2">({railway.trainNumber})</span>
        </p>
        <p className="text-xs text-slate-500">{new Date(railway.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(railway.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
    </div>
);


const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => (
                <svg key={`full-${i}`} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
            ))}
            {halfStar && (
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0v15z"/></svg>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <svg key={`empty-${i}`} className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
            ))}
        </div>
    );
};

const AccommodationOptionCard: React.FC<{ accommodation: AccommodationInfo, isSelected: boolean, onSelect: () => void, currencySymbol: string }> = ({ accommodation, isSelected, onSelect, currencySymbol }) => {
    const bookingLink = accommodation.bookingLink || `https://www.google.com/search?q=${encodeURIComponent(accommodation.name)}`;
    return (
        <div
            onClick={onSelect}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-cyan-900/50 border-cyan-500 ring-2 ring-cyan-500' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-slate-200">{accommodation.name}</h5>
                        {accommodation.isPureVeg && (
                            <span 
                                className="bg-green-200 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full cursor-help border-b border-dotted border-green-600"
                                title={accommodation.pureVegSourceLink ? `Source: ${accommodation.pureVegSourceLink}` : 'Verified Pure-Veg'}
                            >
                                Pure-Veg
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mb-1">{accommodation.type}</p>
                    {accommodation.rating != null && accommodation.reviewCount != null && (
                        <div className="flex items-center space-x-2">
                            <StarRating rating={accommodation.rating} />
                            <span className="text-xs text-slate-400">({accommodation.reviewCount.toLocaleString()} reviews)</span>
                        </div>
                    )}
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                    <div className="flex items-center justify-end gap-1">
                        <p className="font-bold text-white">{currencySymbol}{accommodation.totalPrice.toLocaleString()}</p>
                        <div className="group relative flex items-center">
                            <InfoIcon className="w-4 h-4 text-slate-500 cursor-help" />
                             <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 text-center">
                                Price is an AI-generated estimate. Please verify.
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">{currencySymbol}{accommodation.pricePerNight.toLocaleString()}/night</p>
                </div>
            </div>
             <a href={bookingLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center mt-2 text-xs bg-slate-600 text-slate-300 font-bold py-1 px-2 rounded-md hover:bg-slate-500 transition-colors">
                Book <ExternalLinkIcon className="w-3 h-3 ml-1.5"/>
            </a>
        </div>
    );
};

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itineraryData, selectedFlights, onFlightSelect, selectedRailways, onRailwaySelect, selectedAccommodations, onAccommodationSelect, dynamicTotalCost, onReset }) => {
    const [openDay, setOpenDay] = useState<number | null>(1);
    const itineraryRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [expandAllForPdf, setExpandAllForPdf] = useState(false);
    const currencySymbol = getCurrencySymbol(itineraryData.currency || 'USD');

    const toggleDay = (day: number) => {
        setOpenDay(openDay === day ? null : day);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const handleDownloadPdf = () => {
        if (!itineraryRef.current || isDownloading) return;
        setExpandAllForPdf(true);
        setIsDownloading(true);
    };

    useEffect(() => {
        if (expandAllForPdf) {
            const input = itineraryRef.current;
            if (!input) return;

            // Allow React to re-render with all sections expanded before capturing
            setTimeout(() => {
                const { jsPDF } = window.jspdf;
                window.html2canvas(input, { 
                    backgroundColor: '#1e293b',
                    scale: 2
                }).then((canvas: HTMLCanvasElement) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;
                    const ratio =