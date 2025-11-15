import Login from '@/components/userProfile/Login';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { getCurrentUser } from '@/service/UserAPI';
import type { RootStackParamList } from '@/types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from 'expo-router';

export default function HotelDetail() {
    const [showStickyHeader, setShowStickyHeader] = useState(false);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            console.log("🏨 LoginDisplay");
            const checkLogin = async () => {
                try {
                  setLoading(true);
                  const token = await AsyncStorage.getItem('userToken');
                  if (token) {
                    const user = await getCurrentUser(token);
                    console.log("✅ user.Login:", user);
        
                    if (user) {
                      navigation.replace('LoggedAccount');
                    } 
                  }
                } catch (error) {
                  console.error("❌ Error in checkLogin:", error);
                } finally {
                  setLoading(false);
                }
              };
        
              checkLogin();
        }, [])
    );
    console.log("🏨 LoginDisplay");
    
    const handleScroll = (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        setShowStickyHeader(scrollY > 100); // Thay đổi giá trị nếu cần điều chỉnh
    };

 const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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
                <Login />
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

