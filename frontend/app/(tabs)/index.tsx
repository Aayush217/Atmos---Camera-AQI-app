import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/ui/GlassCard';
import { COLORS, SPACING, RADIUS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function Dashboard() {
  // Mock Data - In real app, fetch from Backend
  const userName = "User";
  const currentAQI = 42;
  const aqiStatus = "Good";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background */}
      <LinearGradient
        colors={[COLORS.dark, '#1e3c72']}
        style={styles.background}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.username}>{userName}</Text>
          </View>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#FFF" />
          </View>
        </Animated.View>

        {/* AQI Highlught */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <GlassCard style={styles.aqiCard} intensity={40} tint="dark">
            <View style={styles.aqiHeader}>
              <Ionicons name="cloud-outline" size={24} color={COLORS.textLight} />
              <Text style={styles.aqiLabel}>Air Quality Index</Text>
            </View>
            <Text style={styles.aqiValue}>{currentAQI}</Text>
            <Text style={styles.aqiStatus}>{aqiStatus}</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: '42%', backgroundColor: COLORS.success }]} />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Health Insight */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <GlassCard style={styles.insightCard} intensity={20}>
            <View style={styles.insightHeader}>
              <Ionicons name="fitness" size={22} color={COLORS.warning} />
              <Text style={styles.sectionTitle}>Checkup</Text>
            </View>
            <Text style={styles.insightText}>
              Air quality is great today! It's a perfect time for an outdoor jog.
              Your asthma risk is low.
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.grid}>
          <Animated.View entering={FadeInDown.delay(800)} style={{ flex: 1 }}>
            <GlassCard style={styles.statCard}>
              <Ionicons name="water-outline" size={24} color="#64b5f6" />
              <Text style={styles.statLabel}>Humidity</Text>
              <Text style={styles.statValue}>45%</Text>
            </GlassCard>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(900)} style={{ flex: 1 }}>
            <GlassCard style={styles.statCard}>
              <Ionicons name="thermometer-outline" size={24} color="#ffb74d" />
              <Text style={styles.statLabel}>Temp</Text>
              <Text style={styles.statValue}>24°C</Text>
            </GlassCard>
          </Animated.View>
        </View>

      </ScrollView>
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
    top: 0, left: 0, right: 0, bottom: 0,
  },
  scrollContent: {
    padding: SPACING.l,
    paddingTop: 60,
    gap: SPACING.l,
    paddingBottom: 100, // Space for Tab Bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aqiCard: {
    padding: SPACING.l,
    alignItems: 'center',
  },
  aqiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
    marginBottom: SPACING.s,
  },
  aqiLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  aqiValue: {
    fontSize: 72,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: -2,
  },
  aqiStatus: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: SPACING.m,
  },
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  insightCard: {
    padding: SPACING.l,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
    marginBottom: SPACING.s,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  insightText: {
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    fontSize: 15,
  },
  grid: {
    flexDirection: 'row',
    gap: SPACING.m,
  },
  statCard: {
    padding: SPACING.m,
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textLight,
  },
});
