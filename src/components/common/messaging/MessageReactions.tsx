import React from 'react';
import {Pressable, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import FastImage from 'react-native-fast-image';

import {Message} from 'revolt.js';

import {client} from '../../../Generic';
import {currentTheme} from '../../../Theme';
import {Text} from '../atoms';
const Image = FastImage;

type ReactionPile = {
  emoji: string;
  reactors: string[];
};

export const MessageReactions = observer(
  ({msg, reactions}: {msg: Message; reactions: ReactionPile[]}) => {
    if (reactions.length > 0) {
      return (
        <View
          style={{
            flexDirection: 'row',
            marginVertical: 4,
            flexWrap: 'wrap',
          }}>
          {reactions.map(r => {
            return (
              <Pressable
                key={`message-${msg._id}-reaction-${r.emoji}`}
                onPress={() => {
                  msg.channel?.havePermission('React')
                    ? console.log('sus')
                    : console.log('amogus');
                }}
                style={{
                  padding: 4,
                  borderRadius: 4,
                  borderColor: r.reactors.includes(client.user?._id!)
                    ? currentTheme.accentColor
                    : currentTheme.backgroundTertiary,
                  backgroundColor: currentTheme.backgroundSecondary,
                  borderWidth: 2,
                  marginRight: 4, // TODO: adapt this for future RTL support
                  marginVertical: 2,
                }}>
                <Text key={`message-${msg._id}-reaction-${r.emoji}-label`}>
                  {r.emoji.length > 6 ? (
                    <Image
                      style={{minHeight: 15, minWidth: 15}}
                      source={{
                        uri: `${client.configuration?.features.autumn.url}/emojis/${r.emoji}`,
                      }}
                    />
                  ) : (
                    r.emoji
                  )}{' '}
                  {r.reactors.length}
                </Text>
              </Pressable>
            );
          })}
        </View>
      );
    }
    return <></>;
  },
);
