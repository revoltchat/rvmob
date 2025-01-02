import type {ModuleType} from 'i18next';

import {storage} from '@rvmob/lib/storage';

const STORE_LANGUAGE_KEY = 'app.language';

export const languageDetectorPlugin = {
  type: 'languageDetector' as ModuleType,
  init: () => {},
  detect: function () {
    try {
      const settings = JSON.parse(storage.getString('settings') ?? '[]');
      for (const setting of settings) {
        if (setting.key === STORE_LANGUAGE_KEY) {
          return setting.value;
        }
      }
      // TODO: use device language
      return 'en';
    } catch (error) {
      console.warn(`[APP] Error reading language: ${error}`);
      return 'en';
    }
  },
  cacheUserLanguage: function (language: string) {
    try {
      const settings = JSON.parse(storage.getString('settings') ?? '[]');
      for (const setting of settings) {
        if (setting.key === STORE_LANGUAGE_KEY) {
          const index = settings.indexOf(setting);
          settings.splice(index, 1);
        }
      }
      settings.push({key: STORE_LANGUAGE_KEY, value: language});
      const newData = JSON.stringify(settings);
      storage.set('settings', newData);
    } catch (error) {}
  },
};
