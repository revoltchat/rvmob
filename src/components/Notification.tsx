import {useContext} from 'react';
import {Pressable, TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import type {API, Channel} from 'revolt.js';

import {styles} from '../Theme';
import {Avatar, Text, Username} from './common/atoms';
import {MarkdownView} from './common/MarkdownView';
import {client} from '@clerotri/lib/client';
import {ChannelContext} from '@clerotri/lib/state';
import {commonValues, ThemeContext} from '@clerotri/lib/themes';
import {parseRevoltNodes} from '@clerotri/lib/utils';

export const Notification = observer(
  ({message, dismiss}: {message: API.Message | null; dismiss: Function}) => {
    const {currentTheme} = useContext(ThemeContext);
    const {setCurrentChannel} = useContext(ChannelContext);

    const openChannel = (channel: Channel | undefined) => {
      dismiss();
      setCurrentChannel(channel ?? null);
    };

    if (message) {
      const author = client.users.get(message.author);
      const channel = client.channels.get(message.channel);

      return (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '90%',
            backgroundColor: currentTheme.background,
            borderRadius: commonValues.sizes.small,
            minHeight: 40,
            padding: commonValues.sizes.medium,
            boxShadow: [
              {
                color: '#00000060',
                blurRadius: commonValues.sizes.large,
              },
            ],
          }}
          onPress={() => openChannel(channel)}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              overflow: 'hidden',
            }}>
            <Avatar user={author} size={35} />
            <View
              style={{
                marginHorizontal: commonValues.sizes.medium,
                maxWidth: '80%',
                overflow: 'hidden',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <Username user={author} server={channel?.server} />
                <Text style={{fontWeight: 'bold'}}>
                  {' '}
                  ({channel?.name ?? channel?._id})
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
          <Pressable
            style={{
              width: 20,
              height: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => dismiss()}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcon
                name="close-circle"
                size={20}
                color={currentTheme.foregroundPrimary}
              />
            </View>
          </Pressable>
        </TouchableOpacity>
      );
    }
    return <></>;
  },
);
