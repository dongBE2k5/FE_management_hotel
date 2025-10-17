import Header from '@/components/userHome/header';
import SavedVoucherCard from '@/components/userHome/SavedVoucherCard'; // 👈 dùng card riêng
import Voucher from '@/models/Voucher';
import { getUserVouchers } from '@/service/UserVoucherAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function VoucherScreen() {
  const [savedVouchers, setSavedVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const userId = await AsyncStorage.getItem("userId");
      const userVouchers = await getUserVouchers(Number(userId));
      console.log("User vouchers từ backend:", userVouchers);
      setSavedVouchers(userVouchers);
    };
    fetchData();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <Text style={styles.title}>Voucher đã lưu</Text>

      {savedVouchers.length === 0 ? (
        <Text style={{ marginLeft: 10, color: '#888' }}>
          Chưa có voucher nào được lưu
        </Text>
      ) : (
        <FlatList
          data={savedVouchers}
          renderItem={({ item }) => (
            <SavedVoucherCard voucher={item} /> // 👈 dùng card riêng
          )}
          keyExtractor={(item) => item.code}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    margin: 10,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
