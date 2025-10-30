import React, { useState, useRef } from 'react';
import { ItineraryOption, Activity } from '../types';
import { PlaneIcon, BedIcon, SightseeingIcon, MealIcon, TravelIcon, OtherIcon, ExternalLinkIcon, DownloadIcon } from './IconComponents';

// Add type definitions for the CDN libraries to the window object
declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

interface ItineraryDisplayProps {
    itineraryData: ItineraryOption;
}

const ActivityTypeIcon: React.FC<{ type: Activity['type'] }> = ({ type }) => {
    const iconClass = "w-5 h-5 text-cyan-400";
    switch (type) {
        case 'Sightseeing': return <SightseeingIcon className={iconClass} />;
        case 'Meal': return <MealIcon className={iconClass} />;
        case 'Travel': return <TravelIcon className={iconClass} />;
        default: return <OtherIcon className={iconClass} />;
    }
};

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itineraryData }) => {
    const [openDay, setOpenDay] = useState<number | null>(1);
    const itineraryRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

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
        const input = itineraryRef.current;
        if (!input) return;

        setIsDownloading(true);
        const { jsPDF } = window.jspdf;

        window.html2canvas(input, { 
            backgroundColor: '#1e293b', // Match the dark theme for capture
            scale: 2 // Increase resolution for better quality
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
            setIsDownloading(false);
        }).catch(() => {
            setIsDownloading(false);
        });
    };
    
    // Generate placeholder links if specific ones are not provided
    const outboundBookingLink = itineraryData.flights?.outbound?.bookingLink || `https://www.google.com/flights?q=flights+from+${encodeURIComponent(itineraryData.flights?.outbound?.departureAirport || '')}+to+${encodeURIComponent(itineraryData.flights?.outbound?.arrivalAirport || '')}`;
    const inboundBookingLink = itineraryData.flights?.inbound?.bookingLink || `https://www.google.com/flights?q=flights+from+${encodeURIComponent(itineraryData.flights?.inbound?.departureAirport || '')}+to+${encodeURIComponent(itineraryData.flights?.inbound?.arrivalAirport || '')}`;
    const accommodationBookingLink = itineraryData.accommodation?.bookingLink || `https://www.google.com/search?q=${encodeURIComponent(itineraryData.accommodation?.name || '')}`;

    return (
        <div className="w-full space-y-8 animate-fade-in" ref={itineraryRef}>
            <header className="text-center relative">
                <h2 className="text-4xl font-extrabold text-white">{itineraryData.title}</h2>
                <p className="text-xl text-cyan-400 font-medium mt-2">
                    Total Estimated Cost: ${itineraryData.totalEstimatedCost.toLocaleString()}
                </p>
                <button 
                    onClick={handleDownloadPdf} 
                    disabled={isDownloading}
                    className="absolute top-0 right-0 mt-2 bg-slate-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-600 disabled:bg-slate-500 disabled:cursor-wait transition-all duration-300 shadow-md flex items-center"
                >
                    {isDownloading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-t-2 border-slate-400 border-t-white rounded-full animate-spin mr-2"></div>
                            Downloading...
                        </>
                    ) : (
                        <>
                            <DownloadIcon className="w-5 h-5 mr-2"/>
                            Download Plan
                        </>
                    )}
                </button>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                {itineraryData.flights && (
                    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                        <div className="flex items-center mb-4">
                            <PlaneIcon className="w-8 h-8 text-cyan-400 mr-4"/>
                            <h3 className="text-2xl font-bold text-white">Flights</h3>
                        </div>
                        <div className="space-y-4">
                            {itineraryData.flights.outbound && (
                                <div>
                                    <h4 className="font-semibold text-slate-300">Outbound</h4>
                                    <p className="text-sm text-slate-400">{itineraryData.flights.outbound.airline} - {itineraryData.flights.outbound.departureAirport} to {itineraryData.flights.outbound.arrivalAirport}</p>
                                    <p className="text-sm text-slate-400">Cost: ${itineraryData.flights.outbound.price}</p>
                                    <a href={outboundBookingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-2 text-sm bg-cyan-600 text-white font-bold py-1 px-3 rounded-md hover:bg-cyan-500 transition-colors">
                                        Book Now <ExternalLinkIcon className="w-4 h-4 ml-2"/>
                                    </a>
                                </div>
                            )}
                            {itineraryData.flights.inbound && (
                                <div>
                                    <h4 className="font-semibold text-slate-300">Inbound</h4>
                                    <p className="text-sm text-slate-400">{itineraryData.flights.inbound.airline} - {itineraryData.flights.inbound.departureAirport} to {itineraryData.flights.inbound.arrivalAirport}</p>
                                    <p className="text-sm text-slate-400">Cost: ${itineraryData.flights.inbound.price}</p>
                                     <a href={inboundBookingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-2 text-sm bg-cyan-600 text-white font-bold py-1 px-3 rounded-md hover:bg-cyan-500 transition-colors">
                                        Book Now <ExternalLinkIcon className="w-4 h-4 ml-2"/>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {itineraryData.accommodation && (
                    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                        <div className="flex items-center mb-4">
                            <BedIcon className="w-8 h-8 text-cyan-400 mr-4"/>
                            <h3 className="text-2xl font-bold text-white">Accommodation</h3>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-slate-200">{itineraryData.accommodation.name}</h4>
                            <p className="text-sm text-slate-400">{itineraryData.accommodation.type}</p>
                            <p className="text-sm text-slate-400">{formatDate(itineraryData.accommodation.checkInDate)} to {formatDate(itineraryData.accommodation.checkOutDate)}</p>
                            <p className="text-sm text-slate-400">Total Price: ${itineraryData.accommodation.totalPrice.toLocaleString()}</p>
                            <a href={accommodationBookingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-2 text-sm bg-cyan-600 text-white font-bold py-1 px-3 rounded-md hover:bg-cyan-500 transition-colors">
                                Book Now <ExternalLinkIcon className="w-4 h-4 ml-2"/>
                            </a>
                        </div>
                    </div>
                )}
            </div>

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
                            {openDay === dayPlan.day && (
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