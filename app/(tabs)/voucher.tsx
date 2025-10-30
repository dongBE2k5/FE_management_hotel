import Header from '@/components/userHome/header';
import SavedVoucherCard from '@/components/userHome/SavedVoucherCard';
import Voucher from '@/models/Voucher';
import { getUserVouchers } from '@/service/UserVoucherAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';

export default function VoucherScreen() {
  const [savedVouchers, setSavedVouchers] = useState<Voucher[]>([]);
  const [appVouchers, setAppVouchers] = useState<Voucher[]>([]);
  const [hotelVouchers, setHotelVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ NEW STATE: Để theo dõi tab đang được chọn ('app' cho toàn hệ thống, 'hotel' cho khách sạn)
  const [activeTab, setActiveTab] = useState<'app' | 'hotel'>('app'); 

  // Hàm xử lý việc xóa voucher
  const handleDeleteVoucher = useCallback((voucherToDelete: Voucher) => {
    console.log(`Bắt đầu xóa voucher: ${voucherToDelete.code}`);

    // 1. Lọc ra danh sách mới không chứa voucher cần xóa
    const updatedSavedVouchers = savedVouchers.filter(v => v.code !== voucherToDelete.code);

    // 2. Cập nhật state chính
    setSavedVouchers(updatedSavedVouchers);

    // 3. Tách lại 2 loại voucher từ danh sách đã cập nhật
    const appList = updatedSavedVouchers.filter(v => !v.hotelId);
    const hotelList = updatedSavedVouchers.filter(v => v.hotelId);

    // 4. Cập nhật state phụ, khiến giao diện render lại
    setAppVouchers(appList);
    setHotelVouchers(hotelList);
    
    // Trong ứng dụng thực tế, bạn sẽ gọi API để xóa voucher khỏi server ở đây.
  }, [savedVouchers]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;

        const userVouchers = await getUserVouchers(Number(userId));
        console.log("User vouchers từ backend:", userVouchers);

        setSavedVouchers(userVouchers);

        // 🎯 Tách 2 loại voucher
        const appList = userVouchers.filter(v => !v.hotelId);
        const hotelList = userVouchers.filter(v => v.hotelId);
        setAppVouchers(appList);
        setHotelVouchers(hotelList);
      } catch (error) {
        console.error("Lỗi khi tải voucher:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // ✅ Lấy danh sách voucher hiển thị dựa trên activeTab
  const vouchersToDisplay = activeTab === 'app' ? appVouchers : hotelVouchers;
  const currentVoucherListLength = activeTab === 'app' ? appVouchers.length : hotelVouchers.length;


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#009EDE" />
        <Text style={{ marginTop: 8 }}>Đang tải voucher...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <Text style={styles.title}>Voucher đã lưu ({savedVouchers.length})</Text>

      {/* NEW UI: Tab Bar */}
      {savedVouchers.length > 0 && (
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'app' && styles.activeTab]}
            onPress={() => setActiveTab('app')}
          >
            <Text style={[styles.tabText, activeTab === 'app' && styles.activeTabText]}>
              🎁 Toàn hệ thống ({appVouchers.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'hotel' && styles.activeTab]}
            onPress={() => setActiveTab('hotel')}
          >
            <Text style={[styles.tabText, activeTab === 'hotel' && styles.activeTabText]}>
              🏨 Theo khách sạn ({hotelVouchers.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {savedVouchers.length === 0 ? (
        <Text style={styles.noVoucherText}>
          Chưa có voucher nào được lưu
        </Text>
      ) : (
        <ScrollView style={styles.scroll}>
          <View style={styles.section}>
            {/* Conditional Content based on Tab */}
            {currentVoucherListLength > 0 ? (
              vouchersToDisplay.map((voucher) => (
                <SavedVoucherCard 
                  key={voucher.code} 
                  voucher={voucher} 
                />
              ))
            ) : (
              <Text style={styles.emptyText}>
                Không có voucher {activeTab === 'app' ? 'toàn hệ thống' : 'theo khách sạn'} nào được lưu.
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    margin: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scroll: {
    paddingHorizontal: 8,
    paddingTop: 10, // Thêm padding trên để tách tab bar và nội dung
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: { // Đã bỏ sử dụng nhưng giữ lại trong trường hợp cần
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 6,
    marginLeft: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 13,
    marginTop: 20,
    marginHorizontal: 10,
  },
  noVoucherText: {
    marginLeft: 10, 
    color: '#888', 
    marginTop: 10
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ✅ NEW STYLES for Tab Bar
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 5,
    marginHorizontal: 10,
    marginBottom: 5,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#009EDE', // Màu chủ đạo khi tab active
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  activeTabText: {
    color: '#009EDE',
    fontWeight: 'bold',
  }
});
