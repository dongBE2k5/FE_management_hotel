import Room from '@/models/Room';
import RoomTypeImage from '@/models/RoomTypeImage';
import { getRoomAvailableByHotel } from '@/service/RoomAPI';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { Button, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RoomCard from "./roomCard";
import RoomZone from './roomZone';

type RoomProps = {
    roomTypeImage: RoomTypeImage[],
    hotelId: number
}
    const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
export default function MidHotelDetail({ roomTypeImage, hotelId }: RoomProps) {

    const [checkIn, setCheckIn] = useState<Date>(today);      // mặc định hôm nay
    const [checkOut, setCheckOut] = useState<Date | null>(tomorrow);
    const [showIn, setShowIn] = useState(false);
    const [showOut, setShowOut] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [insuranceSelected, setInsuranceSelected] = useState(false);
    const [isSearch, setIsSearch] = useState(false);
    const phongDon = rooms.filter(room => room.typeRoom == "DON");
    const phongDoi = rooms.filter(room => room.typeRoom == "DOI");
    const phongGiaDinh = rooms.filter(room => room.typeRoom == "GIA_DINH");


    
    // useEffect(() => {
    //     if (checkIn) {
    //       const nextDay = new Date(checkIn);
    //       nextDay.setDate(nextDay.getDate() + 1); // +1 ngày
    //       setCheckOut(nextDay);
    //     }
    //   }, [checkIn]);
    useEffect(() => {
        const fetchRoomAvailableByHotel = async (id: number, checkIn: Date, checkOut: Date) => {
            console.log("fetchRoomAvailableByHotel");
            console.log(checkIn, checkOut);
            
            try {
                const data = await getRoomAvailableByHotel(id, checkIn, checkOut);
                setRooms(data); 
                setIsSearch(false);
            } catch (err) {
                console.error(err);
            }
        };
        fetchRoomAvailableByHotel(hotelId, checkIn, checkOut!);
    }, [isSearch]);
    // console.log(rooms);
    // console.log(roomTypeImage);
    const taxFee = 124182;
    const insurancePrice = 43500;
    const roomPrice = 43500;
    const specialRequestTotal = 12344;

    const formatVN = (date: Date) =>
        format(date, "EEE, d 'thg' M yyyy", { locale: vi });
    const nights =
        checkOut
            ? Math.max(
                1,
                Math.round(
                    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
                )
            )
            : 0;
    const totalPrice =
        checkOut
            ? (roomPrice * nights) + taxFee + specialRequestTotal + (insuranceSelected ? insurancePrice : 0)
            : 0;
    const insets = useSafeAreaInsets();

    return (
        <View
        >
            <View style={styles.container}>
                <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Khách sạn Mường Thanh Grand Đà Nẵng</Text>
                {/* Ngày nhận phòng + số đêm */}
                <View style={styles.row}>
                    <TouchableOpacity style={styles.leftBox} onPress={() => setShowIn(true)}>
                        <Text style={styles.label}>Ngày nhận phòng</Text>
                        <Text style={styles.value}>{formatVN(checkIn)}</Text>
                    </TouchableOpacity>

                    <View style={styles.rightBox}>
                        <Text style={styles.label}>Số đêm nghỉ</Text>
                        <Text style={[styles.value, { fontWeight: 'bold' }]}>
                            {checkOut ? `${nights} đêm` : '--'}
                        </Text>
                    </View>
                </View>

                {/* Ngày trả phòng */}
                <TouchableOpacity
                    style={styles.bottomBox}
                    onPress={() => setShowOut(true)}
                >
                    <Text style={styles.label}>Trả phòng</Text>
                    <Text style={styles.value}>
                        {checkOut ? formatVN(checkOut) : 'Chưa chọn'}
                    </Text>
                </TouchableOpacity>

                {/* Date Pickers */}
                {/* ----- Date Pickers ----- */}
                {/* Nhận phòng */}

                <Modal
                    transparent
                    animationType="slide"
                    visible={showIn && Platform.OS === 'ios'}
                    onRequestClose={() => setShowIn(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066' }}>
                        <View style={{
                            backgroundColor: '#fff',
                            height: 260,
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                            justifyContent: 'center'
                        }}>
                            <DateTimePicker
                                value={checkIn}
                                minimumDate={checkIn}
                                mode="date"
                                display="spinner"
                                onChange={(_, date) => date && setCheckIn(date)}
                                style={{ height: 200 }}
                            />
                            {/* <input
                                type="date"
                                value={checkIn?.toISOString().split('T')[0]}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setCheckIn(new Date(e.target.value))}
                                style={{ fontSize: 18, padding: 8 }}
                            /> */}
                            {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 12 }}>
                                <Button title="Chọn" onPress={() => {
                                    setShowIn(false);
                                    if (checkOut && checkIn >= checkOut) setCheckOut(null);
                                }} />
                            </View> */}
                        </View>
                    </View>
                </Modal>

                {/* Android giữ nguyên */}
                {Platform.OS === 'android' && showIn && (
                    <DateTimePicker
                        value={checkIn}
                        mode="date"
                        display="default"
                        minimumDate={new Date()} // 👈 Chặn ngày quá khứ
                        onChange={(_, date) => {
                            setShowIn(false);
                            if (date) {
                                setCheckIn(date);
                                if (checkOut && date >= checkOut) setCheckOut(null);
                            }
                        }}
                    />
                )}


                {/* ----- Trả phòng ----- */}
                <Modal
                    transparent
                    animationType="slide"
                    visible={showOut && Platform.OS === 'ios'}
                    onRequestClose={() => setShowOut(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066' }}>
                        <View style={{
                            backgroundColor: '#fff',   // trắng rõ ràng
                            height: 260,
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                            justifyContent: 'center'
                        }}>
                            <DateTimePicker
                                value={checkOut || new Date()}       // 👈 luôn mặc định ngày hôm nay
                                minimumDate={new Date()}
                                mode="date"
                                display="spinner"
                                themeVariant="light" // ép sáng
                                textColor="black"    // màu chữ của spinner (iOS 14+)
                                style={{ flex: 1 }}
                                onChange={(_, date) => date && setCheckOut(date)}
                            />
                            {/* <input
                                type="date"
                                value={checkOut?.toISOString().split('T')[0]}
                                min={(() => {
                                    const tomorrow = new Date(checkIn);
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    return tomorrow.toISOString().split('T')[0];
                                })()}
                                onChange={(e) => setCheckOut(new Date(e.target.value))}
                                style={{ fontSize: 18, padding: 8 }}
                            /> */}
                            {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 12 }}>
                                <Button title="Chọn" onPress={() => setShowOut(false)} />

                            </View> */}
                        </View>
                    </View>
                </Modal>

                {Platform.OS === 'android' && showOut && (
                    <DateTimePicker
                        value={checkOut || new Date(checkIn.getTime() + 86400000)}
                        minimumDate={new Date(checkIn.getTime() + 86400000)}
                        mode="date"
                        display="default"
                        onChange={(_, date) => {
                            setShowOut(false);
                            if (date) setCheckOut(date);
                        }}
                    />
                )}
                <View style={{ marginTop: 10 }}>
                <Button title='Tìm kiếm' onPress={() => {
                    // fetchRoomAvailableByHotel(hotelId, checkIn, checkOut);
                    setIsSearch(true);
                   }} />
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
                        source={require('../../assets/images/logo.png')}
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
            {phongDon.length > 0 && (
                <>
                    <RoomZone roomTypeImage={roomTypeImage.filter(image => image.roomTypeId == 1)} />

                    <RoomCard checkInDate={checkIn} checkOutDate={checkOut} rooms={rooms.filter(room => room.typeRoom == "DON")} />
                </>
            )}

            {phongDoi.length > 0 && (
                <>
                    <RoomZone roomTypeImage={roomTypeImage.filter(image => image.roomTypeId == 2)} />

                    <RoomCard checkInDate={checkIn} checkOutDate={checkOut} rooms={rooms.filter(room => room.typeRoom == "DOI")} />
                </>
            )}

            {phongGiaDinh.length > 0 && (
                <>
                    <RoomZone roomTypeImage={roomTypeImage.filter(image => image.roomTypeId == 3)} />

                    <RoomCard checkInDate={checkIn} checkOutDate={checkOut} rooms={rooms.filter(room => room.typeRoom == "GIA_DINH")} />
                </>
                )}

            {/* Zone phòng
            <RoomZone />
            <RoomCard />
            <RoomCard />
            <RoomCard />
            <RoomCard /> */}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 10,
        margin: 10,
        marginTop: 0,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        // iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        // Android
        elevation: 4,
    },
    leftBox: {
        flex: 1,
        marginRight: 10,
    },
    rightBox: {
        width: 100,
        alignItems: 'flex-end',
    },
    bottomBox: {
        // borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#ddd',
        marginTop: 12,
    },
    label: {
        fontSize: 11,
        color: '#666',
        marginBottom: 4,
    },
    value: {
        fontSize: 12,
        color: '#000',
    },
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
