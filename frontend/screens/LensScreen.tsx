import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import { analyzeImage } from '../services/gemini';
import { fetchSatelliteAQI } from '../services/gee';
import { getCurrentLocation } from '../services/location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import ScanningOverlay from '../components/ScanningOverlay';
import GlassCard from '../components/GlassCard';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

export default function LensScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = Colors[isDark ? 'dark' : 'light'];

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={[styles.message, { color: theme.text }]}>We need your permission to analyze the sky.</Text>
                <TouchableOpacity style={[styles.button, { backgroundColor: theme.tint }]} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Access</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePictureAndAnalyze = async () => {
        if (cameraRef.current) {
            setAnalyzing(true);

            // Safety timeout to ensure we don't get stuck in analyzing state
            const safetyTimer = setTimeout(() => {
                setAnalyzing((current) => {
                    if (current) {
                        alert("Analysis timed out. Please try again.");
                        return false;
                    }
                    return current;
                });
            }, 15000);

            try {
                const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
                if (photo?.base64) {
                    setCapturedImage(photo.uri);

                    const locationPromise = getCurrentLocation();
                    const visualAnalysisPromise = analyzeImage(photo.base64);
                    const coords = await locationPromise;
                    const visualResult = await visualAnalysisPromise;

                    let satelliteResult = null;
                    if (coords) {
                        satelliteResult = await fetchSatelliteAQI(coords.latitude, coords.longitude);
                    }

                    setResult({
                        visual: visualResult,
                        satellite: satelliteResult,
                        location: coords,
                        weather: { // Mock weather data
                            hum: 45,
                            wind: 12, // km/h
                            temp: 24, // C
                        },
                        components: { // Mock pollutants
                            pm10: visualResult.aqi * 1.2,
                            no2: 15,
                            so2: 5
                        }
                    });
                }
            } catch (error) {
                console.error("Analysis failed:", error);
                alert("An error occurred during analysis.");
            } finally {
                clearTimeout(safetyTimer);
                setAnalyzing(false);
            }
        }
    };

    const reset = () => {
        setResult(null);
        setCapturedImage(null);
    };

    return (
        <View style={styles.container}>
            {!capturedImage ? (
                <CameraView style={styles.camera} ref={cameraRef} facing="back">
                    <SafeAreaView style={styles.overlay}>
                        <GlassCard style={styles.header} intensity={10}>
                            <Text style={styles.headerText}>Atmos Lens</Text>
                        </GlassCard>
                        <TouchableOpacity
                            style={[styles.analyzeBtn, { borderColor: 'rgba(255,255,255,0.5)' }]}
                            onPress={takePictureAndAnalyze}
                        >
                            <View style={[styles.shutterInner, { backgroundColor: '#fff' }]} />
                        </TouchableOpacity>
                    </SafeAreaView>
                    <ScanningOverlay isScanning={analyzing} />
                </CameraView>
            ) : (
                <View style={[styles.resultContainer, { backgroundColor: theme.background }]}>
                    <Image source={{ uri: capturedImage }} style={StyleSheet.absoluteFill} blurRadius={30} />
                    <View style={styles.darkOverlay} />

                    <SafeAreaView style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            {result && (
                                <Animated.View entering={FadeInDown.delay(200)}>
                                    <View style={styles.headerRow}>
                                        <TouchableOpacity onPress={reset} style={styles.backBtn}>
                                            <Ionicons name="close-circle" size={32} color="#fff" />
                                        </TouchableOpacity>
                                        <Text style={styles.resultHeader}>Analysis Complete</Text>
                                    </View>

                                    <GlassCard style={styles.mainCard} intensity={40}>
                                        <View style={styles.aqiCircle}>
                                            <Text style={[styles.aqiValue, { color: result.visual.color }]}>{result.visual.aqi}</Text>
                                            <Text style={styles.aqiLabel}>US AQI</Text>
                                        </View>
                                        <Text style={styles.statusText}>{result.visual.description}</Text>
                                    </GlassCard>

                                    <Animated.View entering={FadeInDown.delay(400)}>
                                        <View style={styles.statsRow}>
                                            <GlassCard style={styles.statBox}>
                                                <MaterialCommunityIcons name="weather-windy" size={24} color="#fff" />
                                                <Text style={styles.statValue}>{result.weather.wind} km/h</Text>
                                                <Text style={styles.statLabel}>Wind</Text>
                                            </GlassCard>
                                            <GlassCard style={styles.statBox}>
                                                <MaterialCommunityIcons name="water-percent" size={24} color="#fff" />
                                                <Text style={styles.statValue}>{result.weather.hum}%</Text>
                                                <Text style={styles.statLabel}>Humidity</Text>
                                            </GlassCard>
                                            <GlassCard style={styles.statBox}>
                                                <MaterialCommunityIcons name="thermometer" size={24} color="#fff" />
                                                <Text style={styles.statValue}>{result.weather.temp}°</Text>
                                                <Text style={styles.statLabel}>Temp</Text>
                                            </GlassCard>
                                        </View>
                                    </Animated.View>

                                    <Animated.View entering={FadeInDown.delay(600)}>
                                        <GlassCard style={styles.detailsCard}>
                                            <Text style={styles.sectionTitle}>Pollutants Breakdown</Text>
                                            <View style={styles.row}>
                                                <Text style={styles.rowLabel}>PM 2.5</Text>
                                                <View style={styles.barContainer}>
                                                    <View style={[styles.bar, { width: `${Math.min(result.visual.aqi, 100)}%`, backgroundColor: result.visual.color }]} />
                                                </View>
                                                <Text style={styles.rowValue}>{Math.round(result.visual.aqi)}</Text>
                                            </View>
                                            <View style={styles.row}>
                                                <Text style={styles.rowLabel}>PM 10</Text>
                                                <View style={styles.barContainer}>
                                                    <View style={[styles.bar, { width: `${Math.min(result.components.pm10, 100)}%`, backgroundColor: '#FFD700' }]} />
                                                </View>
                                                <Text style={styles.rowValue}>{Math.round(result.components.pm10)}</Text>
                                            </View>
                                        </GlassCard>
                                    </Animated.View>

                                    <Animated.View entering={FadeInDown.delay(800)}>
                                        <View style={[styles.tipCard, { backgroundColor: result.visual.color }]}>
                                            <Text style={styles.tipIcon}>💡</Text>
                                            <Text style={styles.tipText}>{result.visual.recommendation}</Text>
                                        </View>
                                    </Animated.View>
                                </Animated.View>
                            )}
                        </ScrollView>
                    </SafeAreaView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    camera: { flex: 1 },
    overlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingBottom: 40 },
    header: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
    headerText: { color: '#fff', fontSize: 18, fontWeight: '600', letterSpacing: 1 },
    analyzeBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
    shutterInner: { width: 60, height: 60, borderRadius: 30 },

    resultContainer: { flex: 1 },
    darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    scrollContent: { padding: 20, paddingBottom: 50 },

    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backBtn: { marginRight: 15 },
    resultHeader: { fontSize: 24, fontWeight: '700', color: '#fff' },

    mainCard: { alignItems: 'center', marginBottom: 20 },
    aqiCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    aqiValue: { fontSize: 48, fontWeight: '800' },
    aqiLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textTransform: 'uppercase' },
    statusText: { color: '#fff', fontSize: 18, textAlign: 'center', lineHeight: 24 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    statBox: { flex: 1, marginHorizontal: 5, alignItems: 'center', padding: 15 },
    statValue: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 5 },
    statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

    detailsCard: { marginBottom: 20 },
    sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 15 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    rowLabel: { color: 'rgba(255,255,255,0.8)', width: 50 },
    barContainer: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, marginHorizontal: 10, overflow: 'hidden' },
    bar: { height: '100%', borderRadius: 4 },
    rowValue: { color: '#fff', fontWeight: '700', width: 30, textAlign: 'right' },

    tipCard: { padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
    tipIcon: { fontSize: 24, marginRight: 15 },
    tipText: { color: '#000', fontSize: 15, fontWeight: '600', flex: 1 },

    message: { textAlign: 'center', paddingBottom: 10, fontSize: 16 },
    button: { padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { fontSize: 18, fontWeight: 'bold', color: 'white' },
});
