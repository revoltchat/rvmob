import AsyncStorage from '@react-native-async-storage/async-storage';
import type {ModuleType} from 'i18next';

const STORE_LANGUAGE_KEY = 'app.language';

export const languageDetectorPlugin = {
  type: 'languageDetector' as ModuleType,
  async: true,
  init: () => {},
  detect: async function (callback: (lang: string) => void) {
    try {
      await AsyncStorage.getItem(STORE_LANGUAGE_KEY).then(language => {
        if (language) {
          return callback(language);
        } else {
          // TODO: use the device's locale
          return 'en';
        }
      });
    } catch (error) {
      console.warn(`[APP] Error reading language: ${error}`);
    }
  },
  cacheUserLanguage: async function (language: string) {
    try {
      //save a user's language choice in Async storage
      await AsyncStorage.setItem(STORE_LANGUAGE_KEY, language);
    } catch (error) {}
  },
};
