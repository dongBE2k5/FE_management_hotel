import InFormationAccount from '@/components/userProfile/informationAccount';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, } from 'react-native';
export default function HotelDetail() {
    return (
        <View style={styles.container}>

      
            {/* Scrollable Content */}
            <View
                style={styles.scrollView}
            >
                <InFormationAccount />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
});

