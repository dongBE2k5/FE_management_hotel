import { Hotel } from '@/models/Hotel';
import LocationModel from '@/models/Location';
import { getBestChoiceHotels } from '@/service/BookingAPI';
import { getAllHotel, getHotelByLocation, getRecentlyViewedHotels, getRecentlyViewedHotelsByLocation } from '@/service/HotelAPI';
import { getAllLocation } from '@/service/LocationAPI';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from '../../types/navigation';
import Slide from "../userHotelDetail/slideImage";
import HotelCard from "./hotelCard";
import LocationSelector from "./location";

type ZoneHotelNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function ZoneHotel() {

    const navigation = useNavigation<ZoneHotelNavigationProp>();

    const handleNavigation = (hotelId: number) => {
        navigation.navigate('HotelDetail', { hotelId })
    }

    //
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [locations, setLocations] = useState<LocationModel[]>([]);
    const [recentHotels, setRecentHotels] = useState<Hotel[]>([]);
    // Loại bỏ các khách sạn trùng id trong danh sách
    const uniqueRecentHotels = recentHotels.filter(
        (hotel, index, self) =>
            index === self.findIndex(h => h.id === hotel.id)
    );
    console.log("uniqueRecentHotels", uniqueRecentHotels);
    //bestchoice 
    const [bestChoiceHotels, setBestChoiceHotels] = useState<Hotel[]>([]);
    useEffect(() => {
        const fetchBestChoiceHotels = async () => {
            try {
                const data = await getBestChoiceHotels();
                setBestChoiceHotels(data);
            } catch (err) {
                console.error("Lỗi khi lấy Best Choice Hotels:", err);
            }
        };
        fetchBestChoiceHotels();
    }, []);
    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const data = await getAllHotel();
                setHotels(data);
            } catch (err) {
                console.error(err);
            }
        };
        const fetchLocation = async () => {
            try {
                const data = await getAllLocation();
                setLocations(data)
            } catch (error) {
                console.error(error);
            }
        }

        fetchLocation()
        // fetchHotels();
    }, []);

    useFocusEffect(
        useCallback(() => {
            const fetchViewedHotels = async () => {
                try {
                    const userId = await AsyncStorage.getItem('userId');
                    if (!userId) return;
                    const data = await getRecentlyViewedHotels(Number(userId));
                    setRecentHotels(data);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchViewedHotels();
        }, [])
    );
    const fetchViewedHotelsByLocation = async (locationId?: number) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;
            const data = await getRecentlyViewedHotelsByLocation(Number(userId), locationId);
            setRecentHotels(data);
        } catch (err) {
            console.error(err);
        }
    };

    // Dùng useFocusEffect để load lại khi quay về
    useFocusEffect(
        useCallback(() => {
            fetchViewedHotelsByLocation();
        }, [])
    );

    const changeLocation = async (id: Number) => {
        try {
            if (id === 0) {
                // 0 = “Tất cả”
                const [allHotels, allBestChoices] = await Promise.all([
                    getAllHotel(),
                    getBestChoiceHotels()
                ]);
                setHotels(allHotels);
                setBestChoiceHotels(allBestChoices);
            } else {
                const [filteredHotels, filteredBestChoices] = await Promise.all([
                    getHotelByLocation(id),
                    getBestChoiceHotels(Number(id))
                ]);
                setHotels(filteredHotels);
                setBestChoiceHotels(filteredBestChoices);
            }

            // 🔥 Cập nhật danh sách đã xem theo location
            await fetchViewedHotelsByLocation(Number(id));

        } catch (error) {
            console.error(error);
        }
    };



    return (
        <View style={styles.voucherzone}>
            <ImageBackground
                source={require("../../assets/images/bgKhachSanHome.png")}
                style={styles.background}
                resizeMode="cover"
            >

                {/* === ĐÃ XEM GẦN ĐÂY === */}
                {recentHotels.length > 0 && (
                    <View style={{ marginBottom: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 }}>
                            <Ionicons name="time-outline" size={22} color="#f39c12" />
                            <Text style={[styles.text, { marginLeft: 5 }]}>Khách sạn đã xem</Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
                            {/* lọc khách sạn trùng lặp*/}
                            {uniqueRecentHotels.map(hotel => (
                                <HotelCard key={hotel.id} handleNavigations={handleNavigation} data={hotel} onViewedUpdate={fetchViewedHotelsByLocation} />
                            ))}

                        </ScrollView>
                    </View>
                )}


                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: 10,
                }}>
                    <Text style={styles.text}>Best Choice</Text>
                    <Image source={require("../../assets/images/fire.png")} />
                </View>

                {bestChoiceHotels.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
                        {bestChoiceHotels.map(hotel => (
                            <HotelCard
                                key={hotel.id}
                                handleNavigations={handleNavigation}
                                data={hotel}
                            />
                        ))}
                    </ScrollView>
                ) : (
                    <Text style={{ marginLeft: 15, color: '#888' }}>Đang tải danh sách...</Text>
                )}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: 10,
                }}>
                    <Text style={styles.text}>Khách sạn nội địa</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <LocationSelector
                        locations={[{ id: 0, name: "Tất cả" }, ...locations]}
                        changeLocation={changeLocation}
                    />

                </ScrollView>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.cardScroll}
                >
                    <Pressable
                        // onPress={() => navigation.navigate('HotelDetail')}
                        pressRetentionOffset={{ left: 20, right: 20, top: 20, bottom: 20 }}
                    >
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, }}>
                            {/* <HotelCard />
                            <HotelCard />
                            <HotelCard />
                            <HotelCard /> */}
                            {hotels.map(hotel => (
                                <HotelCard key={hotel.id} handleNavigations={handleNavigation} data={hotel} />
                            ))}

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
                            {hotels.map(hotel => (
                                <HotelCard key={hotel.id} handleNavigations={handleNavigation} data={hotel} />
                            ))}
                        </ScrollView>
                    </View>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={styles.cardScroll}
                    >
                        {hotels.map(hotel => (
                            <HotelCard key={hotel.id} handleNavigations={handleNavigation} data={hotel} />
                        ))}
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