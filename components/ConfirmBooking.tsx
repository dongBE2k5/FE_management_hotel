import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '@/types/navigation';
import type { RouteProp } from '@react-navigation/native';

export default function ConfirmBooking() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'ConfirmBooking'>>();

  const {
    hotelName = 'Khách sạn Mường Thanh Grand Đà Nẵng',
    checkIn,
    checkOut,
    nights = 1,
    roomPrice = 0,
    taxFee = 0,
    insuranceSelected = false,
    insurancePrice = 0,
    specialRequests = [],
    specialRequestPrice = 0,
  } = route.params ?? {};

  const formatDate = (d: any) =>
    d
      ? typeof d === 'string'
        ? d
        : d instanceof Date
        ? d.toLocaleDateString('vi-VN')
        : ''
      : '';

  const specialRequestTotal = specialRequests.length * specialRequestPrice;
  const totalPrice =
    roomPrice * nights +
    taxFee +
    specialRequestTotal +
    (insuranceSelected ? insurancePrice : 0);

  // ⚡ Hàm xác nhận thanh toán
  const handleConfirmPayment = () => {
    Alert.alert(
      'Xác nhận thanh toán',
      `Bạn chắc chắn muốn thanh toán ${totalPrice.toLocaleString('vi-VN')} VND cho đơn đặt phòng này?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: () => {
            // Gọi API thanh toán hoặc điều hướng
            alert('Tiến hành thanh toán…');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Xác nhận đặt phòng</Text>

      {/* Tên khách sạn */}
      <View style={styles.section}>
        <Text style={styles.label}>Khách sạn</Text>
        <Text style={styles.value}>{hotelName}</Text>
      </View>

      {/* Thời gian nhận trả phòng */}
      <View style={styles.section}>
        <Text style={styles.label}>Ngày nhận / trả phòng</Text>
        <Text style={styles.value}>
          {formatDate(checkIn)} → {formatDate(checkOut)}
        </Text>
        <Text style={styles.value}>Số đêm: {nights}</Text>
      </View>

      {/* Chi tiết phí */}
      <View style={styles.section}>
        <Text style={styles.label}>Chi tiết phí</Text>
        <View style={styles.row}>
          <Text>Giá phòng</Text>
          <Text>{(roomPrice * nights).toLocaleString('vi-VN')} VND</Text>
        </View>
        <View style={styles.row}>
          <Text>Thuế & Phí</Text>
          <Text>{taxFee.toLocaleString('vi-VN')} VND</Text>
        </View>
        {specialRequests.length > 0 && (
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
        )}
        <View style={[styles.row, styles.total]}>
          <Text style={{ fontWeight: 'bold' }}>Tổng cộng</Text>
          <Text style={{ fontWeight: 'bold', color: '#e53935' }}>
            {totalPrice.toLocaleString('vi-VN')} VND
          </Text>
        </View>
      </View>

      {/* Chi tiết yêu cầu đặc biệt */}
      {specialRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Chi tiết yêu cầu</Text>
          {specialRequests.map((req: string, idx: number) => (
            <Text key={idx} style={styles.value}>
              • {req}
            </Text>
          ))}
        </View>
      )}

      {/* Nút thanh toán */}
      <TouchableOpacity
        style={styles.payBtn}
        onPress={handleConfirmPayment}
      >
        <Text style={styles.payText}>Thanh toán</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff',marginLeft:10,marginRight:10,borderRadius:10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  section: { marginBottom: 20 },
  label: { fontWeight: 'bold', marginBottom: 4 },
  value: { color: '#333', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  total: { borderTopWidth: 1, borderColor: '#ccc', paddingTop: 8 },
  payBtn: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  payText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
