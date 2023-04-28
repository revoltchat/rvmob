import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Message} from 'revolt.js';

import {currentTheme} from '../Theme';
import {Text} from './common/atoms';

export const Notification = observer(
  ({message, setState}: {message: Message | null; setState: any}) => {
    console.log('ding!')
    if (message) {
      return (
        <TouchableOpacity
          onPress={() =>
            setState({
              notificationMessage: null,
              currentChannel: message.channel,
            })
          }>
          <View
            style={{
              position: 'absolute',
              top: 20,
              left: 0,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                justifyContent: 'center',
                borderRadius: 4,
                minHeight: 40,
                backgroundColor: currentTheme.background,
                width: '80%',
                padding: 8,
              }}>
              <Text style={{fontWeight: 'bold'}}>
                {message.author?.username} (
                {message.channel?.name ?? message.channel?._id})
              </Text>
              {message.content ? (
                <Text>{message.content}</Text>
              ) : (
                <Text colour={currentTheme.foregroundSecondary}>
                  Tap to view message
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    return <></>;
  },
);
