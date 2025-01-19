import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import type {Message} from 'revolt.js';

import {Avatar, Text, Username} from '@clerotri/components/common/atoms';
import {SystemMessage} from './SystemMessage';
import {commonValues} from '@clerotri/lib/themes';

type ReplyProps = {
  message?: Message;
  mention?: boolean;
  showSymbol?: boolean;
  symbolMargin?: number;
};

export const ReplyMessage = (props: ReplyProps) => {
  const {t} = useTranslation();

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
        props.message.system ? (
          <SystemMessage message={props.message} isReply />
        ) : props.message.author ? (
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
          {t('app.messaging.reply_not_loaded')}
        </Text>
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  messageContentReply: {
    height: 20,
    marginLeft: commonValues.sizes.small,
  },
});
