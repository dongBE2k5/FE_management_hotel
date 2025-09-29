import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import RoomCard from "./roomCard";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import RoomZone from '@/components/roomZone';

export default function MidHotelDetail() {
    const insets = useSafeAreaInsets();

    return (
        <View
        >
            {/* Thông tin khách sạn */}
            <View style={styles.section}>
                <Text style={styles.title}>Khách sạn Alibaba Đà Nẵng, Phước Mỹ</Text>
                <Text style={styles.subTitle}>(Alibaba Hotel)</Text>
                <Text style={styles.hotelTag}>Khách Sạn</Text>

                <View style={styles.row}>
                    <Ionicons name="location" size={20} color="#999494" style={styles.iconTop} />
                    <Text style={[styles.grayText, { flex: 1 }]}>
                        168 Hồ Nghinh, Phước Mỹ, Sơn Trà, Đà Nẵng 550000
                    </Text>
                </View>
            </View>

            {/* Tiện ích */}
            <View style={styles.section}>
                <Text style={styles.title}>Tiện ích</Text>
                <Text style={[styles.grayText, { marginLeft: 10, marginTop: 15 }]}>
                    Vị trí thuận tiện gần trung tâm thành phố
                </Text>
                <View style={[styles.row, { marginLeft: 10, marginTop: 8 }]}>
                    <Ionicons name="wifi" size={20} color="#999494" style={styles.iconTop} />
                    <Text style={styles.iconText}>Wifi</Text>

                    <Ionicons name="swap-vertical" size={20} color="#999494" style={[styles.iconTop, { marginLeft: 20 }]} />
                    <Text style={styles.iconText}>Thang máy</Text>

                    <Ionicons name="restaurant" size={20} color="#999494" style={[styles.iconTop, { marginLeft: 20 }]} />
                    <Text style={styles.iconText}>Nhà hàng</Text>
                </View>
            </View>

            {/* Đánh giá */}
            <View style={styles.section}>
                <Text style={styles.title}>XẾP HẠNG & ĐÁNH GIÁ</Text>
                <Text style={[styles.title, { fontSize: 12, marginLeft: 10, marginTop: 5 }]}>Traveloka</Text>
                <View style={styles.row}>
                    <Image
                        tintColor="#009EDE"
                        style={{ marginLeft: 5, width: 30, height: 20, marginTop: 10 }}
                        source={require('../assets/images/logo.png')}
                    />
                    <Text style={{ marginLeft: 5, marginTop: 12, color: '#0046de', fontWeight: 'bold' }}>8.7</Text>
                    <Text style={{ marginLeft: 5, marginTop: 12, color: '#009EDE', fontWeight: 'bold' }}>Ấn tượng</Text>
                </View>
            </View>

            {/* Những điều khách thích */}
            <View style={styles.section}>
                <Text style={styles.title}>Những điều khách thích nhất</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                    <View style={styles.row}>
                        {[
                            ['Phòng sạch', '(4)'],
                            ['Nội thất sạch', '(9)'],
                            ['Nhân viên thân thiện', '(12)'],
                            ['Dịch vụ tốt', '(4)'],
                        ].map(([label, count], idx) => (
                            <View key={idx} style={styles.chip}>
                                <Text style={styles.chipText}>{label}</Text>
                                <Text style={[styles.chipText, { marginLeft: 5 }]}>{count}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Đánh giá hàng đầu */}
            <View style={styles.section}>
                <Text style={styles.title}>Đánh giá hàng đầu</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 10 }}>
                    <View style={styles.row}>
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <Text key={idx} style={styles.reviewText}>
                                “Phòng đẹp tuyệt vời mới lung linh lấp la lấp lánh lắm hahahahahahahaa”
                            </Text>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Zone phòng */}
            <RoomZone />
               <RoomCard />
                 <RoomCard />
                   <RoomCard />
                     <RoomCard />
               
                 {/* Zone phòng */}
            <RoomZone />
               <RoomCard />
                 <RoomCard />
                   <RoomCard />
                     <RoomCard />
               
        </View>
    );
}

const styles = StyleSheet.create({
    section: { margin: 15 },
    row: { flexDirection: 'row', alignItems: 'center' },
    title: { color: 'black', fontWeight: 'bold', fontSize: 15 },
    subTitle: { color: '#999494', fontWeight: 'bold', fontSize: 12, marginLeft: 5, marginTop: 5 },
    hotelTag: {
        borderColor: '#009EDE',
        textAlign: 'center',
        marginTop: 10,
        borderWidth: 2,
        padding: 5,
        borderRadius: 5,
        width: 100,
        color: '#009EDE',
        fontWeight: 'bold',
    },
    grayText: { color: '#999494', fontWeight: 'bold', fontSize: 12, marginTop: 10 },
    iconTop: { marginTop: 10 },
    iconText: { color: '#999494', fontWeight: 'bold', fontSize: 12, marginLeft: 5, marginTop: 15 },
    chip: {
        flexDirection: 'row',
        backgroundColor: '#D9D9D9',
        borderRadius: 50,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginLeft: 10,
    },
    chipText: { color: '#009EDE', fontWeight: 'bold' },
    reviewText: {
        backgroundColor: '#EFEFEF',
        borderRadius: 20,
        padding: 10,
        width: 200,
        color: '#999494',
        fontWeight: 'bold',
        fontSize: 11,
        marginRight: 15,
        // Shadow iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 1.65,
        // Elevation Android
        elevation: 2,
    },
});
