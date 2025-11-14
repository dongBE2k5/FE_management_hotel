import FormVoucher from '@/components/host/screen/voucher/FormVoucher';
import VoucherList from '@/components/host/screen/voucher/VoucherList';
import { HostStack } from '@/types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


const Stack = createNativeStackNavigator<HostStack>();

export default function App() {
  return (
    <Stack.Navigator initialRouteName="VoucherList" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VoucherList" component={VoucherList} />
      <Stack.Screen name="FormVoucher" component={FormVoucher} />
    </Stack.Navigator>
  );
}
