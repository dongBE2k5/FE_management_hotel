import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { StyleSheet, ViewStyle } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  const isSelected = props.accessibilityState?.selected;

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
       style={[
        styles.base,
        isSelected && styles.active,
        // Bạn có thể thêm style khác ở đây nếu cần
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    margin: 4,
  } as ViewStyle,

  active: {
    backgroundColor: '#73c5fc', // Màu nền khi được chọn
  } as ViewStyle,

  pressed: {
    opacity: 0.6,
  } as ViewStyle,
});
