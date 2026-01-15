import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, intensity = 20, tint = 'dark' }) => {
    return (
        <BlurView intensity={intensity} tint={tint} style={[styles.container, style]}>
            {children}
        </BlurView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.m,
        borderRadius: RADIUS.l,
        overflow: 'hidden',
        backgroundColor: COLORS.glass, // Fallback / Overlay
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
});
