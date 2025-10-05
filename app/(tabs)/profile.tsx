import Header from '@/components/header';
import React from 'react';
import Account from '@/components/screens/profile/account';
import { StyleSheet, View } from 'react-native';
import Login from '@/components/screens/profile/loginDisplay';
import Register from '@/components/screens/profile/registerDisplay';
import InFormationAccount from '@/components/screens/profile/informationDisplay';
import LoggedAccount from '@/components/screens/profile/logged';
import { createStackNavigator } from "@react-navigation/stack"
import type { ProfileStackParamList } from '@/types/navigation';

  
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
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({

});


