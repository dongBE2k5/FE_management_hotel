import { Hotel } from "@/models/Hotel";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import React, { useRef, useState, useEffect } from "react";
import Rate from "@/models/Rate";
import { getRatesByHotel } from "@/service/RateAPI";


import {
    Dimensions,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const images = [
    require("../../assets/images/ks1.jpg"),
    require("../../assets/images/ksslide1.jpeg"),
    require("../../assets/images/ksslide2.jpg"),
    require("../../assets/images/ksslide3.jpg"),
    require("../../assets/images/ksslide4.jpg"),
];
type HotelProps = {
    hotel: Hotel;
}

export default function HeaderHotelDetail({ hotel }: HotelProps) {
    const flatListRef = useRef<FlatList<any>>(null);
    const [currentIndex, setCurrentIndex] = useState(1);

    {/* tính sao     */ }
    const [rates, setRates] = useState<Rate[]>([]);
    const [averageRate, setAverageRate] = useState<number>(0);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await getRatesByHotel(hotel.id);
                setRates(res);

                // ✅ Tính trung bình sao
                if (res.length > 0) {
                    const avg =
                        res.reduce((sum: number, r: Rate) => sum + r.rateNumber, 0) / res.length;
                    setAverageRate(parseFloat(avg.toFixed(1))); // ví dụ: 4.3
                } else {
                    setAverageRate(0);
                }
            } catch (error) {
                console.error("Lỗi khi lấy đánh giá:", error);
            }
        };

        if (hotel?.id) {
            fetchRates();
        }
    }, [hotel]);

    const navigation = useNavigation();
    if (!hotel) {
        return <Text>Loading...</Text>;
    }

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width) + 1;
        if (index !== currentIndex) setCurrentIndex(index);
    };

    return (
        <>
            <View style={styles.container}>
                {/* Nút back */}
                <Pressable
                    onPress={() => navigation.goBack()}     // ⬅️ quay lại màn trước (HomeScreen)
                    style={styles.backIcon}
                    hitSlop={10}                            // vùng bấm rộng hơn
                >
                    <Ionicons name="arrow-back" size={20} color="white" />
                </Pressable>


                <Image source={{ uri: hotel.image }} style={styles.image} resizeMode="cover" />

                {/* Tiêu đề đè trên ảnh */}
                <Text style={styles.title}>
                    {/* {hotel.name} */}
                    {hotel && hotel.name}
                </Text>
                <View style={{
                    flexDirection: 'row', marginLeft: 5, position: "absolute",
                    bottom: 20,                // đặt cao hơn counter một chút
                    left: 10,
                    right: 15,
                }}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            position: "absolute",
                            bottom: 0,
                            left: 10,
                        }}
                    >
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
                        <Text style={{ color: "white", marginLeft: 6, fontWeight: "bold" }}>
                            {averageRate > 0 ? averageRate.toFixed(1) : "Chưa có đánh giá"}
                        </Text>
                    </View>

                </View>
            </View>
            {/* Thông tin khách sạn */}
            <View style={styles.section}>
                <Text style={styles.titlesub}>{hotel.name}</Text>
                <Text style={styles.subTitle}> {hotel.locationName}</Text>
                <Text style={styles.hotelTag}>Khách Sạn</Text>

                <View style={styles.row}>
                    <Ionicons name="location" size={20} color="#999494" style={styles.iconTop} />
                    <Text style={[styles.grayText, { flex: 1 }]}>
                        {hotel.address}
                    </Text>
                </View>
            </View>
        </>

    );
}

const styles = StyleSheet.create({
    container: {
        height: 250,
        position: "relative",
    },
    backIcon: {
        position: "absolute",
        top: 40,
        left: 15,
        zIndex: 2,
    },
    image: {
        width: width,
        height: 250,
    },
    counter: {
        position: "absolute",
        bottom: 10,
        right: 15,
        backgroundColor: "rgba(0,0,0,0.4)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    counterText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    title: {
        position: "absolute",
        bottom: 40,                // đặt cao hơn counter một chút
        left: 15,
        right: 15,
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        textShadowColor: "rgba(0,0,0,0.6)", // giúp nổi bật trên nền ảnh
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    section: { margin: 15 },
    row: { flexDirection: 'row', alignItems: 'center' },
    titlesub: { color: 'black', fontWeight: 'bold', fontSize: 15 },
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
});
