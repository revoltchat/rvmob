import {Pressable, TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Message} from 'revolt.js';

import {Avatar} from '../Profile';
import {currentTheme, styles} from '../Theme';
import {Text, Username} from './common/atoms';
import {MarkdownView} from './common/MarkdownView';
import {parseRevoltNodes} from '../lib/utils';

export const Notification = observer(
  ({
    message,
    dismiss,
    openChannel,
  }: {
    message: Message | null;
    dismiss: Function;
    openChannel: Function;
  }) => {
    if (message) {
      return (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            alignItems: 'center',
            width: '90%',
            backgroundColor: currentTheme.background,
            borderRadius: 4,
            minHeight: 40,
            padding: 8,
          }}
          onPress={() => openChannel()}>
          <View
            style={{
              flexDirection: 'row',
              overflow: 'hidden',
            }}>
            <Avatar user={message.author} size={35} />
            <View
              style={{
                marginHorizontal: 8,
                maxWidth: '80%',
                overflow: 'hidden',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
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
