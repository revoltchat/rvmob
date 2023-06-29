import React from 'react';
import {ScrollView, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import Clipboard from '@react-native-clipboard/clipboard';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Message} from 'revolt.js';

import {app} from '../../Generic';
import {currentTheme, styles} from '../../Theme';
import {ContextButton, CopyIDButton, Text} from '../common/atoms';
import {ReplyMessage} from '../common/messaging';

export const MessageMenuSheet = observer(
  ({setState, message}: {setState: Function; message: Message}) => {
    return (
      <>
        <ReplyMessage message={message} style={{margin: 3, width: '100%'}} />
        <ScrollView style={{flex: 1, padding: 3}}>
          <ContextButton onPress={() => setState()}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcon
                name="close-circle"
                size={16}
                color={currentTheme.foregroundPrimary}
              />
            </View>
            <Text>Close</Text>
          </ContextButton>
          {message?.channel?.havePermission('SendMessage') ? (
            <ContextButton
              onPress={() => {
                let replyingMessages = [...app.getReplyingMessages()];
                if (
                  replyingMessages.filter(m => m.message._id === message._id)
                    .length > 0
                ) {
                  return;
                }
                if (replyingMessages.length >= 5) {
                  return;
                }
                if (app.getEditingMessage()) {
                  return;
                }
                replyingMessages.push({
                  message: message,
                  mentions: false,
                });
                app.setReplyingMessages(replyingMessages);
                setState();
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name="reply"
                  size={20}
                  color={currentTheme.foregroundPrimary}
                />
              </View>
              <Text>Reply</Text>
            </ContextButton>
          ) : null}
          {message.content ? (
            <ContextButton
              onPress={() => {
                Clipboard.setString(message.content!);
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name="content-copy"
                  size={20}
                  color={currentTheme.foregroundPrimary}
                />
              </View>
              <Text>Copy content</Text>
            </ContextButton>
          ) : null}
          {app.settings.get('ui.showDeveloperFeatures') ? (
            <CopyIDButton id={message._id} />
          ) : null}
          {message?.channel?.havePermission('ManageMessages') ||
          message?.author?.relationship === 'User' ? (
            <ContextButton
              onPress={() => {
                message.delete();
                setState();
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name="delete"
                  size={20}
                  color={currentTheme.foregroundPrimary}
                />
              </View>
              <Text>Delete</Text>
            </ContextButton>
          ) : null}
          {message?.author?.relationship === 'User' ? (
            <ContextButton
              onPress={() => {
                app.setMessageBoxInput(message?.content);
                app.setEditingMessage(message);
                app.setReplyingMessages([]);
                setState();
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name="edit"
                  size={20}
                  color={currentTheme.foregroundPrimary}
                />
              </View>
              <Text>Edit</Text>
            </ContextButton>
          ) : null}
          {message?.author?.relationship !== 'User' ? (
            <ContextButton
              onPress={() => {
                app.openReportMenu(message, 'Message');
                setState();
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name="flag"
                  size={20}
                  color={currentTheme.foregroundPrimary}
                />
              </View>
              <Text>Report Message</Text>
            </ContextButton>
          ) : null}
          <View style={{marginTop: 7}} />
        </ScrollView>
      </>
    );
  },
);
