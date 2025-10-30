// screens/HomeScreen.js
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { MOCK_TASKS } from '../modal/mockData';
import HeaderProfile from '@/components/HeaderProfile';
import TaskCard from '../modal/TaskCard';

// Component cho màn hình trống
const EmptyState = ({ message, title }) => (
    <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-done-circle-outline" size={60} color="#CBD5E0" />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyMessage}>{message}</Text>
    </View>
);

// Component thống kê (thiết kế lại)
const StatsCards = () => (
    <View style={styles.statsContainer}>
        <View style={styles.statCard}>
            <Ionicons name="list-outline" size={24} color="#0062E0" />
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Cần xử lý</Text>
        </View>
        <View style={styles.statCard}>
            <Ionicons name="alert-circle-outline" size={24} color="#E53E3E" />
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Sự cố</Text>
        </View>
        <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#38A169" />
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Đã dọn</Text>
        </View>
    </View>
);


export default function CleaningStaffScreen({ route }) {
    const [allTasks, setAllTasks] = useState(MOCK_TASKS);

    const statusMap = {
        'Cần làm': 'todo',
        'Đang làm': 'in-progress',
        'Hoàn thành': 'done',
    };
    const currentStatus = statusMap[route.name];

    const filteredTasks = useMemo(() =>
        allTasks.filter(task => task.status === currentStatus),
        [allTasks, currentStatus]
    );

    const handleTaskAction = (taskId, status) => {
        const nextStatus = { 'todo': 'in-progress', 'in-progress': 'done' };
        if (nextStatus[status]) {
            setAllTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, status: nextStatus[status] } : task
                )
            );
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <>
                        <HeaderProfile />
                        <StatsCards />

                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={22} color="#A0AEC0" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tìm kiếm số phòng..."
                                placeholderTextColor="#A0AEC0"
                            />
                        </View>
                        <Text style={styles.listTitle}>{route.name}</Text>
                    </>
                }
                data={filteredTasks}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <TaskCard task={item} onAction={handleTaskAction} />}
                ListEmptyComponent={
                    <EmptyState title="Không có công việc" message="Bạn đã hoàn thành mọi thứ!" />
                }
                contentContainerStyle={{ paddingBottom: 20 }}
                style={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F8FA', // Nền xám siêu nhạt
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
        margin: 20,
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
    listTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A202C',
        marginHorizontal: 20,
        marginBottom: 15,
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