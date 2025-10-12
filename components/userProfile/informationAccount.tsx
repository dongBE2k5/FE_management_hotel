
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from "@react-navigation/native";
import React, { useState ,useCallback} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import HeaderProfile from './headerProfile';


import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@/context/UserContext';

export default function AccountInfo() {
  const [gender, setGender] = useState('Nam');
  const [date, setDate] = useState(new Date(2005, 9, 1));
  const [showDate, setShowDate] = useState(false);
  const navigation = useNavigation();

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDate(false);
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
    }
  };

  const { user, refreshUser } = useUser();

  // Làm mới user mỗi khi Header được focus
  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, [])
  );
  return (
    <View style={{ backgroundColor: '#ddd' }}>

      <HeaderProfile />

      <View
        style={styles.container}
      >
        {/* Box Thông tin cá nhân */}
        <View style={styles.box}>
          {/* Icon mũi tên */}
          <View style={{ marginBottom: 5 }}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
              <Ionicons name="arrow-back" size={20} color="#009EDE" />
            </Pressable>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.title}>Thông tin cá nhân</Text>
            <TouchableOpacity>
              <Text style={styles.editText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>

          {/* Họ và tên */}
          <Text style={styles.label}>Họ và tên:</Text>
          <TextInput
            style={styles.input}
            defaultValue={user?.data?.fullName}
          />

          {/* Ngày sinh */}
          <Text style={styles.label}>Ngày sinh:</Text>
          <TouchableOpacity
            style={styles.inputRow}
            onPress={() => setShowDate(true)}
          >
            <Text style={{ flex: 1 }}>
              {date.toLocaleDateString('vi-VN')}
            </Text>
            <MaterialIcons name="calendar-today" size={20} color="#333" />
          </TouchableOpacity>
          {showDate && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}

          {/* Giới tính */}
          <Text style={styles.label}>Giới tính:</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={{ flex: 1 }}
            >
              <Picker.Item label="Nam" value="Nam" />
              <Picker.Item label="Nữ" value="Nữ" />
              <Picker.Item label="Khác" value="Khác" />
            </Picker>
          </View>

          {/* Địa chỉ */}
          <Text style={styles.label}>Địa chỉ:</Text>
          <TextInput style={styles.input} defaultValue="Thành phố Thủ Đức" />
        </View>

        {/* Box Email */}
        <View style={styles.box}>
          <Text style={styles.title}>Địa chỉ email:</Text>
          <View style={styles.inputRow}>
            <MaterialIcons name="email" size={20} color="#333" />
            <TextInput
              style={styles.textInputFlex}
              defaultValue={user?.data?.email}
            />
          </View>
        </View>

        {/* Box SĐT */}
        <View style={styles.box}>
          <Text style={styles.title}>Số điện thoại:</Text>
          <View style={styles.inputRow}>
            <FontAwesome name="phone" size={20} color="#333" />
            <TextInput
              style={styles.textInputFlex}
              defaultValue={user?.data?.phone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Box CCCD */}
        <View style={styles.box}>
          <Text style={styles.title}>Căn cước công dân:</Text>
          <TextInput
            style={styles.input}
            defaultValue={user?.data?.cccd}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container chính chứa tất cả các box
  container: {
    marginTop: 10,
    paddingHorizontal: 20,   // khoảng cách trái/phải bên trong lề (giúp box cách mép màn hình)
    transform: [{ translateY: -50 }],
  },

  // Kiểu dùng cho từng "box" (ô trắng bo tròn có shadow)
  box: {
    width: '100%',           // chiếm toàn bộ chiều ngang trong container (với padding của container)
    backgroundColor: '#fff', // nền trắng cho box
    borderRadius: 12,        // bo góc tròn cho box
    marginBottom: 15,        // khoảng cách giữa các box
    padding: 10,             // khoảng cách nội bộ giữa viền box và nội dung
    // shadow cho iOS:
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // dịch chuyển bóng sang dưới
    shadowOpacity: 0.1,     // độ đậm của bóng (iOS)
    shadowRadius: 4,        // độ mờ/blur của bóng (iOS)
    elevation: 3,           // shadow cho Android (giá trị càng lớn => bóng càng rõ)
  },

  // Hàng dùng để căn hai phần trái/phải (title và nút chỉnh sửa)
  rowBetween: {
    flexDirection: 'row',       // sắp hàng ngang
    justifyContent: 'space-between', // đẩy 2 phần xa nhau (space-between)
    alignItems: 'center',       // căn giữa theo chiều dọc
    marginBottom: 10,           // khoảng cách dưới hàng này
  },

  // Tiêu đề box (ví dụ "Thông tin cá nhân")
  title: {
    fontWeight: 'bold', // chữ đậm
    fontSize: 14,       // cỡ chữ tiêu đề
    marginBottom: 8,    // khoảng cách dưới tiêu đề
  },

  // Text cho nút "Chỉnh sửa" (màu xanh)
  editText: {
    color: '#0d6efd',   // màu xanh (có thể thay theo design)
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Nhãn (label) trước mỗi input (ví dụ "Họ và tên:")
  label: {
    fontSize: 13,
    marginBottom: 5,    // khoảng cách giữa label và input
    color: '#333',      // màu chữ nhạt
  },

  // Kiểu chung cho TextInput dạng ô (nền hơi khác, border)
  input: {
    width: '100%',              // chiếm hết chiều ngang box (trừ padding)
    backgroundColor: '#f9f9f9', // nền nhẹ để phân biệt với box
    borderRadius: 8,            // bo góc ô input
    paddingHorizontal: 12,      // padding bên trái/phải trong input
    paddingVertical: 8,         // padding trên/dưới trong input
    borderWidth: 1,             // viền mỏng
    borderColor: '#ccc',        // màu viền xám nhạt
    marginBottom: 12,           // khoảng cách dưới input
  },

  // Kiểu cho hàng input có icon + text (ví dụ email, phone)
  inputRow: {
    flexDirection: 'row',       // sắp hàng ngang: icon + text
    alignItems: 'center',       // căn giữa theo chiều dọc
    backgroundColor: '#f9f9f9', // nền giống input
    borderRadius: 8,
    paddingHorizontal: 10,      // padding bên trong hàng
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    height: 40,                 // chiều cao cố định cho hàng (giữ đều)
  },

  // Khi text input nằm bên trong row, text chiếm phần còn lại
  textInputFlex: {
    flex: 1,        // chiếm phần còn lại của dòng sau icon
    marginLeft: 8,  // cách icon một chút
  },

  // Hộp chứa Picker (dropdown) - để có viền/nền giống input
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    height: 40,           // chiều cao cố định để Picker hiển thị vừa
    justifyContent: 'center', // căn giữa nội dung theo chiều dọc
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#009EDE',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  stickyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 30,
  },
});
