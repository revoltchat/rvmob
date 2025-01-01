import AsyncStorage from '@react-native-async-storage/async-storage';
import {storage} from '.';

export async function migrateToMMKV() {
  console.log('hi');
  const keys = await AsyncStorage.getAllKeys();
  console.log(keys);

  for (const key of keys) {
    if (key === 'token' || key === 'settings') {
      const value = await AsyncStorage.getItem(key);
      console.log(value);
      storage.set(key, value ?? '');
    }
  }

  storage.set('hasMigrated', true);
}
