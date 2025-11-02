import { UtilityItem } from '@/models/Utility/Utility';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

type Props = {
  utility: UtilityItem[];
  onChange?: (items: UtilityItem[]) => void; // 👈 thêm
};

export default function SpecialRequest({ utility, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<UtilityItem[]>([]);
  const [quantity, setQuantity] = useState<{ [key: number]: number }>({});
  useEffect(() => {
    setQuantity(Array(utility.length).fill(1));
  }, [utility]);
  // const options = [
  //   'Phòng tầng cao',
  //   'Không hút thuốc',
  //   'Có nôi cho trẻ em',
  //   'Check-in sớm',
  //   'View biển/ thành phố',
  // ];

  const toggleItem = (item: UtilityItem) => {
    setSelected(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  // 🔑 Gửi dữ liệu lên cha mỗi khi selected thay đổi
  useEffect(() => {
    onChange?.(selected.map(item => ({
      ...item,
      quantity: quantity[item.id] || 1
    })));
    
    console.log("selected", selected.map(item => ({
      ...item,
      quantity: quantity[item.id] || 1
    })));
  }, [selected, quantity]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setVisible(true)}>
        {selected.length === 0 ? (
          <Text style={styles.placeholder}>Chọn yêu cầu</Text>
        ) : (
          <View style={styles.selectedBox}>
            {selected?.map((item, index) => (
              <View style={styles.optionRowShow} key={item.id.toString()}>
                <Text style={[styles.optionText, { width: '25%' }]}>{item.name}</Text>
                <Text style={[styles.optionText, { width: '20%', fontWeight: 'bold', fontSize: 12, color: '#5b5b5b' }]}>SL: {quantity[item.id] || 1}</Text>
                <Text style={[styles.optionText, { width: '50%', fontWeight: 'bold', fontSize: 12, color: '#5b5b5b' }]}>Giá: {item.price * Number(quantity[item.id] || 1)} VNĐ</Text>
                {index !== selected.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.title}>Chọn yêu cầu</Text>

            <FlatList
              data={utility}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => toggleItem(item)}
                >
                  <Text style={[styles.optionText, { width: '20%' }]}>{item.name}</Text>
                  {selected?.includes(item) && (
                    <View  style={[styles.quantityContainer, { width: '25%' }]}>
                      <Text style={styles.quantityText}>SL: </Text>
                      <View pointerEvents="box-none">
                        <TouchableWithoutFeedback onPress={() => { }}>
                          <TextInput
                            style={styles.quantityInput}
                            placeholder="Số lượng"
                            value={quantity[item.id]?.toString() ?? '1'}
                            onChangeText={(text) =>
                              setQuantity({ ...quantity, [item.id]: Number(text) })
                            }
                            keyboardType="numeric"
                          />
                        </TouchableWithoutFeedback>

                      </View>
                    </View>
                  )}

                  <Text style={[styles.optionText, { width: '50%', fontWeight: 'bold', fontSize: 14, color: '#5b5b5b' }]}>Giá: {item.price * Number(quantity[item.id] || 1)} VNĐ</Text>
                  {selected?.includes(item) && (
                    <Ionicons name="checkmark" size={20} color="green" />
                  )}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeText}>Xong</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff' },
  placeholder: { color: '#555', fontSize: 13 },
  selectedBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedText: { fontSize: 14, color: '#333', paddingVertical: 6 },
  separator: { height: 1, backgroundColor: '#ddd' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  dialog: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  optionText: { fontSize: 14, color: '#000' },
  closeBtn: { marginTop: 12, backgroundColor: '#009EDE', paddingVertical: 10, borderRadius: 8 },
  closeText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  optionRowShow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
    paddingTop: 10,
  },
  quantityInput: {
    width: 50,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    color: '#000',
  },
});
