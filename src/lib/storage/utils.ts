import {app} from '@clerotri/Generic';
import {storage} from '@clerotri/lib/storage';
import {Setting} from '@clerotri/lib/types';

export function initialiseSettings() {
  const s = storage.getString('settings');
  if (s) {
    try {
      const settings = JSON.parse(s) as {key: string; value: any}[];
      settings.forEach(key => {
        let st: Setting | undefined;
        for (const setting of app.settings.list) {
          if (setting.key === key.key) {
            st = setting;
          }
        }
        if (st) {
          st.value = key.value;
          st.onInitialize && st.onInitialize(key.value);
        } else {
          // ignore known good key
          if (key.key !== 'app.lastVersion') {
            console.warn(`[SETTINGS] Unknown setting in MMKV settings: ${key}`);
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
}
