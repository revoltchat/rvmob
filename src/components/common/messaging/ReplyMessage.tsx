import React from 'react';
import {View} from 'react-native';

import {Message} from 'revolt.js';

import {Avatar} from '../../../Profile';
import {styles} from '../../../Theme';
import {Text, Username} from '../atoms';

type ReplyProps = {
  message?: Message;
  mention?: boolean;
  style?: any;
};

export const ReplyMessage = (props: ReplyProps) => {
  if (!props.message?.system) {
    return (
      <View style={{alignItems: 'center', flexDirection: 'row'}}>
        <Text style={{marginLeft: 15, marginRight: 15}}>↱</Text>
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
              <Text style={styles.messageContentReply}>
                {props.message.content?.split('\n').join(' ')}
              </Text>
            </>
          ) : null
        ) : (
          <Text style={styles.messageContentReply}>Message not loaded</Text>
        )}
      </View>
    );
  } else {
    return <></>;
  }
};
