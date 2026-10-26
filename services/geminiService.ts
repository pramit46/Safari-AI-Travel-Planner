import { ItineraryResponse } from '../types';

export const generateItinerary = async (prompt: string): Promise<ItineraryResponse> => {
    try {
        const response = await fetch('/api/generate-itinerary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            let errorMsg = `Server error (${response.status})`;
            try {
                const errorData = await response.json();
                if (errorData?.error) {
                    errorMsg = errorData.error;
                }
            } catch {
                // Ignore parse errors on failed response
            }
            throw new Error(errorMsg);
        }

        const data: ItineraryResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Error generating itinerary:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to generate itinerary due to an unexpected network or server error.");
    }
};
