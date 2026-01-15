import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'The Lens',
          tabBarIcon: ({ color, focused }) => <Ionicons size={28} name={focused ? 'camera' : 'camera-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'The Map',
          tabBarIcon: ({ color, focused }) => <Ionicons size={28} name={focused ? 'map' : 'map-outline'} color={color} />,
        }}
      />
    </Tabs>
  );
}
