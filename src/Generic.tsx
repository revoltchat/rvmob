import React from 'react';
import {
  View,
  TouchableOpacity,
  Linking,
  TextInput,
  ViewStyle,
} from 'react-native';
import {observer} from 'mobx-react-lite';

import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {API, Channel, Client, Server} from 'revolt.js';

import {MiniProfile} from './Profile';
import {currentTheme, setTheme, themes, styles} from './Theme';
import {Button, Text} from './components/common/atoms';
import {
  DEFAULT_API_URL,
  DEFAULT_MAX_SIDE,
  DISCOVER_URL,
  LOADING_SCREEN_REMARKS,
  RE_INVITE,
  RE_BOT_INVITE,
  WIKI_URL,
} from './lib/consts';
const Image = FastImage;

type StringSetting = {
  default: string;
  type: 'string' | 'number';
  value?: string;
};

type BoolSetting = {
  default: boolean;
  type: 'boolean';
  value?: boolean;
};

export type Setting = (StringSetting | BoolSetting) & {
  key: string;
  name: string;
  category: string;
  experimental?: boolean;
  developer?: boolean;
  options?: string[];
  onChange?: any;
  onInitialize?: any;
};

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
        setting.type === 'number' ? parseInt(raw as string) || 0 : raw;
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
        default: '3',
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
        key: 'ui.messaging.showNSFWContent',
        category: 'functionality',
        name: 'Consent to 18+ content',
        default: false,
        type: 'boolean',
      },
      {
        key: 'ui.messaging.sendAttachments',
        category: 'functionality',
        name: 'Enable attachment sending (broken)',
        default: false,
        type: 'boolean',
        developer: true,
      },
      {
        key: 'ui.messaging.showReactions',
        category: 'functionality',
        name: 'Show a list of reactions under messages (text only)',
        default: false,
        type: 'boolean',
        experimental: true,
      },
      {
        key: 'ui.messaging.experimentalScrolling',
        category: 'functionality',
        name: 'Enable channel scrolling (you can only scroll backwards)',
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
  openProfile: (u, s: Server | undefined) => {},
  openLeftMenu: o => {},
  openRightMenu: o => {},
  openInvite: i => {},
  openBotInvite: i => {},
  openServer: (s: Server | undefined) => {},
  openChannel: c => {},
  openImage: a => {},
  openMessage: m => {},
  openServerContextMenu: s => {},
  openSettings: o => {},
  setMessageBoxInput: t => {},
  setReplyingMessages: (m, a) => {},
  getReplyingMessages: () => {},
  pushToQueue: m => {},
  joinInvite: async (i: API.InviteResponse) => {},
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

// initialiseSettings(); // we'd await this if we could

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

type ChannelButtonProps = {
  channel: Channel;
  onPress?: any;
  onLongPress?: any;
  delayLongPress?: number;
  selected: boolean;
  showUnread?: boolean;
};

export const ChannelButton = observer(
  ({
    channel,
    onPress = () => {},
    onLongPress = () => {},
    delayLongPress,
    selected,
    showUnread = true,
  }: ChannelButtonProps) => {
    let color =
      showUnread && channel.unread
        ? currentTheme.foregroundPrimary
        : currentTheme.foregroundTertiary;
    let pings = channel.mentions?.length;
    let classes = [styles.channelButton];
    if (selected) {
      classes.push(styles.channelButtonSelected);
    }
    if (
      channel.channel_type === 'DirectMessage' ||
      channel.channel_type === 'Group'
    ) {
      classes.push({padding: 6});
    } else {
      classes.push({padding: 8});
    }
    return (
      <TouchableOpacity
        onPress={() => onPress()}
        onLongPress={() => onLongPress()}
        delayLongPress={delayLongPress}
        key={`${channel._id} `}
        style={classes}>
        {channel.channel_type === 'DirectMessage' ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              maxWidth: '80%',
            }}>
            <MiniProfile user={channel.recipient} color={color} />
          </View>
        ) : channel.channel_type === 'Group' ? (
          <MiniProfile channel={channel} color={color} />
        ) : (
          <>
            <View style={styles.iconContainer}>
              <ChannelIcon channel={{type: 'channel', channel: channel}} />
            </View>
            <Text style={{flex: 1, fontWeight: 'bold', color, fontSize: 15}}>
              {channel.name || channel}
            </Text>
            {showUnread && channel.mentions?.length > 0 ? (
              <View
                style={{
                  width: 20,
                  height: 20,
                  marginLeft: 4,
                  marginRight: 4,
                  borderRadius: 10000,
                  backgroundColor: currentTheme.error,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{color: '#FFFFFF', marginRight: 1, marginBottom: 2}}>
                  {pings > 9 ? '9+' : pings}
                </Text>
              </View>
            ) : showUnread && channel.unread ? (
              <View
                style={{
                  width: 12,
                  height: 12,
                  marginLeft: 8,
                  marginRight: 8,
                  borderRadius: 10000,
                  backgroundColor: currentTheme.foregroundPrimary,
                }}
              />
            ) : null}
          </>
        )}
      </TouchableOpacity>
    );
  },
);

