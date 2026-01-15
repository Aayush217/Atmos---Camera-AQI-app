import React from 'react';
import { Text, StyleSheet, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

interface GlassButtonProps {
    title: string;
    onPress: () => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'glass';
    style?: any;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ title, onPress, icon, variant = 'primary', style }) => {
    const scale = new Animated.Value(1);

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    const getBackgroundColor = () => {
        if (variant === 'primary') return COLORS.primary;
        if (variant === 'secondary') return COLORS.secondary;
        return 'transparent';
    };

    return (
        <Animated.View style={[styles.container, style, { transform: [{ scale }] }]}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handlePress}
                style={styles.pressable}
            >
                {variant === 'glass' ? (
                    <BlurView intensity={30} tint="light" style={styles.blur}>
                        {icon && <>{icon}</>}
                        <Text style={[styles.text, { color: COLORS.textLight }]}>{title}</Text>
                    </BlurView>
                ) : (
                    <View style={[styles.solid, { backgroundColor: getBackgroundColor() }]}>
                        {icon && <>{icon}</>}
                        <Text style={styles.text}>{title}</Text>
                    </View>
                )}
            </Pressable>
        </Animated.View>
    );
};

// Start of View Mock for Solid variant (since BlurView handles the other)
import { View } from 'react-native';

const styles = StyleSheet.create({
    container: {
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        width: '100%',
    },
    pressable: {
        width: '100%',
        height: 56,
    },
    blur: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.s,
    },
    solid: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.s,
        borderRadius: RADIUS.xl,
    },
    text: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});
