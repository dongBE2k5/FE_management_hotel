import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HotelReviewForm({ hotelName = 'Khách sạn Alibaba Đà Nẵng' }) {
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  const tags = ['Phòng sạch', 'Nội thất sạch', 'Nhân viên thân thiện', 'Dịch vụ tốt'];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao đánh giá!');
      return;
    }
    Alert.alert(
      'Cảm ơn bạn!',
      `Bạn đã đánh giá ${rating} sao cho ${hotelName}\n\nNội dung: ${comment || '(không có)'}`
    );
    // 🧭 Có thể gửi dữ liệu lên API tại đây
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{hotelName}</Text>
      <Text style={styles.subHeader}>Hãy chia sẻ trải nghiệm của bạn</Text>

      {/* Đánh giá sao */}
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <Ionicons
              name={i <= rating ? 'star' : 'star-outline'}
              size={32}
              color={i <= rating ? '#FFD700' : '#ccc'}
              style={{ marginHorizontal: 4 }}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Các tiêu chí */}
      <Text style={styles.sectionTitle}>Những điều bạn thích nhất</Text>
      <View style={styles.tagsContainer}>
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tag,
              selectedTags.includes(tag) && styles.tagSelected,
            ]}
            onPress={() => toggleTag(tag)}
          >
            <Text
              style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.tagTextSelected,
              ]}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bình luận */}
      <Text style={styles.sectionTitle}>Chia sẻ cảm nhận của bạn</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={4}
        placeholder="Ví dụ: Phòng đẹp, nhân viên nhiệt tình..."
        value={comment}
        onChangeText={setComment}
      />

      {/* Nút gửi */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>GỬI ĐÁNH GIÁ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  subHeader: {
    color: '#777',
    marginTop: 4,
    marginBottom: 16,
  },
  starContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderColor: '#73c5fcff',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  tagSelected: {
    backgroundColor: '#73c5fcff',
  },
  tagText: {
    color: '#73c5fcff',
    fontSize: 13,
  },
  tagTextSelected: {
    color: '#fff',
  },
  textArea: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#73c5fcff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
});
