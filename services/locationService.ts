// A simplified mapping from IANA timezone names to country capitals.
// This is not exhaustive but covers many common cases to provide a reasonable default.
const timezoneToCapitalMap: { [key: string]: string } = {
    // USA
    'America/New_York': 'Washington, D.C., USA',
    'America/Chicago': 'Washington, D.C., USA',
    'America/Denver': 'Washington, D.C., USA',
    'America/Phoenix': 'Washington, D.C., USA',
    'America/Los_Angeles': 'Washington, D.C., USA',
    'America/Anchorage': 'Washington, D.C., USA',
    'Pacific/Honolulu': 'Washington, D.C., USA',
    // Canada
    'America/Toronto': 'Ottawa, Canada',
    'America/Vancouver': 'Ottawa, Canada',
    'America/Halifax': 'Ottawa, Canada',
    // UK
    'Europe/London': 'London, UK',
    // India
    'Asia/Kolkata': 'New Delhi, India',
    // Japan
    'Asia/Tokyo': 'Tokyo, Japan',
    // Australia
    'Australia/Sydney': 'Canberra, Australia',
    'Australia/Melbourne': 'Canberra, Australia',
    'Australia/Perth': 'Canberra, Australia',
    // France
    'Europe/Paris': 'Paris, France',
    // Germany
    'Europe/Berlin': 'Berlin, Germany',
};

/**
 * Infers a user's country capital based on their browser's timezone setting.
 * @returns {string | null} The capital city and country, or null if it cannot be determined.
 */
export const getCapitalFromTimezone = (): string | null => {
    try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return timezoneToCapitalMap[timeZone] || null;
    } catch (e) {
        console.error("Could not determine timezone:", e);
        return null;
    }
};