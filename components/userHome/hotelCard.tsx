import { Hotel } from '@/models/Hotel';
import { saveViewedHotelAPI } from '@/service/HotelAPI';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import Rate from "@/models/Rate";
import { getRatesByHotel } from "@/service/RateAPI";
import { saveHotel, removeSavedHotel, isHotelSaved } from '@/service/SavedHotelAPI';

interface HotelCardProps {
    handleNavigations: (id: number) => void;
    data: Hotel;
    onViewedUpdate?: () => void;
      handleUnsave?: (hotelId: number) => Promise<void>;
}

const HotelCard: React.FC<HotelCardProps> = ({ handleNavigations, data, onViewedUpdate, handleUnsave }) => {

    const [rateCount, setRateCount] = useState<number>(0);
    const [averageRate, setAverageRate] = useState<number>(0);
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                const [ratesRes, userId] = await Promise.all([
                    getRatesByHotel(data.id),
                    AsyncStorage.getItem('userId')
                ]);

                if (!mounted) return;

                setRateCount(ratesRes.length);
                if (ratesRes.length > 0) {
                    const avg = ratesRes.reduce((sum, r) => sum + r.rateNumber, 0) / ratesRes.length;
                    setAverageRate(parseFloat(avg.toFixed(1)));
                } else {
                    setAverageRate(0);
                }

                if (userId) {
                    const saved = await isHotelSaved(Number(userId), data.id);
                    if (mounted) setIsSaved(saved);
                }
            } catch (error) {
                console.error("❌ Lỗi khi tải dữ liệu:", error);
            }
        };

        fetchData();
        return () => { mounted = false };
    }, [data.id]);


    const handlePress = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                await saveViewedHotelAPI(Number(userId), data.id);
                onViewedUpdate?.();
            }
        } catch (err) {
            console.error("Error saving viewed hotel:", err);
        } finally {
            handleNavigations(data.id);
        }
    };

    const handleToggleSave = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        if (isSaved) {
            // Nếu đang lưu -> hỏi xác nhận bỏ lưu
            Alert.alert(
                "Xác nhận",
                "Bạn có chắc muốn hủy lưu khách sạn này không?",
                [
                    { text: "Hủy", style: "cancel", onPress: () => setIsProcessing(false) },
                    {
                        text: "Đồng ý",
                        onPress: async () => {
                            try {
                                setIsSaved(false);

                                
                                if (handleUnsave) {
                                    await handleUnsave(data.id);
                                } else {
                                    // Nếu không, fallback gọi API trực tiếp
                                    await removeSavedHotel(Number(userId), data.id);
                                    Alert.alert("Thành công", "Đã bỏ lưu khách sạn.");
                                }
                            } catch (err) {
                                console.error(" Lỗi khi bỏ lưu:", err);
                                setIsSaved(true);
                            } finally {
                                setIsProcessing(false);
                            }
                        },
                    },
                ],
                { cancelable: true }
            );
        } else {
            // Nếu chưa lưu -> lưu ngay
            setIsSaved(true);
            await saveHotel(Number(userId), data.id);
            Alert.alert("Thành công", "Đã lưu khách sạn vào danh sách yêu thích!");
        }
    } catch (err) {
        console.error(" Lỗi khi toggle lưu:", err);
        setIsSaved((prev) => !prev);
    } finally {
        if (!isSaved) setIsProcessing(false);
    }
};


    return (
        <View style={styles.cardWrapper}>
            <View>
                <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
                    <ImageBackground source={{ uri: data.image }} style={styles.container}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.locationTag}>
                                <Image
                                    style={{ width: 10, height: 10 }}
                                    source={require("../../assets/images/gps.png")}
                                />
                                <Text style={styles.locationText}>{data.locationName}</Text>
                            </View>

                            {/* 🔖 Nút lưu */}
                            <TouchableOpacity
                                onPress={handleToggleSave}
                                disabled={isProcessing}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    style={styles.bookmarkIcon}
                                    name={isSaved ? "bookmark" : "bookmark-outline"}
                                    size={22}
                                    color={isProcessing ? "#ccc" : (isSaved ? "#FFD700" : "white")}
                                />
                            </TouchableOpacity>

                        </View>

                        <View style={styles.discountTag}>
                            <Text style={styles.discountText}>Tiết kiệm 25%</Text>
                        </View>
                    </ImageBackground>

                    {/* 👇 Phần nhấn để đi vào chi tiết khách sạn */}

                    <View style={styles.statusBox}>
                        <Text style={styles.statusText}>{data.status}</Text>
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={styles.hotelName}>{data.name}</Text>

                        {/* ⭐ Đánh giá */}
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
                            <Text style={styles.rateText}>
                                {averageRate > 0 ? averageRate.toFixed(1) : "Chưa có đánh giá"}
                            </Text>
                        </View>

                        {/* 💰 Giá */}
                        <View style={{ flexDirection: 'row', marginTop: 'auto', marginBottom: 5 }}>
                            <Text style={styles.priceText}>
                                {data?.minPrice && data?.maxPrice
                                    ? `${data.minPrice.toLocaleString('vi-VN')} VNĐ - ${data.maxPrice.toLocaleString('vi-VN')} VNĐ`
                                    : ''}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

};

const styles = StyleSheet.create({
    cardWrapper: {
        margin: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    container: {
        width: 180,
        height: 100,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        overflow: 'hidden',
        backgroundColor: 'white',
    },
    locationTag: {
        backgroundColor: '#0E0E14',
        width: 80,
        padding: 5,
        borderRadius: 5,
        flexDirection: 'row',
    },
    locationText: {
        color: 'white',
        fontSize: 10,
        marginLeft: 5,
    },
    bookmarkIcon: {
        left: 70,
        marginTop: 2,
    },
    discountTag: {
        backgroundColor: '#FF6210',
        width: 90,
        padding: 2,
        top: 50,
        left: 90,
    },
    discountText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 10,
        marginLeft: 5,
    },
    statusBox: {
        width: 180,
        height: 25,
        alignItems: 'center',
        padding: 5,
        backgroundColor: '#275DE5',
    },
    statusText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    infoBox: {
        width: 180,
        height: 100,
        overflow: 'hidden',
        padding: 5,
        backgroundColor: 'white',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    hotelName: {
        color: '#534F4F',
        fontWeight: 'bold',
        fontSize: 11,
        marginLeft: 5,
        marginTop: 10,
    },
    rateText: {
        color: "gray",
        marginLeft: 6,
        fontWeight: "bold",
        fontSize: 9,
    },
    priceText: {
        fontSize: 10,
        marginTop: 5,
        marginLeft: 5,
        color: '#FF6210',
        fontWeight: 'bold',
    },
});

export default HotelCard;
