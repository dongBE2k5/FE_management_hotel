// screens/HomeScreen.js
import HeaderProfile from '@/components/HeaderProfile';
import { getRoomByHotel } from '@/service/RoomAPI'; // Đảm bảo đường dẫn này đúng
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Xóa MOCK_TASKS
import { connectAndSubscribe, disconnect, fetchReceivedRequests, updateStatusRequest } from '@/service/Realtime/WebSocketAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import TaskCard from '../modal/TaskCard';

// ==================================================================
// CÁC HÀM XỬ LÝ DỮ LIỆU
// ==================================================================

const mapRoomStatusToTaskStatus = (roomStatus) => {
    switch (roomStatus) {
        case 'NEEDCLEANING':
            return 'todo';
        case 'REQUEST':
            return 'todo'; // Mặc định là 'todo', sẽ được ghi đè bên dưới nếu cần
        case 'CLEANING':
            return 'in-progress';
        case 'AVAILABLE':
            return 'done';
        default:
            return 'todo'; // Mặc định
    }
};

/**
 * Hàm chuyển đổi dữ liệu gộp từ API phòng và API request
 * @param {Array} rooms - Danh sách phòng từ getRoomByHotel
 * @param {Array} receivedRequests - Danh sách request từ fetchReceivedRequests
 * @returns {Array} Danh sách task đã được gộp và xử lý logic
 */
const transformData = (rooms = [], receivedRequests = [], hotelId) => {
    // 1. Chỉ định các trạng thái được phép
    const allowedStatuses = ['NEEDCLEANING', 'AVAILABLE', 'REQUEST', 'CLEANING'];

    // 2. Lọc mảng phòng
    const filteredRooms = rooms.filter(room => allowedStatuses.includes(room.status));

    // 3. Chuyển đổi mảng đã lọc
    return filteredRooms.map(room => {

        // --- LOGIC MỚI: Tinh chỉnh Status và Actionable ---

        // 1. Lấy trạng thái mặc định từ phòng
        let taskStatus = mapRoomStatusToTaskStatus(room.status);
        const taskPriority = (room.status === 'REQUEST') ? 'REQUEST' : 'NORMAL';

        // 2. Khởi tạo các biến
        let isActionable = false;
        let taskId = room.id.toString(); // Mặc định là ID phòng
        let requestId = null;
        let assignmentId = null;
        let isAlowwed = false;
        let title = `Phòng ${room.roomNumber}`;
        let bookingId = null;

        // 3. Xử lý logic
        if (room.status === 'REQUEST') {
            // Tìm request đang PENDING hoặc IN_PROGRESS cho phòng này
            const matchingRequest = receivedRequests.find(
                req => req.roomId === room.id && (req.status === 'PENDING' || req.status === 'IN_PROGRESS')
            );

            if (matchingRequest) {

                console.log("data", matchingRequest.bookingId);

                bookingId = matchingRequest.bookingId ?? null; // ✅ Lấy bookingId đúng chỗ
                console.log("booking", bookingId);


                if (matchingRequest.status === 'PENDING') {
                    // TRƯỜNG HỢP 1: Yêu cầu mới, CHƯA ai nhận
                    taskStatus = 'todo'; // Hiển thị ở cột 'Cần làm'
                    isActionable = true; // Cho phép nhấn
                    isAlowwed = true;
                    taskId = matchingRequest.id.toString(); // Dùng ID của assignment
                    requestId = matchingRequest.requestId.toString();
                    assignmentId = matchingRequest.id.toString();
                    title = `Phòng ${room.roomNumber} (Yêu cầu khẩn)`;

                } else if (matchingRequest.status === 'IN_PROGRESS') {
                    // TRƯỜNG HỢP 2 (ĐÃ SỬA): Yêu cầu đang IN_PROGRESS
                    taskStatus = 'in-progress'; // Hiển thị ở cột 'Đang làm'
                    isActionable = true; // <-- SỬA: Cho phép nhấn để tiếp tục
                    isAlowwed = true;    // <-- SỬA: Cho phép nhấn để tiếp tục
                    taskId = matchingRequest.id.toString();
                    requestId = matchingRequest.requestId.toString();
                    assignmentId = matchingRequest.id.toString();
                    title = `Phòng ${room.roomNumber} (Tiếp tục xử lý YC)`; // Tiêu đề mới
                }
            } else {
                // Phòng là 'REQUEST' nhưng không có request nào (PENDING/IN_PROGRESS)
                taskStatus = 'todo';
                isActionable = false;
                isAlowwed = false;
                title = `Phòng ${room.roomNumber} (Đang chờ xử lý...)`;
            }

        } else if (room.status === 'NEEDCLEANING') {
            // TRƯỜNG HỢP 3: Dọn dẹp thông thường
            taskStatus = 'todo';
            isActionable = true; // Luôn cho phép
            title = `Phòng ${room.roomNumber}`;

        } else if (room.status === 'CLEANING') {
            // TRƯỜNG HỢP 4: Đang dọn
            taskStatus = 'in-progress';
            isActionable = true; // Cho phép nhấn để hoàn thành
            title = `Phòng ${room.roomNumber} (Đang dọn...)`;

        } else if (room.status === 'AVAILABLE') {
            // TRƯỜNG HỢP 5: Hoàn thành
            taskStatus = 'done';
            isActionable = false; // Không cần hành động
            title = `Phòng ${room.roomNumber} (Sẵn sàng)`;
        }
        // --- KẾT THÚC LOGIC MỚI ---

        return {
            id: taskId,
            roomId: room.id.toString(),
            roomNumber: room.roomNumber,
            roomTypeId: room.typeOfRoomId,
            title: title,
            description: room.description,
            status: taskStatus,
            priority: taskPriority,
            typeRoom: room.typeRoom,
            actionable: isActionable,
            requestId: requestId,
            assignmentId: assignmentId,
            allowed: isAlowwed,
            bookingId: bookingId,
            hotelId: hotelId
        };
    });
};


