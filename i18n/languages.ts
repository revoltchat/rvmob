import {Language} from '../src/lib/types';

// string files
import {default as en} from './strings/en.json';

// resources object passed to i18next
export const resources = {
  en: {translation: en},
};

// languages object, used for settings
export const languages = {
  en: {name: 'English (Traditional)', emoji: '🇬🇧'} as Language,
  de: {name: 'Deutsch (Deutschland)', emoji: '🇩🇪'} as Language,
  it: {name: 'Italiano', emoji: '🇮🇹'} as Language,
};
