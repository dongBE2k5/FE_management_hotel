import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { resetPassword } from "@/service/UserAPI";
import { Ionicons } from "@expo/vector-icons";
import BannerLogin from "../../userProfile/bannerLogin";
export default function ResetPasswordScreen({ route, navigation }: any) {
    const { email } = route.params;
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleReset = async () => {
        if (!otp || !newPassword) {
            Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ OTP và mật khẩu mới!");
            return;
        }
        type Props = {
            title: string;
            subtitle: string;
        };
        const res = await resetPassword(email, otp, newPassword);
        Alert.alert(res.success ? "Thành công" : "Lỗi", res.message);

        if (res.success) {
            navigation.navigate("Login");
        }
    };

    return (
        <View>
            <BannerLogin title="Đặt lại mật khẩu" subtitle="Nhập mã otp để xác nhận đặt lại mật khẩu" />
         


            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.subtitle}>
                Nhập OTP và mật khẩu mới cho tài khoản {email}
            </Text>

            <View style={{margin:10}}>
                 <TextInput
                style={styles.input}
                placeholder="Nhập mã OTP"
                placeholderTextColor="#333"
                value={otp}
                onChangeText={setOtp}
            />
            <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor="#333"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleReset}>
                <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
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
        backgroundColor: "#fff",
    },
    backButton: {
        position: "absolute",
        top: 50,
        left: 20,

        padding: 8,

        elevation: 2,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        color: "#555",
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        fontWeight: "500",
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
        fontSize: 16,
    },
});
