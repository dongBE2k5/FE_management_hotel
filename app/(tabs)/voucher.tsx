import Header from '@/components/userHome/header';
import React from 'react';
import { StyleSheet, View ,Text} from 'react-native';
import VoucherCard from '@/components/userHome/voucherCard';


export default function Voucher() {


  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }} >
      <Header />
      <Text style={{margin:10,fontSize:15,fontWeight:'bold'}}>Mã giảm giá của bạn</Text>
      <View>
        <VoucherCard/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

});