// ==================================================================
// CÁC COMPONENT GIAO DIỆN (Giữ nguyên)
// ==================================================================
const TaskFilter = ({ activeFilter, onChange }) => {
    const filters = [
        { key: 'todo', label: 'Cần làm' },
        { key: 'in-progress', label: 'Đang làm' },
        { key: 'done', label: 'Hoàn thành' },
    ];

    return (
        <View style={styles.filterContainer}>
            {filters.map((filter) => (
                <TouchableOpacity
                    key={filter.key}
                    style={[
                        styles.filterButton,
                        activeFilter === filter.key && styles.filterButtonActive
                    ]}
                    onPress={() => onChange(filter.key)}
                >
                    <Text style={[
                        styles.filterText,
                        activeFilter === filter.key && styles.filterTextActive
                    ]}>
                        {filter.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const StatsCards = ({ stats = { todo: 0, incidents: 0, done: 0 } }) => (
    <View style={styles.statsContainer}>
        <View style={styles.statCard}>
            <Ionicons name="list-outline" size={24} color="#0062E0" />
            <Text style={styles.statNumber}>{stats.todo}</Text>
            <Text style={styles.statLabel}>Cần xử lý</Text>
        </View>
        <View style={styles.statCard}>
            <Ionicons name="alert-circle-outline" size={24} color="#E53E3E" />
            <Text style={styles.statNumber}>{stats.incidents}</Text>
            <Text style={styles.statLabel}>Sự cố</Text>
        </View>
        <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#38A169" />
            <Text style={styles.statNumber}>{stats.done}</Text>
            <Text style={styles.statLabel}>Đã dọn</Text>
        </View>
    </View>
);

const EmptyState = ({ message, title }) => (
    <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-done-circle-outline" size={60} color="#CBD5E0" />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyMessage}>{message}</Text>
    </View>
);

// ==================================================================
// COMPONENT CHÍNH (ĐÃ SỬA)
// ==================================================================

export default function CleaningStaffScreen() {

    const navigation = useNavigation();

    // State
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('todo');

    // Memoized Lọc dữ liệu
    const filteredTasks = useMemo(() =>
        allTasks.filter(task => task.status === activeFilter),
        [allTasks, activeFilter]
    );

    // Memoized Tính toán số liệu thống kê
    const stats = useMemo(() => {
        const todo = allTasks.filter(t => t.status === 'todo').length;
        const incidents = allTasks.filter(t => t.priority === 'REQUEST' && t.status !== 'done').length;
        const done = allTasks.filter(t => t.status === 'done').length;
        return { todo, incidents, done };
    }, [allTasks]);


    // Lấy dữ liệu từ API và kết nối WebSocket
    useFocusEffect(
        useCallback(() => {
            let isMounted = true;
            let userId = null;

            // 1. Định nghĩa hàm setup WebSocket
            const setupWs = (currentUserId) => {
                connectAndSubscribe(currentUserId, {
                    onConnected: () => console.log('✅ WebSocket connected from CleaningStaffScreen'),
                    onDisconnected: () => console.log('❌ WebSocket disconnected from CleaningStaffScreen'),
                    onError: (error) => console.error('⚠️ WebSocket error:', error),

                    onMessageReceived: async (newRequest) => {
                        console.log("📩 Nhận request realtime:", newRequest);
                        if (newRequest) {
                            Toast.show({
                                type: 'info',
                                text1: 'Có yêu cầu mới 🚨',
                                // text2: `Khách hàng đã hoàn tất thanh toán cho booking${data.bookingId ? ` (ID: ${data.bookingId})` : ''}.`,
                            });
                        }
                        try {
                            const currentUserId = userId || Number(await AsyncStorage.getItem("userId"));
                            if (!currentUserId) return;
                            const hotelIdStr = await AsyncStorage.getItem('hotelID');
                            const hotelId = hotelIdStr ? Number(hotelIdStr) : null;
                            if (!hotelId) {
                                console.error("Hotel ID không hợp lệ.");
                                return;
                            }
                            const [rooms, receivedRequests] = await Promise.all([
                                getRoomByHotel(hotelId),
                                fetchReceivedRequests(currentUserId)
                            ]);

                            if (isMounted) {
                                const transformedTasks = transformData(rooms, receivedRequests, hotelId);
                                setAllTasks(transformedTasks);
                            }
                        } catch (error) {
                            console.error("❌ Lỗi khi xử lý request realtime:", error);
                        }
                    },
                });
            };

            // 2. Định nghĩa hàm tải dữ liệu chính
            const loadDataAndConnect = async () => {
                try {
                    if (isMounted) setIsLoading(true);

                    const userIdStr = await AsyncStorage.getItem("userId");
                    if (!userIdStr) {
                        console.warn("⚠️ Không tìm thấy userId trong AsyncStorage");
                        return;
                    }
                    userId = Number(userIdStr);
                    const hotelIdStr = await AsyncStorage.getItem('hotelID');
                    const hotelId = hotelIdStr ? Number(hotelIdStr) : null;
                    if (!hotelId) {
                        console.error("Hotel ID không hợp lệ.");
                        return;
                    }
                    const [rooms, receivedRequests] = await Promise.all([
                        getRoomByHotel(hotelId),
                        fetchReceivedRequests(userId)
                    ]);

                    if (!isMounted) return;

                    const transformedTasks = transformData(rooms, receivedRequests,hotelId);
                    setAllTasks(transformedTasks);

                    setupWs(userId);

                } catch (error) {
                    console.error("Lỗi khi tải dữ liệu ban đầu:", error);
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            };

            // 3. Chạy hàm tải dữ liệu
            loadDataAndConnect();

            // 4. Hàm dọn dẹp khi unmount
            return () => {
                isMounted = false;
                disconnect();
                console.log("Disconnected WebSocket và unmounted CleaningStaffScreen");
            };
        }, []) // Dependency rỗng để chỉ chạy 1 lần khi focus
    );

    // Xử lý hành động nhấn nút
    const handleTaskAction = async (taskId, status, priority, item) => {
        const nextStatusMap = { 'todo': 'in-progress', 'in-progress': 'done' };

        // 1️⃣ Xử lý logic cho YÊU CẦU KHẨN (REQUEST)
        if (priority === "REQUEST") {

            if (status === 'todo') {
                // --- Bắt đầu một task REQUEST ---

                // 1a. Optimistic UI: todo -> in-progress và cho phép tiếp tục
                setAllTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === taskId
                            ? { ...task, status: 'in-progress', actionable: true, title: `Phòng ${item.roomNumber} (Tiếp tục xử lý YC)` }
                            : task
                    )
                );

                // 1b. API Call: Cập nhật trạng thái
                try {
                    await updateStatusRequest(item.requestId, "RECEIVED", item.roomId, item.assignmentId);
                    console.log(`✅ Đã nhận yêu cầu khẩn ${taskId} -> RECEIVED`);
                } catch (error) {
                    console.error("❌ Lỗi cập nhật trạng thái request:", error);
                    // Cần rollback UI ở đây nếu lỗi
                }
                console.log("item", item);

                // 1c. Navigation
                navigation.navigate("CheckRoomScreen", {
                    id: item.roomId,
                    roomNumber: item.roomNumber,
                    roomTypeId: item.roomTypeId,
                    requestId: item.requestId,
                    assignmentId: item.assignmentId,
                    bookingId: item.bookingId,
                    hotelId: item.hotelId
                });

            } else if (status === 'in-progress') {
                // --- Tiếp tục một task REQUEST (Yêu cầu mới) ---

                // 1a. KHÔNG cập nhật UI (nó đã ở 'in-progress')
                // 1b. KHÔNG gọi API (chỉ là vào lại màn hình)

                // 1c. Chỉ Navigation
                console.log(`Tiếp tục xử lý yêu cầu ${taskId}`);
                navigation.navigate("CheckRoomScreen", {
                    id: item.roomId,
                    roomNumber: item.roomNumber,
                    roomTypeId: item.roomTypeId,
                    requestId: item.requestId,
                    assignmentId: item.assignmentId,
                    bookingId: item.bookingId,
                    hotelId: item.hotelId
                });
            }

        } else {
            // 2️⃣ Xử lý logic cho DỌN DẸP THƯỜNG (NORMAL)

            const nextStatus = nextStatusMap[status];
            if (nextStatus) {
                // 2a. Optimistic UI
                setAllTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === taskId ? { ...task, status: nextStatus } : task
                    )
                );

                // 2b. API Call (ví dụ)
                try {
                    if (status === 'todo') {
                        // await updateRoomStatus(taskId, 'CLEANING');
                        console.log(`Bắt đầu dọn phòng ${taskId}`);
                    } else if (status === 'in-progress') {
                        // await updateRoomStatus(taskId, 'AVAILABLE');
                        console.log(`Hoàn thành dọn phòng ${taskId}`);
                    }
                } catch (error) {
                    console.error("Lỗi cập nhật trạng thái phòng:", error);
                }
            }
        }
    };

    // Hiển thị loading
    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#0062E0" />
            </View>
        );
    }

    // Giao diện chính
    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <>
                        <HeaderProfile />
                        <StatsCards stats={stats} />

                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={22} color="#A0AEC0" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tìm kiếm số phòng..."
                                placeholderTextColor="#A0AEC0"
                            />
                        </View>

                        <TaskFilter
                            activeFilter={activeFilter}
                            onChange={setActiveFilter}
                        />
                    </>
                }
                data={filteredTasks}
                keyExtractor={item => item.roomId}
                renderItem={({ item }) => (
                    <TaskCard
                        task={item}
                        onAction={() => handleTaskAction(item.id, item.status, item.priority, item)}
                    />
                )}
                ListEmptyComponent={
                    <EmptyState title="Không có công việc" message="Bạn đã hoàn thành mọi thứ!" />
                }
                contentContainerStyle={{ paddingBottom: 20 }}
                style={styles.list}
            />
        </View>
    );
}

// ==================================================================
// STYLES (Giữ nguyên)
// ==================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F8FA',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        backgroundColor: '#F5F8FA',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginTop: 20,
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
        elevation: 3,
        shadowColor: '#1A202C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A202C',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#718096',
        marginTop: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 20,
        marginTop: 20,
        paddingHorizontal: 15,
        elevation: 2,
        shadowColor: '#1A202C',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    searchInput: {
        flex: 1,
        height: 50,
        marginLeft: 10,
        fontSize: 16,
        color: '#1A202C',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 15,
        backgroundColor: '#EDF2F7',
        borderRadius: 10,
        padding: 4,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#FFFFFF',
        elevation: 1,
        shadowColor: '#1A202C',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#718096',
    },
    filterTextActive: {
        color: '#0062E0',
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        padding: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4A5568',
        marginTop: 10,
    },
    emptyMessage: {
        fontSize: 16,
        color: '#A0AEC0',
        marginTop: 5,
        textAlign: 'center',
    },
});