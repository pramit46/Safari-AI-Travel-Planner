import React, { useState, useRef, useEffect } from 'react';
import { ItineraryOption, Activity, FlightInfo, AccommodationInfo } from '../types';
import { PlaneIcon, BedIcon, SightseeingIcon, MealIcon, TravelIcon, OtherIcon, ExternalLinkIcon, DownloadIcon, WeatherIcon, ClothingIcon, WarningIcon } from './IconComponents';

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
    selectedAccommodations: { [location: string]: AccommodationInfo | null };
    onAccommodationSelect: (accommodation: AccommodationInfo, location: string) => void;
    dynamicTotalCost: number | null;
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
            <span className="font-semibold text-slate-200">{flight.airline} <span className="text-xs text-slate-400">{flight.flightNumber}</span></span>
            <span className="font-bold text-white">{currencySymbol}{flight.price.toLocaleString()}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">{flight.departureAirport} → {flight.arrivalAirport}</p>
        <p className="text-xs text-slate-500">{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
    </div>
);

const AccommodationOptionCard: React.FC<{ accommodation: AccommodationInfo, isSelected: boolean, onSelect: () => void, currencySymbol: string }> = ({ accommodation, isSelected, onSelect, currencySymbol }) => {
    const bookingLink = accommodation.bookingLink || `https://www.google.com/search?q=${encodeURIComponent(accommodation.name)}`;
    return (
        <div
            onClick={onSelect}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-cyan-900/50 border-cyan-500 ring-2 ring-cyan-500' : 'bg-slate-900/50 border-slate-700 hover:border-slate-500'}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h5 className="font-semibold text-slate-200">{accommodation.name}</h5>
                    <p className="text-xs text-slate-400">{accommodation.type}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-white">{currencySymbol}{accommodation.totalPrice.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">{currencySymbol}{accommodation.pricePerNight}/night</p>
                </div>
            </div>
             <a href={bookingLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center mt-2 text-xs bg-slate-600 text-slate-300 font-bold py-1 px-2 rounded-md hover:bg-slate-500 transition-colors">
                Book <ExternalLinkIcon className="w-3 h-3 ml-1.5"/>
            </a>
        </div>
    );
};

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itineraryData, selectedFlights, onFlightSelect, selectedAccommodations, onAccommodationSelect, dynamicTotalCost }) => {
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
    
    return (
        <div className="w-full space-y-8 animate-fade-in" ref={itineraryRef}>
            <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div></div>
                <div className="text-center">
                    <h2 className="text-4xl font-extrabold text-white leading-tight">{itineraryData.title}</h2>
                    <p className="text-xl text-cyan-400 font-medium mt-2">
                        Total Estimated Cost: {currencySymbol}{dynamicTotalCost?.toLocaleString()}
                    </p>
                </div>
                <div className="flex justify-end">
                    <button 
                        onClick={handleDownloadPdf} 
                        disabled={isDownloading}
                        className="bg-slate-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 disabled:bg-slate-500 disabled:cursor-wait transition-all duration-300 shadow-md flex items-center"
                    >
                        {isDownloading ? (
                            <><div className="w-5 h-5 border-2 border-t-2 border-slate-400 border-t-white rounded-full animate-spin mr-2"></div>Downloading...</>
                        ) : (
                            <><DownloadIcon className="w-5 h-5 mr-2"/>Download Plan</>
                        )}
                    </button>
                </div>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                {itineraryData.flights && (
                    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                        <div className="flex items-center mb-4">
                            <PlaneIcon className="w-8 h-8 text-cyan-400 mr-4"/>
                            <h3 className="text-2xl font-bold text-white">Flights</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-slate-300 mb-2">Outbound Options</h4>
                                <div className="space-y-2">
                                    {itineraryData.flights.outboundOptions.map(flight => (
                                        <FlightOptionCard key={`${flight.flightNumber}-${flight.departureTime}`} flight={flight} isSelected={selectedFlights.outbound?.flightNumber === flight.flightNumber && selectedFlights.outbound?.departureTime === flight.departureTime} onSelect={() => onFlightSelect(flight, 'outbound')} currencySymbol={currencySymbol} />
                                    ))}
                                </div>
                                 <a href={outboundBookingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-3 text-sm bg-cyan-600 text-white font-bold py-1 px-3 rounded-md hover:bg-cyan-500 transition-colors">Book Selected <ExternalLinkIcon className="w-4 h-4 ml-2"/></a>
                            </div>
                             <div>
                                <h4 className="font-semibold text-slate-300 mb-2">Inbound Options</h4>
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
                {itineraryData.accommodation && itineraryData.accommodation.length > 0 && (
                    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                        <div className="flex items-center mb-4">
                            <BedIcon className="w-8 h-8 text-cyan-400 mr-4"/>
                            <h3 className="text-2xl font-bold text-white">Accommodation</h3>
                        </div>
                        <div className="space-y-4">
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
            </div>
            
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
                                <svg className={`w-6 h-6 text-slate-400 transition-transform ${openDay === dayPlan.day ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
