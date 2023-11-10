import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Channel} from 'revolt.js';

import {ChannelIcon} from '@rvmob/components/navigation/ChannelIcon';
import {MiniProfile} from '@rvmob/Profile';
import {currentTheme, styles} from '@rvmob/Theme';
import {Text} from './Text';

type ChannelButtonProps = {
  channel: Channel | 'Home' | 'Friends' | 'Saved Notes' | 'Debug';
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
      showUnread && channel instanceof Channel && channel.unread
        ? currentTheme.foregroundPrimary
        : currentTheme.foregroundTertiary;
    let pings = channel instanceof Channel ? channel.mentions?.length : 0;
    let classes = [styles.channelButton];
    if (selected) {
      classes.push(styles.channelButtonSelected);
    }
    if (
      channel instanceof Channel &&
      (channel.channel_type === 'DirectMessage' ||
        channel.channel_type === 'Group')
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
        key={
          channel instanceof Channel
            ? channel._id
            : `channel-special-${channel}`
        }
        style={classes}>
        {channel instanceof Channel &&
        channel.channel_type === 'DirectMessage' ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              maxWidth: '80%',
            }}>
            <MiniProfile user={channel.recipient} color={color} />
          </View>
        ) : channel instanceof Channel && channel.channel_type === 'Group' ? (
          <MiniProfile channel={channel} color={color} />
        ) : (
          <>
            <View style={styles.iconContainer}>
              <ChannelIcon
                channel={{type: 'channel', channel: channel as Channel}}
              />
            </View>
            <Text style={{flex: 1, fontWeight: 'bold', color, fontSize: 15}}>
              {channel instanceof Channel ? channel.name ?? channel : channel}
            </Text>
            {showUnread && channel instanceof Channel && pings > 0 ? (
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
            ) : showUnread && channel instanceof Channel && channel.unread ? (
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
