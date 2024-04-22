import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import 'intl-pluralrules';

import {resources} from '@rvmob-i18n/languages';
import {languageDetectorPlugin} from '@rvmob-i18n/getLanguage';
import {Text} from '@rvmob/components/common/atoms';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(languageDetectorPlugin) // get the user's language if it's stored
  // @ts-expect-error upstream typing issue (https://github.com/i18next/react-i18next/issues/1648)
  .init({
    fallbackLng: 'en',

    resources: resources,

    interpolation: {
      escapeValue: false,
    },

    react: {
      defaultTransParent: Text,
      useSuspense: false,
    },
  });

export default i18n;

export function setLanguage(l: string) {
  i18n.changeLanguage(l);
}
