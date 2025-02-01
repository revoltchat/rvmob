import {Platform, ToastAndroid} from 'react-native';

import { DOMParser as CoreDOMParser } from '@xmldom/xmldom';

export function showToast(badgeName: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(badgeName, ToastAndroid.SHORT);
  } else {
    console.warn(
      `[NATIVEUTILS] attempted to show toast outside android (${badgeName}) - implement this !!!`,
    );
  }
}

export function DOMParserFunction() {
  return new CoreDOMParser({
    errorHandler: (level, message) => {
      if (level === 'error') {
        throw new Error(message);
      }
    },
  });
}