interface CIChannel {
  type: 'channel';
  channel: Channel;
}

interface SpecialCIChannel {
  type: 'special';
  channel: 'Home' | 'Friends' | 'Saved Notes' | 'Debug';
}

export const ChannelIcon = ({
  channel,
  showUnread = true,
}: {
  channel: CIChannel | SpecialCIChannel;
  showUnread?: boolean;
}) => {
  let color =
    channel.type === 'channel' && showUnread && channel.channel.unread
      ? currentTheme.foregroundPrimary
      : currentTheme.foregroundSecondary;
  let radius =
    channel.type === 'channel' &&
    (channel.channel.channel_type === 'DirectMessage' ||
      channel.channel.channel_type === 'Group')
      ? 10000
      : 0;
  return channel.channel === 'Home' ? (
    <MaterialIcon name="home" size={24} color={color} />
  ) : channel.channel === 'Friends' ? (
    <MaterialIcon name="group" size={24} color={color} />
  ) : channel.channel === 'Saved Notes' ? (
    <MaterialIcon name="sticky-note-2" size={24} color={color} />
  ) : channel.channel === 'Debug' ? (
    <MaterialIcon name="bug-report" size={24} color={color} />
  ) : channel.channel.generateIconURL && channel.channel.generateIconURL() ? (
    <Image
      source={{
        uri:
          channel.channel.generateIconURL() + '?max_side=' + DEFAULT_MAX_SIDE,
      }}
      style={{
        width: 24,
        height: 24,
        borderRadius: radius,
      }}
    />
  ) : channel.channel.channel_type === 'DirectMessage' ? (
    <MaterialCommunityIcon name="at" size={24} color={color} />
  ) : channel.channel.channel_type === 'VoiceChannel' ? (
    <MaterialIcon name="volume-up" size={24} color={color} />
  ) : (
    <MaterialIcon name="tag" size={24} color={color} />
  );
};

export const ServerName = observer(
  ({server, size}: {server: Server; size?: number}) => {
    return (
      <View style={{flexDirection: 'row'}}>
        <Text
          style={{fontWeight: 'bold', fontSize: size || 14, flexWrap: 'wrap'}}>
          {server.name}
        </Text>
      </View>
    );
  },
);

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

type InputProps = {
  value?: string;
  onChangeText?: any;
  placeholder?: string;
  style?: any;
  backgroundColor: ViewStyle['backgroundColor'];
};

export function Input({
  value,
  onChangeText,
  placeholder,
  style,
  backgroundColor,
  ...props
}: InputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={[
        {
          minWidth: '100%',
          borderRadius: 8,
          backgroundColor: currentTheme.backgroundSecondary,
          padding: 6,
          paddingLeft: 10,
          paddingRight: 10,
          color: currentTheme.foregroundPrimary,
        },
        backgroundColor ? {backgroundColor} : {},
        style,
      ]}
      {...props}
    />
  );
}

export function InputWithButton({
  defaultValue,
  placeholder,
  buttonLabel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  style,
  backgroundColor,
  onPress,
  ...props
}: {
  defaultValue?: string;
  placeholder?: string;
  buttonLabel: string;
  style: any;
  backgroundColor: ViewStyle['backgroundColor'];
  onPress: any;
}) {
  let [value, setValue] = React.useState(defaultValue);
  return (
    //style.input and style.button are applied to the input and button respectively
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '100%',
      }}>
      <TextInput
        value={value}
        onChangeText={v => {
          setValue(v);
        }}
        placeholder={placeholder}
        style={{
          fontFamily: 'Open Sans',
          flex: 1,
          borderRadius: 8,
          backgroundColor: backgroundColor || currentTheme.backgroundSecondary,
          padding: 6,
          paddingLeft: 10,
          paddingRight: 10,
          color: currentTheme.foregroundPrimary,
        }}
        {...props}
      />
      <Button
        onPress={() => {
          onPress(value);
        }}
        style={[
          styles.button,
          {marginRight: 0},
          backgroundColor ? {backgroundColor} : {},
        ]}>
        <Text style={{color: currentTheme.foregroundPrimary}}>
          {buttonLabel}
        </Text>
      </Button>
    </View>
  );
}
