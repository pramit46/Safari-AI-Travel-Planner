
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

export interface AccommodationInfo {
  name: string;
  type: string;
  checkInDate: string;
  checkOutDate: string;
  pricePerNight: number;
  totalPrice: number;
  bookingLink?: string;
}

export interface ItineraryOption {
  title: string;
  totalEstimatedCost: number;
  flights: {
    outbound: FlightInfo;
    inbound: FlightInfo;
  };
  accommodation: AccommodationInfo;
  dailyPlan: DailyPlan[];
}

export interface ItineraryResponse {
  itineraries: ItineraryOption[];
}
