import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ProfileStackParamList } from '@/types/navigation';
import Account from '@/components/screens/profile/account';
import Login from '@/components/screens/profile/loginDisplay';
import Register from '@/components/screens/profile/registerDisplay';
import InFormationAccount from '@/components/screens/profile/informationDisplay';
import LoggedAccount from '@/components/screens/profile/logged';
import { getCurrentUser } from '@/service/UserAPI';

const Stack = createStackNavigator<ProfileStackParamList>();
type ProfileNavProp = StackNavigationProp<ProfileStackParamList>;

function Profile() {
  const navigation = useNavigation<ProfileNavProp>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const user = await getCurrentUser(token);
        if (user) navigation.replace('LoggedAccount');
        else {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userId');
          navigation.replace('Account');
        }
      } else {
        navigation.replace('Account');
      }
      setLoading(false);
    };
    checkLogin();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#0d6efd" />;
  return null; // chỉ điều hướng


}

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false}}>
      <Stack.Screen name="Account" component={Account} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="InFormationAccount" component={InFormationAccount} />
      <Stack.Screen name="LoggedAccount" component={LoggedAccount} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
