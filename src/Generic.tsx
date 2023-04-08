import React from 'react';
import {
  View,
  TouchableOpacity,
  Linking,
  TextInput,
  ViewStyle,
} from 'react-native';
import {observer} from 'mobx-react-lite';

import Markdown, {hasParents, MarkdownIt} from 'react-native-markdown-display';

import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import spoilerPlugin from '@traptitech/markdown-it-spoiler';
import {Channel, Client, Server} from 'revolt.js';

import {MiniProfile} from './Profile';
import {currentTheme, setTheme, themes, styles} from './Theme';
import {Text} from './components/common/atoms';
import {
  DEFAULT_API_URL,
  DEFAULT_MAX_SIDE,
  DISCOVER_URL,
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
};

AsyncStorage.getItem('settings').then(s => {
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
});

app.openProfile = u => {};
app.openLeftMenu = o => {};
app.openRightMenu = o => {};
app.openInvite = i => {};
app.openBotInvite = i => {};
app.openServer = s => {};
app.openChannel = c => {};
app.openImage = a => {};
app.openMessage = m => {};
app.openServerContextMenu = s => {};
app.openSettings = o => {};
app.setMessageBoxInput = t => {};
app.setReplyingMessages = (m, a) => {};
app.getReplyingMessages = () => {};
app.pushToQueue = m => {};

export function setFunction(name: string, func: any) {
  app[name] = func;
}

const apiURL = (app.settings.get('app.instance') as string) ?? DEFAULT_API_URL;

console.log(`[AUTH] Creating client... (instance: ${apiURL})`);

export const client = new Client({
  unreads: true,
  apiURL: apiURL,
});

export const defaultMarkdownIt = MarkdownIt({typographer: true, linkify: true})
  .disable(['image'])
  .use(spoilerPlugin);

export const openUrl = (url: string) => {
  console.log(`[FUNCTIONS] Handling URL: ${url}`);
  if (url.startsWith('/@')) {
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
    app.openInvite(match[0].split('/').pop());
    return;
  }
  let botmatch = url.match(RE_BOT_INVITE);
  if (botmatch) {
    app.openBotInvite(botmatch[0].split('/').pop());
    return;
  }

  Linking.openURL(url);
};

const spoilerStyle = {
  hiddenSpoiler: {
    backgroundColor: '#000',
    color: 'transparent',
  },
  revealedSpoiler: {
    backgroundColor: currentTheme.backgroundSecondary,
    color: currentTheme.foregroundPrimary,
  },
};

const SpoilerContext = React.createContext();
const Spoiler = ({content}) => {
  const [revealed, setRevealed] = React.useState(false);
  return (
    <SpoilerContext.Provider value={revealed}>
      <Text onPress={() => setRevealed(!revealed)}>{content}</Text>
    </SpoilerContext.Provider>
  );
};

// the text and code_inline rules are the same as the built-in ones,
// except with spoiler support
const spoilerRule = {
  spoiler: (node, children) => <Spoiler key={node.key} content={children} />,
  text: (node, children, parent, styles, inheritedStyles = {}) => {
    if (hasParents(parent, 'spoiler')) {
      return (
        <SpoilerContext.Consumer key={node.key}>
          {isRevealed => (
            <Text
              style={{
                ...inheritedStyles,
                ...styles.text,
                ...(isRevealed
                  ? spoilerStyle.revealedSpoiler
                  : spoilerStyle.hiddenSpoiler),
              }}>
              {node.content}
            </Text>
          )}
        </SpoilerContext.Consumer>
      );
    }

    return (
      <Text key={node.key} style={{...inheritedStyles, ...styles.text}}>
        {node.content}
      </Text>
    );
  },
  code_inline: (node, children, parent, styles, inheritedStyles = {}) => {
    if (hasParents(parent, 'spoiler')) {
      return (
        <SpoilerContext.Consumer key={node.key}>
          {isRevealed => (
            <Text
              style={{
                ...inheritedStyles,
                ...styles.code_inline,
                ...(isRevealed
                  ? spoilerStyle.revealedSpoiler
                  : spoilerStyle.hiddenSpoiler),
              }}>
              {node.content}
            </Text>
          )}
        </SpoilerContext.Consumer>
      );
    }

    return (
      <Text key={node.key} style={{...inheritedStyles, ...styles.code_inline}}>
        {node.content}
      </Text>
    );
  },
};

