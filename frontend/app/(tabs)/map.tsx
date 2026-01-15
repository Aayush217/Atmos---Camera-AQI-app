import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

export default function MapScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Map Integration Coming Soon</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: COLORS.textLight,
        fontSize: 18,
    },
});
