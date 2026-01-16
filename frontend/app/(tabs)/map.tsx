import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS } from '@/constants/theme';
import { getCurrentLocation } from '@/services/location';
import { GlassCard } from '@/components/ui/GlassCard';

export default function MapScreen() {
    const [location, setLocation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const coords = await getCurrentLocation();
            if (coords) {
                setLocation({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            }
            setLoading(false);
        })();
    }, []);

    if (loading || !location) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Locating...</Text>
            </View>
        );
    }

    // Mock AQI color for the circle (Green for Good)
    const aqiColor = "rgba(0, 228, 0, 0.4)";

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={PROVIDER_DEFAULT} // Use default to be safe on iOS/Android without custom keys setup
                initialRegion={location}
                showsUserLocation
                showsMyLocationButton
            >
                <Marker
                    coordinate={location}
                    title="You are here"
                    description="Current Location"
                />
                <Circle
                    center={location}
                    radius={1500}
                    fillColor={aqiColor}
                    strokeColor="rgba(0, 228, 0, 0.8)"
                />
            </MapView>

            <View style={styles.overlay}>
                <GlassCard style={styles.infoCard} intensity={30}>
                    <Text style={styles.infoTitle}>Local Air Quality</Text>
                    <Text style={styles.infoValue}>AQI 42 (Good)</Text>
                </GlassCard>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.dark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.textLight,
        marginTop: 10,
    },
    overlay: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
    },
    infoCard: {
        padding: 15,
        alignItems: 'center',
    },
    infoTitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginBottom: 4,
    },
    infoValue: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
