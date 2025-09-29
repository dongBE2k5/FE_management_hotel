import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function BannerAccount(props) {
  return (
    <>
      <ImageBackground
        source={require("../assets/images/bannerAccount.png")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.textContainer}>
          <Text style={styles.title}>{props.title}</Text>
          <Text style={styles.subtitle}>{props.subtitle}</Text>
        </View>
      </ImageBackground>

     
    </>
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
  arrowContainer: {
    alignItems: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
  }
});
