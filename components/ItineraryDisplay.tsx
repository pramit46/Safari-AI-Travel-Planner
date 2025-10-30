import React, { useState } from 'react';
import { ItineraryOption, Activity } from '../types';
import { PlaneIcon, BedIcon, SightseeingIcon, MealIcon, TravelIcon, OtherIcon, ExternalLinkIcon } from './IconComponents';

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
    
    return (
        <div className="w-full space-y-8 animate-fade-in">
            <header className="text-center">
                <h2 className="text-4xl font-extrabold text-white">{itineraryData.title}</h2>
                <p className="text-xl text-cyan-400 font-medium mt-2">
                    Total Estimated Cost: ${itineraryData.totalEstimatedCost.toLocaleString()}
                </p>
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
                                    {itineraryData.flights.outbound.bookingLink && (
                                        <a href={itineraryData.flights.outbound.bookingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-2 text-sm bg-cyan-600 text-white font-bold py-1 px-3 rounded-md hover:bg-cyan-500 transition-colors">
                                            Book Now <ExternalLinkIcon className="w-4 h-4 ml-2"/>
                                        </a>
                                    )}
                                </div>
                            )}
                            {itineraryData.flights.inbound && (
                                <div>
                                    <h4 className="font-semibold text-slate-300">Inbound</h4>
                                    <p className="text-sm text-slate-400">{itineraryData.flights.inbound.airline} - {itineraryData.flights.inbound.departureAirport} to {itineraryData.flights.inbound.arrivalAirport}</p>
                                    <p className="text-sm text-slate-400">Cost: ${itineraryData.flights.inbound.price}</p>
                                    {itineraryData.flights.inbound.bookingLink && (
                                        <a href={itineraryData.flights.inbound.bookingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-2 text-sm bg-cyan-600 text-white font-bold py-1 px-3 rounded-md hover:bg-cyan-500 transition-colors">
                                            Book Now <ExternalLinkIcon className="w-4 h-4 ml-2"/>
                                        </a>
                                    )}
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
                            {itineraryData.accommodation.bookingLink && (
                                <a href={itineraryData.accommodation.bookingLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-2 text-sm bg-cyan-600 text-white font-bold py-1 px-3 rounded-md hover:bg-cyan-500 transition-colors">
                                    Book Now <ExternalLinkIcon className="w-4 h-4 ml-2"/>
                                </a>
                            )}
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