import { Image } from 'expo-image';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';



export default function HomeScreen() {
   const handlePress = () => {
    console.log('Button pressed!');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.text}>Nhấn vào đây</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});