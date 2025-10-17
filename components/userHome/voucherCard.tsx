import { StyleSheet, Text, View } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import Voucher from '@/models/Voucher';

interface VoucherCardProps {
  voucher: Voucher;
  onSave?: (voucher: Voucher) => void;
  isSaved?: boolean; // 👈 thêm prop này
}

export default function VoucherCard({ voucher, onSave, isSaved }: VoucherCardProps) {
  const usedPercent = ((voucher.used || 0) / voucher.quantity) * 100;

  return (
    <View style={styles.vouchercard}>
      <View style={styles.card}>
        <View style={styles.iconRow}>
          <Ionicons name="bed" size={24} color="#000" />
          <Text style={styles.titleText}>{voucher.name}</Text>
        </View>
        <Text style={styles.descriptionText}>{voucher.description}</Text>
      </View>

      <View style={styles.bottomCard}>
        <Text style={{ fontSize: 10, marginBottom: 2 }}>
          Đã dùng {voucher.used || 0}/{voucher.quantity} ({usedPercent.toFixed(0)}%)
        </Text>

        <View style={styles.iconRow}>
          <View style={styles.codeBox}>
            <View style={styles.iconRow}>
              <Ionicons name="copy-outline" size={10} color="#000" />
              <Text style={{ fontSize: 10, marginLeft: 5 }}>{voucher.code}</Text>
            </View>
          </View>

          {isSaved ? (
            <View style={[styles.saveBtn, { backgroundColor: '#B8F6BE' }]}>
              <Text style={{ fontSize: 8, color: 'green', fontWeight: 'bold' }}>Đã lưu</Text>
            </View>
          ) : (
            <View style={styles.saveBtn}>
              <Text
                style={{ fontSize: 10 }}
                onPress={() => onSave && onSave(voucher)}
              >
                Lưu
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vouchercard: { marginTop: 10, marginLeft: 10 },
  card: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: 'white',
    width: 175,
    padding: 5,
    borderRadius: 5,
  },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  titleText: { fontSize: 10, marginLeft: 5 },
  descriptionText: { fontSize: 10, marginLeft: 5, marginTop: 5, color: '#534F4F' },
  bottomCard: {
    backgroundColor: 'white',
    width: 175,
    padding: 5,
    borderRadius: 5,
  },
  codeBox: {
    backgroundColor: '#D9D9D9',
    padding: 5,
    alignItems: 'center',
    width: 120,
    borderRadius: 5,
  },
  saveBtn: {
    backgroundColor: '#A9FFFB',
    padding: 5,
    alignItems: 'center',
    width: 40,
    borderRadius: 5,
    marginLeft: 5,
  },
});
