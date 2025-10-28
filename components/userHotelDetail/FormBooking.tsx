import RegisterResponse from '@/models/RegisterResponse';
import { getUserById } from '@/service/UserAPI';
import type { RootStackParamList } from '@/types/navigation';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, Image, Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import SpecialRequest from './SpecialRequest';
type FormBookingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FormBooking"
>;

export default function FormBooking() {
    const [checkIn, setCheckIn] = useState<Date>(new Date());      // mặc định hôm nay
    const [checkOut, setCheckOut] = useState<Date | null>(null);   // chưa chọn
    const [showIn, setShowIn] = useState(false);
    const [showOut, setShowOut] = useState(false);
    const [specialRequests, setSpecialRequests] = useState<string[]>([]);
    const route = useRoute<RouteProp<RootStackParamList, 'FormBooking'>>();
    const { room, checkInDate, checkOutDate } = route.params;
    const [user, setUser] = useState<RegisterResponse | null>(null);
    const [price, setPrice] = useState<number>(0);
    const router = useRouter();
    const navigation = useNavigation<FormBookingScreenNavigationProp>();

    useEffect(() => {
        const getUser = async () => {
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                const res = await getUserById(userId!);
                console.log(res);

                setUser(res);
            } else {
                console.log("Không tìm thấy userId");
                router.replace('/(tabs)/profile');
            }
        };

        getUser();
        setPrice(Number(room.price) * nights);

    }, []);
    // type FormBookingNavProp = NativeStackNavigationProp<RootStackParamList, 'FormBooking'>;
    // const navigation = useNavigation<FormBookingNavProp>();
    console.log(room);

    // const hotelName = 'Khách sạn Mường Thanh Grand Đà Nẵng';
    const roomName = 'Superior Twin Room - Room with Breakfast';
    const hotelImage = require('../../assets/images/ks1.jpg');

    const specialRequestPrice = 30000;
    const specialRequestTotal = specialRequestPrice * specialRequests.length;


    // Thuế & phí, bảo hiểm
    const [insuranceSelected, setInsuranceSelected] = useState(false);
    const taxFee = 124182;
    const insurancePrice = 43500;

    const nights =
        checkOutDate
            ? Math.max(
                1,
                Math.round(
                    (checkOutDate!.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
                )
            )
            : 0;
    const totalPrice =
        checkOutDate
            ? (Number(room.price) * nights) + taxFee + specialRequestTotal + (insuranceSelected ? insurancePrice : 0)
            : 0;

    const options = [
        'Phòng tầng cao',
        'Không hút thuốc',
        'Có nôi cho trẻ em',
        'Check-in sớm',
        'View biển/ thành phố',
    ];



    const formatVN = (date: Date) =>
        format(date, "EEE, d 'thg' M yyyy", { locale: vi });

    return (
        <View>

            <View style={styles.container}>
                <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{room.hotelName}</Text>
                {/* Ngày nhận phòng + số đêm */}
                <View style={styles.row}>
                    <TouchableOpacity style={styles.leftBox}>
                        <Text style={styles.label}>Ngày nhận phòng</Text>
                        <Text style={styles.value}>{formatVN(checkInDate)}</Text>
                    </TouchableOpacity>

                    <View style={styles.rightBox}>
                        <Text style={styles.label}>Số đêm nghỉ</Text>
                        <Text style={[styles.value, { fontWeight: 'bold' }]}>
                            {checkOutDate ? `${nights} đêm` : '--'}
                        </Text>
                    </View>
                </View>

                {/* Ngày trả phòng */}
                <TouchableOpacity
                    style={styles.bottomBox}
                >
                    <Text style={styles.label}>Trả phòng</Text>
                    <Text style={styles.value}>{formatVN(checkOutDate!)}</Text>

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
                            backgroundColor: '#fff',   // trắng rõ ràng
                            height: 260,
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                            justifyContent: 'center'
                        }}>
                            <DateTimePicker
                                value={checkIn || new Date()}       // 👈 luôn mặc định ngày hôm nay
                                minimumDate={new Date()}
                                mode="date"
                                display="spinner"
                                themeVariant="light" // ép sáng
                                textColor="black"    // màu chữ của spinner (iOS 14+)
                                onChange={(_, date) => date && setCheckIn(date)}
                                style={{ flex: 1 }}
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 12 }}>
                                <Button title="Chọn" onPress={() => setShowIn(false)} />

                            </View>
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
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 12 }}>
                                <Button title="Chọn" onPress={() => setShowOut(false)} />

                            </View>
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


                <Text style={{ fontWeight: 'bold', marginBottom: 5, marginTop: 10 }}>{room.description}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ color: '#999494', fontSize: 11 }}>Khách</Text>
                    <Text style={{ color: '#999494', fontSize: 11, left: 68 }}>{room.typeRoom == "DON" ? "1 người" : room.typeRoom == "DOI" ? "2 người" : "4 trở lên"} /Phòng</Text>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Text style={{ color: '#999494', fontSize: 11 }}>Loại giường</Text>
                    <Text style={{ color: '#999494', fontSize: 11, left: 40 }}>2 giường đơn</Text>

                </View>

                <View style={{ flexDirection: 'row' }}>
                    <Image style={{ width: 70, height: 50, borderRadius: 5, marginTop: 5 }} source={require("../../assets/images/room1.jpg")} />
                    <View>
                        <Text style={{ color: '#999494', fontSize: 11, left: 28, marginTop: 5 }}>Gồm bữa sáng</Text>
                        <Text style={{ color: '#999494', fontSize: 11, left: 28, marginTop: 5 }}>Wifi miễn phí</Text>
                    </View>
                </View>
            </View>

            <View style={styles.container}>
                <Text style={{ fontWeight: 'bold', }}>Chính Sách lưu trú</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 11, marginLeft: 15, marginTop: 10, color: '' }}>Giấy tờ bắt buộc</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 11, marginLeft: 15, marginTop: 10, color: '#999494' }}>Khi nhận phòng, bạn cần cung cấp CMND/CCCD, other. Các giấy tờ cần thiết có thể ở dạng bản mềm</Text>
            </View>
            <View style={styles.container}>
                <Text style={{ fontWeight: 'bold', }}>Thông tin liên hệ (nhận vé/ phiếu thanh toán)</Text>
                <View style={{
        
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: '#ccc',
                    paddingBottom: 4,
                    marginHorizontal: 15,
                    marginTop: 10
                }}>
                    <View style={{
                        flexDirection: 'row',
                    }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 10, marginRight: 10 }}>
                            {user?.data?.fullName}
                        </Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 10, marginRight: 10 }}>
                            {user?.data?.email}
                        </Text>

                    </View >
                    <View style={{
                        flexDirection: 'row',     marginTop: 10
                    }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 10, marginRight: 10 }}>
                            {user?.data?.phone}
                        </Text>
                        <Ionicons name="checkmark" size={15} color="green" />
                    </View>
                </View>
                <View>
                    <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Yêu cầu đặc biệt</Text>
                    <SpecialRequest onChange={setSpecialRequests} />
                </View>


                {/* Tiện ích cho chuyến đi */}
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
                    Tiện ích cho chuyến đi
                </Text>
                <TouchableOpacity
                    style={styles.insuranceBox}
                    activeOpacity={0.8}
                    onPress={() => setInsuranceSelected(!insuranceSelected)}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons
                            name="shield-checkmark"
                            size={20}
                            color="#007AFF"
                            style={{ marginRight: 6 }}
                        />
                        <Text style={{ fontWeight: 'bold', fontSize: 13, flexShrink: 1 }}>
                            Bảo hiểm Du lịch Chubb – Hotel Protect
                        </Text>
                    </View>

                    <Text style={styles.insuranceText}>
                        Bảo vệ kỳ nghỉ của Quý khách khỏi rủi ro bị hủy, mất đặt phòng khách sạn,
                        và hơn thế nữa.
                    </Text>

                    <View style={{ marginTop: 6 }}>
                        <Text style={styles.insuranceItem}>• Mất hoặc hư hại đồ với hành lý, quần áo và vật dụng cá nhân: Chi trả lên đến VND 20,000,000 (giới hạn VND 3,000,000 cho mỗi món đồ).</Text>
                        <Text style={styles.insuranceItem}>• Mất đặt phòng khách sạn: Chi trả lên đến VND 850,000/ phòng/ đêm.</Text>
                        <Text style={styles.insuranceItem}>• Hủy hay Gián đoạn đặt phòng: Chi trả lên đến VND 850,000/ phòng/ đêm.</Text>
                        <Text style={styles.insuranceItem}>• Tài sản cá nhân: Chi trả lên đến VND 210,000,000.</Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={{ color: '#e53935', fontWeight: 'bold' }}>VND 43.500</Text>
                        <Ionicons
                            name={insuranceSelected ? 'checkbox' : 'square-outline'}
                            size={22}
                            color={insuranceSelected ? '#007AFF' : '#aaa'}
                        />
                    </View>
                </TouchableOpacity>
                {/* Chi tiết phí thanh toán */}
                <View style={styles.insuranceBox}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>
                        Chi tiết phí thanh toán
                    </Text>

                    <Text style={styles.note}>
                        Thuế và phí là các khoản được Traveloka chuyển trả cho khách sạn. Mọi thắc mắc về thuế và hóa đơn vui lòng tham khảo
                        Điều Khoản và Điều Kiện của TravelokaTDC để được giải đáp
                    </Text>

                    {checkOut && nights > 0 && (
                        <>
                            <View style={styles.itemRow}>
                                <Text style={styles.itemName}>
                                    (1×) Deluxe Single Beds x {nights} đêm
                                </Text>
                                <Text style={styles.itemValue}>
                                    {(Number(room.price) * nights).toLocaleString('vi-VN')} VND
                                </Text>
                            </View>

                            <View style={styles.itemRow}>
                                <Text style={styles.itemName}>Thuế và phí</Text>
                                <Text style={styles.itemValue}>
                                    {taxFee.toLocaleString('vi-VN')} VND
                                </Text>
                            </View>
                        </>
                    )}

                    {specialRequests.length > 0 && (

                        <View style={styles.itemRow}>
                            <Text style={styles.itemName}>Phí yêu cầu </Text>
                            <Text style={styles.itemValue}>{specialRequestTotal.toLocaleString('vi-VN')} VND</Text>
                        </View>
                    )}
                    {insuranceSelected && (
                        <View style={styles.itemRow}>
                            <Text style={styles.itemName}>Bảo hiểm Du lịch</Text>
                            <Text style={styles.itemValue}>
                                {insurancePrice.toLocaleString('vi-VN')} VND
                            </Text>
                        </View>
                    )}
                    <Text style={styles.totalPrice}>
                        Tổng: {price.toLocaleString('vi-VN')} VND
                    </Text>
                    <TouchableOpacity
                        style={[
                            {
                                backgroundColor: '#1E90FF', // xám nếu chưa chọn
                                paddingVertical: 12,
                                borderRadius: 8,
                                alignItems: 'center',
                                marginTop: 10,
                            },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                            navigation.navigate('ReviewBooking', {
                                room,
                                checkInDate,
                                checkOutDate,
                                nights,
                            });
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                            Tiếp tục
                        </Text>
                    </TouchableOpacity>

                </View>


            </View>
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#ddd',
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
        borderBottomWidth: StyleSheet.hairlineWidth,
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
    insuranceBox: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        backgroundColor: '#fff',
        marginTop: 10
    },
    insuranceText: {
        marginTop: 6,
        fontSize: 12,
        color: '#555',
    },
    insuranceItem: {
        fontSize: 12,
        color: '#555',
        marginTop: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#ddd',
        paddingVertical: 8,
        marginBottom: 6,
    },
    note: {
        fontSize: 11,
        color: '#555',
        marginBottom: 8,
    },
    totalLabel: { fontWeight: 'bold' },
    totalPrice: { fontWeight: 'bold', color: '#000' },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    itemName: { fontSize: 12, color: '#444' },
    itemValue: { fontSize: 12, color: '#444' },
    btnContinue: {

        borderRadius: 6,
        alignItems: 'center',
        paddingVertical: 10,
        marginTop: 10,
    },

});


