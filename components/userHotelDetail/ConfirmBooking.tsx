import Booking from '@/models/Booking/Booking';
import { BookingUtilityRequest } from '@/models/BookingUtility/BookingUtilityRequest';
import Room from '@/models/Room';
import { UtilityItem } from '@/models/Utility/Utility';
import Voucher from '@/models/Voucher';
import { createBooking } from '@/service/BookingAPI';
import { createBookingUtility } from '@/service/BookingUtilityAPI';
import { getUserVouchers } from '@/service/UserVoucherAPI';
import { useVoucher } from '@/service/VoucherAPI';
import type { RootStackParamList } from '@/types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { initiatePayment } from '../payment/PaymentButton';
type ConfirmBookingProps = {
  room: Room,
  checkInDate: Date,
  checkOutDate: Date | null,
  nights: number
  specialRequests: UtilityItem[]
}

export default function ConfirmBooking() {
  // const route = useRoute<ConfirmBookingRouteProp>();

  const router = useRouter();
  const route = useRoute<RouteProp<RootStackParamList, 'ConfirmBooking'>>();
  const { room, checkInDate, checkOutDate, nights, specialRequests,  } = route.params;

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
  const [voucherModalVisible2, setVoucherModalVisible2] = useState(false);
  //show voucher đã lưu trong modal, 2 loại
  const [selectedGlobalVoucher, setSelectedGlobalVoucher] = useState<Voucher | null>(null);
  const [selectedHotelVoucher, setSelectedHotelVoucher] = useState<Voucher | null>(null);

  const [selectedVoucher, setSelectedVoucher] = useState<null | Voucher>(
    null
  );
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const userId = await AsyncStorage.getItem("userId");
      const userVouchers = await getUserVouchers(Number(userId));
      console.log("User vouchers từ backend:", userVouchers);
      setAvailableVouchers(userVouchers);
    };
    fetchData();
  }, []);
  const specialRequestTotal = specialRequests.map(item => item.price * Number(item.quantity)).reduce((a, b) => a + b, 0);
  const totalPrice = Number(room.price) * nights + specialRequestTotal;

  const globalDiscount = selectedGlobalVoucher ? selectedGlobalVoucher.percent : 0;
  const hotelDiscount = selectedHotelVoucher ? selectedHotelVoucher.percent : 0;
  // tổng phần trăm giảm cộng lại (giới hạn 100%)
  const totalDiscount = Math.min(globalDiscount + hotelDiscount, 100);

  const finalPrice = totalPrice - (totalPrice * totalDiscount / 100);
  //hàm thanh toán
  const handleConfirmPayment = async () => {
    if (selectedGlobalVoucher && totalPrice < selectedGlobalVoucher.priceCondition) {
      alert(
        `Giá phòng ${totalPrice.toLocaleString('vi-VN')} VND nhỏ hơn điều kiện của voucher app (${selectedGlobalVoucher.priceCondition.toLocaleString('vi-VN')} VND).`
      );
      return;
    }

    if (selectedHotelVoucher && totalPrice < selectedHotelVoucher.priceCondition) {
      alert(
        `Giá phòng ${totalPrice.toLocaleString('vi-VN')} VND nhỏ hơn điều kiện của voucher khách sạn (${selectedHotelVoucher.priceCondition.toLocaleString('vi-VN')} VND).`
      );
      return;
    }

    const userId = await AsyncStorage.getItem('userId');

    const voucherIds: number[] = [];
    // nếu có voucher khách sạn
    if (selectedHotelVoucher?.id) voucherIds.push(selectedHotelVoucher.id);

    // nếu có voucher app
    if (selectedGlobalVoucher?.id) voucherIds.push(selectedGlobalVoucher.id);

    const booking: Booking = {
      userId: Number(userId!),
      roomId: room.id,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate!),
      totalPrice: finalPrice,
      voucherIds: voucherIds.length > 0 ? voucherIds : undefined, // chỉ gửi nếu có

    };

    try {
      const data = await createBooking(booking);
      if (selectedGlobalVoucher?.id) await useVoucher(selectedGlobalVoucher.id, totalPrice);
      if (selectedHotelVoucher?.id) await useVoucher(selectedHotelVoucher.id, totalPrice);
      const bookingUtilityRequest: BookingUtilityRequest = {
        bookingId: data.id,
        utilityItemBooking: specialRequests.map(item => {
          return {
            utilityId: item.id,
            quantity: Number(item.quantity)
          }
        })
      }
      const createdBookingUtility = await createBookingUtility(bookingUtilityRequest);
      initiatePayment(finalPrice, 'vnpay', data.id);
      console.log("Đã tạo booking utility thành công:", createdBookingUtility);
      router.replace("/(tabs)/booking");
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Xác nhận đặt phòng</Text>

      {/* Tên khách sạn */}
      <View style={styles.section}>
        <Text style={styles.label}>Khách sạn</Text>
        <Text style={styles.value}>{room.hotelName}</Text>
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

          <View key={item.id} style={styles.row}>
            {/* <Text>Yêu cầu đặc biệt</Text> */}
            <Text style={{ width: '45%' }}>{item.name}</Text>
            <Text style={{ width: '10%' }}>X{item.quantity}</Text>
            <Text style={{ width: '45%', textAlign: 'right' }}>{(item.price * Number(item.quantity)).toLocaleString('vi-VN')} VND</Text>
            {/* <Text>{specialRequests.map((item: UtilityItem) => item.price).join(', ')}</Text> */}
          </View>
        ))}

      </View>


      <View style={styles.section}>
        <Text style={styles.label}>Voucher của app</Text>
        <TouchableOpacity
          style={styles.voucherBox}
          onPress={() => setVoucherModalVisible(true)}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: selectedGlobalVoucher ? '#333' : '#888' }}>
              {selectedGlobalVoucher
                ? `${selectedGlobalVoucher.code} - Giảm ${selectedGlobalVoucher.percent.toLocaleString('vi-VN')} %`
                : 'Chọn voucher'}
            </Text>

            {/* Nút xóa voucher nếu đang chọn */}
            {selectedGlobalVoucher && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();        // chặn mở modal
                  setSelectedGlobalVoucher(null);   // bỏ chọn
                }}
                style={styles.clearBtn}
              >
                <Text style={{ color: '#e53935', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </View>


      <View style={styles.section}>
        <Text style={styles.label}>Voucher của khách sạn</Text>
        <TouchableOpacity
          style={styles.voucherBox}
          onPress={() => setVoucherModalVisible2(true)}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: selectedHotelVoucher ? '#333' : '#888' }}>
              {selectedHotelVoucher
                ? `${selectedHotelVoucher.code} - Giảm ${selectedHotelVoucher.percent.toLocaleString('vi-VN')} %`
                : 'Chọn voucher'}
            </Text>

            {/* Nút xóa voucher nếu đang chọn */}
            {selectedHotelVoucher && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();        // chặn mở modal
                  setSelectedHotelVoucher(null);   // bỏ chọn
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
          {(selectedGlobalVoucher || selectedHotelVoucher) ? (
            <>
              {/* Giá gốc gạch ngang */}
              <Text style={styles.oldPrice}>
                {(totalPrice).toLocaleString('vi-VN')} VND
              </Text>

              {/* Giá sau giảm */}
              <Text style={styles.newPrice}>
                {finalPrice.toLocaleString('vi-VN')} VND
              </Text>

              {/* Hiển thị phần giảm */}
              <Text style={styles.discount}>
                (Giảm {totalDiscount}%)
              </Text>
            </>
          ) : (
            <Text style={styles.newPrice}>
              {totalPrice.toLocaleString('vi-VN')} VND
            </Text>
          )}
        </View>
      </View>




      {/* Nút thanh toán */}
      <TouchableOpacity style={styles.payBtn} onPress={handleConfirmPayment}>
        <Text style={styles.payText}>Thanh toán</Text>
      </TouchableOpacity>

      {/* ===== Modal chọn voucher ks ===== */}
      <Modal
        visible={voucherModalVisible2}
        transparent
        animationType="slide"
        onRequestClose={() => setVoucherModalVisible2(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              Voucher của khách sạn
            </Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {/* 🏨 Voucher của khách sạn */}
              <Text style={{ fontSize: 16, fontWeight: '600', marginVertical: 8 }}>
                🏨 Voucher của khách sạn
              </Text>
              {availableVouchers.filter(
                (v) =>
                  Number(v.hotelId) === Number(room.hotel?.id ?? room.hotelId) &&
                  (v.used || 0) < (v.initialQuantity ?? v.quantity ?? 0)
              ).length > 0 ? (
                availableVouchers
                  .filter(
                    (v) =>
                      Number(v.hotelId) === Number(room.hotel?.id ?? room.hotelId) &&
                      (v.used || 0) < (v.initialQuantity ?? v.quantity ?? 0)
                  )
                  .map((item) => {
                    const isEligible = totalPrice >= item.priceCondition;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.voucherItem, !isEligible && { opacity: 0.5 }]}
                        disabled={!isEligible}
                        onPress={() => {
                          if (!isEligible) {
                            Alert.alert(
                              'Không đủ điều kiện',
                              'Giá phòng chưa đạt điều kiện để áp dụng voucher này.'
                            );
                            return;
                          }
                          setSelectedHotelVoucher(item);
                          setVoucherModalVisible2(false);
                        }}
                      >
                        <Text style={{ fontWeight: '600' }}>{item.code}</Text>
                        <Text>Giảm {item.percent}%</Text>
                        <Text>
                          Điều kiện: Hóa đơn ≥ {item.priceCondition.toLocaleString('vi-VN')} VND
                        </Text>
                        {!isEligible && (
                          <Text style={{ color: 'red', fontSize: 12 }}>
                            Không đủ điều kiện áp dụng
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })
              ) : (
                <Text style={{ color: '#888', fontStyle: 'italic' }}>
                  Không có voucher khách sạn
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.payBtn, { marginTop: 10, backgroundColor: '#aaa' }]}
              onPress={() => setVoucherModalVisible2(false)}
            >
              <Text style={styles.payText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* ===== voucher app ===== */}
      <Modal
        visible={voucherModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setVoucherModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              Voucher của app
            </Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {/* 🎁 Voucher Toàn hệ thống */}
              <Text style={{ fontSize: 16, fontWeight: '600', marginVertical: 8 }}>
                🎁 Voucher Toàn hệ thống
              </Text>
              {availableVouchers.filter(
                (v) =>
                  !v.hotelId && (v.used || 0) < (v.initialQuantity ?? v.quantity ?? 0)
              ).length > 0 ? (
                availableVouchers
                  .filter(
                    (v) =>
                      !v.hotelId && (v.used || 0) < (v.initialQuantity ?? v.quantity ?? 0)
                  )
                  .map((item) => {
                    const isEligible = totalPrice >= item.priceCondition;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.voucherItem, !isEligible && { opacity: 0.5 }]}
                        disabled={!isEligible}
                        onPress={() => {
                          if (!isEligible) {
                            Alert.alert(
                              'Không đủ điều kiện',
                              'Giá phòng chưa đạt điều kiện để áp dụng voucher này.'
                            );
                            return;
                          }
                          setSelectedGlobalVoucher(item);
                          setVoucherModalVisible(false);
                        }}
                      >
                        <Text style={{ fontWeight: '600' }}>{item.code}</Text>
                        <Text>Giảm {item.percent}%</Text>
                        <Text>
                          Điều kiện: Hóa đơn ≥ {item.priceCondition.toLocaleString('vi-VN')} VND
                        </Text>
                        {!isEligible && (
                          <Text style={{ color: 'red', fontSize: 12 }}>
                            Không đủ điều kiện áp dụng
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })
              ) : (
                <Text style={{ color: '#888', fontStyle: 'italic' }}>
                  Không có voucher toàn hệ thống
                </Text>
              )}
            </ScrollView>

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