import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { analyzeImage } from '@/services/gemini';
import { fetchSatelliteAQI } from '@/services/gee';
import { getCurrentLocation } from '@/services/location';
import { saveScan } from '@/services/api';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import ScanningOverlay from '@/components/ScanningOverlay';

export default function ScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const router = useRouter();

    if (!permission) return <View />;

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>We need your permission to analyze the sky.</Text>
                <GlassButton title="Grant Access" onPress={requestPermission} />
            </View>
        );
    }

    const takePictureAndAnalyze = async () => {
        if (!cameraRef.current) return;

        setAnalyzing(true);
        try {
            const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.3 });
            if (photo?.base64) {
                setCapturedImage(photo.uri);

                const locationPromise = getCurrentLocation();
                const visualAnalysisPromise = analyzeImage(photo.base64);

                const [coords, visualResult] = await Promise.all([locationPromise, visualAnalysisPromise]);

                // Mock Satellite if GEE not set up
                let satelliteResult = null;
                if (coords) {
                    // satelliteResult = await fetchSatelliteAQI(coords.latitude, coords.longitude);
                }

                const scanData = {
                    visual: visualResult,
                    satellite: satelliteResult,
                    location: coords,
                    weather: { hum: 45, wind: 12, temp: 24 },
                    components: { pm10: visualResult.aqi * 1.2, no2: 15, so2: 5 }
                };

                setResult(scanData);

                // Save to Backend
                // Assume generic User ID 1 for now
                await saveScan({
                    userId: 1,
                    aqi: visualResult.aqi,
                    location: coords || {},
                    ai_analysis: scanData
                });
            }
        } catch (error) {
            console.error("Analysis failed:", error);
            Alert.alert("Error", "Could not analyze image.");
            setResult(null);
            setCapturedImage(null);
        } finally {
            setAnalyzing(false);
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
                        <View style={styles.topBar}>
                            <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                            <GlassCard style={styles.headerBadge} intensity={20}>
                                <Text style={styles.headerText}>Atmos Lens</Text>
                            </GlassCard>
                            <View style={{ width: 40 }} />
                        </View>

                        <View style={styles.controls}>
                            <TouchableOpacity
                                style={styles.shutterBtn}
                                onPress={takePictureAndAnalyze}
                            >
                                <View style={styles.shutterInner} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                    {analyzing && <ScanningOverlay isScanning={analyzing} />}
                </CameraView>
            ) : (
                <View style={styles.resultContainer}>
                    <Image source={{ uri: capturedImage }} style={StyleSheet.absoluteFill} blurRadius={40} />
                    <View style={styles.darkOverlay} />

                    <SafeAreaView style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            {result && (
                                <Animated.View entering={FadeInDown.springify()}>
                                    {/* Header */}
                                    <View style={styles.resultHeader}>
                                        <TouchableOpacity onPress={reset}>
                                            <Ionicons name="close-circle" size={36} color="rgba(255,255,255,0.8)" />
                                        </TouchableOpacity>
                                        <Text style={styles.resultTitle}>Analysis</Text>
                                        <View style={{ width: 36 }} />
                                    </View>

                                    {/* Main AQI Card */}
                                    <GlassCard style={styles.mainCard} intensity={50}>
                                        <View style={[styles.ring, { borderColor: result.visual.color }]}>
                                            <Text style={[styles.aqiValue, { color: result.visual.color }]}>
                                                {result.visual.aqi}
                                            </Text>
                                            <Text style={styles.aqiLabel}>AQI</Text>
                                        </View>
                                        <Text style={styles.statusText}>{result.visual.description}</Text>
                                    </GlassCard>

                                    {/* Stats Grid */}
                                    <View style={styles.grid}>
                                        <GlassCard style={styles.statItem}>
                                            <MaterialCommunityIcons name="weather-windy" size={24} color="#FFF" />
                                            <Text style={styles.statValue}>{result.weather.wind} km/h</Text>
                                            <Text style={styles.statLabel}>Wind</Text>
                                        </GlassCard>
                                        <GlassCard style={styles.statItem}>
                                            <MaterialCommunityIcons name="water-percent" size={24} color="#FFF" />
                                            <Text style={styles.statValue}>{result.weather.hum}%</Text>
                                            <Text style={styles.statLabel}>Hum</Text>
                                        </GlassCard>
                                        <GlassCard style={styles.statItem}>
                                            <MaterialCommunityIcons name="thermometer" size={24} color="#FFF" />
                                            <Text style={styles.statValue}>{result.weather.temp}°</Text>
                                            <Text style={styles.statLabel}>Temp</Text>
                                        </GlassCard>
                                    </View>

                                    {/* Tip */}
                                    <GlassCard style={[styles.tipCard, { backgroundColor: result.visual.color + '40' }]}>
                                        <Ionicons name="bulb" size={24} color="#FFF" style={{ marginRight: 12 }} />
                                        <Text style={styles.tipText}>{result.visual.recommendation}</Text>
                                    </GlassCard>

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
    container: { flex: 1, backgroundColor: '#000' },
    permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.dark },
    permissionText: { color: '#FFF', fontSize: 18, marginBottom: 20, textAlign: 'center' },

    camera: { flex: 1 },
    overlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingBottom: 50 },
    topBar: { flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 },
    closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    headerBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    headerText: { color: '#FFF', fontWeight: '600' },

    controls: { alignItems: 'center' },
    shutterBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
    shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF' },

    resultContainer: { flex: 1 },
    darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    scrollContent: { padding: SPACING.l },
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.l },
    resultTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },

    mainCard: { alignItems: 'center', padding: SPACING.xl, marginBottom: SPACING.l },
    ring: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.m },
    aqiValue: { fontSize: 56, fontWeight: '900' },
    aqiLabel: { color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
    statusText: { color: '#FFF', fontSize: 18, textAlign: 'center' },

    grid: { flexDirection: 'row', gap: SPACING.m, marginBottom: SPACING.l },
    statItem: { flex: 1, alignItems: 'center', padding: SPACING.m },
    statValue: { color: '#FFF', fontWeight: '700', marginTop: 4 },
    statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

    tipCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.m },
    tipText: { flex: 1, color: '#FFF', fontSize: 15, lineHeight: 20 },
});
