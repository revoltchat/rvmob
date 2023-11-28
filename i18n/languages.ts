import {Language} from '../src/lib/types';

// string files
import {default as en} from './strings/en.json';
import {default as de} from './strings/de.json';
import {default as ru} from './strings/ru.json';

// resources object passed to i18next
export const resources = {
  en: {translation: en},
  de: {translation: de},
  ru: {translation: ru},
};

// languages object, used for settings
export const languages = {
  en: {
    name: 'English (Traditional)',
    englishName: 'English (UK)',
    emoji: '🇬🇧',
  } as Language,
  de: {
    name: 'Deutsch (Deutschland)',
    englishName: 'German (Germany)',
    emoji: '🇩🇪',
  } as Language,
  hu: {name: 'Magyar', englishName: 'Hungarian', emoji: '🇭🇺'},
  id: {
    name: 'Bahasa Indonesia',
    englishName: 'Indonesian',
    emoji: '🇮🇩',
  } as Language,
  it: {name: 'Italiano', englishName: 'Italian', emoji: '🇮🇹'} as Language,
  ru: {name: 'Русский', englishName: 'Russian', emoji: '🇷🇺'} as Language,
};
