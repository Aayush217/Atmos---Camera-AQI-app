import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { getCurrentLocation } from '../services/location';
import { Colors } from '../constants/theme';
import { useColorScheme } from 'react-native';

export default function MapScreen() {
    const [location, setLocation] = useState<any>(null);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    useEffect(() => {
        (async () => {
            const coords = await getCurrentLocation();
            if (coords) {
                setLocation({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
            }
        })();
    }, []);

    return (
        <View style={styles.container}>
            {location ? (
                <MapView
                    style={styles.map}
                    initialRegion={location}
                    provider={PROVIDER_GOOGLE}
                    showsUserLocation={true}
                >
                    {/* Simulated Heatmap Overlay - simplified as Circles for now */}
                    <Circle
                        center={location}
                        radius={1000}
                        fillColor="rgba(255, 255, 0, 0.3)" // Yellow haze
                        strokeColor="rgba(255, 255, 0, 0.5)"
                    />
                    <Circle
                        center={{ latitude: location.latitude + 0.01, longitude: location.longitude + 0.01 }}
                        radius={1500}
                        fillColor="rgba(0, 255, 0, 0.2)" // Good air nearby
                        strokeColor="rgba(0, 255, 0, 0.4)"
                    />
                </MapView>
            ) : (
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }]}>
                    <Text style={{ color: theme.text }}>Locating...</Text>
                </View>
            )}

            <View style={[styles.legend, { backgroundColor: theme.card }]}>
                <Text style={[styles.legendTitle, { color: theme.text }]}>Air Quality Heatmap</Text>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: 'rgba(0, 255, 0, 0.5)' }]} />
                    <Text style={{ color: theme.text }}>Good</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: 'rgba(255, 255, 0, 0.5)' }]} />
                    <Text style={{ color: theme.text }}>Moderate</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    legend: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        padding: 15,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    legendTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    }
});
