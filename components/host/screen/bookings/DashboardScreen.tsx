import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Component con cho mỗi nút chức năng
const DashboardButton = ({ icon, title, onPress }) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Ionicons name={icon} size={20} color="#007bff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

export default function DashboardScreen() {
    const navigation = useNavigation();

    const handlePress = (featureName) => {
        Alert.alert("Chức năng đang phát triển", `Màn hình "${featureName}" sẽ được cập nhật sớm.`);
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.scrollViewContent}
            >
                <DashboardButton
                    icon="stats-chart-outline"
                    title="Doanh thu"
                    onPress={() => navigation.navigate('revenueDashboard')}
                />
                <DashboardButton
                    icon="git-network-outline"
                    title="Nguồn đặt"
                    onPress={() => handlePress('Phân tích nguồn đặt')}
                />
                <DashboardButton
                    icon="receipt-outline"
                    title="Lịch sử"
                    onPress={() => handlePress('Lịch sử thao tác')}
                />
                {/* Bạn có thể dễ dàng thêm các nút khác ở đây */}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // Không cần flex vì nó được chứa trong View cha
        backgroundColor: '#f0f0f0',
    },
    scrollViewContent: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20, // Bo tròn để tạo hình viên thuốc
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e2e5ea',
        elevation: 2,
        shadowColor: '#a7b0c0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
});