export const MarkdownView = (props: any) => {
  let newProps = {...props};
  if (!newProps.onLinkPress) {
    newProps = Object.assign({onLinkPress: openUrl}, newProps);
  }
  if (!newProps.markdownit) {
    newProps = Object.assign({markdownit: defaultMarkdownIt}, newProps);
  }
  if (!newProps.rules) {
    newProps = Object.assign({rules: spoilerRule}, newProps);
  }
  if (!newProps.style) {
    newProps = Object.assign({style: {}}, newProps);
  }
  if (!newProps.style.body) {
    newProps.style = Object.assign({body: {}}, newProps.style);
  }
  newProps.style.body = Object.assign(
    {color: currentTheme.foregroundPrimary},
    newProps.style.body,
  );
  if (!newProps.style.paragraph) {
    newProps.style = Object.assign({paragraph: {}}, newProps.style);
  }
  newProps.style.paragraph = Object.assign(
    {color: currentTheme.foregroundPrimary, marginTop: -3, marginBottom: 2},
    newProps.style.paragraph,
  );
  if (!newProps.style.link) {
    newProps.style = Object.assign({link: {}}, newProps.style);
  }
  newProps.style.link = Object.assign(
    {color: currentTheme.accentColor},
    newProps.style.link,
  );
  if (!newProps.style.code_inline) {
    newProps.style = Object.assign({code_inline: {}}, newProps.style);
  }
  newProps.style.code_inline = Object.assign(
    {
      color: currentTheme.foregroundPrimary,
      backgroundColor: currentTheme.backgroundSecondary,
    },
    newProps.style.code_inline,
  );
  if (!newProps.style.fence) {
    newProps.style = Object.assign({fence: {}}, newProps.style);
  }
  newProps.style.fence = Object.assign(
    {
      color: currentTheme.foregroundPrimary,
      backgroundColor: currentTheme.backgroundSecondary,
      borderWidth: 0,
    },
    newProps.style.fence,
  );
  if (!newProps.style.code_block) {
    newProps.style = Object.assign({code_block: {}}, newProps.style);
  }
  newProps.style.code_block = Object.assign(
    {
      borderColor: currentTheme.foregroundPrimary,
      color: currentTheme.foregroundPrimary,
      backgroundColor: currentTheme.backgroundSecondary,
    },
    newProps.style.code_block,
  );
  if (!newProps.style.blockquote) {
    newProps.style = Object.assign({blockquote: {}}, newProps.style);
  }
  newProps.style.blockquote = Object.assign(
    {
      marginBottom: 2,
      paddingVertical: 6,
      borderRadius: 4,
      borderColor: currentTheme.foregroundPrimary,
      color: currentTheme.foregroundPrimary,
      backgroundColor: currentTheme.blockQuoteBackground,
    },
    newProps.style.block_quote,
  );
  try {
    return <Markdown {...newProps}>{newProps.children}</Markdown>;
  } catch (e) {
    return <Text>Error rendering markdown</Text>;
  }
};

