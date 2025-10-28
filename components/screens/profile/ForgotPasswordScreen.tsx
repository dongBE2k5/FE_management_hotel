import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { sendOtp } from "@/service/UserAPI";
import { Ionicons } from "@expo/vector-icons"; // cần cài expo install @expo/vector-icons
import BannerLogin from "../../userProfile/bannerLogin";
export default function ForgotPasswordScreen({ navigation }: any) {
    const [email, setEmail] = useState("");

    const handleSendOtp = async () => {
        if (!email) {
            Alert.alert("Thiếu thông tin", "Vui lòng nhập email đã đăng ký!");
            return;
        }
        type Props = {
            title: string;
            subtitle: string;
        };
        const res = await sendOtp(email);
        Alert.alert(res.success ? "Thành công" : "Lỗi", res.message);

        if (res.success) {
            navigation.navigate("ResetPassword", { email });
        }
    };

    return (
        <View >
           <BannerLogin title="Quên mật khẩu" subtitle="nhập email để nhận mã otp" />

    

            <Text style={styles.title}>Quên mật khẩu</Text>
            <Text style={styles.subtitle}>
                Nhập email bạn đã đăng ký để nhận mã OTP
            </Text>

            <View style={{margin:10}}>
                <TextInput
                style={styles.input}
                placeholder="Nhập email"
                placeholderTextColor="#333" // màu chữ placeholder đậm hơn
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
                <Text style={styles.buttonText}>Gửi OTP</Text>
            </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
        backgroundColor: "#fff"
    },
    backButton: {
        position: "absolute",
        top: 50, // căn theo khoảng status bar
        left: 20,

        padding: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        elevation: 3,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center"
    },
    subtitle: {
        color: "#555",
        textAlign: "center",
        marginBottom: 20
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#007BFF",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16
    },
});
