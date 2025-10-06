// BannerAccount.tsx
import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ProfileStackParamList } from '@/types/navigation';
type BannerAccountProps = {
  subtitle?: string;
};

export default function BannerAccount(props: { subtitle: string }) {
 const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();

  return (
    <ImageBackground
      source={require("../../assets/images/bannerAccount.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.textContainer}>
        {/* Dòng trên: Đăng nhập / Đăng ký */}
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.title}>Đăng nhập</Text>
          </TouchableOpacity>

          <Text style={styles.title}>  /  </Text>

          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.title}>Đăng ký</Text>
          </TouchableOpacity>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>{props.subtitle}</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    position: "absolute",
    bottom: 30,
  },
  title: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  subtitle: {
    color: "white",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
});
