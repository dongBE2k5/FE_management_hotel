import { useHost } from '@/context/HostContext';
import VoucherRequest from '@/models/Voucher/VoucherRequest';
import { addVoucherOfHotel, updateVoucherOfHotel } from '@/service/VoucherAPI';
import { HostStack } from '@/types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// NOTE: This is a single-file React Native component for an "Add Voucher" admin screen.
// It uses only core react-native components to keep it portable. Replace pickers/date
// inputs with your native libs (react-native-datepicker, react-native-modal-datetime-picker,
// react-native-picker-select, etc.) when integrating.


export default function FormVoucher() {

  const { params } = useRoute<RouteProp<HostStack, 'FormVoucher'>>();
  const { isEdit, voucher } = params;

  const [code, setCode] = useState(voucher?.code || '');
  const [name, setName] = useState(voucher?.name || '');
  const [description, setDescription] = useState(voucher?.description || '');
  const [value, setValue] = useState(voucher?.percent || 0);
  const [priceCondition, setPriceCondition] = useState<number>(voucher?.priceCondition || 0);
  const [quantity, setQuantity] = useState<number>(voucher?.quantity || 0);
  const [initialQuantity, setInitialQuantity] = useState<number>(voucher?.initialQuantity || 0);
  const [percent, setPercent] = useState<number>(voucher?.percent || 0);
  const [active, setActive] = useState<boolean>(voucher?.active || false);
  const { hotelId } = useHost();

  const navigation = useNavigation<NativeStackNavigationProp<HostStack, 'VoucherList'>>();

  if (!hotelId) return <Text>Không tìm thấy hotelId</Text>;
  console.log("🏨 isEdit:", isEdit);
  console.log("🏨 Voucher:", voucher);
  console.log("🏨 active:", active);
  const validateAndSubmit = async () => {
    // basic validations
    if (!code.trim()) return Alert.alert('Lỗi', 'Mã voucher không được để trống');
    if (!name.trim()) return Alert.alert('Lỗi', 'Tên voucher không được để trống');
    if (!description.trim()) return Alert.alert('Lỗi', 'Mô tả voucher không được để trống');
    if (!priceCondition || isNaN(Number(priceCondition))) return Alert.alert('Lỗi', 'Giá trị tối thiểu để áp dụng không hợp lệ');
    if (!initialQuantity || isNaN(Number(initialQuantity))) return Alert.alert('Lỗi', 'Giới hạn sử dụng không hợp lệ');

    const payload: VoucherRequest = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      priceCondition: Number(priceCondition),
      hotelId,
      quantity: Number(initialQuantity - (voucher?.used || 0)),
      percent: Number(percent),
      initialQuantity: Number(initialQuantity),
      active,
    };
    console.log(payload);
    if (!isEdit) {
      const voucher = await addVoucherOfHotel(payload);
      if (voucher) {

        Alert.alert('Thành công', 'Voucher đã được thêm thành công', [
          { text: 'OK', onPress: () => {
            handleReset();
            console.log("🏨 Voucher thêm thành công:", voucher);
            navigation.navigate('VoucherList');
          } }
        ]);
      } else {
        Alert.alert('Lỗi', 'Không thể thêm voucher', [
          { text: 'OK', onPress: () => {
            navigation.navigate('VoucherList');
          } }
        ]);
      }
    }else {
      if (!voucher?.id) return Alert.alert('Lỗi', 'Không tìm thấy voucher');
      const voucherUpdate = await updateVoucherOfHotel(voucher?.id, payload);
      if (voucherUpdate) {
        Alert.alert('Thành công', 'Voucher đã được cập nhật thành công', [
          { text: 'OK', onPress: () => {
            handleReset();
            console.log("🏨 Voucher cập nhật thành công:", voucherUpdate);
            navigation.navigate('VoucherList');
          } }
        ]);
      } else {
        Alert.alert('Lỗi', 'Không thể cập nhật voucher', [
          { text: 'OK', onPress: () => {
            navigation.navigate('VoucherList');
          } }
        ]);
      }
    }

  };

  const handleReset = () => {
    setCode('');
    setName('');
    setDescription('');
    setPriceCondition(0);
    setQuantity(0);
    setPercent(0);
    setInitialQuantity(0);
    setActive(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={{ marginBottom: 10 }} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.heading}>{isEdit ? "Cập nhật voucher" : "Thêm voucher mới"}</Text>

      <Text style={styles.label}>Mã voucher</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: SPRING2025"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
      />

      <Text style={styles.label}>Tiêu đề</Text>
      <TextInput style={styles.input} placeholder="Tiêu đề (tùy chọn)" value={name} onChangeText={setName} />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Mô tả ngắn về voucher"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <View style={styles.rowBetween}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Đơn vị</Text>
          <View style={[styles.segment, styles.segmentItemActive]}>
            <TouchableOpacity
              style={[styles.segmentItem]}
            >
              <Text style={[styles.segmentText, styles.segmentTextActive]}>%</Text>
            </TouchableOpacity>

          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Giá trị</Text>
          <TextInput
            style={styles.input}
            placeholder={'VD: 10 (10%)'}
            value={percent.toString()}
            onChangeText={(text) => setPercent(Number(text))}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.label}>Giá trị tối thiểu để áp dụng</Text>
      <TextInput style={styles.input} placeholder={'VD: 200000'} value={priceCondition.toString()} onChangeText={(text) => setPriceCondition(Number(text))} keyboardType="numeric" />


      <Text style={styles.label}>Giới hạn sử dụng (tùy chọn)</Text>
      <TextInput style={styles.input} placeholder={'VD: 100'} value={initialQuantity.toString()} onChangeText={(text) => setInitialQuantity(Number(text))} keyboardType="numeric" />

      <View style={[styles.rowBetween, { alignItems: 'center', marginTop: 12, display: 'flex' }]}>
        <Text style={[styles.label, { marginBottom: 0 }]}>Kích hoạt</Text>
        <Switch style={{ marginLeft: 10 }} value={active} onValueChange={(value) => setActive(value)} />
      </View>

      <View style={styles.footerButtons}>
        <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={handleReset}>
          <Text style={styles.cancelText}>Đặt lại</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.saveBtn]} onPress={validateAndSubmit}>
          <Text style={styles.saveText}>Lưu voucher</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  textarea: {
    minHeight: 78,
    textAlignVertical: 'top',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: '#0b84ff',
  },
  segmentText: {
    color: '#333',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  segmentFullWidth: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  segmentItemWide: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 8,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  saveBtn: {
    backgroundColor: '#0b84ff',
    marginLeft: 8,
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
});
