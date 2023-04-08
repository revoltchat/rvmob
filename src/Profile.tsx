import {observer} from 'mobx-react-lite';
import React from 'react';
import {client, app} from './Generic';
import {currentTheme, styles} from './Theme';
import {Pressable, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Server, User, Message, Channel} from 'revolt.js';
import {Text} from './components/common/atoms';
import {getColour} from './lib/utils';
import {DEFAULT_MAX_SIDE, USER_IDS} from './lib/consts';

const Image = FastImage;

type UsernameProps = {
  server?: Server;
  user?: User;
  noBadge?: boolean;
  size?: number;
  masquerade?: string;
  color?: string;
};

export const Username = observer(
  ({server, user, noBadge, size, masquerade, color}: UsernameProps) => {
    if (typeof user !== 'object') {
      return (
        <Text style={size ? {fontSize: size} : {}}>{'<Unknown User>'}</Text>
      );
    }
    let memberObject = server
      ? client.members.getKey({
          server: server?._id,
          user: user?._id,
        })
      : undefined;
    let roleColor = color ? getColour(color) : styles.textDefault.color;
    let name =
      server && memberObject?.nickname
        ? memberObject?.nickname
        : user?.username;
    if (server && memberObject?.roles && memberObject?.roles?.length > 0) {
      let srv = client.servers.get(memberObject._id.server);
      if (srv?.roles) {
        for (let role of memberObject?.roles) {
          if (srv.roles[role].colour) {
            roleColor = getColour(srv.roles[role].colour!);
          }
        }
      }
    }
    let badgeSize = (size || 14) * 0.6;
    let bridgedMessage =
      user?._id === USER_IDS.automod && masquerade !== undefined;
    let badgeStyle = {
      color: currentTheme.accentColorForeground,
      backgroundColor: currentTheme.accentColor,
      marginLeft: badgeSize * 0.3,
      paddingLeft: badgeSize * 0.4,
      paddingRight: badgeSize * 0.4,
      borderRadius: 3,
      fontSize: badgeSize,
      height: badgeSize + badgeSize * 0.45,
      top: badgeSize * 0.5,
    };
    return (
      <View style={{flexDirection: 'row'}}>
        <Text
          colour={roleColor}
          style={{fontWeight: 'bold', fontSize: size || 14}}>
          {masquerade ?? name}
        </Text>
        {!noBadge ? (
          <>
            {bridgedMessage ? (
              <Text style={badgeStyle}>BRIDGE</Text>
            ) : (
              <>
                {user?.bot ? <Text style={badgeStyle}>BOT</Text> : null}
                {masquerade ? <Text style={badgeStyle}>MASQ.</Text> : null}
                {user?._id === USER_IDS.platformModeration ? (
                  <Text style={badgeStyle}>SYSTEM</Text>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </View>
    );
  },
);

type AvatarProps = {
  channel?: Channel;
  user?: User;
  server?: Server;
  status?: boolean;
  size?: number;
  backgroundColor?: string;
  masquerade?: Message['masquerade'];
  pressable?: boolean;
};

export const Avatar = observer(
  ({
    channel,
    user,
    server,
    status,
    size,
    backgroundColor,
    masquerade,
    pressable,
  }: AvatarProps) => {
    let memberObject =
      server && user
        ? client.members.getKey({
            server: server?._id,
            user: user?._id,
          })
        : null;
    let statusColor;
    let statusScale = 2.7;
    if (status) {
      const s = user?.online ? user.status?.presence || 'Online' : 'Offline';
      statusColor = currentTheme[`status${s}`];
    }
    let Container = pressable
      ? ({children}) => (
          <Pressable
            onPress={() => app.openImage(memberObject?.avatar || user?.avatar)}>
            {children}
          </Pressable>
        )
      : View;
    if (user) {
      return (
        <Container>
          <Image
            source={{
              uri:
                (masquerade
                  ? masquerade
                  : server &&
                    memberObject?.generateAvatarURL &&
                    memberObject?.generateAvatarURL()
                  ? memberObject?.generateAvatarURL()
                  : user?.generateAvatarURL()) +
                '?max_side=' +
                DEFAULT_MAX_SIDE,
            }}
            style={{width: size || 35, height: size || 35, borderRadius: 10000}}
          />
          {status ? (
            <View
              style={{
                width: Math.round(size / statusScale),
                height: Math.round(size / statusScale),
                backgroundColor: statusColor,
                borderRadius: 10000,
                marginTop: -Math.round(size / statusScale),
                left: size - Math.round(size / statusScale),
                borderWidth: Math.round(size / 20),
                borderColor: backgroundColor || currentTheme.backgroundPrimary,
              }}
            />
          ) : null}
          {masquerade && app.settings.get('ui.messaging.showMasqAvatar') ? (
            <Image
              style={{
                width: Math.round(size / statusScale),
                height: Math.round(size / statusScale),
                marginBottom: -Math.round(size / statusScale),
                bottom: size,
                borderRadius: 10000,
                borderWidth: Math.round(size / 30),
                borderColor: backgroundColor || currentTheme.backgroundPrimary,
              }}
              source={{
                uri:
                  server &&
                  memberObject?.generateAvatarURL &&
                  memberObject?.generateAvatarURL()
                    ? memberObject?.generateAvatarURL()
                    : user?.generateAvatarURL(),
              }}
            />
          ) : null}
        </Container>
      );
    }
    if (channel) {
      return (
        <View>
          {channel?.generateIconURL() ? (
            <Image
              source={{
                uri:
                  channel?.generateIconURL() + '?max_side=' + DEFAULT_MAX_SIDE,
              }}
              style={{
                width: size || 35,
                height: size || 35,
                borderRadius: 10000,
              }}
            />
          ) : null}
        </View>
      );
    }
    return <></>;
  },
);

type MiniProfileProps = {
  user?: User;
  scale?: number;
  channel?: Channel;
  server?: Server;
  color?: string;
};

export const MiniProfile = observer(
  ({user, scale, channel, server, color}: MiniProfileProps) => {
    if (user) {
      return (
        <View style={{flexDirection: 'row'}} key={`mini-profile-${user._id}`}>
          <Avatar
            key={`mini-profile-${user._id}-avatar`}
            user={user}
            server={server}
            size={35 * (scale || 1)}
            status
          />
          <View
            key={`mini-profile-${user._id}-text-wrapper`}
            style={{marginLeft: 10 * (scale || 1)}}>
            <Username
              user={user}
              server={server}
              color={color || currentTheme.foregroundPrimary}
              size={14 * (scale || 1)}
            />
            <Text
              colour={color || currentTheme.foregroundPrimary}
              style={{
                marginTop: -3 * (scale || 1),
                fontSize: 14 * (scale || 1),
              }}>
              {user.online
                ? user.status?.text || user.status?.presence || 'Online'
                : 'Offline'}
            </Text>
          </View>
        </View>
      );
    }

    if (channel) {
      return (
        <View style={{flexDirection: 'row'}}>
          <Avatar channel={channel} size={35 * (scale || 1)} />
          <View style={{marginLeft: 10 * (scale || 1)}}>
            <Text
              colour={color || currentTheme.foregroundPrimary}
              style={{
                fontSize: 14 * (scale || 1),
                fontWeight: 'bold',
              }}>
              {channel.name}
            </Text>
            <Text
              colour={color || currentTheme.foregroundPrimary}
              style={{
                marginTop: -3 * (scale || 1),
                fontSize: 14 * (scale || 1),
              }}>
              {channel?.recipient_ids?.length} members
            </Text>
          </View>
        </View>
      );
    }

    return <></>;
  },
);

type RoleViewProps = {
  server: Server;
  user: User;
};

export const RoleView = observer(({server, user}: RoleViewProps) => {
  let memberObject = client.members.getKey({
    server: server?._id,
    user: user?._id,
  });

  let roles = memberObject?.roles?.map(r => server.roles![r]) || null;
  return memberObject && roles ? (
    <>
      <Text style={styles.profileSubheader}>ROLES</Text>
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        {roles.map(r => (
          <View
            style={{
              flexDirection: 'row',
              padding: 6,
              paddingLeft: 8,
              paddingRight: 8,
              margin: 2,
              backgroundColor: currentTheme.backgroundPrimary,
              borderRadius: 8,
            }}>
            <View
              style={{
                borderRadius: 10000,
                backgroundColor: r.colour || currentTheme.foregroundSecondary,
                height: 16,
                width: 16,
                margin: 2,
                marginRight: 6,
              }}
            />
            <Text>{r.name}</Text>
          </View>
        ))}
      </View>
    </>
  ) : null;
});
