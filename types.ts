export interface Activity {
  time: string;
  type: 'Sightseeing' | 'Meal' | 'Travel' | 'Activity' | 'Other';
  description: string;
  details?: string;
}

export interface DailyPlan {
  day: number;
  date: string;
  title: string;
  activities: Activity[];
}

export interface FlightInfo {
  departureAirport: string;
  arrivalAirport: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  bookingLink?: string;
  seatType: 'Economy' | 'Business' | 'First';
}

export interface RailwayInfo {
    departureStation: string;
    arrivalStation: string;
    trainProvider: string;
    trainNumber: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
    bookingLink?: string;
    berthType: 'EC' | 'CC' | 'Sleeper' | '2AC' | '3AC' | '1AC' | 'General';
}

export interface AccommodationInfo {
  name: string;
  type: string;
  pricePerNight: number;
  totalPrice: number;
  bookingLink?: string;
  rating?: number;
  reviewCount?: number;
  isPureVeg?: boolean;
  pureVegSourceLink?: string;
}

export interface LocationAccommodation {
  location: string;
  options: AccommodationInfo[];
}

export interface TripEssentials {
  weatherInfo: string;
  clothingSuggestions: string;
  travelWarnings: string;
}

export interface ItineraryOption {
  title: string;
  totalEstimatedCost: number;
  currency: string; // e.g., "USD", "INR", "EUR"
  flights?: {
    outboundOptions: FlightInfo[];
    inboundOptions: FlightInfo[];
  };
  railways?: {
    outboundOptions: RailwayInfo[];
    inboundOptions: RailwayInfo[];
  };
  accommodation: LocationAccommodation[];
  dailyPlan: DailyPlan[];
  tripEssentials: TripEssentials;
}

export interface ItineraryResponse {
  itineraries: ItineraryOption[];
}
