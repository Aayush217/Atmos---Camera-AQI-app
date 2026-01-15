import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../constants/theme';
import { useColorScheme } from 'react-native';

export default function MapScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.text, { color: theme.text }]}>
                The Map View uses Google Earth Engine data and is optimized for the Mobile App.
                {"\n\n"}
                Please open this on iOS or Android to view the heatmap overlay!
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    }
});
