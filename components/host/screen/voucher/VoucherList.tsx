import { useHost } from '@/context/HostContext';
import Voucher from '@/models/Voucher';
import { getVouchersByHotelId } from '@/service/VoucherAPI';
import { HostStack } from '@/types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Giao diện danh sách voucher cho admin
// Hỗ trợ hiển thị danh sách voucher, nút thêm mới, sửa, xóa và toggle kích hoạt

type AdminVoucherListNavProp = NativeStackNavigationProp<
    HostStack,
    'FormVoucher'
>;


export default function VoucherList() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const navigation = useNavigation<AdminVoucherListNavProp>();
    const { hotelId } = useHost();

    // Giả lập fetch data (thay bằng API thật)
    useFocusEffect(
        useCallback(() => {
            console.log("hotelId", hotelId);

            setLoading(true);
            const fetchVouchers = async () => {
                if (!hotelId) {
                    Alert.alert("⚠ Lỗi", "Vui lòng chọn khách sạn");
                    return router.push("/(host)");
                }              
                  const vouchers = await getVouchersByHotelId(Number(hotelId));
                setVouchers(vouchers);
                setLoading(false);
            };
            fetchVouchers();
        }, [hotelId]));

    const handleToggleActive = (item: Voucher) => {
        setVouchers((prev) =>
            prev.map((v) => (v.id === item.id ? { ...v, active: !v.active } : v))
        );
    };

    const handleDelete = (id) => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa voucher này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: () => {
                    setVouchers((prev) => prev.filter((v) => v.id !== id));
                },
            },
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.rowBetween}>
                <Text style={styles.code}>{item.code}</Text>
                <Switch value={item.active} onValueChange={() => handleToggleActive(item)} />
            </View>

            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.value}>
                Giảm: {item.percent}% 
            </Text>

            <View style={styles.rowBetween}>
                <Text style={styles.meta}>Đã dùng: {item.used}/{item.initialQuantity}</Text>
                {/* <Text style={styles.meta}>{item.startDate} → {item.endDate}</Text> */}
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.btn, styles.editBtn]}
                onPress={() => navigation.navigate('FormVoucher', { isEdit: true, voucher: item })}
                >
                    <Text style={styles.editText}>Sửa</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteText}>Xóa</Text>
                </TouchableOpacity> */}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons style={{ marginRight: 10 }} name="ticket" size={20} color="#0b84ff" />
                    <Text style={styles.heading}>Danh sách voucher</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0b84ff" style={{ marginTop: 30 }} />
            ) : vouchers.length === 0 ? (
                <Text style={styles.empty}>Chưa có voucher nào</Text>
            ) : (
                <FlatList
                    data={vouchers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 50 }}
                />
            )}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('FormVoucher', { isEdit: false, voucher: null })}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    heading: {
        fontSize: 20,
        fontWeight: '700',
    },
    addBtn: {
        backgroundColor: '#0b84ff',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addText: {
        color: '#fff',
        fontWeight: '700',
    },
    card: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
        backgroundColor: '#FAFAFA',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    code: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0b84ff',
    },
    title: {
        fontSize: 14,
        color: '#333',
        marginVertical: 6,
    },
    value: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    meta: {
        fontSize: 12,
        color: '#777',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    btn: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
        marginLeft: 8,
    },
    editBtn: {
        backgroundColor: '#E3F2FD',
    },
    editText: {
        color: '#0b84ff',
        fontWeight: '600',
    },
    deleteBtn: {
        backgroundColor: '#FFEBEE',
    },
    deleteText: {
        color: '#D32F2F',
        fontWeight: '600',
    },
    empty: {
        textAlign: 'center',
        color: '#777',
        marginTop: 40,
    },
    fab: {
        position: "absolute",
        bottom: 0,
        right: 20,
        backgroundColor: "#007bff",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
});
