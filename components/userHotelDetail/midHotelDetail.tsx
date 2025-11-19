import VoucherCard from "@/components/userHome/voucherCard";
import Rate from '@/models/Rate';
import Room from '@/models/Room';
import RoomTypeImage from '@/models/RoomTypeImage';
import { TypeOfRoomUtility } from '@/models/TypeOfRoomUtility/TypeOfRoomUtilityResponse';
import Voucher from "@/models/Voucher";
import { getTypeOfRoomUtilityOfHotelByHotelIdAndType } from '@/service/HotelUtilityAPI';
import { getAverageRate, getRatesByHotel } from '@/service/RateAPI';
import { getRoomAvailableByHotel } from '@/service/RoomAPI';
import { getUserVouchers, saveUserVoucher } from '@/service/UserVoucherAPI';
import { getAllVouchers } from '@/service/VoucherAPI';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RoomCard from "./roomCard";
import RoomZone from './roomZone';

type RoomProps = {
    roomTypeImage: RoomTypeImage[],
    hotelId: number
}

interface Props {
    hotelId: number;
}
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
export default function MidHotelDetail({ roomTypeImage, hotelId }: RoomProps) {
    console.log("roomTypeImage MidHotelDetail", roomTypeImage);
    const [rates, setRates] = useState<Rate[]>([]);
    const [averageRate, setAverageRate] = useState<number>(0);
    // Những điều khách thích nhất
    const defaultTags = ['Phòng sạch', 'Nội thất đẹp', 'Nhân viên thân thiện', 'Dịch vụ tốt'];
    const tagCounts: Record<string, number> = {};
    defaultTags.forEach(tag => (tagCounts[tag] = 0));

    rates.forEach(rate => {
        rate.likedPoints?.forEach(point => {
            if (tagCounts[point] !== undefined) tagCounts[point]++;
        });
    });

    const tagDisplayList = Object.entries(tagCounts);


    const [checkIn, setCheckIn] = useState<Date>(today);      // mặc định hôm nay
    const [tempCheckIn, setTempCheckIn] = useState<Date>(checkIn);

    const [checkOut, setCheckOut] = useState<Date | null>(tomorrow);
    const [tempCheckOut, setTempCheckOut] = useState<Date | null>(checkOut);
    const [showModalChooseDate, setShowModalChooseDate] = useState(false);
    const [showIn, setShowIn] = useState(false);
    const [showOut, setShowOut] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [insuranceSelected, setInsuranceSelected] = useState(false);
    const [isSearch, setIsSearch] = useState(false);
    const [utility, setUtility] = useState<TypeOfRoomUtility[]>([]);
    const phongDon = rooms.filter(room => room.typeRoom == "DON");
    const phongDoi = rooms.filter(room => room.typeRoom == "DOI");
    const phongGiaDinh = rooms.filter(room => room.typeRoom == "GIA_DINH");

    const utilityOfTypeRoom1 = utility!.filter((utility: TypeOfRoomUtility) => utility.typeOfRoomId
        == 1);
    const utilityOfTypeRoom2 = utility!.filter((utility: TypeOfRoomUtility) => utility.typeOfRoomId
        == 2);
    const utilityOfTypeRoom3 = utility!.filter((utility: TypeOfRoomUtility) => utility.typeOfRoomId
        == 3);

    console.log("utilityOfTypeRoom1", utilityOfTypeRoom1);


    useEffect(() => {
        const fetchRoomAvailableByHotel = async (id: number, checkIn: Date, checkOut: Date) => {
            console.log("fetchRoomAvailableByHotel");
            console.log(checkIn, checkOut);

            try {
                const data = await getRoomAvailableByHotel(id, checkIn, checkOut);
                console.log("data", data);
                setRooms(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchRoomAvailableByHotel(hotelId, checkIn, checkOut!);
    }, [showModalChooseDate]);
    useEffect(() => {


        const fetchUtilityOfHotel = async (id: number) => {
            console.log("fetchUtilityOfHotel");

            try {
                const data = await getTypeOfRoomUtilityOfHotelByHotelIdAndType(id, "INROOM");
                console.log("data", data.data.utilities);
                setUtility(data.data.utilities as TypeOfRoomUtility[]);
                console.log("utility 1: ", utility!.filter((utility: TypeOfRoomUtility) => utility.typeOfRoomId
                    == 1));


            } catch (err) {
                console.error(err);
            }
        };
        fetchUtilityOfHotel(hotelId);
    }, [isSearch]);
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const rateData = await getRatesByHotel(hotelId);
                const avg = await getAverageRate(hotelId);
                setRates(rateData);
                setAverageRate(avg);
            } catch (error) {
                console.error("❌ Lỗi khi tải đánh giá:", error);
            }
        };
        fetchRates();
        setShowModalChooseDate(true);
    }, [hotelId]);

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
        <View>
            <View style={styles.container}>
                {/* Hàng trên: Nhận phòng + Trả phòng */}
                <TouchableOpacity onPress={() => setShowModalChooseDate(true)}>
                    <View style={[styles.row, { marginBottom: 0 }]}>
                        {/* Nhận phòng */}
                        <View style={styles.box}>
                            <Text style={styles.label}>Nhận phòng</Text>
                            <Text style={styles.date}>{formatVN(checkIn)}</Text>
                        </View>

                        {/* Trả phòng */}
                        <View style={styles.box}>
                            <Text style={styles.label}>Trả phòng</Text>
                            <Text style={styles.date}>
                                {checkOut ? formatVN(checkOut) : "Chưa chọn"}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Số đêm */}
                <View style={styles.nightBox}>
                    <Text style={styles.nightText}>Số đêm: </Text>
                    <Text style={styles.nightValue}>{nights} đêm</Text>
                </View>
            </View>
            <HotelVoucherSection hotelId={hotelId} />
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
                    <Text style={{ marginLeft: 5, marginTop: 12, color: '#0046de', fontWeight: 'bold' }}>
                        {averageRate.toFixed(1)}
                    </Text>
                    <Text style={{ marginLeft: 5, marginTop: 12, color: '#009EDE', fontWeight: 'bold' }}>
                        {averageRate >= 5 ? 'Tuyệt vời' : averageRate >= 4 ? 'Ấn tượng' : 'Tốt'}
                    </Text>

                </View>
            </View>

            {/* Những điều khách thích */}
            <View style={styles.section}>
                <Text style={styles.title}>Những điều khách thích nhất</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                    <View style={styles.row}>
                        {tagDisplayList.map(([tag, count], idx) => (
                            <View key={idx} style={styles.chip}>
                                <Text style={styles.chipText}>{tag}</Text>
                                <Text style={[styles.chipText, { marginLeft: 5 }]}>({count})</Text>
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
                        {rates.slice(0, 10).map((r, idx) => (
                            <Text key={idx} style={styles.reviewText}>
                                “{r.comment}”
                            </Text>
                        ))}
                    </View>
                </ScrollView>
            </View>


            {/* Zone phòng */}
            {phongDon.length > 0 && (
                <>
                    <RoomZone
                        utilityOfTypeRoom={utilityOfTypeRoom1}
                        roomTypeImage={roomTypeImage.filter(image => image.roomTypeId == 1)} />

                    <RoomCard checkInDate={checkIn} checkOutDate={checkOut} rooms={rooms.filter(room => room.typeRoom == "DON")} />
                </>
            )}

            {phongDoi.length > 0 && (
                <>
                    <RoomZone utilityOfTypeRoom={utilityOfTypeRoom2} roomTypeImage={roomTypeImage.filter(image => image.roomTypeId == 2)} />

                    <RoomCard checkInDate={checkIn} checkOutDate={checkOut} rooms={rooms.filter(room => room.typeRoom == "DOI")} />
                </>
            )}

            {phongGiaDinh.length > 0 && (
                <>
                    <RoomZone utilityOfTypeRoom={utilityOfTypeRoom3} roomTypeImage={roomTypeImage.filter(image => image.roomTypeId == 3)} />

                    <RoomCard checkInDate={checkIn} checkOutDate={checkOut} rooms={rooms.filter(room => room.typeRoom == "GIA_DINH")} />
                </>
            )}


            {showModalChooseDate && <ModalChooseDate showModalChooseDate={showModalChooseDate} setShowModalChooseDate={setShowModalChooseDate} checkIn={checkIn} setCheckIn={setCheckIn} checkOut={checkOut} setCheckOut={setCheckOut} />}
        </View>
    );
}

//hiển thị voucher ks
function HotelVoucherSection({ hotelId }: Props) {
    const [hotelVouchers, setHotelVouchers] = useState<Voucher[]>([]);
    const [savedVouchers, setSavedVouchers] = useState<Voucher[]>([]);
    const [userId, setUserId] = useState<number | null>(null);

    // ✅ Lấy userId trước
    useEffect(() => {
        const fetchUserAndVouchers = async () => {
            try {
                const idStr = await AsyncStorage.getItem("userId");
                if (!idStr) return;

                const id = Number(idStr);
                setUserId(id);

                // 🔹 Load voucher khách sạn hiện tại
                const allVouchers = await getAllVouchers();
                const hotelVs = allVouchers.filter(v => v.hotelId === hotelId);
                setHotelVouchers(hotelVs);

                // 🔹 Load voucher đã lưu của user
                const saved = await getUserVouchers(id);
                setSavedVouchers(saved);
            } catch (error) {
                console.error("❌ Lỗi khi tải dữ liệu voucher:", error);
            }
        };

        fetchUserAndVouchers();
    }, [hotelId]); // reload khi đổi khách sạn

    const handleSaveVoucher = async (voucher: Voucher) => {
        if (!userId) return;

        const res = await saveUserVoucher(userId, voucher.id!);
        if (res) {
            Alert.alert("✅ Thành công", "Voucher đã được lưu!");
            setSavedVouchers((prev) => [...prev, voucher]);
        } else {
            Alert.alert("❌ Lỗi", "Voucher này đã được lưu trước đó!");
        }
    };

    const isVoucherSaved = (voucherId: number) =>
        savedVouchers.some((v) => v.id === voucherId);

    if (hotelVouchers.length === 0) return null;

    return (
        <View style={styles.section}>
            <Text style={styles.title}>🎟 Ưu đãi của khách sạn</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
            >
                {hotelVouchers.map((v) => (
                    <View key={v.id} style={{ marginRight: 10, marginBottom: 5 }}>
                        <VoucherCard
                            voucher={v}
                            onSave={() => handleSaveVoucher(v)}
                            isSaved={isVoucherSaved(v.id!)} // ✅ Giờ sẽ nhận đúng trạng thái
                        />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

type ModalChooseDateProps = {
    showModalChooseDate: boolean;
    setShowModalChooseDate: (show: boolean) => void;
    type: "checkIn" | "checkOut";
    checkIn: Date;
    setCheckIn: (date: Date) => void;
    checkOut: Date | null;
    setCheckOut: (date: Date | null) => void;
};

const ModalChooseDate = ({
    showModalChooseDate,
    setShowModalChooseDate,
    type,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
}: ModalChooseDateProps) => {
    const [modalChooseDateType, setModalChooseDateType] = useState<"checkIn" | "checkOut" | undefined>(undefined);
    console.log("modalChooseDateType", modalChooseDateType);

    console.log("checkIn", checkIn);
    console.log("checkOut", checkOut);


    const formatVN = (date: Date) =>
        format(date, "EEE, d 'thg' M yyyy", { locale: vi });

    return (
        <Modal
            transparent
            animationType="slide"
            visible={showModalChooseDate}
            onRequestClose={() => setShowModalChooseDate(false)}
        >
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    {/* Drag handle */}
                    <View style={styles.handle} />

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setShowModalChooseDate(false)}>
                            <Text style={styles.cancel}>Hủy</Text>
                        </TouchableOpacity>

                        <Text style={styles.title}>
                            {type === "checkIn" ? "Chọn ngày nhận phòng" : "Chọn ngày trả phòng"}
                        </Text>

                        <TouchableOpacity
                            onPress={() => {
                                setShowModalChooseDate(false);
                            }}
                        >
                            <Text style={[styles.actionText, { color: '#007AFF' }]}>OK</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Picker */}
                    <View style={[styles.content, { padding: 10 }]}>
                        <TouchableOpacity
                            style={styles.dateBox}
                            onPress={() => {
                                setModalChooseDateType("checkIn");
                                setShowModalChooseDate(true);
                            }}
                        >
                            <Text style={styles.label}>Ngày nhận phòng</Text>
                            <Text style={styles.value}>{formatVN(checkIn)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dateBox}
                            onPress={() => {
                                setModalChooseDateType("checkOut");
                                setShowModalChooseDate(true);
                            }}
                        >
                            <Text style={styles.label}>Ngày trả phòng</Text>
                            <Text style={styles.value}>{checkOut ? formatVN(checkOut) : "Chưa chọn"}</Text>
                        </TouchableOpacity>
                        {modalChooseDateType == "checkIn" && (
                            <>
                                <Modal
                                    transparent
                                    animationType="slide"
                                    visible={modalChooseDateType == "checkIn" && Platform.OS === 'ios'}
                                    onRequestClose={() => setModalChooseDateType(undefined)}
                                >
                                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066' }}>
                                        <View
                                            style={{
                                                backgroundColor: '#fff',
                                                height: 300,
                                                borderTopLeftRadius: 12,
                                                borderTopRightRadius: 12,
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {/* Header */}
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    paddingHorizontal: 16,
                                                    paddingVertical: 10,
                                                    borderBottomWidth: 1,
                                                    borderColor: '#ddd',
                                                }}
                                            >
                                                <TouchableOpacity onPress={() => setModalChooseDateType(undefined)}>
                                                    <Text style={{ color: '#009EDE', fontWeight: 'bold' }}>Hủy</Text>
                                                </TouchableOpacity>
                                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Nhận phòng</Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        // nếu ngày nhận >= ngày trả thì reset ngày trả
                                                        if (checkOut && checkIn >= checkOut) setCheckOut(null);
                                                        setModalChooseDateType(undefined);
                                                    }}
                                                >
                                                    <Text style={{ color: '#009EDE', fontWeight: 'bold' }}>OK</Text>
                                                </TouchableOpacity>
                                            </View>

                                            <DateTimePicker
                                                value={checkIn}
                                                minimumDate={new Date()}
                                                mode="date"
                                                display="spinner"
                                                themeVariant="light"
                                                textColor="black"
                                                style={{ flex: 1 }}
                                                onChange={(_, date) => date && setCheckIn(date)}
                                            />
                                        </View>
                                    </View>
                                </Modal>
                            // {/* Android giữ nguyên */}
                                {Platform.OS === 'android' && modalChooseDateType && (
                                    <DateTimePicker
                                        value={checkIn}
                                        mode="date"
                                        display="default"
                                        minimumDate={new Date()} // 👈 Chặn ngày quá khứ
                                        onChange={(_, date) => {
                                            setModalChooseDateType(undefined);
                                            if (date) {
                                                setCheckIn(date);
                                                if (checkOut && date >= checkOut) setCheckOut(null);
                                            }
                                        }}
                                    />
                                )}
                            </>
                        )}
                        {modalChooseDateType == "checkOut" && (
                            <>
                                <Modal
                                    transparent
                                    animationType="slide"
                                    visible={modalChooseDateType == "checkOut" && Platform.OS === 'ios'}
                                    onRequestClose={() => setModalChooseDateType(undefined)}
                                >
                                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000066' }}>
                                        <View
                                            style={{
                                                backgroundColor: '#fff',
                                                height: 300,
                                                borderTopLeftRadius: 12,
                                                borderTopRightRadius: 12,
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {/* Header */}
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    paddingHorizontal: 16,
                                                    paddingVertical: 10,
                                                    borderBottomWidth: 1,
                                                    borderColor: '#ddd',
                                                }}
                                            >
                                                <TouchableOpacity onPress={() => setModalChooseDateType(undefined)}>
                                                    <Text style={{ color: '#009EDE', fontWeight: 'bold' }}>Hủy</Text>
                                                </TouchableOpacity>
                                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Trả phòng</Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        if (checkOut) setCheckOut(checkOut);
                                                        setModalChooseDateType(undefined);
                                                    }}
                                                >
                                                    <Text style={{ color: '#009EDE', fontWeight: 'bold' }}>OK</Text>
                                                </TouchableOpacity>
                                            </View>

                                            <DateTimePicker
                                                value={checkOut || new Date(checkIn.getTime() + 86400000)}
                                                minimumDate={new Date(checkIn.getTime() + 86400000)}
                                                mode="date"
                                                display="spinner"
                                                themeVariant="light"
                                                textColor="black"
                                                style={{ flex: 1 }}
                                                onChange={(_, date) => date && setCheckOut(date)}
                                            />
                                        </View>
                                    </View>
                                </Modal>


                                {Platform.OS === 'android' && modalChooseDateType == "checkOut" && (
                                    <DateTimePicker
                                        value={checkOut || new Date(checkIn.getTime() + 86400000)}
                                        minimumDate={new Date(checkIn.getTime() + 86400000)}
                                        mode="date"
                                        display="default"
                                        onChange={(_, date) => {
                                            setModalChooseDateType(undefined);
                                            if (date) setCheckOut(date);
                                        }}
                                    />
                                )}
                            </>
                        )}

                    </View>

                </View>
            </View>
        </Modal>
    );
};


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
    section: { margin: 15, },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
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
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    sheet: {
        height: 250,
        backgroundColor: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 20,
    },
    handle: {
        width: 50,
        height: 5,
        backgroundColor: "#ccc",
        borderRadius: 3,
        alignSelf: "center",
        marginVertical: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 10,
        alignItems: "center",
    },
    cancel: {
        fontSize: 16,
        color: "red",
    },

    actionText: {
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: "#eee",
        marginBottom: 10,
    },
    content: {
        flex: 1,
    },
    dateBox: {
        padding: 14,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: "#fff",
    },
    nightBox: {
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: "#F0F7FF",
        borderRadius: 10,
        marginTop: 5,
    },

    nightText: {
        fontSize: 14,
        color: "#555",
    },

    nightValue: {
        fontSize: 14,
        fontWeight: "700",
        color: "#007AFF",
    },
    box: {
        width: "48%",
        padding: 12,
        backgroundColor: "#F8F9FA",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E5E5",
    },

    date: {
        marginTop: 4,
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
});