// notable user IDs (mostly used for badges)
export const USER_IDS = {
  // bots/built-in users
  automod: '01FHGJ3NPP7XANQQH8C2BE44ZY',
  platformModeration: '01FC17E1WTM2BGE4F3ARN3FDAF',

  // devs/team members
  developers: ['01FC1HP5H22F0M34MFFM9DZ099', '01FEEFJCKY5C4DMMJYZ20ACWWC'],
  teamMembers: {
    insert: '01EX2NCWQ0CHS3QJF0FEQS1GR4',
    lea: '01EXAF3KX65608AJ4NG27YG1HM',
  },
};

// notable servers (used for the home screen + other features)
export const SPECIAL_SERVERS = {
  // the Revolt Lounge
  lounge: {
    id: '01F7ZSBSFHQ8TA81725KQCSDDP',
    invite: 'Testers',
  },

  // RVMob's support server
  supportServer: {
    id: '01FKES1VJN27SVV4QJX82ZS3ME',
    invite: 'ZFGGw6ry',
  },
};

// default API URL - when support for other instances is added, this will be the default one
export const DEFAULT_API_URL = 'https://api.revolt.chat'; // TODO: switch to https://revolt.chat/api when it's available

export type SpecialDateObject = {
  name: string;
  key: string;
  emoji: string;
  link: string;
};

// list of holidays, used for the home screen
export const SPECIAL_DATES = [
  '1/1',
  '14/2',
  '31/3',
  '1/4',
  '31/10',
  '20/11',
  '31/12',
  'month6',
  'month12',
]; // NYD, Valentine's Day, TDOV, April Fool's, Halloween, TDOR and NYE + Pride Month/December

// objects for each holiday
export const SPECIAL_DATE_OBJECTS = {
  '1/1': {
    name: "New Year's Day",
    key: 'app-home-holiday-nyd',
    emoji: '🎉',
    link: "https://en.wikipedia.org/wiki/New_Year's_Eve",
  } as SpecialDateObject,
  '14/2': {
    name: "Valentine's Day",
    key: 'app-home-holiday-valentines',
    emoji: '💖',
    link: "https://en.wikipedia.org/wiki/Valentine's_Day",
  } as SpecialDateObject,
  '31/3': {
    name: 'International Trans Day of Visibility',
    key: 'app-home-holiday-tdov',
    emoji: '🏳️‍⚧️',
    link: 'https://en.wikipedia.org/wiki/TDOV',
  } as SpecialDateObject,
  '1/4': {
    name: "April Fools' Day",
    key: 'app-home-holiday-april-fools',
    emoji: '🤡',
    link: 'https://en.wikipedia.org/wiki/April_Fools%27_Day',
  } as SpecialDateObject,
  '31/10': {
    name: 'Halloween',
    key: 'app-home-holiday-halloween',
    emoji: '🎃',
    link: 'https://en.wikipedia.org/wiki/Halloween',
  } as SpecialDateObject,
  '20/11': {
    name: 'Trans Day of Remembrance',
    key: 'app-home-holiday-tdor',
    emoji: '🕯️',
    link: 'https://en.wikipedia.org/wiki/TDoR',
  } as SpecialDateObject,
  '31/12': {
    name: "New Year's Eve",
    key: 'app-home-holiday-nye',
    emoji: '⏰',
    link: "https://en.wikipedia.org/wiki/New_Year's_Eve",
  } as SpecialDateObject,
  month6: {
    name: 'Pride Month',
    key: 'app-home-holiday-pride',
    emoji: '🏳️‍🌈🏳️‍⚧️',
    link: 'https://en.wikipedia.org/wiki/Pride_Month',
  } as SpecialDateObject,
  month12: {
    name: 'Holiday Season',
    key: 'app-home-holiday-dechols',
    emoji: '🎄❄️',
    link: 'https://en.wikipedia.org/wiki/Christmas_and_holiday_season',
  } as SpecialDateObject,
};
