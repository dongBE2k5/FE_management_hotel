import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type HotelReviewDialogProps = {
    visible: boolean;
    onClose: () => void;
    hotelName: string;
};


export default function HotelReviewDialog({
    visible,
    onClose,
    hotelName,
}: HotelReviewDialogProps) {
    const [rating, setRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [comment, setComment] = useState('');

    const tags = ['Phòng sạch', 'Nội thất', 'Nhân viên thân thiện', 'Vị trí tốt', 'Đồ ăn ngon'];

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
        Alert.alert('Cảm ơn bạn!', `Đánh giá ${rating} sao cho ${hotelName}`);
        onClose(); // đóng dialog sau khi gửi
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <ScrollView>
                        <Text style={styles.header}>{hotelName}</Text>
                        <Text style={styles.subHeader}>Hãy chia sẻ trải nghiệm của bạn</Text>

                        {/* ⭐ Đánh giá sao */}
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

                        {/* Tag */}
                        <Text style={styles.sectionTitle}>Những điều bạn thích nhất</Text>
                        <View style={styles.tagsContainer}>
                            {tags.map((tag) => (
                                <TouchableOpacity
                                    key={tag}
                                    style={[styles.tag, selectedTags.includes(tag) && styles.tagSelected]}
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

                        {/* Nút */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
                                <Text style={styles.cancelText}>HỦY</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.submitBtn]} onPress={handleSubmit}>
                                <Text style={styles.submitText}>GỬI</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dialog: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        maxHeight: '90%',
    },
    header: { fontSize: 18, fontWeight: '700', color: '#333' },
    subHeader: { color: '#777', marginVertical: 10 },
    starContainer: { flexDirection: 'row', marginVertical: 10 },
    sectionTitle: { fontWeight: '600', color: '#333', marginTop: 20, marginBottom: 10 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    tag: {
        borderColor: '#73c5fc',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        margin: 4,
    },
    tagSelected: { backgroundColor: '#73c5fc' },
    tagText: { color: '#73c5fc', fontSize: 13 },
    tagTextSelected: { color: '#fff' },
    textArea: {
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        textAlignVertical: 'top',
        color: '#333',
    },
    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
    btn: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 8,
        marginLeft: 8,
    },
    cancelBtn: { backgroundColor: '#ddd' },
    submitBtn: { backgroundColor: '#73c5fc' },
    cancelText: { color: '#333', fontWeight: '600' },
    submitText: { color: '#fff', fontWeight: '700' },
});
