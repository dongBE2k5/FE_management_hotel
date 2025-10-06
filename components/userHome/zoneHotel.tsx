import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, ScrollView, TouchableOpacity, StyleSheet, Text, View, TextInput } from "react-native";
import HotelCard from "./hotelCard";
import Location from "./location";
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../types/navigation'; // đường dẫn tuỳ dự án
import Slide from "../userHotelDetail/slideImage";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';
import bgKhachSanHome from "../../assets/images/bgKhachSanHome.png";
import bgBestChoice from "../../assets/images/fire.png";
import { saveViewedHotel, getViewedHotels } from '../../untils/hotelViewStorage';


type ZoneHotelNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function ZoneHotel() {
    const navigation = useNavigation<ZoneHotelNavigationProp>();

    const [viewedHotels, setViewedHotels] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await getViewedHotels();
            setViewedHotels(data);
        };
        const unsubscribe = navigation.addListener('focus', load);
        return unsubscribe;
    }, [navigation]);
    return (
        <View style={styles.voucherzone}>

            {viewedHotels.length > 0 && (
                <View>
                    <Text style={styles.text}>Đã xem gần đây</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {viewedHotels.map((hotel, index) => (
                            <Pressable
                                key={index}
                                onPress={() => navigation.navigate('HotelDetail', { hotelId: hotel.id })}
                            >
                                <HotelCard hotel={hotel} />
                                
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}

            <ImageBackground
                source={bgKhachSanHome}
                style={styles.background}
                resizeMode="cover"

            >
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: 10,
                }}>
                    <Text style={styles.text}>Best Choice</Text>
                    <Image source={bgBestChoice} />
                </View>


                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.cardScroll}
                >
                    <Pressable
                        onPress={() => {
                            const hotel = {
                                id: 1,
                                name: 'Khách sạn Mường Thanh',
                                location: 'Đà Nẵng',
                                image: 'https://example.com/muongthanh.jpg'
                            };
                            saveViewedHotel(hotel);
                            navigation.navigate('HotelDetail', { hotelId: hotel.id });
                        }}
                    >
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, }}>
                            <HotelCard />
                            <HotelCard />
                            <HotelCard />
                            <HotelCard />

                        </ScrollView>
                    </Pressable>
                </ScrollView>


                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: 10,
                }}>
                    <Text style={styles.text}>Khách sạn nội địa</Text>
                    <View style={styles.searchInputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Tìm kiếm khách sạn phù hợp?"
                            placeholderTextColor="#000000"
                        />
                        <Ionicons name="search" size={15} color="#73c5fcff" />

                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Location />
                </ScrollView>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.cardScroll}
                >
                    <Pressable
                        onPress={() => navigation.navigate('HotelDetail')}
                        pressRetentionOffset={{ left: 20, right: 20, top: 20, bottom: 20 }}
                    >
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, }}>
                            <HotelCard />
                            <HotelCard />
                            <HotelCard />
                            <HotelCard />

                        </ScrollView>
                    </Pressable>
                </ScrollView>



            </ImageBackground>
            <View>
                <Text style={styles.text}>Thêm nguồn cảm hứng du lịch</Text>
                <Text style={{ fontSize: 12, marginLeft: 15, color: '#888383ff' }}>Những điểm nổi bật đặc biệt dành cho bạn</Text>
                <View style={{ flexDirection: 'row', }}>
                    <View>
                        <Slide />
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={styles.cardScroll}
                        >
                            <HotelCard />
                            <HotelCard />
                            <HotelCard />
                            <HotelCard />
                        </ScrollView>
                    </View>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={styles.cardScroll}
                    >
                        <HotelCard />
                        <HotelCard />
                        <HotelCard />
                        <HotelCard />
                    </ScrollView>
                </View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    voucherzone: {

    },
    background: {
        width: '100%',
        height: undefined, // để auto theo tỉ lệ

    },

    text: {
        margin: 10,
        color: '#534F4F',
        fontWeight: '700',
        fontSize: 23,
    },
    cardScroll: {
        marginLeft: 5,
        marginTop: 10,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 3
    },
    input: {
        fontSize: 10,
        color: '#000',
        marginRight: 5,
        paddingVertical: 0,
    },
});
