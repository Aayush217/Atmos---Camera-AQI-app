import * as Location from 'expo-location';

export const getCurrentLocation = async () => {
    try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.warn('Permission to access location was denied');
            return null;
        }

        // Create a promise that rejects after 5 seconds
        const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("Location timeout")), 5000)
        );

        try {
            // Race between getting location and timeout
            let location = await Promise.race([
                Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
                timeoutPromise
            ]) as Location.LocationObject;

            return location.coords;
        } catch (e) {
            console.log("Location request timed out or failed, trying last known...");
            // Fallback to last known position
            const lastKnown = await Location.getLastKnownPositionAsync({});
            if (lastKnown) return lastKnown.coords;
            return null;
        }
    } catch (error) {
        console.error("Error getting location:", error);
        return null;
    }
};
