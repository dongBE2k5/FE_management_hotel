import { StyleSheet, Text, View, ImageBackground,ScrollView } from "react-native";
import VoucherCard from "./voucherCard";

export default function VoucherZone() {
    return (
        <View style={styles.voucherzone}>
            <ImageBackground
                source={require("../assets/images/bgvoucher.png")}
                style={styles.background}
                resizeMode="cover"
            >
                <Text style={styles.text}>Coupon EPIC tri ân</Text>
                <View style={{ backgroundColor: '#0F4DEB', width: 100, padding: 10, borderRadius: 10, alignItems: 'center', marginLeft: 10 }}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Khách sạn</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
                    <VoucherCard />
                    <VoucherCard />
                    <VoucherCard />
                    <VoucherCard />
                </ScrollView>

            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    voucherzone: {

    },
    background: {
        transform: [{ translateY: -20 }],
        width: '100%',
        height: 200,
        overflow: 'hidden',       // để bo góc ảnh nếu cần
    },
    text: {
        margin: 10,
        color: '#534F4F',
        fontWeight: '700',
        fontSize: 20,
    },
       cardScroll: {
        marginTop: 10,
    },
});
