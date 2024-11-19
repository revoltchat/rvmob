import {Pressable, View} from 'react-native';
import {action} from 'mobx';
import {observer} from 'mobx-react-lite';

import {Message} from 'revolt.js';

import {Image} from '@rvmob/crossplat/Image';
import {client} from '../../../Generic';
import {showToast} from '../../../lib/utils';
import {commonValues, currentTheme} from '../../../Theme';
import {Text} from '../atoms';

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
            marginVertical: commonValues.sizes.small,
            flexWrap: 'wrap',
          }}>
          {reactions.map(r => {
            return (
              <Pressable
                key={`message-${msg._id}-reaction-${r.emoji}`}
                onPress={action(() => {
                  msg.channel?.havePermission('React')
                    ? !r.reactors.includes(client.user?._id!)
                      ? msg.react(r.emoji)
                      : msg.unreact(r.emoji)
                    : showToast('You cannot react to this message.');
                })}
                style={{
                  padding: commonValues.sizes.small,
                  borderRadius: commonValues.sizes.small,
                  borderColor: r.reactors.includes(client.user?._id!)
                    ? currentTheme.accentColor
                    : currentTheme.backgroundTertiary,
                  backgroundColor: currentTheme.backgroundSecondary,
                  borderWidth: commonValues.sizes.xs,
                  marginEnd: commonValues.sizes.small,
                  marginVertical: commonValues.sizes.xs,
                }}>
                <View style={{flexDirection: 'row'}}>
                  {r.emoji.length > 6 && (
                    <Image
                      style={{minHeight: 15, minWidth: 15}}
                      source={{
                        uri: `${client.configuration?.features.autumn.url}/emojis/${r.emoji}`,
                      }}
                    />
                  )}
                  <Text key={`message-${msg._id}-reaction-${r.emoji}-label`}>
                    {r.emoji.length <= 6 && r.emoji} {r.reactors.length}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      );
    }
    return <></>;
  },
);
