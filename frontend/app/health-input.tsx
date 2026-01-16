import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { createUserProfile } from '@/services/api';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HealthInputScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [conditions, setConditions] = useState<string[]>([]);

    // Mock conditions for selection
    const availableConditions = ['Asthma', 'Dust Allergy', 'Pollen Allergy', 'Sinusitis', 'None'];

    const toggleCondition = (condition: string) => {
        if (condition === 'None') {
            setConditions(['None']);
            return;
        }
        if (conditions.includes('None')) {
            setConditions([condition]);
            return;
        }

        if (conditions.includes(condition)) {
            setConditions(conditions.filter(c => c !== condition));
        } else {
            setConditions([...conditions, condition]);
        }
    };

    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await createUserProfile({
                name,
                age: parseInt(age) || 0,
                conditions,
                sensitivity_level: conditions.length > 1 ? 'High' : 'Medium'
            });
            // Small delay to ensure DB write before navigation
            await new Promise(r => setTimeout(r, 500));
            router.replace('/(tabs)');
        } catch (error) {
            console.error("Failed to create profile", error);
            router.replace('/(tabs)');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.dark, '#1a1a2e']}
                style={styles.background}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Animated.View entering={FadeInDown.delay(200)}>
                    <Text style={styles.heading}>About You</Text>
                    <Text style={styles.subheading}>Help us personalize your air quality insights.</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400)} style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <GlassCard style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Your Name"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                value={name}
                                onChangeText={setName}
                            />
                        </GlassCard>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Age</Text>
                        <GlassCard style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Age"
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                keyboardType="number-pad"
                                value={age}
                                onChangeText={setAge}
                            />
                        </GlassCard>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Health Conditions</Text>
                        <View style={styles.chipsContainer}>
                            {availableConditions.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    onPress={() => toggleCondition(item)}
                                    style={[
                                        styles.chip,
                                        conditions.includes(item) && styles.activeChip
                                    ]}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        conditions.includes(item) && styles.activeChipText
                                    ]}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            <View style={styles.footer}>
                <GlassButton title={loading ? "Saving..." : "Continue"} onPress={handleContinue} />
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
    scrollContent: {
        padding: SPACING.xl,
        paddingTop: 80,
    },
    heading: {
        fontSize: 34,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: SPACING.s,
    },
    subheading: {
        fontSize: 17,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: SPACING.xl,
    },
    form: {
        gap: SPACING.l,
    },
    inputGroup: {
        gap: SPACING.s,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textLight,
        marginLeft: SPACING.xs,
    },
    inputContainer: {
        padding: SPACING.m, // Override GlassCard padding if needed
    },
    input: {
        fontSize: 17,
        color: COLORS.textLight,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.s,
    },
    chip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: RADIUS.l,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    activeChip: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    chipText: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
    },
    activeChipText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    footer: {
        padding: SPACING.xl,
        paddingBottom: 40,
    },
});
