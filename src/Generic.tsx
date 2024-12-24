import AsyncStorage from '@react-native-async-storage/async-storage';

import {Client} from 'revolt.js';
import type {API, Channel, Message, Server, User} from 'revolt.js';

import {setLanguage} from '@rvmob-i18n/i18n';
import {languages} from '@rvmob-i18n/languages';
import {DEFAULT_API_URL, LOADING_SCREEN_REMARKS} from '@rvmob/lib/consts';
import {checkNotificationPerms} from '@rvmob/lib/notifications';
import {themes} from '@rvmob/lib/themes';
import {
  CreateChannelModalProps,
  DeletableObject,
  ReplyingMessage,
  ReportedObject,
  Setting,
  TextEditingModalProps,
} from '@rvmob/lib/types';

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
    set: async (k: string, v: string | boolean | undefined) => {
      try {
        const setting = app.settings._fetch(k);
        if (!setting) {
          console.warn(`[SETTINGS] Setting ${k} does not exist; func = set`);
          return null;
        }
        setting.value = v;
        setting.onChange && setting.onChange(v);
        await app.settings.save();
      } catch (err) {
        console.log(`[SETTINGS] Error setting setting ${k} to ${v}: ${err}`);
      }
    },
    save: async () => {
      try {
        let out: object[] = [];
        for (const s of app.settings.list) {
          if (s.value !== undefined) {
            out.push({key: s.key, value: s.value});
          }
        }
        await AsyncStorage.setItem('settings', JSON.stringify(out));
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
        category: 'i18n',
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
        category: 'appearance',
        default: 'Dark',
        type: 'string',
        options: Object.keys(themes),
        onChange: (v: any) => {
          app.setTheme(v);
        },
        onInitialize: (v: any) => {
          app.setTheme(v);
        },
        remark: true,
      },
      {
        key: 'ui.messaging.showSelfInTypingIndicator',
        category: 'appearance',
        default: false,
        type: 'boolean',
        developer: true,
      },
      {
        key: 'ui.messaging.statusInChatAvatars',
        category: 'appearance',
        default: false,
        type: 'boolean',
      },
      {
        key: 'ui.messaging.use24H',
        category: 'appearance',
        default: true,
        type: 'boolean',
      },
      {
        key: 'ui.messaging.showMasqAvatar',
        category: 'appearance',
        default: true,
        type: 'boolean',
      },
      {
        key: 'app.refetchOnReconnect',
        category: 'functionality',
        default: true,
        type: 'boolean',
      },
      {
        key: 'app.reopenLastChannel',
        category: 'functionality',
        default: true,
        type: 'boolean',
      },
      {
        key: 'app.notifications.enabled',
        category: 'functionality',
        default: false,
        type: 'boolean',
        experimental: true,
        onChange: (v: boolean) => {
          if (v) {
            checkNotificationPerms();
          }
        },
      },
      {
        key: 'app.notifications.notifyOnSelfPing',
        category: 'functionality',
        default: false,
        type: 'boolean',
        developer: true,
      },
      {
        key: 'ui.messaging.messageSpacing',
        category: 'appearance',
        default: '10',
        type: 'number',
      },
      {
        key: 'ui.messaging.fontSize',
        category: 'appearance',
        remark: true,
        default: '14',
        type: 'number',
      },
      {
        key: 'ui.home.holidays',
        category: 'appearance',
        default: true,
        type: 'boolean',
      },
      {
        key: 'ui.messaging.doubleTapToReply',
        category: 'functionality',
        default: true,
        type: 'boolean',
        experimental: true,
        remark: true,
      },
      {
        key: 'ui.messaging.emojiPack',
        category: 'appearance',
        default: 'System',
        type: 'string',
        options: ['System', 'Mutant', 'Twemoji', 'Noto', 'Openmoji'],
      },
      {
        key: 'ui.messaging.showNSFWContent',
        category: 'functionality',
        default: false,
        type: 'boolean',
      },
      {
        key: 'ui.messaging.sendAttachments',
        category: 'functionality',
        default: true,
        type: 'boolean',
      },
      {
        key: 'ui.messaging.showReactions',
        category: 'functionality',
        remark: true,
        default: false,
        type: 'boolean',
        experimental: true,
      },
      {
        key: 'ui.messaging.experimentalScrolling',
        category: 'functionality',
        remark: true,
        default: false,
        type: 'boolean',
        experimental: true,
      },
      {
        key: 'ui.messaging.useNewMessageView',
        category: 'functionality',
        default: true,
        type: 'boolean',
        experimental: true,
      },
      {
        key: 'app.showChangelogs',
        category: 'functionality',
        default: true,
        type: 'boolean',
      },
      {
        key: 'ui.settings.showExperimental',
        category: 'functionality',
        default: false,
        type: 'boolean',
      },
      {
        key: 'ui.showDeveloperFeatures',
        category: 'functionality',
        default: false,
        type: 'boolean',
      },

      // instance URL
      {
        key: 'app.instance',
        category: 'donotshow',
        default: DEFAULT_API_URL,
        type: 'string',
      },
      // last ver
      {
        key: 'app.lastVersion',
        category: 'donotshow',
        default: '',
        type: 'string',
      },
    ] as Setting[],
  },
  setTheme: (themeName: string) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function setTheme (args: ${themeName})`,
    );
  },
  setLoggedOutScreen: (screen: 'loginPage' | 'loadingPage') => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function setLoggedOutScreen (args: ${screen})`,
    );
  },
  setLoadingStage: (stage: string) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function setLoadingStage (args: ${stage})`,
    );
  },
  openProfile: (u?: User | null, s?: Server | null) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function openProfile (args: ${u}, ${s})`,
    );
  },
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
  openDirectMessage: (c: Channel) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function openDirectMessage (args: ${c})`,
    );
  },
  openImage: a => {},
  openMessage: (m: Message | null) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function openMessage (args: ${m})`,
    );
  },
  openServerContextMenu: (s: Server | null) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function openServerContextMenu (args: ${s})`,
    );
  },
  openSettings: (o: boolean) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function openSettings (args: ${o})`,
    );
  },
  openServerSettings: (s: Server | null) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function openServerSettings (args: ${s})`,
    );
  },
  setMessageBoxInput: (t: string | null) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function setMessageBoxInput (args: ${t})`,
    );
  },
  getMessageBoxInput: () => {
    return '';
  },
  setEditingMessage: (message: Message) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function setEditingMessage (args: ${message})`,
    );
  },
  getEditingMessage: (): Message | null => {
    return null;
  },
  setReplyingMessages: (m: ReplyingMessage[]) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function setReplyingMessages (args: ${m})`,
    );
  },
  getReplyingMessages: (): ReplyingMessage[] => {
    return [];
  },
  /**
   * @deprecated Message queuing will be removed/reworked due to the switch of message views
   */
  pushToQueue: m => {},
  joinInvite: async (i: API.InviteResponse) => {},
  logOut: () => {},
  openMemberList: (data: Channel | Server | null) => {},
  openChannelContextMenu: (c: Channel | null) => {},
  openPinnedMessagesMenu: (c: Channel | null) => {},
  openStatusMenu: (state: boolean) => {},
  openReportMenu: (object: ReportedObject | null) => {},
  openDeletionConfirmationModal: (object: DeletableObject | null) => {},
  openTextEditModal: (object: TextEditingModalProps | null) => {},
  openCreateChannelModal: (object: CreateChannelModalProps | null) => {},
  handleSettingsVisibility: (stateFunction: (state: boolean) => void) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function handleSettingsVisibility(args: ${stateFunction})`,
    );
  },
  handleServerSettingsVisibility: (stateFunction: (state: null) => void) => {
    console.log(
      `[FUNCTIONS] Tried to run uninitialised function handleServerSettingsVisibility (args: ${stateFunction})`,
    );
  },
  closeRoleSubsection: () => {
    console.log(
      '[FUNCTIONS] Tried to run uninitialised function closeRoleSubsection',
    );
  },
};

export function setFunction(name: string, func: any) {
  app[name] = func;
}

async function initialiseSettings() {
  const s = await AsyncStorage.getItem('settings');
  console.log(s);
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
