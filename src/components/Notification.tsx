import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Message} from 'revolt.js';

import {Avatar, Username} from '../Profile';
import {currentTheme} from '../Theme';
import {Text} from './common/atoms';
import {MarkdownView} from './common/MarkdownView';
import {parseRevoltNodes} from '../lib/utils';

export const Notification = observer(
  ({message, setState}: {message: Message | null; setState: any}) => {
    if (message) {
      return (
        <TouchableOpacity
          style={{alignItems: 'center'}}
          onPress={() => setState()}>
          <View style={{maxWidth: '90%'}}>
            <View
              style={{
                flexDirection: 'row',
                borderRadius: 4,
                minHeight: 40,
                backgroundColor: currentTheme.background,
                paddingVertical: 8,
                paddingHorizontal: 32,
                justifyContent: 'center',
              }}>
              <Avatar user={message.author} size={35} />
              <View style={{marginHorizontal: 8}}>
                <View style={{flexDirection: 'row'}}>
                  <Username
                    user={message.author}
                    server={message.channel?.server}
                  />
                  <Text style={{fontWeight: 'bold'}}>
                    {' '}
                    ({message.channel?.name ?? message.channel?._id})
                  </Text>
                </View>
                {message.content ? (
                  <MarkdownView>
                    {parseRevoltNodes(
                      message.content.length > 200
                        ? message.content.slice(0, 200) + '...'
                        : message.content,
                    )}
                  </MarkdownView>
                ) : (
                  <Text colour={currentTheme.foregroundSecondary}>
                    Tap to view message
                  </Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    return <></>;
  },
);
