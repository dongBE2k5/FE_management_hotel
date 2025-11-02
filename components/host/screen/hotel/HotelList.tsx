import { useHost } from '@/context/HostContext';
import { getAllHotelsByUser } from '@/service/HotelAPI';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function HotelList() {
    const { hotelId, setHotelId } = useHost();
    const navigation = useNavigation<any>();
    const [hotels, setHotels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchHotels(); // Gọi lại API mỗi khi vào lại trang
        }, [])
    );
    const fetchHotels = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            // const userId = 1;   
            if (!userId) return;
            const res = await getAllHotelsByUser(Number(userId));
            setHotels(res.data || []);
        } catch (error) {
            console.error("Lỗi khi tải danh sách khách sạn:", error);
        } finally {
            setLoading(false);
        }
    };

    //   const handleDelete = async (id: number) => {
    //     try {
    //       await deleteHotel(id);
    //       setHotels(prev => prev.filter(h => h.id !== id));
    //     } catch (error) {
    //       console.error("Lỗi khi xóa khách sạn:", error);
    //     }
    //   };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                setHotelId(item.id);
                navigation.navigate('hostBookings');
            }}
            activeOpacity={0.8}
        >
            <Image
                source={{
                    uri: item.image || 'https://i.ibb.co/4fZPmDc/default-hotel.jpg',
                }}
                style={styles.hotelImage}
            />

            <View style={styles.infoContainer}>
                <Text style={styles.hotelName} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.hotelAddress} numberOfLines={1}>
                    📍 {item.address}
                </Text>
                {/* <Text style={styles.hotelDetail}>⭐ {item.stars} sao</Text> */}
                <Text style={styles.hotelDetail}>📞 {item.phone}</Text>
                <Text
                    style={[
                        styles.status,
                        styles.active,
                    ]}
                >
                    {item.status}
                </Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity onPress={() => navigation.navigate('hotelEdit', { id: item.id })}>
                    <Ionicons name="create-outline" size={22} color="#007bff" />
                </TouchableOpacity>
                <TouchableOpacity
                //  onPress={() => handleDelete(item.id)}
                >
                    <Ionicons name="trash-outline" size={22} color="#dc3545" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("CreateHotel")}>
                <Ionicons name="add-circle-outline" size={28} color="#fff" />
                <Text style={styles.addText}>Thêm khách sạn</Text>
            </TouchableOpacity>

            <FlatList
                data={hotels}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>Chưa có khách sạn nào.</Text>}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f6f8',
        paddingHorizontal: 16,
        paddingTop: 40,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    info: {
        flex: 1,
    },
    hotelName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
    },
    hotelAddress: {
        fontSize: 14,
        color: '#555',
        marginTop: 2,
    },
    hotelDetail: {
        fontSize: 13,
        color: '#777',
    },
    status: {
        marginTop: 5,
        fontWeight: '500',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    active: {
        backgroundColor: '#d1e7dd',
        color: '#0f5132',
    },
    inactive: {
        backgroundColor: '#f8d7da',
        color: '#842029',
    },
    actions: {
        flexDirection: 'row',
        gap: 15,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007bff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        justifyContent: 'center',
    },
    addText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hotelImage: {
        width: 90,
        height: 90,
        borderRadius: 10,
        marginRight: 10,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
});
