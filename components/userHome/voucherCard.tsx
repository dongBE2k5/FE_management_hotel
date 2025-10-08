import { StyleSheet, Text, View, ImageBackground } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function VoucherCard() {
    return (
        <View style={styles.vouchercard}>
            <View style={styles.card}>
                {/* Icon và text cùng hàng */}
                <View style={styles.iconRow}>
                    <Ionicons name="bed" size={24} color="#000" />
                    <Text style={styles.titleText}>Voucher dành cho bạn mới</Text>
                </View>
                <Text style={styles.descriptionText}>Đặt khách sạn từ 2.5 triệu</Text>
            </View>
            <View style={{
                backgroundColor: 'white',
                width: 175,
                padding: 5,
                borderRadius: 5,
            }}>
                <View style={styles.iconRow}>
                    <View style={{ backgroundColor: '#D9D9D9', padding: 5, alignItems: 'center', width: 120, borderRadius: 5 }}>
                        <View style={styles.iconRow}>
                            <Ionicons name="copy-outline" size={10} color="#000" />
                            <Text style={{ fontSize: 10, marginLeft: 5 }}>VNEPICTHANKYOU</Text>

                        </View>
                    </View>
                    <View style={{ backgroundColor: '#A9FFFB', padding: 5, alignItems: 'center', width:40, borderRadius: 5 ,marginLeft:5}}>
                           <Text style={{ fontSize: 10, marginLeft: 5 }}>Copy</Text>
                    </View>
                </View>
            </View>
        </View>


    );
}

const styles = StyleSheet.create({
    vouchercard: {
        marginTop: 10,
        marginLeft: 10,
    },
    card: {
        borderBottomWidth: 1,
        borderStyle: 'dashed',
        backgroundColor: 'white',
        width: 175,
        padding: 5,
        borderRadius: 5,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 10,
        marginLeft: 5,
    },
    descriptionText: {
        fontSize: 10,
        marginLeft: 5,
        marginTop: 5,
        color: '#534F4F',
    },
});
