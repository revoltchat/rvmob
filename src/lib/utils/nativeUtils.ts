import {Platform, ToastAndroid} from 'react-native';

export function showToast(badgeName: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(badgeName, ToastAndroid.SHORT);
  } else {
    console.warn(
      `[NATIVEUTILS] attempted to show toast outside android (${badgeName}) - implement this !!!`,
    );
  }
}
