import Booking from '@/models/Booking/Booking';
import Room from '@/models/Room';
import { createBooking } from '@/service/BookingAPI';
// Giả định bạn đã tạo hàm này trong một file service, ví dụ: '@/service/Payment/PaymentService'
import { initiatePayment } from '@/components/payment/PaymentButton';
import type { RootStackParamList } from '@/types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BookingUtilityRequest } from '@/models/BookingUtility/BookingUtilityRequest';
import { UtilityItem } from '@/models/Utility/Utility';
import { createBookingUtility } from '@/service/BookingUtilityAPI';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type ConfirmBookingProps = {
  room: Room,
  checkInDate: Date,
  checkOutDate: Date | null,
  nights: number,
  specialRequests: UtilityItem[],
  price: number,
}

export default function ConfirmBooking() {
  // const route = useRoute<ConfirmBookingRouteProp>();

  const router = useRouter();
  const route = useRoute<RouteProp<RootStackParamList, 'ConfirmBooking'>>();
  const { room, checkInDate, checkOutDate, nights, specialRequests, price } = route.params;
  console.log("specialRequests", specialRequests);
  const [bookingUtility, setBookingUtility] = useState<BookingUtilityRequest[]>();
  useEffect(() => {
    // const bookingUtility = specialRequests.map(item => {
    //   return {
    //     utilityId: item.id,
    //     quantity: Number(item.quantity)
    //   }
    // });
    // console.log("bookingUtility", bookingUtility);
    // setBookingUtility(bookingUtility);
  }, [specialRequests]);

  type ConfirmBookingNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'ConfirmBooking'
  >;
  const navigation = useNavigation<ConfirmBookingNavigationProp>();

  const formatDate = (d: any) => {
    if (!d) return '';
    if (typeof d === 'string') return d;
    if (d instanceof Date) return d.toLocaleDateString('vi-VN');
    if (typeof d === 'object' && d.toDate) {
      return d.toDate().toLocaleDateString('vi-VN');
    }
    return '';
  };

  // ---------- Thêm trạng thái voucher ----------
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<null | { code: string; discount: number }>(
    null
  );
  // State để quản lý quá trình loading
  const [isProcessing, setIsProcessing] = useState(false);

  // Ví dụ danh sách voucher có sẵn
  const availableVouchers = [
    { code: 'SALE10', discount: 100000 },
    { code: 'SUMMER5', discount: 50000 },
    { code: 'VIP20', discount: 200000 },
  ];

  // const specialRequestTotal = specialRequests.length * specialRequestPrice;
  // const baseTotal =
  //   roomPrice * nights + taxFee + specialRequestTotal + (insuranceSelected ? insurancePrice : 0);

  // const discount = selectedVoucher?.discount ?? 0;
  const totalPrice = Number(room.price) * nights;

  // Lắng nghe deep link trả về từ app thanh toán
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      console.log("🔗 URL nhận được:", url);
      const data = Linking.parse(url);
      console.log("🔗 Deep link data parse:", data);

      if (data) {
        const status = (data.queryParams?.status as string) ?? "unknown";
        console.log("🔗 Trạng thái thanh toán:", status);

        if (status === "success" || status === "00") {
          setTimeout(() => {
            Alert.alert("Thành công", "Thanh toán thành công!", [
              { text: "OK", onPress: () => router.replace("/(tabs)/booking") },
            ]);
          }, 500);
        } else {
          setTimeout(() => {
            Alert.alert(
              "Thất bại",
              `Thanh toán không thành công. Trạng thái: ${status}`
            );
          }, 500);
        }
      }
    };

    // Đăng ký listener deep link
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Kiểm tra nếu app được mở bằng deep link ngay từ đầu (khi chưa chạy)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Cleanup listener khi unmount
    return () => {
      subscription.remove();
    };
  }, [router]);


  // ⚡ Gộp chức năng Đặt phòng và Thanh toán
  const handleConfirmAndPay = async () => {
    setIsProcessing(true); // Bắt đầu loading
    console.log("Bắt đầu quá trình đặt phòng và thanh toán...");

    try {
      // BƯỚC 1: TẠO BOOKING
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error("Không tìm thấy User ID");
      }

      const booking: Booking = {
        userId: Number(userId!),
        roomId: room.id,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate!),
        totalPrice: price,
      }
      console.log("booking", booking);
      const createdBooking = await createBooking(booking);
      console.log("Đã tạo booking thành công:", createdBooking);

      const bookingUtilityRequest: BookingUtilityRequest = {
        bookingId: createdBooking.id,
        utilityItemBooking: specialRequests.map(item => {
          return {
            utilityId: item.id,
            quantity: Number(item.quantity)
          }
        })
      }
      const createdBookingUtility = await createBookingUtility(bookingUtilityRequest);
      console.log("Đã tạo booking utility thành công:", createdBookingUtility);

      // BƯỚC 2: KHỞI TẠO THANH TOÁN NGAY LẬP TỨC
      if (createdBooking && createdBooking.id) {
        // Gọi hàm thanh toán đã được tách ra
        await initiatePayment(createdBooking.totalPrice, 'vnpay', createdBooking.id);
      } else {
        throw new Error("Tạo booking không trả về ID hợp lệ.");
      }

    } catch (err) {
      console.error("Lỗi trong quá trình xác nhận và thanh toán:", err);
      // Alert.alert("Lỗi", "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false); // Kết thúc loading
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Xác nhận đặt phòng</Text>

      {/* Tên khách sạn */}
      <View style={styles.section}>
        <Text style={styles.label}>Khách sạn</Text>
        <Text style={styles.value}>{room.hotel.name}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Loại phòng</Text>
        <Text style={styles.value}>{room.typeRoom == "DON" ? "Phòng đơn" : room.typeRoom == "DOI" ? "Phòng đôi" : "Phòng gia đình"}</Text>
      </View>

      {/* Thời gian nhận trả phòng */}
      <View style={styles.section}>
        <Text style={styles.label}>Ngày nhận / trả phòng</Text>
        <Text style={styles.value}>
          {formatDate(checkInDate)} → {formatDate(checkOutDate)}
        </Text>
        <Text style={styles.value}>Số đêm: {nights}</Text>
      </View>

      {/* Chi tiết phí */}
      <View style={styles.section}>
        <Text style={styles.label}>Chi tiết phí</Text>
        <View style={styles.row}>
          <Text>Giá phòng</Text>
          <Text>{(totalPrice).toLocaleString('vi-VN')} VND</Text>
        </View>
        {specialRequests.map((item: UtilityItem) => (

          <View style={styles.row}>
            {/* <Text>Yêu cầu đặc biệt</Text> */}
              <Text style={{ width: '45%' }}>{item.name}</Text>
              <Text style={{ width: '10%' }}>X{item.quantity}</Text>
              <Text style={{ width: '45%', textAlign: 'right' }}>{(item.price * Number(item.quantity)).toLocaleString('vi-VN')} VND</Text>
            {/* <Text>{specialRequests.map((item: UtilityItem) => item.price).join(', ')}</Text> */}
          </View>
        ))}

        <View style={styles.row}>
          <Text>Thuế & Phí</Text>
          <Text>{Number(0).toLocaleString('vi-VN')} VND</Text>
        </View>
        {/* {specialRequests.length > 0 && (
          <View style={styles.row}>
            <Text>Yêu cầu đặc biệt (x{specialRequests.length})</Text>
            <Text>{specialRequestTotal.toLocaleString('vi-VN')} VND</Text>
          </View>
        )}
        {insuranceSelected && (
          <View style={styles.row}>
            <Text>Bảo hiểm du lịch</Text>
            <Text>{insurancePrice.toLocaleString('vi-VN')} VND</Text>
          </View>
        )} */}
      </View>

      {/* Chi tiết yêu cầu đặc biệt */}
      {/* {specialRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Chi tiết yêu cầu</Text>
          {specialRequests.map((req: string, idx: number) => (
            <Text key={idx} style={styles.value}>
              • {req}
            </Text>
          ))}
        </View>
      )} */}

      {/* ----- Ô chọn voucher ----- */}
      <View style={styles.section}>
        <Text style={styles.label}>Voucher</Text>
        <TouchableOpacity
          style={styles.voucherBox}
          onPress={() => setVoucherModalVisible(true)}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: selectedVoucher ? '#333' : '#888' }}>
              {selectedVoucher
                ? `${selectedVoucher.code} - Giảm ${selectedVoucher.discount.toLocaleString('vi-VN')} VND`
                : 'Chọn voucher'}
            </Text>
            {selectedVoucher && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();    // chặn mở modal
                  setSelectedVoucher(null);   // bỏ chọn
                }}
                style={styles.clearBtn}
              >
                <Text style={{ color: '#e53935', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Tổng cộng */}
      <View style={[styles.row, styles.total]}>
        <Text style={{ fontWeight: 'bold' }}>Tổng cộng</Text>
        <View style={{ alignItems: 'flex-end' }}>
          {selectedVoucher ? (
            <>
              {/* Giá gốc gạch ngang */}
              <Text style={styles.oldPrice}>
                {totalPrice.toLocaleString('vi-VN')} VND
              </Text>
              {/* Giá đã giảm */}
              <Text style={styles.newPrice}>
                {totalPrice.toLocaleString('vi-VN')} VND
              </Text>
            </>
          ) : (
            // Chưa chọn voucher: chỉ hiển thị 1 giá
            <Text style={styles.newPrice}>
              {price.toLocaleString('vi-VN')} VND
            </Text>
          )}
        </View>
      </View>

      {/* Nút thanh toán */}
      <TouchableOpacity
        style={styles.payBtn}
        onPress={handleConfirmAndPay}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payText}>Xác nhận và Thanh toán</Text>
        )}
      </TouchableOpacity>

      {/* ===== Modal chọn voucher ===== */}
      <Modal
        visible={voucherModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setVoucherModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Chọn Voucher</Text>
            <FlatList
              data={availableVouchers}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.voucherItem}
                  onPress={() => {
                    setSelectedVoucher(item);
                    setVoucherModalVisible(false);
                  }}
                >
                  <Text style={{ fontWeight: '600' }}>{item.code}</Text>
                  <Text>Giảm {item.discount.toLocaleString('vi-VN')} VND</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.payBtn, { marginTop: 10, backgroundColor: '#aaa' }]}
              onPress={() => setVoucherModalVisible(false)}
            >
              <Text style={styles.payText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff', marginHorizontal: 10, borderRadius: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  section: { marginBottom: 20 },
  label: { fontWeight: 'bold', marginBottom: 4 },
  value: { color: '#333', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  total: { borderTopWidth: 1, borderColor: '#ccc', paddingTop: 8 },
  voucherBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    justifyContent: 'center',
  },
  payBtn: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 48, // Đảm bảo nút không bị nhảy chiều cao khi có loading
  },
  payText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  voucherItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  totalBox: {
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 8,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#888',
    fontSize: 14,
  },
  newPrice: {
    fontWeight: 'bold',
    color: '#e53935',
    fontSize: 16,
  },
  discount: {
    fontSize: 16,
    color: '#e53935', // màu đỏ cho giảm giá
  },
  finalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e53935', // màu nổi bật
  },
  clearBtn: {
    marginLeft: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});