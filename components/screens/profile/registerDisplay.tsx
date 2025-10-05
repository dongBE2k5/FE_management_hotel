import Register from '@/components/Register';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
export default function HotelDetail() {
    const [showStickyHeader, setShowStickyHeader] = useState(false);

    const handleScroll = (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        setShowStickyHeader(scrollY > 100); // Thay đổi giá trị nếu cần điều chỉnh
    };

    const navigation = useNavigation();

    return (
        <View style={styles.container}>

         
            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                bounces={false}             // tắt hiệu ứng bounce trên iOS
                overScrollMode="never"     // tắt hiệu ứng overscroll trên Android
            >
                <Register />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    iconTop: { marginTop: 10 },
    scrollView: {
        flex: 1,
    },
    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#009EDE',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        elevation: 10, // Android
        shadowColor: '#000', // iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    stickyText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginTop: 40,
        paddingBottom:10,
        textAlign:'center'
    },
});

