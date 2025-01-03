import {useContext} from 'react';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import type {Channel} from 'revolt.js';

import {Image} from '@rvmob/crossplat/Image';
import {DEFAULT_MAX_SIDE} from '@rvmob/lib/consts';
import {ThemeContext} from '@rvmob/lib/themes';

export const ChannelIcon = ({
  channel,
  showUnread = true,
}: {
  channel: Channel;
  showUnread?: boolean;
}) => {
  const {currentTheme} = useContext(ThemeContext);

  let color =
    showUnread && channel.unread
      ? currentTheme.foregroundPrimary
      : currentTheme.foregroundSecondary;
  let radius =
    channel.channel_type === 'DirectMessage' || channel.channel_type === 'Group'
      ? 10000
      : 0;
  return channel.generateIconURL && channel.generateIconURL() ? (
    <Image
      source={{
        uri: channel.generateIconURL() + '?max_side=' + DEFAULT_MAX_SIDE,
      }}
      style={{
        width: 24,
        height: 24,
        borderRadius: radius,
      }}
    />
  ) : channel.channel_type === 'DirectMessage' ? (
    <MaterialCommunityIcon name="at" size={24} color={color} />
  ) : channel.channel_type === 'VoiceChannel' ? (
    <MaterialIcon name="volume-up" size={24} color={color} />
  ) : (
    <MaterialIcon name="tag" size={24} color={color} />
  );
};
