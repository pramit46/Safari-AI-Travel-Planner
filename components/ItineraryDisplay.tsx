import React, { useState, useRef, useEffect } from 'react';
import { ItineraryOption, Activity, FlightInfo, AccommodationInfo, RailwayInfo } from '../types';
import { PlaneIcon, BedIcon, SightseeingIcon, MealIcon, TravelIcon, OtherIcon, ExternalLinkIcon, DownloadIcon, WeatherIcon, ClothingIcon, WarningIcon, RailwayIcon, ResetIcon } from './IconComponents';

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
            <span className="font-bold text-white">{currencySymbol}{flight.price.toLocaleString()}</span>
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
            <span className="font-bold text-white">{currencySymbol}{railway.price.toLocaleString()}</span>
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
                    <p className="font-bold text-white">{currencySymbol}{accommodation.totalPrice.toLocaleString()}</p>
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
                    const ratio = canvasWidth / canvasHeight;
                    const imgHeight = pdfWidth / ratio;
                    
                    let heightLeft = imgHeight;
                    let position = 0;
                    
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pdf.internal.pageSize.getHeight();

                    while (heightLeft > 0) {
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                        heightLeft -= pdf.internal.pageSize.getHeight();
                    }

                    pdf.save(`safari-trip-planner-${itineraryData.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`);
                }).finally(() => {
                    setExpandAllForPdf(false);
                    setIsDownloading(false);
                });
            }, 100);
        }
    }, [expandAllForPdf, itineraryData.title]);
    
    const outboundBookingLink = selectedFlights.outbound?.bookingLink || `https://www.google.com/flights?q=flights+from+${encodeURIComponent(selectedFlights.outbound?.departureAirport || '')}+to+${encodeURIComponent(selectedFlights.outbound?.arrivalAirport || '')}`;
    const inboundBookingLink = selectedFlights.inbound?.bookingLink || `https://www.google.com/flights?q=flights+from+${encodeURIComponent(selectedFlights.inbound?.departureAirport || '')}+to+${encodeURIComponent(selectedFlights.inbound?.arrivalAirport || '')}`;
    
    const outboundRailwayBookingLink = selectedRailways.outbound?.bookingLink || `https://www.google.com/search?q=trains+from+${encodeURIComponent(selectedRailways.outbound?.departureStation || '')}+to+${encodeURIComponent(selectedRailways.outbound?.arrivalStation || '')}`;
    const inboundRailwayBookingLink = selectedRailways.inbound?.bookingLink || `https://www.google.com/search?q=trains+from+${encodeURIComponent(selectedRailways.inbound?.departureStation || '')}+to+${encodeURIComponent(selectedRailways.inbound?.arrivalStation || '')}`;

    const showFlights = itineraryData.flights && itineraryData.flights.outboundOptions.length > 0;
    const showRailways = itineraryData.railways && itineraryData.railways.outboundOptions.length > 0;


    return (
        <div className="w-full space-y-8 animate-fade-in" ref={itineraryRef}>
            <header className="flex justify-between items-start gap-4">
                <div className="w-32 flex-shrink-0"></div>
                <div className="text-center min-w-0 flex-1">
                    <h2 className="text-4xl font-extrabold text-white leading-tight" title={itineraryData.title}>
                        {itineraryData.title}
                    </h2>
                    <p className="text-xl text-cyan-400 font-medium mt-2">
                        Total Estimated Cost: {currencySymbol}{dynamicTotalCost?.toLocaleString()}
                    </p>
                </div>
                <div className="w-32 flex-shrink-0 flex justify-end items-center gap-4">
                     <button 
                        onClick={handleDownloadPdf} 
                        disabled={isDownloading}
                        title={isDownloading ? "Downloading..." : "Download Plan"}
                        className="p-3 bg-slate-700 rounded-full text-slate-200 hover:text-white hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-wait transition-colors"
                    >
                        {isDownloading ? (
                            <div className="w-8 h-8 border-4 border-t-4 border-slate-500 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <DownloadIcon className="w-8 h-8" />
                        )}
                    </button>
                    <button
                        onClick={onReset}
                        title="New Search"
                        className="p-3 bg-slate-700 rounded-full text-slate-200 hover:text-white hover:bg-slate-600 transition-colors"
                    >
                        <ResetIcon className="w-8 h-8" />
                    </button>
                </div>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                {showFlights && (
                    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                        <div className="flex items-center mb-4">
                            <PlaneIcon className="w-8 h-8 text-cyan-400 mr-4"/>
                            <h3 className="text-2xl font-bold text-white">Flights</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-bold text-slate-300 mb-2"><span className="text-cyan-400">Outbound</span> Options</h4>
                                <div className="space-y-2">
                                    {itineraryData.flights.outboundOptions.map(flight => (
                                        <FlightOptionCard key={`${flight.flightNumber}-${flight.departureTime}`} flight={flight} isSelected={selectedFlights.outbound?.flightNumber === flight.flightNumber && selectedFlights.outbound?.departureTime === flight.departureTime} onSelect={() => onFlightSelect(flight, 'outbound')} currencySymbol={currencySymbol} />
                                    ))}
                                </div>
                                 <a href={outboundBookingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-3 text-sm bg-cyan-600 text-white font-bold py-1 px-3 rounded-md hover:bg-cyan-500 transition-colors">Book Selected <ExternalLinkIcon className="w-4 h-4 ml-2"/></a>
                            </div>
                             <div>
                                <h4 className="font-bold text-slate-300 mb-2"><span className="text-cyan-400">Inbound</span> Options</h4>
                                <div className="space-y-2">
                                    {itineraryData.flights.inboundOptions.map(flight => (
                                        <FlightOptionCard key={`${flight.flightNumber}-${flight.departureTime}`} flight={flight} isSelected={selectedFlights.inbound?.flightNumber === flight.flightNumber && selectedFlights.inbound?.departureTime === flight.departureTime} onSelect={() => onFlightSelect(flight, 'inbound')} currencySymbol={currencySymbol} />
                                    ))}
                                </div>
                                <a href={inboundBookingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-3 text-sm bg-cyan-600 text-white font-bold py-1 px-3 rounded-md hover:bg-cyan-500 transition-colors">Book Selected <ExternalLinkIcon className="w-4 h-4 ml-2"/></a>
                            </div>
                        </div>
                    </div>
                )}
                {showRailways && (
                    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                        <div className="flex items-center mb-4">
                            <RailwayIcon className="w-8 h-8 text-cyan-400 mr-4"/>
                            <h3 className="text-2xl font-bold text-white">Railways</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-bold text-slate-300 mb-2"><span className="text-cyan-400">Outbound</span> Options</h4>
                                <div className="space-y-2">
                                    {itineraryData.railways.outboundOptions.map(rail => (
                                        <RailwayOptionCard key={`${rail.trainNumber}-${rail.departureTime}`} railway={rail} isSelected={selectedRailways.outbound?.trainNumber === rail.trainNumber && selectedRailways.outbound?.departureTime === rail.departureTime} onSelect={() => onRailwaySelect(rail, 'outbound')} currencySymbol={currencySymbol} />
                                    ))}
                                </div>
                                <a href={outboundRailwayBookingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-3 text-sm bg-cyan-600 text-white font-bold py-1 px-3 rounded-md hover:bg-cyan-500 transition-colors">Book Selected <ExternalLinkIcon className="w-4 h-4 ml-2"/></a>
                            </div>
                             <div>
                                <h4 className="font-bold text-slate-300 mb-2"><span className="text-cyan-400">Inbound</span> Options</h4>
                                <div className="space-y-2">
                                    {itineraryData.railways.inboundOptions.map(rail => (
                                        <RailwayOptionCard key={`${rail.trainNumber}-${rail.departureTime}`} railway={rail} isSelected={selectedRailways.inbound?.trainNumber === rail.trainNumber && selectedRailways.inbound?.departureTime === rail.departureTime} onSelect={() => onRailwaySelect(rail, 'inbound')} currencySymbol={currencySymbol} />
                                    ))}
                                </div>
                                <a href={inboundRailwayBookingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-3 text-sm bg-cyan-600 text-white font-bold py-1 px-3 rounded-md hover:bg-cyan-500 transition-colors">Book Selected <ExternalLinkIcon className="w-4 h-4 ml-2"/></a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {itineraryData.accommodation && itineraryData.accommodation.length > 0 && (
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                    <div className="flex items-center mb-4">
                        <BedIcon className="w-8 h-8 text-cyan-400 mr-4"/>
                        <h3 className="text-2xl font-bold text-white">Accommodation</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {itineraryData.accommodation.map(locGroup => (
                            <div key={locGroup.location}>
                                <h4 className="font-semibold text-slate-300 mb-2">{locGroup.location}</h4>
                                <div className="space-y-2">
                                    {locGroup.options.map(option => (
                                        <AccommodationOptionCard 
                                            key={option.name}
                                            accommodation={option}
                                            isSelected={selectedAccommodations[locGroup.location]?.name === option.name}
                                            onSelect={() => onAccommodationSelect(option, locGroup.location)}
                                            currencySymbol={currencySymbol}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {itineraryData.tripEssentials && (
              <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-white text-center">Trip Essentials</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                      {itineraryData.tripEssentials.weatherInfo && (
                          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex">
                              <WeatherIcon className="w-8 h-8 text-cyan-400 mr-4 mt-1 flex-shrink-0"/>
                              <div>
                                  <h4 className="font-bold text-white">Weather</h4>
                                  <p className="text-sm text-slate-400">{itineraryData.tripEssentials.weatherInfo}</p>
                              </div>
                          </div>
                      )}
                      {itineraryData.tripEssentials.clothingSuggestions && (
                           <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex">
                              <ClothingIcon className="w-8 h-8 text-cyan-400 mr-4 mt-1 flex-shrink-0"/>
                              <div>
                                  <h4 className="font-bold text-white">What to Pack</h4>
                                  <p className="text-sm text-slate-400">{itineraryData.tripEssentials.clothingSuggestions}</p>
                              </div>
                          </div>
                      )}
                  </div>
                  {itineraryData.tripEssentials.travelWarnings && (
                      <div className="bg-amber-900/50 p-4 rounded-xl border border-amber-700 flex">
                          <WarningIcon className="w-8 h-8 text-amber-400 mr-4 mt-1 flex-shrink-0"/>
                          <div>
                              <h4 className="font-bold text-amber-300">Travel Advisory</h4>
                              <p className="text-sm text-amber-300/80">{itineraryData.tripEssentials.travelWarnings}</p>
                          </div>
                      </div>
                  )}
              </div>
            )}

            <div>
                <h3 className="text-3xl font-bold text-white mb-6 text-center">Daily Itinerary</h3>
                <div className="space-y-4">
                    {itineraryData.dailyPlan && itineraryData.dailyPlan.map(dayPlan => (
                        <div key={dayPlan.day} className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                            <button onClick={() => toggleDay(dayPlan.day)} className="w-full p-4 text-left flex justify-between items-center bg-slate-700/50 hover:bg-slate-700 transition-colors">
                                <div className="flex items-center">
                                    <span className="bg-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4">{dayPlan.day}</span>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">{dayPlan.title}</h4>
                                        <p className="text-sm text-slate-400">{formatDate(dayPlan.date)}</p>
                                    </div>
                                </div>
                                <svg className={`w-6 h-6 text-slate-400 transition-transform ${openDay === dayPlan.day || expandAllForPdf ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {(openDay === dayPlan.day || expandAllForPdf) && (
                                <div className="p-6 border-t border-slate-700 animate-fade-in-down">
                                    <ul className="space-y-4 relative">
                                        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-700"></div>
                                        {dayPlan.activities && Array.isArray(dayPlan.activities) && dayPlan.activities.map((activity, index) => (
                                            <li key={index} className="flex items-start pl-10 relative">
                                                <div className="absolute left-0 top-1 flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center ring-4 ring-slate-800">
                                                        <ActivityTypeIcon type={activity.type} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-200">{activity.time} - {activity.description}</p>
                                                    {activity.details && <p className="text-slate-400 text-sm mt-1">{activity.details}</p>}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ItineraryDisplay;