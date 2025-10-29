import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal
} from 'react-native';
import HeaderProfile from './headerProfile';
import { useUser } from '@/context/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { updateProfile } from '@/service/UserAPI';
import { ScrollView } from 'react-native-gesture-handler';

export default function AccountInfo() {
  const navigation = useNavigation();
  const { user, refreshUser } = useUser();

  // Dữ liệu người dùng
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cccd, setCccd] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [showDate, setShowDate] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  // Load user khi focus
  useFocusEffect(
    useCallback(() => {
      if (user?.data) {
        setFullName(user.data.fullName || "");
        setEmail(user.data.email || "");
        setPhone(user.data.phone || "");
        setCccd(user.data.cccd || "");
        setAddress(user.data.address || "");
        setGender(user.data.gender || "Nam");
        // Sửa: Dùng birthDate như đã thống nhất
        if (user.data.birthDate) {
          const parsedDate = new Date(user.data.birthDate);
          // Kiểm tra xem parsedDate có hợp lệ không trước khi set
          if (!isNaN(parsedDate.getTime())) {
            setDate(parsedDate);
          } else {
            setDate(null);
          }
        } else {
          setDate(null);
        }
      }
    }, [user])
  );

  // Khi chọn ngày sinh
  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // Luôn ẩn Picker trên Android sau khi chọn hoặc nhấn Cancel
    if (Platform.OS === 'android') {
      setShowDate(false);
    }

    // Trên iOS, type 'set' là khi người dùng đã chọn xong
    if (event.type === 'set') {
      if (selectedDate) {
        setDate(selectedDate);
      }
      // Ẩn Picker trên iOS sau khi chọn xong
      if (Platform.OS === 'ios') {
        setShowDate(false);
      }
    }
    // Nếu type là 'dismissed' (Cancel trên iOS/Android)
    if (event.type === 'dismissed') {
      setShowDate(false);
    }
  };
  const handleSelectGender = (selectedGender: string) => {
    setGender(selectedGender);
    setShowGenderModal(false); // Đóng modal sau khi chọn
  }

  const GenderModal = () => {
    const GENDERS = ["Nam", "Nữ", "Khác"];
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showGenderModal}
        onRequestClose={() => setShowGenderModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowGenderModal(false)}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Chọn Giới tính</Text>
            {GENDERS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.modalOption, gender === item && styles.modalOptionSelected]}
                onPress={() => handleSelectGender(item)}
              >
                <Text style={[styles.modalText, gender === item && styles.modalTextSelected]}>{item}</Text>
                {gender === item && <Ionicons name="checkmark-circle" size={20} color="#0d6efd" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    )
  };
  // Gửi cập nhật
  const handleUpdate = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ họ tên, email và số điện thoại!");
      return;
    }

    const userId = user?.data?.id;
    if (!userId) {
      Alert.alert("Lỗi", "Không xác định được người dùng hiện tại!");
      return;
    }

    const payload: any = {
      fullName,
      email,
      phone,
      cccd,
      gender,
      address,
    };
    if (date) {
      payload.birthDate = date.toISOString().split("T")[0]; // chỉ gửi ngày (YYYY-MM-DD)
    }

    try {
      await updateProfile(Number(userId), payload);
      Alert.alert(" Thành công", "Cập nhật thông tin cá nhân thành công!");
      refreshUser();
    } catch (error) {
      // Log lỗi chi tiết hơn nếu cần
      console.error("Update profile error:", error);
      Alert.alert(" Lỗi", "Không thể cập nhật thông tin!");
    }
  };

  const showDatePicker = () => {
    setShowDate(true);
  }

  return (
    <View style={{ backgroundColor: '#ddd', flex: 1 }}>
      <HeaderProfile />

      <ScrollView>
        <View style={styles.container}>
          <View style={styles.box}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={{ marginBottom: 5 }}>
              <Ionicons name="arrow-back" size={20} color="#009EDE" />
            </Pressable>

            <View style={styles.rowBetween}>
              <Text style={styles.title}>Thông tin cá nhân</Text>
              <TouchableOpacity onPress={handleUpdate}>
                <Text style={styles.editText}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </View>

            {/* Họ và tên */}
            <Text style={styles.label}>Họ và tên:</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

            {/* Ngày sinh */}
            <Text style={styles.label}>Ngày sinh:</Text>
            <TouchableOpacity style={styles.inputRow} onPress={showDatePicker}>
              <Text style={{ flex: 1, color: date ? '#000' : '#888' }}>
                {date ? date.toLocaleDateString("vi-VN") : "Chọn ngày sinh"}
              </Text>
              <MaterialIcons name="calendar-today" size={20} color="#333" />
            </TouchableOpacity>

            {showDate && (
              <DateTimePicker
                // Nếu date là null, dùng ngày mặc định (VD: 1/1/2000)
                value={date || new Date(2000, 0, 1)}
                mode="date"
                // Dùng 'spinner' cho Android, 'default' cho iOS để hiển thị modal/popover
                display={Platform.OS === 'ios' ? 'default' : 'spinner'}
                onChange={onChangeDate}
                maximumDate={new Date()}

                // Chỉ hiển thị DatePicker trên iOS, Android sẽ hiển thị theo mặc định
                {...(Platform.OS === 'ios' && {
                  onTouchCancel: () => setShowDate(false) // Xử lý khi hủy trên iOS
                })}
              />
            )}

            {/* Giới tính */}
            <Text style={styles.label}>Giới tính:</Text>
            <TouchableOpacity style={styles.inputRow} onPress={() => setShowGenderModal(true)}>
              <MaterialIcons name="person" size={20} color="#333" />
              <Text style={styles.textInputFlex}>
                {gender}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
            </TouchableOpacity>
            {/* Địa chỉ */}
            <Text style={styles.label}>Địa chỉ:</Text>

            <TextInput style={styles.input} value={address} onChangeText={setAddress} />
          </View>

          {/* Email */}
          <View style={styles.box}>
            <Text style={styles.title}>Địa chỉ email:</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="email" size={20} color="#333" />
              <TextInput
                style={styles.textInputFlex}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* SĐT */}
          <View style={styles.box}>
            <Text style={styles.title}>Số điện thoại:</Text>
            <View style={styles.inputRow}>
              <FontAwesome name="phone" size={20} color="#333" />
              <TextInput
                style={styles.textInputFlex}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* CCCD */}
          <View style={styles.box}>
            <Text style={styles.title}>Căn cước công dân:</Text>
            <TextInput
              style={styles.input}
              value={cccd}
              onChangeText={setCccd}
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>
      {GenderModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingHorizontal: 20,

  },
  box: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
  },
  editText: {
    color: '#0d6efd',
    fontWeight: 'bold',
    fontSize: 13,
  },
  label: {
    fontSize: 13,
    marginBottom: 5,
    color: '#000000ff',
  },
  input: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    height: 40,
  },
  textInputFlex: {
    flex: 1,
    marginLeft: 8,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    height: 40,
    // Dùng alignSelf: 'stretch' và justifyContent: 'center' để fix lỗi Picker
    justifyContent: 'center',
    alignSelf: 'stretch',
    overflow: 'hidden', // Quan trọng cho iOS
  },
  // Styles mới cho Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền tối
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalOption: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionSelected: {
    // Không cần thêm style border, chỉ thay đổi text color
  },
  modalText: {
    fontSize: 15,
    color: '#333',
  },
  modalTextSelected: {
    fontWeight: 'bold',
    color: '#0d6efd', // Màu xanh nổi bật
  }
});