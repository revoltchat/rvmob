import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import 'intl-pluralrules';

import {resources} from './languages';
import {languageDetectorPlugin} from './getLanguage';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(languageDetectorPlugin) // get the user's language if it's stored
  .init({
    fallbackLng: 'en',

    resources: resources,

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;

export function setLanguage(l: string) {
  i18n.changeLanguage(l);
}
