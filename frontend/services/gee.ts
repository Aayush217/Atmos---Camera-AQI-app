// This stands in for a backend service that would normally query Earth Engine
// Since we can't run Earth Engine client-side securely or easily in React Native without a proxy.

export const fetchSatelliteAQI = async (latitude: number, longitude: number) => {
    const credentials = process.env.EXPO_PUBLIC_GEE_CREDENTIALS;

    if (!credentials) {
        console.warn("GEE Credentials missing. Using mock data.");
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock logic: randomly generate AQI based on 'location' hash (lat+long) so it's consistent
    const randomSeed = Math.floor((Math.abs(latitude) + Math.abs(longitude)) * 100);
    const mockAQI = 20 + (randomSeed % 150); // range 20-170

    let color = "#00E400"; // Green
    let status = "Good";

    if (mockAQI > 50) { color = "#FFFF00"; status = "Moderate"; }
    if (mockAQI > 100) { color = "#FF7E00"; status = "Unhealthy for Sensitive Groups"; }
    if (mockAQI > 150) { color = "#FF0000"; status = "Unhealthy"; }

    return {
        aqi: mockAQI,
        status: status,
        color: color,
        source: "Google Earth Engine (Simulated)"
    };
};
