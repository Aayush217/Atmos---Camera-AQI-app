/**
 * Clean Tech Theme
 * Minimalist, airy, soft cool blues, whites, and dynamic AQI status colors.
 */
import { Platform } from 'react-native';

const tintColorLight = '#0288D1';
const tintColorDark = '#4FC3F7';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    tint: tintColorLight,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    status: {
      good: '#00E676',
      moderate: '#FFEA00',
      unhealthy: '#FF3D00',
      hazardous: '#D50000',
    },
    card: '#FFFFFF',
    shadow: 'rgba(148, 163, 184, 0.1)',
  },
  dark: {
    text: '#F1F5F9',
    background: '#0F172A',
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    status: {
      good: '#00C853',
      moderate: '#FFD600',
      unhealthy: '#DD2C00',
      hazardous: '#B71C1C',
    },
    card: '#1E293B',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export const Fonts = Platform.select({
  ios: {
    hero: 'System',
    body: 'System',
  },
  android: {
    hero: 'Roboto',
    body: 'Roboto',
  },
  default: {
    hero: 'sans-serif',
    body: 'sans-serif',
  }
});
