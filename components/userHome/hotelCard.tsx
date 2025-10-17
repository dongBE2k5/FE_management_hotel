import { Hotel } from '@/models/Hotel';
import { saveViewedHotelAPI } from '@/service/HotelAPI';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import Rate from "@/models/Rate";
import { getRatesByHotel, getAverageRate } from "@/service/RateAPI";


interface HotelCardProps {
    handleNavigations: (id: number) => void
    data: Hotel;
    onViewedUpdate?: () => void;
}


const HotelCard: React.FC<HotelCardProps> = ({ handleNavigations, data, onViewedUpdate }) => {

    {/* tính tổng đânhs gia     */ }
    const [rateCount, setRateCount] = useState<number>(0);

    {/* tính sao     */ }
    const [rates, setRates] = useState<Rate[]>([]);
    const [averageRate, setAverageRate] = useState<number>(0);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await getRatesByHotel(data.id);
                setRates(res);

                // ✅ Tổng số rate
                setRateCount(res.length);

                // ✅ Tính trung bình sao
                if (res.length > 0) {
                    const avg =
                        res.reduce((sum: number, r: Rate) => sum + r.rateNumber, 0) / res.length;
                    setAverageRate(parseFloat(avg.toFixed(1)));
                } else {
                    setAverageRate(0);
                }
            } catch (error) {
                console.error("Lỗi khi lấy đánh giá:", error);
            }
        };

        if (data?.id) {
            fetchRates();
        }
    }, [data]);

    const handlePress = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                // ✅ Gọi API lưu lịch sử đã xem gần đây
                await saveViewedHotelAPI(Number(userId), data.id);
                onViewedUpdate?.();
            }
        } catch (err) {
            console.error("Error saving viewed hotel:", err);
        } finally {
            // ✅ Sau khi lưu, chuyển sang trang chi tiết
            handleNavigations(data.id);

        }
    };

    return (
        <View style={styles.cardWrapper}>
            <TouchableOpacity
                onPress={handlePress}
            // style={{ backgroundColor: "blue", padding: 10, borderRadius: 5 }}
            >

                <ImageBackground
                    source={{ uri: `${data.image}` }}
                    style={styles.container}

                >
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ backgroundColor: '#0E0E14', width: 80, padding: 5, borderRadius: 5, flexDirection: 'row' }}>
                            <Image style={{ width: 10, height: 10 }} source={require("../../assets/images/gps.png")} />
                            <Text style={{ color: 'white', fontSize: 10, marginLeft: 5 }}>{data.locationName}</Text>

                        </View>
                        <Ionicons style={{ left: 70, marginTop: 2 }} name="bookmark-outline" size={20} color="white" />
                    </View>
                    <View style={{ backgroundColor: '#FF6210', width: 90, padding: 2, top: 50, left: 90 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10, marginLeft: 5 }}>Tiết kiệm 25%</Text>
                    </View>
                </ImageBackground >
                <View style={{

                    width: 180,
                    height: 25,
                    overflow: 'hidden',  // để bo góc imageBackground
                    alignItems: 'center',
                    padding: 5,
                    backgroundColor: '#275DE5'
                }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12, marginLeft: 5 }}>{data.status}</Text>
                </View>
                <View style={{

                    width: 180,
                    height: 100,
                    overflow: 'hidden',  // để bo góc imageBackground
                    padding: 5,
                    backgroundColor: 'white',
                    borderBottomLeftRadius: 5,
                    borderBottomRightRadius: 5,

                }}>
                    <Text style={{ color: '#534F4F', fontWeight: 'bold', fontSize: 11, marginLeft: 5, marginTop: 10 }}>{data.name}</Text>

                    {/* tính sao     */}
                    <View style={{ flexDirection: 'row', marginLeft: 2, marginTop: 2 }}>

                        {[1, 2, 3, 4, 5].map((i) => (
                            <Ionicons
                                key={i}
                                name={
                                    averageRate >= i
                                        ? "star"
                                        : averageRate >= i - 0.5
                                            ? "star-half"
                                            : "star-outline"
                                }
                                size={14}
                                color="#FFD700"
                                style={{ marginHorizontal: 1 }}
                            />
                        ))}
                        <Text style={{ color: "gray", marginLeft: 6, fontWeight: "bold", fontSize: 9 }}>
                            {averageRate > 0 ? averageRate.toFixed(1) : "Chưa có đánh giá"}
                        </Text>

                    </View>
                    <View style={{ flexDirection: 'row', marginLeft: 5, marginTop: 5 }}>
                        <Image style={{ width: 10, height: 10, tintColor: '#009EDE' }} source={require("../../assets/images/logo.png")} />
                        <Text style={{ fontSize: 9, marginLeft: 5, color: '#009EDE', fontWeight: 'bold' }}>{averageRate.toFixed(1)}/5</Text>
                        <Text style={{ fontSize: 9, marginLeft: 5, color: '#009EDE', fontWeight: 'bold'}}>
                            ({rateCount})
                        </Text>

                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 'auto', marginBottom: 5 }}>
                        <Text style={{ fontSize: 10, marginTop: 5, marginLeft: 5, color: '#FF6210', fontWeight: 'bold' }}>{data?.minPrice && data?.maxPrice ? `${data?.minPrice?.toLocaleString('vi-VN')} VNĐ - ${data?.maxPrice?.toLocaleString('vi-VN')} VNĐ` : ''}</Text>

                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {

        width: 180,
        height: 100,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        overflow: 'hidden',  // để bo góc imageBackground
        backgroundColor: 'white', // fallback khi ảnh chưa load
    },
    cardWrapper: {
        margin: 10,
        borderRadius: 8,
        // iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        // Android
        elevation: 4,
    }

});
export default HotelCard;
