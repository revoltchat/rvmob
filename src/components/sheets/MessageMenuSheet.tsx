import React from 'react';
import {ScrollView, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import Clipboard from '@react-native-clipboard/clipboard';
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
        <ScrollView style={{flex: 1, paddingHorizontal: 15}}>
          <View
            style={{
              paddingVertical: 12,
            }}>
            <ReplyMessage message={message} showSymbol={false} />
          </View>
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
          <ContextButton
              onPress={() => {
                Clipboard.setString(message.url);
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name="link"
                  size={20}
                  color={currentTheme.foregroundPrimary}
                />
              </View>
              <Text>Copy message link</Text>
            </ContextButton>
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
                  color={currentTheme.error}
                />
              </View>
              <Text colour={currentTheme.error}>Delete</Text>
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
                  color={currentTheme.error}
                />
              </View>
              <Text colour={currentTheme.error}>Report Message</Text>
            </ContextButton>
          ) : null}
          <View style={{marginTop: 7}} />
        </ScrollView>
      </>
    );
  },
);