export function parseRevoltNodes(text: string) {
  text = text.replace(/<@[0-9A-Z]*>/g, ping => {
    let id = ping.slice(2, -1);
    let user = client.users.get(id);
    if (user) {
      return `[@${user.username}](/@${user._id})`;
    }
    return ping;
  });
  text = text.replace(/<#[0-9A-Z]*>/g, ping => {
    let id = ping.slice(2, -1);
    let channel = client.channels.get(id);
    if (channel) {
      return `[#${channel.name
        ?.split(']')
        .join('\\]')
        .split('[')
        .join('\\[')
        .split('*')
        .join('\\*')
        .split('`')
        .join('\\`')}](/server/${channel.server?._id}/channel/${channel._id})`;
    }
    return ping;
  });
  text = text.replace(/:[0-9A-Z]*:/g, ping => {
    let id = ping.slice(1, -1);
    let emoji = client.emojis.get(id);
    if (emoji) {
      return `!EMOJI - [${emoji.name}](${emoji.imageURL}) - EMOJI!`;
    }
    return ping;
  });
  return text;
}

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

export const ServerList = observer(
  ({
    onServerPress,
    onServerLongPress,
    filter,
    showUnread = true,
    showDiscover = true,
  }) => {
    let servers = [...client.servers.values()];
    if (filter) {
      servers = servers.filter(filter);
    }
    return (
      <View key={'server-list-container'}>
        {servers.map(s => {
          let iconURL = s.generateIconURL();
          let pings = s.getMentions().length;
          let initials = '';
          for (const word of s.name.split(' ')) {
            initials += word.charAt(0);
          }
          return (
            <View key={`${s._id}-indicator-container`}>
              {showUnread && s.getMentions().length > 0 ? (
                <View
                  key={`${s._id}-mentions-indicator`}
                  style={{
                    borderRadius: 10000,
                    backgroundColor: currentTheme.error,
                    height: 20,
                    width: 20,
                    marginBottom: -20,
                    left: 34,
                    zIndex: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    key={`${s._id}-mentions-indicator-count`}
                    style={{color: '#FFFFFF', marginRight: 1, marginBottom: 2}}>
                    {pings > 9 ? '9+' : pings}
                  </Text>
                </View>
              ) : showUnread && s.isUnread() ? (
                <View
                  key={`${s._id}-unreads-indicator`}
                  style={{
                    borderRadius: 10000,
                    borderWidth: 3,
                    borderColor: currentTheme.background,
                    backgroundColor: currentTheme.foregroundPrimary,
                    height: 20,
                    width: 20,
                    marginBottom: -20,
                    left: 34,
                    zIndex: 2,
                  }}
                />
              ) : null}
              <TouchableOpacity
                onPress={() => {
                  onServerPress(s);
                }}
                onLongPress={() => {
                  onServerLongPress(s);
                }}
                key={s._id}
                style={styles.serverButton}>
                {iconURL ? (
                  <Image
                    key={`${s._id}-icon`}
                    source={{uri: iconURL + '?max_side=' + DEFAULT_MAX_SIDE}}
                    style={styles.serverIcon}
                  />
                ) : (
                  <Text
                    key={`${s._id}-initials`}
                    style={styles.serverButtonInitials}>
                    {initials}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
        {/* {showDiscover ? (
          <>
            <View
              style={{
                margin: 6,
                height: 2,
                width: '80%',
                backgroundColor: currentTheme.backgroundPrimary,
              }}
            />
            <TouchableOpacity
              onPress={() => {
                openUrl('https://rvlt.gg/discover');
              }}
              key={'serverlist-discover'}
              style={styles.serverButton}>
              <View style={{alignItems: 'center'}}>
                <MaterialCommunityIcon
                  name={'compass'}
                  size={25}
                  color={currentTheme.foregroundPrimary}
                />
              </View>
            </TouchableOpacity>
          </>
        ) : null} */}
      </View>
    );
  },
);

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
  channel: 'Home' | 'Friends' | 'Saved Notes';
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
    <FA5Icon name="house-user" size={20} color={color} />
  ) : channel.channel === 'Friends' ? (
    <FA5Icon name="users" size={20} color={color} />
  ) : channel.channel === 'Saved Notes' ? (
    <MaterialIcon name="sticky-note-2" size={24} color={color} />
  ) : channel.channel.generateIconURL && channel.channel.generateIconURL() ? (
    <Image
      source={{
        uri: channel.channel.generateIconURL() + '?max_side=' + DEFAULT_MAX_SIDE,
      }}
      style={{
        width: 24,
        height: 24,
        borderRadius: radius,
      }}
    />
  ) : channel.channel.channel_type === 'DirectMessage' ? (
    <FontistoIcon name="at" size={20} color={color} />
  ) : channel.channel.channel_type === 'VoiceChannel' ? (
    <FA5Icon name="volume-up" size={20} color={color} />
  ) : (
    <FontistoIcon name="hashtag" size={20} color={color} />
  );
};

type ChannelListProps = {
  onChannelClick: any;
  currentChannel: Channel;
  currentServer: Server;
};

// thanks a lot, revolt.js 🙄
type Category = {
  id: string;
  title: string;
  channels: string[];
};

const ServerChannelListCategory = observer(
  ({category, props}: {category: Category; props: ChannelListProps}) => {
    const [isVisible, setIsVisible] = React.useState(true);
    return (
      <View key={category.id} style={{marginVertical: 8}}>
        <TouchableOpacity
          key={`${category.id}-title`}
          onPress={() => {
            setIsVisible(!isVisible);
          }}>
          <Text
            style={{
              marginLeft: 12,
              marginBottom: 2,
              fontWeight: 'bold',
            }}>
            {category.title?.toUpperCase()}
          </Text>
        </TouchableOpacity>
        {isVisible &&
          category.channels.map((cid: string) => {
            let c = client.channels.get(cid);
            if (c) {
              return (
                <ChannelButton
                  key={c._id}
                  channel={c}
                  onPress={() => {
                    props.onChannelClick(c);
                  }}
                  selected={props.currentChannel?._id === c._id}
                />
              );
            }
          })}
      </View>
    );
  },
);

const ServerChannelList = observer((props: ChannelListProps) => {
  const [processedChannels, setProcessedChannels] = React.useState(
    [] as string[],
  );
  const [res, setRes] = React.useState([] as JSX.Element[] | undefined);

  React.useEffect(() => {
    let categories = props.currentServer.categories?.map(c => {
      const element = (
        <ServerChannelListCategory
          key={`wrapper-${c.id}`}
          category={c}
          props={props}
        />
      );
      for (const cnl of c.channels) {
        if (!processedChannels.includes(cnl)) {
          let newProcessedChannels = processedChannels;
          newProcessedChannels.push(cnl);
          setProcessedChannels(newProcessedChannels);
        }
      }
      return element;
    });
    setRes(categories);
  }, [props, processedChannels]);

  return (
    <>
      {props.currentServer.banner ? (
        <Image
          source={{uri: props.currentServer.generateBannerURL()}}
          style={{width: '100%', height: 110, justifyContent: 'flex-end'}}>
          <TouchableOpacity
            onPress={() => app.openServerContextMenu(props.currentServer)}>
            <Text style={styles.serverName}>{props.currentServer.name}</Text>
          </TouchableOpacity>
        </Image>
      ) : (
        <TouchableOpacity
          onPress={() => app.openServerContextMenu(props.currentServer)}>
          <Text style={styles.serverName}>{props.currentServer.name}</Text>
        </TouchableOpacity>
      )}

      {props.currentServer.channels.map(c => {
        if (c) {
          if (!processedChannels.includes(c._id)) {
            return (
              <ChannelButton
                key={c._id}
                channel={c}
                onPress={() => {
                  props.onChannelClick(c);
                }}
                selected={props.currentChannel?._id === c._id}
              />
            );
          }
        }
      })}
      {res}
    </>
  );
});

export const ChannelList = observer((props: ChannelListProps) => {
  return (
    <>
      {!props.currentServer ? (
        <>
          <Text
            style={{
              marginLeft: 12,
              margin: 14,
              fontSize: 16,
              fontWeight: 'bold',
            }}>
            Direct Messages
          </Text>

          <ChannelButton
            onPress={async () => {
              props.onChannelClick(null);
            }}
            key={'home'}
            channel={'Home'}
            selected={props.currentChannel === null}
          />

          <ChannelButton
            onPress={() => {
              props.onChannelClick('friends');
            }}
            key={'friends'}
            channel={'Friends'}
            selected={props.currentChannel === 'friends'}
          />

          <ChannelButton
            onPress={async () => {
              props.onChannelClick(await client.user?.openDM());
            }}
            key={'notes'}
            channel={'Saved Notes'}
            selected={props.currentChannel?.channel_type === 'SavedMessages'}
          />

          {[...client.channels.values()]
            .filter(
              c =>
                c.channel_type === 'DirectMessage' ||
                c.channel_type === 'Group',
            )
            .sort((c1, c2) => c2.updatedAt - c1.updatedAt)
            .map(dm => (
              <ChannelButton
                onPress={() => {
                  props.onChannelClick(dm);
                }}
                onLongPress={() => {
                  app.openProfile(dm.recipient);
                }}
                delayLongPress={750}
                key={dm._id}
                channel={dm}
                style={props.currentChannel?._id === dm._id}
              />
            ))}
        </>
      ) : null}
      {props.currentServer ? (
        <ServerChannelList
          onChannelClick={props.onChannelClick}
          currentChannel={props.currentChannel}
          currentServer={props.currentServer}
        />
      ) : null}
    </>
  );
});

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

export const loadingScreenRemarks = [
  "I'm writing a complaint to the Head of Loading Screens.",
  "I don't think we can load any longer!",
  'Fun fact: RVMob is built with React Native.',
  'Better grab a book or something.',
  'When will the madness end?',
  'You know, what does RVMob even stand for?',
  'Why do they call it a "building" if it\'s already built?',
];

export var selectedRemark =
  loadingScreenRemarks[Math.floor(Math.random() * loadingScreenRemarks.length)];
export function randomizeRemark() {
  selectedRemark =
    loadingScreenRemarks[
      Math.floor(Math.random() * loadingScreenRemarks.length)
    ];
}

type ButtonProps = {
  children?: any;
  backgroundColor?: string;
  onPress?: any;
  onLongPress?: any;
  delayLongPress?: number;
  style?: any;
};

export function Button({
  children,
  backgroundColor,
  onPress,
  onLongPress,
  delayLongPress,
  style,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      style={[styles.button, backgroundColor ? {backgroundColor} : {}, style]}
      {...props}>
      {children}
    </TouchableOpacity>
  );
}

export function ContextButton({
  children,
  backgroundColor,
  onPress,
  onLongPress,
  delayLongPress,
  style,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      style={[
        styles.actionTile,
        backgroundColor ? {backgroundColor} : {},
        style,
      ]}
      {...props}>
      {children}
    </TouchableOpacity>
  );
}

export function Input({
  value,
  onChangeText,
  placeholder,
  style,
  backgroundColor,
  ...props
}) {
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
  defaultValue: string;
  placeholder: string;
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

export const Badges = {
  Developer: 1,
  Translator: 2,
  Supporter: 4,
  ResponsibleDisclosure: 8,
  Founder: 16,
  PlatformModeration: 32,
  ActiveSupporter: 64,
  Paw: 128,
  EarlyAdopter: 256,
  ReservedRelevantJokeBadge1: 512,
  ReservedRelevantJokeBadge2: 1024,
};
