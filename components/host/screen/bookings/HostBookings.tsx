import ListRoom from "@/components/employee_staff/screen/listRoom";
import { StyleSheet, View } from "react-native";
import DashboardScreen from "./DashboardScreen";

export default function HostBookings() {
    return (
        // Bọc trong một View cha với flex: 1
        <View style={styles.pageContainer}>
            <View style={styles.dashboardContainer}>
                <DashboardScreen />
            </View>
            <View style={styles.listContainer}>
                <ListRoom />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: '#f0f0f0', // Thêm màu nền chung
    },
    dashboardContainer: {
        // Không cần flex, nó sẽ tự động co giãn theo nội dung
        paddingTop: 50, // Giữ lại padding top cho status bar
    },
    listContainer: {
        flex: 1, // ListRoom sẽ chiếm toàn bộ không gian còn lại
    }
});