import React from 'react';
import {Linking, View} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';

import {API, Channel, Client, Message, Server} from 'revolt.js';

import {setLanguage} from '../i18n/i18n';
import {languages} from '../i18n/languages';
import {setTheme, themes} from './Theme';
import {
  DEFAULT_API_URL,
  DEFAULT_MAX_SIDE,
  DISCOVER_URL,
  LOADING_SCREEN_REMARKS,
  RE_INVITE,
  RE_BOT_INVITE,
  WIKI_URL,
} from './lib/consts';
import {
  DeletableObject,
  ReplyingMessage,
  ReportedObject,
  Setting,
} from './lib/types';
const Image = FastImage;

export const app = {
  version: '0.6.0',
  settings: {
    _fetch: (k: string) => {
      let s;
      for (const setting of app.settings.list) {
        if (setting.key === k) {
          s = setting;
        }
      }
      if (!s) {
        console.log(`[SETTINGS] Setting ${k} does not exist; func = _fetch`);
        return null;
      }
      return s as Setting;
    },
    getRaw: (k: string) => {
      const setting = app.settings._fetch(k);
      if (!setting) {
        console.log(`[SETTINGS] Setting ${k} does not exist; func = getRaw`);
        return null;
      }
      return typeof setting.value ===
        (setting.type === 'number' ? 'string' : setting.type)
        ? setting.value
        : setting.default;
    },
    get: (k: string) => {
      const setting = app.settings._fetch(k);
      if (!setting) {
        console.warn(`[SETTINGS] Setting ${k} does not exist; func = get`);
        return null;
      }
      let raw =
        typeof setting.value ===
          (setting.type === 'number' ? 'string' : setting.type) &&
        (setting.experimental
          ? app.settings._fetch('ui.settings.showExperimental')?.value
          : true) &&
        (setting.developer
          ? app.settings._fetch('ui.showDeveloperFeatures')?.value
          : true)
          ? setting.value
          : setting.default;
      const toreturn =
        setting.type === 'number' ? parseInt(raw as string, 10) || 0 : raw;
      return toreturn;
    },
    set: (k: string, v: string | boolean | undefined) => {
      try {
        const setting = app.settings._fetch(k);
        if (!setting) {
          console.warn(`[SETTINGS] Setting ${k} does not exist; func = set`);
          return null;
        }
        setting.value = v;
        setting.onChange && setting.onChange(v);
        app.settings.save();
      } catch (err) {
        console.log(`[SETTINGS] Error setting setting ${k} to ${v}: ${err}`);
      }
    },
    save: () => {
      try {
        let out: object[] = [];
        for (const s of app.settings.list) {
          if (s.value !== undefined) {
            out.push({key: s.key, value: s.value});
          }
        }
        out.push({key: 'app.lastVersion', value: app.version});
        AsyncStorage.setItem('settings', JSON.stringify(out));
      } catch (err) {
        console.log(`[SETTINGS] Error saving settings: ${err}`);
      }
    },
    clear: async () => {
      try {
        AsyncStorage.setItem('settings', '{}').then(() => {
          for (const s of app.settings.list) {
            delete s.value;
            s.onChange && s.onChange(s.default);
          }
        });
      } catch (err) {
        console.log(`[SETTINGS] Error saving settings: ${err}`);
      }
    },
    list: [
      {
        key: 'app.language',
        name: 'Language',
        category: 'functionality',
        default: 'en',
        type: 'string',
        options: Object.keys(languages),
        onChange: (v: string) => {
          setLanguage(v);
        },
        onInitialize: (v: string) => {
          setLanguage(v);
        },
      },
      {
        key: 'ui.theme',
        name: 'Theme',
        category: 'appearance',
        default: 'Dark',
        type: 'string',
        options: Object.keys(themes),
        onChange: (v: any) => {
          setTheme(v);
        },
        onInitialize: (v: any) => {
          setTheme(v);
        },
        remark:
          "You'll have to open or close the side menu for your changes to appear everywhere.",
      },
      {
        key: 'ui.messaging.showSelfInTypingIndicator',
        category: 'appearance',
        name: 'Show yourself in the typing indicator',
        default: false,
        type: 'boolean',
        developer: true,
      },
      {
        key: 'ui.messaging.statusInChatAvatars',
        category: 'appearance',
        name: 'Show user status in chat avatars',
        default: false,
        type: 'boolean',
      },
      {
        key: 'ui.messaging.use24H',
        category: 'appearance',
        name: 'Use 24-hour timestamps',
        default: true,
        type: 'boolean',
      },
      {
        key: 'ui.messaging.showMasqAvatar',
        category: 'appearance',
        name: 'Show masqueraded avatar in corner',
        default: true,
        type: 'boolean',
      },
      {
        key: 'app.refetchOnReconnect',
        category: 'functionality',
        name: 'Refetch messages when reconnecting',
        default: true,
        type: 'boolean',
      },
      {
        key: 'app.notifications.enabled',
        category: 'functionality',
        name: 'Enable push notifications',
        default: false,
        type: 'boolean',
        experimental: true,
      },
      {
        key: 'app.notifications.notifyOnSelfPing',
        category: 'functionality',
        name: 'Receive a notification when you ping yourself',
        default: false,
        type: 'boolean',
        developer: true,
      },
      {
        key: 'ui.messaging.messageSpacing',
        category: 'appearance',
        name: 'Message spacing',
        default: '10',
        type: 'number',
      },
      {
        key: 'ui.messaging.fontSize',
        category: 'appearance',
        name: 'Font size',
        remark: 'This will aplly to messages and certain parts of the app.',
        default: '14',
        type: 'number',
      },
      {
        key: 'ui.home.holidays',
        category: 'appearance',
        name: 'Show holidays on home page',
        default: true,
        type: 'boolean',
      },
      {
        key: 'ui.messaging.emojiPack',
        name: 'Emoji pack',
        category: 'appearance',
        default: 'System',
        type: 'string',
        options: ['System', 'Mutant', 'Twemoji', 'Noto', 'Openmoji'],
      },
      {
        key: 'ui.messaging.showNSFWContent',
        category: 'functionality',
        name: 'Consent to 18+ content',
        default: false,
        type: 'boolean',
      },
      {
        key: 'ui.messaging.sendAttachments',
        category: 'functionality',
        name: 'Enable attachment sending',
        default: true,
        type: 'boolean',
      },
      {
        key: 'ui.messaging.showReactions',
        category: 'functionality',
        name: 'Show reactions under messages',
        default: false,
        type: 'boolean',
        experimental: true,
      },
      {
        key: 'ui.messaging.experimentalScrolling',
        category: 'functionality',
        name: 'Enable channel scrolling for old message view',
        remark: 'You can only scroll backwards.',
        default: false,
        type: 'boolean',
        experimental: true,
      },
      {
        key: 'ui.messaging.useNewMessageView',
        category: 'functionality',
        name: 'Use new message view',
        default: false,
        type: 'boolean',
        experimental: true,
      },
      {
        key: 'app.showChangelogs',
        category: 'functionality',
        name: 'Show changelogs after updating RVMob',
        default: true,
        type: 'boolean',
      },
      {
        key: 'ui.settings.showExperimental',
        category: 'functionality',
        name: 'Show experimental features',
        default: false,
        type: 'boolean',
      },
      {
        key: 'ui.showDeveloperFeatures',
        category: 'functionality',
        name: 'Show developer tools',
        default: false,
        type: 'boolean',
      },
      {
        key: 'app.instance',
        category: 'donotshow',
        name: 'Instance URL',
        default: DEFAULT_API_URL,
        type: 'string',
      },
    ] as Setting[],
  },
  openProfile: (u, s?: Server) => {},
  openLeftMenu: (o: boolean) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function openLeftMenu (args: ${o})`,
    );
  },
  openInvite: i => {},
  openBotInvite: i => {},
  openServer: (s?: Server) => {},
  getCurrentServer: () => {
    return undefined as string | undefined;
  },
  openChannel: c => {},
  openDirectMessage: (c: Channel) => {},
  openImage: a => {},
  openMessage: m => {},
  openServerContextMenu: (s: Server | null) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function openServerContextMenu (args: ${s})`,
    );
  },
  openSettings: o => {},
  openServerSettings: (s: Server | null) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function openServerSettings (args: ${s})`,
    );
  },
  setMessageBoxInput: (t: string | null) => {},
  setEditingMessage: (message: Message) => {},
  setReplyingMessages: (m: ReplyingMessage[]) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function setReplyingMessages (args: ${m})`,
    );
  },
  getReplyingMessages: () => {
    return undefined as unknown as ReplyingMessage[];
  },
  /**
   * @deprecated Message queuing will be removed/reworked due to the switch of message views
   */
  pushToQueue: m => {},
  joinInvite: async (i: API.InviteResponse) => {},
  logOut: () => {},
  openMemberList: (data: Channel | Server | null) => {},
  openChannelContextMenu: (c: Channel | null) => {},
  openStatusMenu: (state: boolean) => {},
  openReportMenu: (object: ReportedObject | null) => {},
  openDeletionConfirmationModal: (object: DeletableObject | null) => {},
};

