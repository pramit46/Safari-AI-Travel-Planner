import React, { useState, useRef, useEffect } from 'react';
import { ItineraryOption, Activity, FlightInfo, AccommodationInfo, RailwayInfo, RoadwayInfo, OtherTransportInfo } from '../types';
import { PlaneIcon, BedIcon, SightseeingIcon, MealIcon, TravelIcon, OtherIcon, ExternalLinkIcon, DownloadIcon, WeatherIcon, ClothingIcon, WarningIcon, RailwayIcon, RoadwayIcon, NewPlanIcon, InfoIcon, OtherTransportIcon } from './IconComponents';

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
    selectedRoadways: { outbound: RoadwayInfo | null; inbound: RoadwayInfo | null };
    onRoadwaySelect: (roadway: RoadwayInfo, direction: 'outbound' | 'inbound') => void;
    selectedOtherTransport: { outbound: OtherTransportInfo | null; inbound: OtherTransportInfo | null };
    onOtherTransportSelect: (transport: OtherTransportInfo, direction: 'outbound' | 'inbound') => void;
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
        <div className="flex justify-between items-start gap-2">
            <div className="flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-200">{flight.airline}</span>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{flight.seatType}</span>
                    {flight.verificationStatus === 'Verified' && (
                         <div className="flex items-center gap-1 text-xs bg-green-800/50 text-green-300 px-2 py-0.5 rounded-full" title="Flight route plausibility has been verified by the AI.">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                            </svg>
                            Verified
                        </div>
                    )}
                </div>
                <p className="text-sm text-slate-400 mt-1">
                    <span className="font-bold text-cyan-400">{flight.departureAirport}</span> → <span className="font-bold text-cyan-400">{flight.arrivalAirport}</span>
                    <span className="text-xs text-slate-500 ml-2">({flight.flightNumber})</span>
                </p>
                <p className="text-xs text-slate-500">{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
             <div className="text-right flex-shrink-0">
                <div className="flex items-center justify-end gap-1">
                    <span className="font-bold text-white">{currencySymbol}{flight.price.toLocaleString()}</span>
                    <div className="group relative flex items-center">
                        <InfoIcon className="w-4 h-4 text-slate-500 cursor-help" />
                        <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 text-center">
                            Price is a verified AI estimate. Please confirm on booking site.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {isSelected && (
            <a href={flight.bookingLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-block mt-3 text-sm bg-cyan-600 text-white font-bold py-1.5 px-5 rounded-md hover:bg-cyan-500 transition-colors shadow-lg">
                Book Selected
            </a>
        )}
    </div>
);

const RailwayOptionCard: React.FC<{ railway: RailwayInfo, isSelected: boolean, onSelect: () => void, currencySymbol: string }> = ({ railway, isSelected, onSelect, currencySymbol }) => (
    <div
        onClick={onSelect}
        className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-cyan-900/50 border-cyan-500 ring-2 ring-cyan-500' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
    >
        <div className="flex justify-between items-start gap-2">
             <div className="flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-200">{railway.trainProvider}</span>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{railway.berthType}</span>
                    {railway.verificationStatus === 'Verified' && (
                         <div className="flex items-center gap-1 text-xs bg-green-800/50 text-green-300 px-2 py-0.5 rounded-full" title="Railway route plausibility has been verified by the AI.">
                            <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                            </svg>
                            Verified
                        </div>
                    )}
                </div>
                <p className="text-sm text-slate-400 mt-1">
                    <span className="font-bold text-cyan-400">{railway.departureStation}</span> → <span className="font-bold text-cyan-400">{railway.arrivalStation}</span>
                    <span className="text-xs text-slate-500 ml-2">({railway.trainNumber})</span>
                </p>
                 <p className="text-xs text-slate-500">{new Date(railway.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(railway.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="text-right flex-shrink-0">
                <div className="flex items-center justify-end gap-1">
                    <span className="font-bold text-white">{currencySymbol}{railway.price.toLocaleString()}</span>
                     <div className="group relative flex items-center">
                        <InfoIcon className="w-4 h-4 text-slate-500 cursor-help" />
                        <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 text-center">
                            Price is an AI-generated estimate. Please verify.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {isSelected && (
             <a href={railway.bookingLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-block mt-3 text-sm bg-cyan-600 text-white font-bold py-1.5 px-5 rounded-md hover:bg-cyan-500 transition-colors shadow-lg">
                Book Selected
            </a>
        )}
    </div>
);

const RoadwayOptionCard: React.FC<{ roadway: RoadwayInfo, isSelected: boolean, onSelect: () => void, currencySymbol: string }> = ({ roadway, isSelected, onSelect, currencySymbol }) => (
    <div
        onClick={onSelect}
        className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-cyan-900/50 border-cyan-500 ring-2 ring-cyan-500' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
    >
        <div className="flex justify-between items-start gap-2">
             <div className="flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-200">{roadway.serviceProvider}</span>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{roadway.seatType}</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                    <span className="font-bold text-cyan-400">{roadway.departurePoint}</span> → <span className="font-bold text-cyan-400">{roadway.arrivalPoint}</span>
                     <span className="text-xs text-slate-500 ml-2">({roadway.vehicleType})</span>
                </p>
                 <p className="text-xs text-slate-500">{new Date(roadway.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(roadway.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="text-right flex-shrink-0">
                <div className="flex items-center justify-end gap-1">
                    <span className="font-bold text-white">{currencySymbol}{roadway.price.toLocaleString()}</span>
                     <div className="group relative flex items-center">
                        <InfoIcon className="w-4 h-4 text-slate-500 cursor-help" />
                        <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 text-center">
                            Price is an AI-generated estimate. Please verify.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {isSelected && (
             <a href={roadway.bookingLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-block mt-3 text-sm bg-cyan-600 text-white font-bold py-1.5 px-5 rounded-md hover:bg-cyan-500 transition-colors shadow-lg">
                Book Selected
            </a>
        )}
    </div>
);

const OtherTransportOptionCard: React.FC<{ transport: OtherTransportInfo, isSelected: boolean, onSelect: () => void, currencySymbol: string }> = ({ transport, isSelected, onSelect, currencySymbol }) => (
    <div
        onClick={onSelect}
        className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-cyan-900/50 border-cyan-500 ring-2 ring-cyan-500' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
    >
        <div className="flex justify-between items-start gap-2">
             <div className="flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-200">{transport.serviceProvider}</span>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{transport.transportType}</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                    <span className="font-bold text-cyan-400">{transport.departurePoint}</span> → <span className="font-bold text-cyan-400">{transport.arrivalPoint}</span>
                </p>
                 <p className="text-xs text-slate-500">{new Date(transport.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(transport.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                 {transport.details && <p className="text-xs text-slate-400 mt-1 italic">{transport.details}</p>}
            </div>
            <div className="text-right flex-shrink-0">
                <div className="flex items-center justify-end gap-1">
                    <span className="font-bold text-white">{currencySymbol}{transport.price.toLocaleString()}</span>
                     <div className="group relative flex items-center">
                        <InfoIcon className="w-4 h-4 text-slate-500 cursor-help" />
                        <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 text-center">
                            Price is an AI-generated estimate. Please verify.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {isSelected && (
             <a href={transport.bookingLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-block mt-3 text-sm bg-cyan-600 text-white font-bold py-1.5 px-5 rounded-md hover:bg-cyan-500 transition-colors shadow-lg">
                Book Selected
            </a>
        )}
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
             <a href={bookingLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-block mt-3 text-sm bg-slate-700 text-white font-bold py-1.5 px-5 rounded-md hover:bg-slate-600 transition-colors shadow-md">
                Book
            </a>
        </div>
    );
};

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itineraryData, selectedFlights, onFlightSelect, selectedRailways, onRailwaySelect, selectedRoadways, onRoadwaySelect, selectedOtherTransport, onOtherTransportSelect, selectedAccommodations, onAccommodationSelect, dynamicTotalCost, onReset }) => {
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
                    const ratio = pdfWidth / canvasWidth;
                    const pdfHeight = canvasHeight * ratio;
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`safari-itinerary-${itineraryData.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
                }).finally(() => {
                    setIsDownloading(false);
                    setExpandAllForPdf(false);
                });
            }, 500); // A small delay to ensure render completes
        }
    }, [expandAllForPdf, itineraryData.title]);

    const advisoryPoints = itineraryData.tripEssentials.travelWarnings
        .split('\n')
        .map(point => point.trim())
        .filter(point => point.length > 0 && (point.startsWith('*') || point.startsWith('-')));

    return (
        <div className="bg-slate-900/50 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in" ref={itineraryRef}>
            {/* Header and controls */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-extrabold text-white">{itineraryData.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-slate-400">Total Estimated Cost:</p>
                          <div className="group relative flex items-center">
                              <InfoIcon className="w-4 h-4 text-slate-500 cursor-help" />
                              <div className="absolute bottom-full mb-2 -right-1/2 translate-x-1/2 w-52 p-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 text-center">
                                  All prices are AI-generated estimates and should be verified.
                              </div>
                          </div>
                        </div>
                        <p className="text-4xl font-bold text-cyan-400 mt-1">
                            {currencySymbol}{dynamicTotalCost ? dynamicTotalCost.toLocaleString() : itineraryData.totalEstimatedCost.toLocaleString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownloadPdf}
                            disabled={isDownloading}
                            className="bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isDownloading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-t-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <DownloadIcon className="w-5 h-5" /> PDF
                                </>
                            )}
                        </button>
                        <button
                            onClick={onReset}
                            className="bg-slate-700 text-slate-300 font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
                        >
                            <NewPlanIcon className="w-5 h-5" /> New Plan
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="p-6 space-y-8">

                {/* --- 1. Transport Section (Grid) --- */}
                {(itineraryData.flights || itineraryData.railways || itineraryData.roadways || itineraryData.otherTransport) && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Flights Card */}
                        {itineraryData.flights && ((itineraryData.flights.outboundOptions?.length || 0) > 0 || (itineraryData.flights.inboundOptions?.length || 0) > 0) && (
                            <div className="bg-slate-800/70 p-5 rounded-lg border border-slate-700 flex flex-col gap-4">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3"><PlaneIcon /> Flights</h3>
                                {(itineraryData.flights.outboundOptions?.length || 0) > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-cyan-400 mb-2">Outbound Options</h4>
                                        <div className="space-y-3">
                                            {(itineraryData.flights.outboundOptions ?? []).map((flight, index) => (
                                                <FlightOptionCard key={`out-${index}`} flight={flight} isSelected={selectedFlights.outbound === flight} onSelect={() => onFlightSelect(flight, 'outbound')} currencySymbol={currencySymbol} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {(itineraryData.flights.inboundOptions?.length || 0) > 0 && (
                                     <div>
                                        <h4 className="font-semibold text-cyan-400 mb-2">Inbound Options</h4>
                                        <div className="space-y-3">
                                             {(itineraryData.flights.inboundOptions ?? []).map((flight, index) => (
                                                <FlightOptionCard key={`in-${index}`} flight={flight} isSelected={selectedFlights.inbound === flight} onSelect={() => onFlightSelect(flight, 'inbound')} currencySymbol={currencySymbol} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Railways Card */}
                        {itineraryData.railways && ((itineraryData.railways.outboundOptions?.length || 0) > 0 || (itineraryData.railways.inboundOptions?.length || 0) > 0) && (
                            <div className="bg-slate-800/70 p-5 rounded-lg border border-slate-700 flex flex-col gap-4">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3"><RailwayIcon /> Railways</h3>
                                 {(itineraryData.railways.outboundOptions?.length || 0) > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-cyan-400 mb-2">Outbound Options</h4>
                                        <div className="space-y-3">
                                            {(itineraryData.railways.outboundOptions ?? []).map((railway, index) => (
                                               <RailwayOptionCard key={`out-rail-${index}`} railway={railway} isSelected={selectedRailways.outbound === railway} onSelect={() => onRailwaySelect(railway, 'outbound')} currencySymbol={currencySymbol} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                 {(itineraryData.railways.inboundOptions?.length || 0) > 0 && (
                                     <div>
                                        <h4 className="font-semibold text-cyan-400 mb-2">Inbound Options</h4>
                                        <div className="space-y-3">
                                            {(itineraryData.railways.inboundOptions ?? []).map((railway, index) => (
                                                <RailwayOptionCard key={`in-rail-${index}`} railway={railway} isSelected={selectedRailways.inbound === railway} onSelect={() => onRailwaySelect(railway, 'inbound')} currencySymbol={currencySymbol} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                         {/* Roadways Card */}
                        {itineraryData.roadways && ((itineraryData.roadways.outboundOptions?.length || 0) > 0 || (itineraryData.roadways.inboundOptions?.length || 0) > 0) && (
                            <div className="bg-slate-800/70 p-5 rounded-lg border border-slate-700 flex flex-col gap-4">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3"><RoadwayIcon /> Roadways</h3>
                                 {(itineraryData.roadways.outboundOptions?.length || 0) > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-cyan-400 mb-2">Outbound Options</h4>
                                        <div className="space-y-3">
                                            {(itineraryData.roadways.outboundOptions ?? []).map((roadway, index) => (
                                               <RoadwayOptionCard key={`out-road-${index}`} roadway={roadway} isSelected={selectedRoadways.outbound === roadway} onSelect={() => onRoadwaySelect(roadway, 'outbound')} currencySymbol={currencySymbol} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                 {(itineraryData.roadways.inboundOptions?.length || 0) > 0 && (
                                     <div>
                                        <h4 className="font-semibold text-cyan-400 mb-2">Inbound Options</h4>
                                        <div className="space-y-3">
                                            {(itineraryData.roadways.inboundOptions ?? []).map((roadway, index) => (
                                                <RoadwayOptionCard key={`in-road-${index}`} roadway={roadway} isSelected={selectedRoadways.inbound === roadway} onSelect={() => onRoadwaySelect(roadway, 'inbound')} currencySymbol={currencySymbol} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Other Transport Card */}
                        {itineraryData.otherTransport && ((itineraryData.otherTransport.outboundOptions?.length || 0) > 0 || (itineraryData.otherTransport.inboundOptions?.length || 0) > 0) && (
                            <div className="bg-slate-800/70 p-5 rounded-lg border border-slate-700 flex flex-col gap-4">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3"><OtherTransportIcon /> Other Transport</h3>
                                 {(itineraryData.otherTransport.outboundOptions?.length || 0) > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-cyan-400 mb-2">Outbound Options</h4>
                                        <div className="space-y-3">
                                            {(itineraryData.otherTransport.outboundOptions ?? []).map((transport, index) => (
                                               <OtherTransportOptionCard key={`out-other-${index}`} transport={transport} isSelected={selectedOtherTransport.outbound === transport} onSelect={() => onOtherTransportSelect(transport, 'outbound')} currencySymbol={currencySymbol} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                 {(itineraryData.otherTransport.inboundOptions?.length || 0) > 0 && (
                                     <div>
                                        <h4 className="font-semibold text-cyan-400 mb-2">Inbound Options</h4>
                                        <div className="space-y-3">
                                            {(itineraryData.otherTransport.inboundOptions ?? []).map((transport, index) => (
                                                <OtherTransportOptionCard key={`in-other-${index}`} transport={transport} isSelected={selectedOtherTransport.inbound === transport} onSelect={() => onOtherTransportSelect(transport, 'inbound')} currencySymbol={currencySymbol} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                {/* --- 2. Accommodation Section --- */}
                {itineraryData.accommodation && itineraryData.accommodation.length > 0 && (
                     <div className="bg-slate-800/70 p-5 rounded-lg border border-slate-700">
                        <div className="space-y-6">
                            {itineraryData.accommodation.map(loc => (
                                 <div key={loc.location}>
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-4"><BedIcon /> Accommodation in {loc.location}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {loc.options.map((acc, index) => (
                                            <AccommodationOptionCard
                                                key={index}
                                                accommodation={acc}
                                                isSelected={selectedAccommodations[loc.location] === acc}
                                                onSelect={() => onAccommodationSelect(acc, loc.location)}
                                                currencySymbol={currencySymbol}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
               
                {/* --- 3. Trip Essentials Section --- */}
                {itineraryData.tripEssentials && (
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4 text-center">Trip Essentials</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700">
                                    <div className="flex items-start gap-3">
                                        <WeatherIcon className="w-6 h-6 text-cyan-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-slate-300 text-lg">Weather</p>
                                            <p className="text-sm text-slate-400 mt-1">{itineraryData.tripEssentials.weatherInfo}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700">
                                    <div className="flex items-start gap-3">
                                        <ClothingIcon className="w-6 h-6 text-cyan-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-slate-300 text-lg">What to Pack</p>
                                            <p className="text-sm text-slate-400 mt-1">{itineraryData.tripEssentials.clothingSuggestions}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-amber-900/30 p-4 rounded-lg border border-amber-700">
                                <div className="flex items-start gap-3">
                                    <WarningIcon className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-amber-300 text-lg">Travel Advisory</p>
                                        <ul className="list-disc list-inside text-sm text-amber-400 mt-1 space-y-1">
                                            {advisoryPoints.map((point, index) => (
                                                <li key={index}>{point.replace(/^[\*\-]\s*/, '')}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 4. Daily Plan Section --- */}
                {itineraryData.dailyPlan && itineraryData.dailyPlan.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white mb-2 text-center">Daily Itinerary</h3>
                        {itineraryData.dailyPlan.map(day => (
                            <div key={day.day} className="bg-slate-800/70 rounded-lg overflow-hidden border border-slate-700">
                                <button
                                    onClick={() => toggleDay(day.day)}
                                    className="w-full text-left p-4 flex justify-between items-center bg-slate-900/50 hover:bg-slate-800 transition-colors"
                                >
                                    <div>
                                        <p className="font-bold text-lg text-cyan-400">Day {day.day}: {day.title}</p>
                                        <p className="text-sm text-slate-400">{formatDate(day.date)}</p>
                                    </div>
                                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${openDay === day.day || expandAllForPdf ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {(openDay === day.day || expandAllForPdf) && (
                                    <div className="p-4 border-t border-slate-700">
                                        <ul className="space-y-4">
                                            {day.activities.map((activity, index) => (
                                                <li key={index} className="flex items-start gap-4">
                                                    <div className="pt-1 flex-shrink-0">
                                                        <ActivityTypeIcon type={activity.type} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-300">{activity.time} - {activity.description}</p>
                                                        {activity.details && <p className="text-sm text-slate-400">{activity.details}</p>}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItineraryDisplay;
