import {useContext} from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import type {Server, User, Channel} from 'revolt.js';

import {Avatar} from '@rvmob/components/common/atoms/Avatar';
import {Text} from '@rvmob/components/common/atoms/Text';
import {Username} from '@rvmob/components/common/atoms/Username';
import {ThemeContext} from '@rvmob/lib/themes';

type MiniProfileProps = {
  user?: User;
  scale?: number;
  channel?: Channel;
  server?: Server;
  color?: string;
};

export const MiniProfile = observer(
  ({user, scale, channel, server, color}: MiniProfileProps) => {
    const {currentTheme} = useContext(ThemeContext);

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
