import React, {useRef} from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import BottomSheetCore from '@gorhom/bottom-sheet';
import Clipboard from '@react-native-clipboard/clipboard';
import {useBackHandler} from '@react-native-community/hooks';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Message} from 'revolt.js';

import {app, setFunction} from '../../Generic';
import {currentTheme, styles} from '../../Theme';
import {ContextButton, CopyIDButton, Text} from '../common/atoms';
import {BottomSheet} from '../common/BottomSheet';
import {ReplyMessage} from '../common/messaging';

export const MessageMenuSheet = observer(() => {
  const [message, setMessage] = React.useState(null as Message | null);

  const sheetRef = useRef<BottomSheetCore>(null);

  useBackHandler(() => {
    if (message) {
      sheetRef.current?.close();
      return true;
    }

    return false;
  });

  setFunction('openMessage', async (m: Message | null) => {
    setMessage(m);
    m ? sheetRef.current?.expand() : sheetRef.current?.close();
  });
  return (
    <BottomSheet sheetRef={sheetRef}>
      <View style={{paddingHorizontal: 16}}>
        {!message ? (
          <></>
        ) : (
          <>
            <View
              style={{
                paddingBottom: 12,
                overflow: 'hidden',
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
                  app.openMessage(null);
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
                  app.openMessage(null);
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
                  app.openDeletionConfirmationModal({
                    type: 'Message',
                    object: message,
                  });
                  app.openMessage(null);
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
                  app.openReportMenu({object: message, type: 'Message'});
                  app.openMessage(null);
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
            <View style={{marginTop: 20}} />
          </>
        )}
      </View>
    </BottomSheet>
  );
});
