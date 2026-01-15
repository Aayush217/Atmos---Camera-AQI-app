import React from 'react';
import { StyleSheet, View, ViewStyle, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/theme';
import { useColorScheme } from 'react-native';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
}

export default function GlassCard({ children, style, intensity = 20 }: GlassCardProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.container, style]}>
            <BlurView intensity={intensity} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <LinearGradient
                colors={isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] : ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)']}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 20,
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
    },
    content: {
        padding: 20,
    }
});
