import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, StyleSheet, Text, TextInput, View } from "react-native";
export default function Header() {

  return (
    <>
      <View style={styles.header}>
        <View style={styles.wrapper}>
          <Text style={styles.title}>TravelokaTDC</Text>
          <Image style={{ marginLeft: 5 }} source={require("../assets/images/logo.png")} />
        </View>
        <View style={styles.profile}>
          <Image style={styles.avatar} source={require("../assets/images/logo.png")} />
          <View>
            <Text style={{ color: 'white', fontWeight: 700 }}>Xin chào Admin</Text>
            <View style={styles.tell}>
              <Text style={{ color: '#999494', fontWeight: 700 }}>84+ 983214123112</Text>
            </View>
          </View>
        </View>

      </View>

      <View style={styles.search}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Bạn muốn tìm khách sạn?"
            placeholderTextColor="#000000"
          />
          <Ionicons name="search" size={20} color="#0077c7ff" />

        </View>
        <View style={styles.searchOptions}>
          <View style={styles.optionContainer}>
            <View style={[styles.ItemSearch, { backgroundColor: colors.khachsan }]}>
              <Ionicons name="bed" size={24} color="#000" />
            </View>
            <Text style={styles.itemText}>Khách sạn</Text>
          </View>

          <View style={styles.optionContainer}>
            <View style={[styles.ItemSearch, { backgroundColor: colors.tienich }]}>
              <Ionicons name="settings" size={24} color="#000" />
            </View>
            <Text style={styles.itemText}>Tiện ích</Text>
          </View>

          <View style={styles.optionContainer}>
            <View style={[styles.ItemSearch, { backgroundColor: colors.khuyenmai }]}>
              <Ionicons name="pricetag" size={24} color="#000" />
            </View>
            <Text style={styles.itemText}>Khuyến mãi</Text>
          </View>

          <View style={styles.optionContainer}>
            <View style={[styles.ItemSearch, { backgroundColor: colors.noibat }]}>
              <Ionicons name="star" size={24} color="#000" />
            </View>
            <Text style={styles.itemText}>Nổi bật</Text>
          </View>
        </View>

      </View>


    </>

  );
}
const colors = {
  khachsan: '#4CAF50',
  noibat: '#2196F3',
  khuyenmai: '#FF9800',
  tienich: '#E91E63',
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#009EDE',
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 50,
    display: 'flex',
    paddingVertical: 50

  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: 700,
  },
  profile: {
    paddingHorizontal: 30,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  tell: {
    backgroundColor: 'white',

    borderRadius: 100,
    padding: 5,
    marginTop: 10

  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: 'red',
    marginRight: 10
  }
  ,
  search: {
    borderRadius: 40,
    backgroundColor: 'white',
    paddingBottom: 40,
    marginLeft: 15,
    marginRight: 15,
    transform: [{ translateY: -40 }],

    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4.65,

    // Elevation cho Android
    elevation: 8,
  }

  ,
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d0d0d0ff',
    borderRadius: 50,
    marginTop: 30,
    marginHorizontal: 50,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 12,
    color: '#000',
    paddingVertical: 0,
  },
  searchOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginHorizontal: 35,
  },

  optionContainer: {
    alignItems: 'center',
    width: 65,          // độ rộng cố định để các ô đều nhau
  },

  ItemSearch: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },

  itemText: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    color: '#000',
  }

});
