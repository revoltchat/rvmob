import {useContext} from 'react';
import {Pressable, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Server, User, Channel} from 'revolt.js';

import {Image} from '@rvmob/crossplat/Image';
import {app} from '@rvmob/Generic';
import {client} from '@rvmob/lib/client';
import {DEFAULT_MAX_SIDE} from '@rvmob/lib/consts';
import {ThemeContext} from '@rvmob/lib/themes';

type AvatarProps = {
  channel?: Channel;
  user?: User | null;
  server?: Server;
  status?: boolean;
  size?: number;
  backgroundColor?: string;
  masquerade?: string;
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
    const {currentTheme} = useContext(ThemeContext);

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
