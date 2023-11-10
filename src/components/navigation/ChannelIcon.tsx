import React from 'react';

import FastImage from 'react-native-fast-image';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Channel} from 'revolt.js';

import {DEFAULT_MAX_SIDE} from '@rvmob/lib/consts';
import {currentTheme} from '@rvmob/Theme';

const Image = FastImage;

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
