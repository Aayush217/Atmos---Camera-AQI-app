import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/theme';

export default function ScanningOverlay({ isScanning }: { isScanning: boolean }) {
  if (!isScanning) return null;

  return (
    <View style={styles.container}>
      <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
      <LottieView
        source={require('../assets/lottie/scanning.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
      <Text style={styles.text}>Analyzing Atmosphere...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  lottie: {
    width: 300,
    height: 300,
  },
  text: {
    marginTop: 20,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  }
});
