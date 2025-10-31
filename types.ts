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
}

export interface AccommodationInfo {
  name: string;
  type: string;
  pricePerNight: number;
  totalPrice: number;
  bookingLink?: string;
  rating?: number;
  reviewCount?: number;
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