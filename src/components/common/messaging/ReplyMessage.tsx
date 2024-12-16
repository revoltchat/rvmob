import {StyleSheet, View} from 'react-native';

import {Message} from 'revolt.js';

import {Avatar, Text, Username} from '@rvmob/components/common/atoms';
import {commonValues} from '@rvmob/lib/themes';

type ReplyProps = {
  message?: Message;
  mention?: boolean;
  showSymbol?: boolean;
  symbolMargin?: number;
};

export const ReplyMessage = (props: ReplyProps) => {
  if (!props.message?.system) {
    return (
      <View style={{alignItems: 'center', flexDirection: 'row'}}>
        {props.showSymbol ? (
          <Text
            style={{
              fontWeight: 'bold',
              marginHorizontal: props.symbolMargin ?? 21,
            }}>
            ↱
          </Text>
        ) : null}
        {props.message ? (
          props.message.author ? (
            <>
              <Avatar
                user={props.message.author}
                server={props.message.channel?.server}
                masquerade={props.message.generateMasqAvatarURL()}
                size={16}
              />
              <Text style={{marginLeft: 4}}>{props.mention ? '@' : ''}</Text>
              <Username
                user={props.message.author}
                server={props.message.channel?.server}
                masquerade={props.message.masquerade?.name}
              />
              <Text style={localStyles.messageContentReply}>
                {props.message.content?.split('\n').join(' ')}
              </Text>
            </>
          ) : null
        ) : (
          <Text style={localStyles.messageContentReply}>
            Message not loaded
          </Text>
        )}
      </View>
    );
  } else {
    return <></>;
  }
};

const localStyles = StyleSheet.create({
  messageContentReply: {
    height: 20,
    marginLeft: commonValues.sizes.small,
  },
});