export function setFunction(name: string, func: any) {
  app[name] = func;
}

async function initialiseSettings() {
  const s = await AsyncStorage.getItem('settings');
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
            console.warn(
              `[SETTINGS] Unknown setting in AsyncStorage settings: ${key}`,
            );
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
}

async function getAPIURL() {
  await initialiseSettings();
  console.log(`[APP] Initialised settings (${new Date().getTime()})`);
  let url: string = '';
  console.log('[AUTH] Getting API URL...');
  const instance = app.settings.get('app.instance') as
    | string
    | null
    | undefined;
  if (!instance) {
    console.log(
      '[AUTH] Unable to fetch app.instance; setting apiURL to default',
    );
    url = DEFAULT_API_URL;
  } else {
    console.log(`[AUTH] Fetched app.instance; setting apiURL to ${instance}`);
    url = instance;
  }
  return url;
}

export let client = undefined as unknown as Client;

getAPIURL().then(url => {
  const apiURL = url;
  console.log(`[AUTH] Creating client... (instance: ${apiURL})`);
  client = new Client({
    unreads: true,
    apiURL: apiURL,
  });
});

export const openUrl = (url: string) => {
  console.log(`[FUNCTIONS] Handling URL: ${url}`);
  if (url.startsWith('/@')) {
    console.log(`[FUNCTIONS] Opening user profile from URL: ${url}`);
    let id = url.slice(2);
    let user = client.users.get(id);
    if (user) {
      app.openProfile(user);
    }
    return;
  }
  let match = url.match(RE_INVITE);
  let isDiscover = url.match(DISCOVER_URL);
  let isWiki = url.match(WIKI_URL);
  if (match && !isWiki && !isDiscover) {
    console.log(`[FUNCTIONS] Opening server invite from URL: ${url}`);
    app.openInvite(match[0].split('/').pop());
    return;
  }
  let botmatch = url.match(RE_BOT_INVITE);
  if (botmatch) {
    console.log(`[FUNCTIONS] Opening bot invite from URL: ${url}`);
    app.openBotInvite(botmatch[0].split('/').pop());
    return;
  }
  if (url.startsWith('/bot/')) {
    console.log(`[FUNCTIONS] Opening bot invite from URL: ${url}`);
    const id = url.split('/');
    app.openBotInvite(id[2]);
    return;
  }

  Linking.openURL(url);
};

export const GeneralAvatar = ({
  attachment,
  size,
  directory,
}: {
  attachment: any;
  size: number;
  directory?: string;
}) => {
  const uri = directory
    ? client.configuration?.features.autumn.url + directory + attachment
    : client.generateFileURL(attachment) + '?max_side=' + DEFAULT_MAX_SIDE;
  return (
    <View>
      {
        <Image
          source={{
            uri: uri,
          }}
          style={{width: size || 35, height: size || 35, borderRadius: 10000}}
        />
      }
    </View>
  );
};

export var selectedRemark =
  LOADING_SCREEN_REMARKS[
    Math.floor(Math.random() * LOADING_SCREEN_REMARKS.length)
  ];
export function randomizeRemark() {
  selectedRemark =
    LOADING_SCREEN_REMARKS[
      Math.floor(Math.random() * LOADING_SCREEN_REMARKS.length)
    ];
}
