import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/ui/GlassButton';
import { COLORS, SPACING } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function WelcomeScreen() {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push('/health-input');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#4facfe', '#00f2fe']} // Placeholder nice gradient
                style={styles.background}
            />

            {/* Semantic Background Circle */}
            <View style={styles.circle} />

            <View style={styles.content}>
                <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.header}>
                    <Text style={styles.title}>Atmos</Text>
                    <Text style={styles.subtitle}>Breathe Smarter.</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.footer}>
                    <Text style={styles.description}>
                        Real-time air quality insights powered by AI, tailored to your health.
                    </Text>
                    <GlassButton
                        title="Get Started"
                        onPress={handleGetStarted}
                        variant="glass"
                    />
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark,
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    circle: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        padding: SPACING.xl,
        paddingTop: 120,
        paddingBottom: 60,
    },
    header: {
        alignItems: 'center',
    },
    title: {
        fontSize: 52,
        fontWeight: '800',
        color: COLORS.textLight,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: '300',
        color: 'rgba(255,255,255,0.8)',
        marginTop: SPACING.s,
    },
    footer: {
        gap: SPACING.l,
    },
    description: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: SPACING.m,
    },
});
