import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {
  onChange?: (items: string[]) => void; // 👈 thêm
};

export default function SpecialRequest({ onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const options = [
    'Phòng tầng cao',
    'Không hút thuốc',
    'Có nôi cho trẻ em',
    'Check-in sớm',
    'View biển/ thành phố',
  ];

  const toggleItem = (item: string) => {
    setSelected(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  // 🔑 Gửi dữ liệu lên cha mỗi khi selected thay đổi
  useEffect(() => {
    onChange?.(selected);
  }, [selected]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setVisible(true)}>
        {selected.length === 0 ? (
          <Text style={styles.placeholder}>Chọn yêu cầu</Text>
        ) : (
          <View style={styles.selectedBox}>
            {selected.map((item, index) => (
              <View key={item}>
                <Text style={styles.selectedText}>{item}</Text>
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
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => toggleItem(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                  {selected.includes(item) && (
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
  },
  optionText: { fontSize: 14, color: '#000' },
  closeBtn: { marginTop: 12, backgroundColor: '#009EDE', paddingVertical: 10, borderRadius: 8 },
  closeText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
