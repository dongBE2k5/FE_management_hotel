import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, ScrollView, TouchableOpacity, StyleSheet, Text, View, TextInput } from "react-native";
import HotelCard from "./hotelCard";
import LocationSelector from "./location";
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../types/navigation'; 
import Slide from "../userHotelDetail/slideImage";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';
import { Hotel } from '@/models/Hotel';
import LocationModel from '@/models/Location';
import { getAllHotel, getHotelByLocation } from '@/service/HotelAPI';
import { getAllLocation } from '@/service/LocationAPI';
type ZoneHotelNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export default function ZoneHotel() {
    const navigation = useNavigation<ZoneHotelNavigationProp>();

    const handleNavigation = (hotelId: number) => {
        navigation.navigate('HotelDetail', { hotelId })
    }

    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [locations, setLocations] = useState<LocationModel[]>([]);

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
        fetchHotels();
    }, []);

     const changeLocation = async (id: Number) => {
        try {
            const data = await getHotelByLocation(id)
            setHotels(data)
        } catch (error) {
            console.error(error);
        }
    }
  

      return (
        <View style={styles.voucherzone}>
            <ImageBackground
                source={require("../../assets/images/bgKhachSanHome.png")}
                style={styles.background}
                resizeMode="cover"
            >
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: 10,
                }}>
                    <Text style={styles.text}>Best Choice</Text>
                    <Image source={require("../../assets/images/fire.png")} />
                </View>


                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.cardScroll}
                >
                    <Pressable
                        // onPress={() => navigation.navigate('HotelDetail', {hotelId: 1})}
                        pressRetentionOffset={{ left: 20, right: 20, top: 20, bottom: 20 }}
                    >
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, }}>
                            {hotels.map(hotel => (
                                <HotelCard key={hotel.id} handleNavigations={handleNavigation} data={hotel} />
                            ))}
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
                  <LocationSelector locations={locations} changeLocation={changeLocation} />
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
                            {/* <HotelCard />
                            <HotelCard />
                            <HotelCard />
                            <HotelCard /> */}
                        </ScrollView>
                    </View>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={styles.cardScroll}
                    >
                        {/* <HotelCard />
                        <HotelCard />
                        <HotelCard />
                        <HotelCard /> */}
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
