import Booking from '@/models/Booking/Booking';
import Room from '@/models/Room';
import Voucher from '@/models/Voucher';
import { createBooking } from '@/service/BookingAPI';
import { getUserVouchers } from '@/service/UserVoucherAPI';
import type { RootStackParamList } from '@/types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { useVoucher } from '@/service/VoucherAPI';
type ConfirmBookingProps = {
  room: Room,
  checkInDate: Date,
  checkOutDate: Date | null,
  nights: number
}

export default function ConfirmBooking() {
  // const route = useRoute<ConfirmBookingRouteProp>();

  const router = useRouter();
  const route = useRoute<RouteProp<RootStackParamList, 'ConfirmBooking'>>();
  const { room, checkInDate, checkOutDate, nights } = route.params;

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
  //show voucher đã lưu trong modal
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

  const totalPrice = Number(room.price) * nights;

  //tính tổng sau khi áp voucher
  const discountPercent = selectedVoucher ? selectedVoucher.percent : 0;
  const finalPrice = totalPrice - (totalPrice * discountPercent / 100);

  //hàm thanh toán
  const handleConfirmPayment = async () => {
    if (selectedVoucher) {
      if (totalPrice < selectedVoucher.priceCondition) {
        alert(
          `Giá phòng ${totalPrice.toLocaleString('vi-VN')} VND nhỏ hơn điều kiện của voucher (${selectedVoucher.priceCondition.toLocaleString('vi-VN')} VND). Không thể áp dụng voucher này.`
        );
        return; // ❌ Dừng thanh toán
      }
    }

    console.log("addBooking");
    const userId = await AsyncStorage.getItem('userId');
    const booking: Booking = {
      userId: Number(userId!),
      roomId: room.id,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate!),
      totalPrice: finalPrice,
    };

    try {
      const data = await createBooking(booking);
      if (selectedVoucher?.id) {
        await useVoucher(selectedVoucher.id, totalPrice);
      }

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
        <View style={styles.row}>
          <Text>Thuế & Phí</Text>
          <Text>{Number(0).toLocaleString('vi-VN')} VND</Text>
        </View>

      </View>


      <View style={styles.section}>
        <Text style={styles.label}>Voucher</Text>
        <TouchableOpacity
          style={styles.voucherBox}
          onPress={() => setVoucherModalVisible(true)}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: selectedVoucher ? '#333' : '#888' }}>
              {selectedVoucher
                ? `${selectedVoucher.code} - Giảm ${selectedVoucher.percent.toLocaleString('vi-VN')} %`
                : 'Chọn voucher'}
            </Text>

            {/* Nút xóa voucher nếu đang chọn */}
            {selectedVoucher && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();        // chặn mở modal
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
              {/* Giá sau giảm */}
              <Text style={styles.newPrice}>
                {finalPrice.toLocaleString('vi-VN')} VND
              </Text>
              {/* Hiển thị thêm phần giảm nếu muốn */}
              <Text style={styles.discount}>
                (Giảm {discountPercent}%)
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
              //xét vouhcer thuộc hotel nào, voucher có hotelid= room hotel id mới hiển thị
              data={availableVouchers.filter(
                v =>
                  (v.used || 0) < v.initialQuantity &&
                  Number(v.hotelId) === Number(room.hotel?.id ?? room.hotelId)
              )}

              //  Lọc voucher chưa hết
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const isEligible = totalPrice >= item.priceCondition; //  Kiểm tra giá gốc có đủ điều kiện không
                return (

                  <TouchableOpacity
                    style={[
                      styles.voucherItem,
                      !isEligible && { opacity: 0.5 } // Mờ đi nếu không đủ điều kiện
                    ]}
                    disabled={!isEligible} // Không cho chọn nếu không hợp lệ
                    onPress={() => {
                      if (!isEligible) {
                        Alert.alert('Không đủ điều kiện', 'Giá phòng chưa đạt điều kiện để áp dụng voucher này.');
                        return;
                      }
                      setSelectedVoucher(item);
                      setVoucherModalVisible(false);
                    }}
                  >
                    <Text style={{ fontWeight: '600' }}>{item.code}</Text>
                    <Text>Giảm {item.percent.toLocaleString('vi-VN')} %</Text>
                    <Text>Điều kiện: Hóa đơn ≥ {item.priceCondition.toLocaleString('vi-VN')} VND</Text>

                    {/* Nếu không đủ điều kiện thì thông báo */}
                    {!isEligible && (
                      <Text style={{ color: 'red', fontSize: 12 }}>
                        Không đủ điều kiện áp dụng
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
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