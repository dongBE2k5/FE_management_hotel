import Account from '@/components/screens/profile/account';
import InFormationAccount from '@/components/screens/profile/informationDisplay';
import LoggedAccount from '@/components/screens/profile/logged';
import Login from '@/components/screens/profile/loginDisplay';
import Register from '@/components/screens/profile/registerDisplay';
import type { ProfileStackParamList } from '@/types/navigation';
import { createStackNavigator } from "@react-navigation/stack";
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HomeScreen } from '.';

  
const Stack = createStackNavigator<ProfileStackParamList>();

function Profile() {

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }} >
      <Account />

    </View>
  );
}
export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Account" component={Account} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="InFormationAccount" component={InFormationAccount} />
      <Stack.Screen name="LoggedAccount" component={LoggedAccount} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({

});


