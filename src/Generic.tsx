import Markdown, {hasParents, MarkdownIt} from 'react-native-markdown-display';
import ReactNative, {
  View,
  TouchableOpacity,
  Linking,
  TextInput,
  ViewStyle,
} from 'react-native';
import {Channel, Client, Server} from 'revolt.js';
import {currentTheme, setTheme, themes, styles} from './Theme';
import {MiniProfile} from './Profile';
import React, {useState} from 'react';
import {observer} from 'mobx-react-lite';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import FastImage from 'react-native-fast-image';
import spoilerPlugin from '@traptitech/markdown-it-spoiler';
const Image = FastImage;
export const app = {
  settings: {
    Theme: {
      name: 'Theme',
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
    'ui.messaging.showSelfInTypingIndicator': {
      name: 'Show yourself in the typing indicator',
      default: true,
      type: 'boolean',
    },
    'Show user status in chat avatars': {
      name: 'Show user status in chat avatars',
      default: false,
      type: 'boolean',
    },
    'ui.messaging.use24H': {
      name: 'Use 24-hour timestamps',
      default: true,
      type: 'boolean',
    },
    'Show masqueraded avatar in corner': {
      name: 'Show masqueraded avatar in corner',
      default: true,
      type: 'boolean',
    },
    'Refetch messages on reconnect': {
      name: 'Refetch messages when reconnecting',
      default: true,
      type: 'boolean',
    },
    'Push notifications': {
      name: 'Enable push notifications',
      default: false,
      type: 'boolean',
      experimental: true,
    },
    'Notify for pings from yourself': {
      name: 'Receive a notification when you ping yourself',
      default: false,
      type: 'boolean',
      developer: true,
    },
    'Message spacing': {
      name: 'Message spacing',
      default: '3',
      type: 'number',
    },
    'Consented to 18+ content': {
      name: 'Consent to 18+ content',
      default: false,
      type: 'boolean',
    },
    'Show experimental features': {
      name: 'Show experimental features',
      default: false,
      type: 'boolean',
    },
    'Show developer tools': {
      name: 'Show developer tools',
      default: false,
      type: 'boolean',
    },
  },
};

app.settings.getRaw = k => {
  return typeof app.settings[k].value ==
    (app.settings[k].type == 'number' ? 'string' : app.settings[k].type)
    ? app.settings[k].value
    : app.settings[k].default;
};
app.settings.get = k => {
  if (!app.settings[k]) {
    console.warn(`No setting named "${k}"`);
    return null;
  }
  let raw =
    typeof app.settings[k].value ==
      (app.settings[k].type == 'number' ? 'string' : app.settings[k].type) &&
    (app.settings[k].experimental
      ? app.settings['Show experimental features'].value
      : true) &&
    (app.settings[k].developer
      ? app.settings['Show developer tools'].value
      : true)
      ? app.settings[k].value
      : app.settings[k].default;
  return app.settings[k].type == 'number' ? parseInt(raw) || 0 : raw;
};
app.settings.set = (k, v) => {
  app.settings[k].value = v;
  app.settings[k].onChange && app.settings[k].onChange(v);
  app.settings.save();
};
app.settings.save = async () => {
  let out = {};
  Object.keys(app.settings)
    .filter(s => typeof app.settings[s] == 'object')
    .forEach(s => (out[s] = app.settings[s].value));
  await AsyncStorage.setItem('settings', JSON.stringify(out));
};
app.settings.clear = async () => {
  await AsyncStorage.setItem('settings', '{}');
  Object.keys(app.settings).forEach(s => {
    delete app.settings[s].value;
    app.settings[s].onChange &&
      app.settings[s].onChange(app.settings[s].default);
  });
};

// i gotta say github copilot is actually pretty good at this
AsyncStorage.getItem('settings').then(s => {
  if (s) {
    try {
      const settings = JSON.parse(s);
      Object.keys(settings).forEach(key => {
        if (app.settings[key]) {
          app.settings[key].value = settings[key];
          app.settings[key].onInitialize &&
            app.settings[key].onInitialize(settings[key]);
        } else {
          console.warn(`Unknown setting ${key}`);
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

export function setFunction(name, func) {
  app[name] = func;
}

export const defaultMaxSide = '128';
export const defaultMessageLoadCount = 50;

export const client = new Client({
  unreads: true,
  apiURL: 'https://api.revolt.chat',
});

export const Text = (props: any) => {
  let newProps = {...props};
  if (!props.style) {
    newProps = Object.assign({style: {}}, newProps);
  }
  const useInter = newProps.useInter && newProps.useInter === true;
  const font = useInter ? 'Inter' : 'Open Sans';
  newProps.style = Object.assign(
    {
      color: currentTheme.foregroundPrimary,
      flexWrap: 'wrap',
      fontFamily: font,
    },
    newProps.style,
  );
  return <ReactNative.Text {...newProps}>{newProps.children}</ReactNative.Text>;
};

export const defaultMarkdownIt = MarkdownIt({typographer: true, linkify: true})
  .disable(['image'])
  .use(spoilerPlugin);

export const INVITE_PATHS = [
  'app.revolt.chat/invite',
  'nightly.revolt.chat/invite',
  'local.revolt.chat/invite',
  'rvlt.gg',
];
export const RE_INVITE = new RegExp(
  `(?:${INVITE_PATHS.map(x => x?.split('.').join('\\.')).join(
    '|',
  )})/([A-Za-z0-9]*)`,
  'g',
);

export const BOT_INVITE_PATHS = [
  'app.revolt.chat/bot',
  'nightly.revolt.chat/bot',
  'local.revolt.chat/bot',
];
export const RE_BOT_INVITE = new RegExp(
  `(?:${BOT_INVITE_PATHS.map(x => x.split('.').join('\\.')).join(
    '|',
  )})/([A-Za-z0-9]*)`,
  'g',
);

export const openUrl = (url: string) => {
  console.log(`handling url ${url}`);
  if (url.startsWith('/@')) {
    let id = url.slice(2);
    let user = client.users.get(id);
    if (user) {
      app.openProfile(user);
    }
    return;
  }
  let match = url.match(RE_INVITE);
  if (match) {
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
  if (!newProps.onLinkPress)
    newProps = Object.assign({onLinkPress: openUrl}, newProps);
  if (!newProps.markdownit)
    newProps = Object.assign({markdownit: defaultMarkdownIt}, newProps);
  if (!newProps.rules) newProps = Object.assign({rules: spoilerRule}, newProps);
  if (!newProps.style) newProps = Object.assign({style: {}}, newProps);
  if (!newProps.style.body)
    newProps.style = Object.assign({body: {}}, newProps.style);
  newProps.style.body = Object.assign(
    {color: currentTheme.foregroundPrimary},
    newProps.style.body,
  );
  if (!newProps.style.paragraph)
    newProps.style = Object.assign({paragraph: {}}, newProps.style);
  newProps.style.paragraph = Object.assign(
    {color: currentTheme.foregroundPrimary, marginTop: -3, marginBottom: 2},
    newProps.style.paragraph,
  );
  if (!newProps.style.link)
    newProps.style = Object.assign({link: {}}, newProps.style);
  newProps.style.link = Object.assign(
    {color: currentTheme.accentColor},
    newProps.style.link,
  );
  if (!newProps.style.code_inline)
    newProps.style = Object.assign({code_inline: {}}, newProps.style);
  newProps.style.code_inline = Object.assign(
    {
      color: currentTheme.foregroundPrimary,
      backgroundColor: currentTheme.backgroundSecondary,
    },
    newProps.style.code_inline,
  );
  if (!newProps.style.fence)
    newProps.style = Object.assign({fence: {}}, newProps.style);
  newProps.style.fence = Object.assign(
    {
      color: currentTheme.foregroundPrimary,
      backgroundColor: currentTheme.backgroundSecondary,
      borderWidth: 0,
    },
    newProps.style.fence,
  );
  if (!newProps.style.code_block)
    newProps.style = Object.assign({code_block: {}}, newProps.style);
  newProps.style.code_block = Object.assign(
    {
      borderColor: currentTheme.foregroundPrimary,
      color: currentTheme.foregroundPrimary,
      backgroundColor: currentTheme.backgroundSecondary,
    },
    newProps.style.code_block,
  );
  if (!newProps.style.blockquote)
    newProps.style = Object.assign({blockquote: {}}, newProps.style);
  newProps.style.blockquote = Object.assign(
    {
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
  return text;
}

export const GeneralAvatar = (attachment, size: number) => {
  return (
    <View>
      {
        <Image
          source={{
            uri:
              client.generateFileURL(attachment) +
              '?max_side=' +
              defaultMaxSide,
          }}
          style={{width: size || 35, height: size || 35, borderRadius: 10000}}
        />
      }
    </View>
  );
};

export const ServerList = observer(
  ({onServerPress, onServerLongPress, filter, showUnread = true}) => {
    let servers = [...client.servers.values()];
    if (filter) servers = servers.filter(filter);
    return servers.map(s => {
      let iconURL = s.generateIconURL();
      let pings = s.getMentions().length;
      let initials = '';
      for (const word of s.name.split(' ')) {
        initials += word.charAt(0);
      }
      return (
        <View>
          {showUnread && s.getMentions().length > 0 ? (
            <View
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
              <Text style={{color: '#FFFFFF', marginRight: 1, marginBottom: 2}}>
                {pings > 9 ? '9+' : pings}
              </Text>
            </View>
          ) : showUnread && s.isUnread() ? (
            <View
              style={{
                borderRadius: 10000,
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
                source={{uri: iconURL + '?max_side=' + defaultMaxSide}}
                style={styles.serverIcon}
              />
            ) : (
              <Text>{initials}</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    });
  },
);

type ChannelButtonProps = {
  channel: Channel;
  onPress: any;
  onLongPress: any;
  delayLongPress: number;
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
        key={channel._id}
        style={classes}>
        {channel.channel_type == 'DirectMessage' ? (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <MiniProfile user={channel.recipient} color={color} />
          </View>
        ) : channel.channel_type == 'Group' ? (
          <MiniProfile channel={channel} color={color} />
        ) : (
          <>
            <View style={styles.iconContainer}>
              <ChannelIcon channel={channel} />
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

export const ChannelIcon = ({
  channel,
  showUnread = true,
}: {
  channel: any; // FIXME: realistically it's a Channel | string but this is easier for the moment
  showUnread?: boolean;
}) => {
  let color =
    showUnread && channel.unread
      ? currentTheme.foregroundPrimary
      : currentTheme.foregroundSecondary;
  return channel.generateIconURL && channel.generateIconURL() ? (
    <Image
      source={{uri: channel.generateIconURL() + '?max_side=' + defaultMaxSide}}
      style={{width: 24, height: 24}}
    />
  ) : channel === 'Home' ? (
    <FA5Icon name="house-user" size={20} color={color} />
  ) : channel === 'Friends' ? (
    <FA5Icon name="users" size={20} color={color} />
  ) : channel === 'Saved Notes' ? (
    <MaterialIcon name="sticky-note-2" size={24} color={color} />
  ) : channel.channel_type === 'DirectMessage' ? (
    <FontistoIcon name="at" size={20} color={color} />
  ) : channel.channel_type === 'VoiceChannel' ? (
    <FA5Icon name="volume-up" size={20} color={color} />
  ) : (
    <FontistoIcon name="hashtag" size={20} color={color} />
  );
};

export const ChannelList = observer(props => {
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
                style={props.currentChannel?._id == dm._id}
              />
            ))}
        </>
      ) : null}
      {props.currentServer ? (
        <>
          {props.currentServer.banner ? (
            <Image
              source={{uri: props.currentServer.generateBannerURL()}}
              style={{width: '100%', height: 110, justifyContent: 'flex-end'}}>
              <Text style={styles.serverName}>{props.currentServer.name}</Text>
            </Image>
          ) : (
            <Text style={styles.serverName}>{props.currentServer.name}</Text>
          )}
          {(() => {
            let processedChannels = [] as string[];
            let res = props.currentServer.categories?.map(c => {
              return (
                <View key={c.id}>
                  <Text
                    style={{
                      marginLeft: 12,
                      marginTop: 8,
                      marginBottom: 2,
                      fontWeight: 'bold',
                    }}>
                    {c.title?.toUpperCase()}
                  </Text>
                  {c.channels.map((cid: string) => {
                    processedChannels.push(cid);
                    let c = client.channels.get(cid);
                    if (c) {
                      return (
                        <ChannelButton
                          key={c._id}
                          channel={c}
                          onPress={() => {
                            props.onChannelClick(c);
                          }}
                          selected={props.currentChannel?._id == c._id}
                        />
                      );
                    }
                  })}
                </View>
              );
            });
            return (
              <>
                {props.currentServer.channels.map(c => {
                  if (c) {
                    if (!processedChannels.includes(c._id))
                      return (
                        <ChannelButton
                          key={c._id}
                          channel={c}
                          onPress={() => {
                            props.onChannelClick(c);
                          }}
                          selected={props.currentChannel?._id == c._id}
                        />
                      );
                  }
                })}
                {res}
              </>
            );
          })()}
        </>
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

export const remarkStyle = {
  color: currentTheme.foregroundSecondary,
  textAlign: 'center',
  fontSize: 16,
  marginTop: 5,
};
export const loadingScreenRemarks = [
  <Text style={remarkStyle}>
    I'm writing a complaint to the Head of Loading Screens.
  </Text>,
  <Text style={remarkStyle}>I don't think we can load any longer!</Text>,
  <Text style={remarkStyle}>Fun fact: RVMob is built with React Native.</Text>,
  <Text style={remarkStyle}>Better grab a book or something.</Text>,
  <Text style={remarkStyle}>When will the madness end?</Text>,
  <Text style={remarkStyle}>You know, what does RVMob even stand for?</Text>,
  <Text style={remarkStyle}>
    Why do they call it a "building" if it's already built?
  </Text>,
];
export var selectedRemark =
  loadingScreenRemarks[Math.floor(Math.random() * loadingScreenRemarks.length)];
export function randomizeRemark() {
  selectedRemark =
    loadingScreenRemarks[
      Math.floor(Math.random() * loadingScreenRemarks.length)
    ];
}

export function Button({
  children,
  backgroundColor,
  onPress,
  onLongPress,
  delayLongPress,
  style,
  ...props
}) {
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
}) {
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
  let [value, setValue] = useState(defaultValue);
  return (
    //style.input and style.button are applied to the input and button respectively
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: '100%',
      }}>
      <TextInput
        value={value}
        onChangeText={v => {
          setValue(v);
        }}
        placeholder={placeholder}
        style={{
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
        style={[styles.button, backgroundColor ? {backgroundColor} : {}]}>
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
