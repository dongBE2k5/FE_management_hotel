// components/TaskCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TaskCard = ({ task, onAction }) => {
  // Cấu hình màu sắc
  const priorityColors = {
    urgent: '#E53E3E', // Đỏ
    maintenance: '#0062E0', // Xanh dương
    default: '#D69E2E', // Vàng
  };

  // Cấu hình nút bấm
  const buttonConfig = {
    todo: { text: 'Bắt đầu', color: '#0062E0', textColor: '#FFFFFF' },
    'in-progress': { text: 'Hoàn thành', color: '#38A169', textColor: '#FFFFFF' }, // Xanh lá
    done: { text: 'Đã xong', color: '#EDF2F7', textColor: '#A0AEC0' },
  };

  const barColor = priorityColors[task.priority] || priorityColors.default;
  const currentButton = buttonConfig[task.status] || buttonConfig.todo;
  const iconName = task.priority === 'urgent' ? 'flash-outline' : 'build-outline';

  return (
    <View style={styles.card}>
      {/* Viền ưu tiên */}
      <View style={[styles.priorityBar, { backgroundColor: barColor }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name={iconName} size={20} color={barColor} />
          <Text style={[styles.subtitle, { color: barColor }]}>{task.subtitle}</Text>
        </View>

        <Text style={styles.roomNumber}>Phòng {task.roomNumber}</Text>
        <Text style={styles.title}>{task.title}</Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: currentButton.color }]}
          onPress={() => onAction(task.id, task.status)}
          disabled={task.status === 'done'}
        >
          <Text style={[styles.buttonText, { color: currentButton.textColor }]}>{currentButton.text}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    elevation: 3, // Bóng đổ nhẹ cho Android
    shadowColor: '#1A202C', // Bóng đổ cho iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  priorityBar: {
    width: 6,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  content: {
    padding: 15,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  roomNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  title: {
    fontSize: 16,
    color: '#718096',
    marginTop: 2,
    marginBottom: 15,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TaskCard;