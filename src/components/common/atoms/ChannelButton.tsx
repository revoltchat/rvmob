import {useContext} from 'react';
import {StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Channel} from 'revolt.js';

import {MiniProfile} from '@rvmob/components/common/profile';
import {ChannelIcon} from '@rvmob/components/navigation/ChannelIcon';
import {SpecialChannelIcon} from '@rvmob/components/navigation/SpecialChannelIcon';
import {styles} from '@rvmob/Theme';
import {Text} from '@rvmob/components/common/atoms/Text';
import {commonValues, Theme, ThemeContext} from '@rvmob/lib/themes';

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
    const {currentTheme} = useContext(ThemeContext);
    const localStyles = generateLocalStyles(currentTheme);

    let color =
      showUnread && channel instanceof Channel && channel.unread
        ? currentTheme.foregroundPrimary
        : currentTheme.foregroundTertiary;

    let pings = channel instanceof Channel ? channel.mentions?.length : 0;

    let classes: ViewStyle[] = [localStyles.channelButton];

    if (selected) {
      classes.push(localStyles.channelButtonSelected);
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
        style={{
          ...localStyles.channelButton,
          ...(selected && localStyles.channelButtonSelected),
        }}>
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
              {channel instanceof Channel ? (
                <ChannelIcon channel={channel} />
              ) : (
                <SpecialChannelIcon channel={channel} />
              )}
            </View>
            <Text style={{flex: 1, fontWeight: 'bold', color, fontSize: 15}}>
              {channel instanceof Channel
                ? channel.name ?? `${channel}`
                : channel}
            </Text>
            {showUnread && channel instanceof Channel && pings > 0 ? (
              <View style={localStyles.mentionIndicator}>
                <Text style={localStyles.mentionCount}>
                  {pings > 9 ? '9+' : pings}
                </Text>
              </View>
            ) : showUnread && channel instanceof Channel && channel.unread ? (
              <View style={localStyles.unreadIndicator} />
            ) : null}
          </>
        )}
      </TouchableOpacity>
    );
  },
);

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    channelButton: {
      marginHorizontal: commonValues.sizes.medium,
      borderRadius: commonValues.sizes.medium,
      padding: commonValues.sizes.medium,
      flexDirection: 'row',
      alignItems: 'center',
    },
    channelButtonSelected: {
      backgroundColor: currentTheme.hover,
    },
    mentionIndicator: {
      width: 20,
      height: 20,
      marginHorizontal: commonValues.sizes.small,
      borderRadius: 10000,
      backgroundColor: currentTheme.error,
      justifyContent: 'center',
      alignItems: 'center',
    },
    mentionCount: {color: '#FFFFFF', marginRight: 1, marginBottom: 2},
    unreadIndicator: {
      width: commonValues.sizes.large,
      height: commonValues.sizes.large,
      marginHorizontal: commonValues.sizes.medium,
      borderRadius: 10000,
      backgroundColor: currentTheme.foregroundPrimary,
    },
  });
};
