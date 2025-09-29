import { Image, ImageBackground, ScrollView, StyleSheet, Text, View, TextInput } from "react-native";
import Slide from "./slideImage";
import RoomCard from "./roomCard";
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RoomZone() {
    return (
        <View style={{ backgroundColor: '#EFEFEF', borderRadius: 15, width: '100%', height: 400 }}>
            <Text style={{ color: '#275DE5', fontWeight: 'bold', margin: 10, fontSize: 20, marginLeft: 10 }}>Phòng có sẵn</Text>
            <View style={{ flexDirection: 'row', backgroundColor: 'white', width: '100%', padding: 10 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}

                >
                    <Text style={{ color: '#009EDE', fontWeight: 'bold', backgroundColor: '#F2F2F2', padding: 10, borderRadius: 10, marginRight: 10 }}>Miễn phí hủy phòng</Text>
                    <Text style={{ color: '#009EDE', fontWeight: 'bold', backgroundColor: '#F2F2F2', padding: 10, borderRadius: 10, marginRight: 10 }}>Miễn phí bữa sáng</Text>

                </ScrollView>
            </View>

            <View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ height: 150 }}    // ✨ thêm chiều cao bằng đúng chiều cao ảnh
                    contentContainerStyle={{ alignItems: 'center' }} // căn giữa nếu muốn
                >
                    <Image style={{ width: 300, height: 150, marginRight: 10 }} source={require("../assets/images/room1.jpg")} />
                    <Image style={{ width: 300, height: 150, marginRight: 10 }} source={require("../assets/images/room2.jpg")} />
                    <Image style={{ width: 300, height: 150, marginRight: 10 }} source={require("../assets/images/room3.jpg")} />
                    <Image style={{ width: 300, height: 150, marginRight: 10 }} source={require("../assets/images/room4.jpg")} />
                </ScrollView>

                <Text style={{ marginTop: 15, marginLeft: 15, color: 'black', fontSize: 15, fontWeight: 'bold' }}>Tiện ích phòng</Text>
            </View>
            <View style={{ backgroundColor: 'white', width: '100%', padding: 20, marginTop: 10 }}>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flexDirection: 'row', marginRight: 15 }}>
                        <Ionicons style={{ marginRight: 5 }} name="expand" size={15} color="black" />
                        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>20.0m2</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginRight: 15 }}>
                        <Ionicons style={{ marginRight: 5 }} name="bed" size={15} color="black" />
                        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>1 giường cỡ queen</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginRight: 15 }}>
                        <Ionicons style={{ marginRight: 5 }} name="wifi" size={15} color="black" />
                        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Có wifi</Text>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <View style={{ flexDirection: 'row', marginRight: 15 }}>
                        <Ionicons style={{ marginRight: 5 }} name="close-circle" size={15} color="black" />
                        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Không hút thuốc</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginRight: 15 }}>
                        <MaterialCommunityIcons style={{ marginRight: 5 }} name="shower" size={15} color="black" />
                        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Bồn tắm</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginRight: 15 }}>
                        <Ionicons style={{ marginRight: 5 }} name="thermometer" size={15} color="black" />
                        <Text style={{ fontWeight: 'bold', fontSize: 12 }}>Nước nóng</Text>
                    </View>
                </View>
            </View>
        
        </View>
    );
}

const styles = StyleSheet.create({

});
