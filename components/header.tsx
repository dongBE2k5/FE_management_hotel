import { Image, StyleSheet, Text, TextInput, View } from "react-native";

export default function Header() {
  
  return (
    <>    
    <View style={styles.header}>
      <View style={styles.wrapper}>
        <Text style={styles.title}>TravelokaTDC</Text>
        <Image style={{ marginLeft: 5}} source={require("../assets/images/logo.png")} />
      </View>
      <View style={styles.profile}>
          <Image style={styles.avatar} source={require("../assets/images/logo.png")} />
          <View>
            <Text style={{color: 'white', fontWeight: 700}}>Xin chào Admin</Text>
             <View style={styles.tell}>
            <Text style={{color: '#999494', fontWeight: 700}}>84+ 983214123112</Text>
        </View>
          </View>
      </View>
      
    </View>
    
     <View style={styles.search}>
        
        <TextInput></TextInput>
      </View>
    </>

  );
}

const styles = StyleSheet.create({
    header: {
      backgroundColor: '#009EDE',
      borderBottomRightRadius:50,
      borderBottomLeftRadius:50,
      display: 'flex',
            padding: 50

    },
    wrapper: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10

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
    tell:{
      backgroundColor:'white',

      borderRadius:'5px',
      padding:5,
      marginTop:10

    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      backgroundColor: 'red',
      marginRight: 10
    }
    ,
    search:{
      borderTopRightRadius: 40,
      borderTopLeftRadius: 40,
      backgroundColor:'white',
      paddingVertical:40,
      transform: [{ translateY: -40 }]
    }
});
