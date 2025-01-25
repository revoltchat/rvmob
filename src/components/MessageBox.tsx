import {useContext, useState} from 'react';
import {Platform, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import {type DocumentPickerResponse} from 'react-native-document-picker';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import type {Channel, Message} from 'revolt.js';
import {ulid} from 'ulid';

import {app, setFunction} from '@clerotri/Generic';
import {client} from '@clerotri/lib/client';
import {styles} from '@clerotri/Theme';
import {DocumentPicker} from '@clerotri/crossplat/DocumentPicker';
import {Avatar, Text, Username} from '@clerotri/components/common/atoms';
import {USER_IDS} from '@clerotri/lib/consts';
import {storage} from '@clerotri/lib/storage';
import {commonValues, Theme, ThemeContext} from '@clerotri/lib/themes';
import {ReplyingMessage} from '@clerotri/lib/types';
import {getReadableFileSize, showToast} from '@clerotri/lib/utils';

let typing = false;

type MessageBoxProps = {
  channel: Channel;
};

function placeholderText(channel: Channel) {
  switch (channel.channel_type) {
    case 'SavedMessages':
      return 'message_box_saved_notes';
    case 'DirectMessage':
      return 'message_box_dm';
    case 'TextChannel':
      return 'message_box_channel';
    case 'Group':
      return 'message_box_group';
    default:
      return `${channel.channel_type}`;
  }
}

export const MessageBox = observer((props: MessageBoxProps) => {
  const {currentTheme} = useContext(ThemeContext);
  const localStyles = generateLocalStyles(currentTheme);

  const {t} = useTranslation();

  const [currentText, setCurrentText] = useState('');
  const [editingMessage, setEditingMessage] = useState(null as Message | null);
  const [replyingMessages, setReplyingMessages] = useState(
    [] as ReplyingMessage[],
  );
  const [attachments, setAttachments] = useState(
    [] as DocumentPickerResponse[],
  );

  setFunction('setMessageBoxInput', setCurrentText.bind(this));
  setFunction('getMessageBoxInput', () => {
    return currentText;
  });

  setFunction('setReplyingMessages', setReplyingMessages.bind(this));
  setFunction('getReplyingMessages', () => {
    return replyingMessages;
  });

  setFunction('setEditingMessage', setEditingMessage.bind(this));
  setFunction('getEditingMessage', () => {
    return editingMessage;
  });

  // let memberObject = client.members.getKey({server: this.props.channel?.server, user: client.user?._id})
  if (!props.channel.havePermission('SendMessage')) {
    return (
      <View style={localStyles.noPermissionBox}>
        <Text style={{textAlign: 'center'}}>
          {props.channel.channel_type === 'DirectMessage' &&
          props.channel.recipient?._id === USER_IDS.platformModeration
            ? 'You cannot reply to system messages.'
            : 'You do not have permission to send messages in this channel.'}
        </Text>
      </View>
    );
  }
  return (
    <View style={localStyles.messageBoxOuter}>
      <TypingIndicator channel={props.channel} />
      {replyingMessages
        ? replyingMessages.map((m, i) => (
            <View key={m.message._id} style={localStyles.messageBoxBar}>
              <Pressable
                style={{
                  width: 30,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() =>
                  setReplyingMessages(
                    replyingMessages?.filter(
                      m2 => m2.message._id !== m.message._id,
                    ),
                  )
                }>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcon
                    name="close-circle"
                    size={16}
                    color={currentTheme.foregroundPrimary}
                  />
                </View>
              </Pressable>
              <Pressable
                style={{
                  width: 45,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  let replacing = [...replyingMessages];
                  replacing[i].mentions = !replacing[i].mentions;
                  setReplyingMessages(replacing);
                }}>
                <Text
                  colour={
                    m.mentions
                      ? currentTheme.accentColor
                      : currentTheme.foregroundPrimary
                  }
                  style={{
                    fontWeight: 'bold',
                    marginTop: -3,
                  }}>
                  @{m.mentions ? 'ON' : 'OFF'}
                </Text>
              </Pressable>
              <Text style={{marginTop: -1}}> Replying to </Text>
              <View style={{marginTop: -1}}>
                <Username
                  user={m.message.author}
                  server={props.channel.server}
                />
              </View>
            </View>
          ))
        : null}
      <AttachmentsBar
        attachments={attachments}
        setAttachments={setAttachments}
      />
      {editingMessage ? (
        <View key={'editing'} style={localStyles.messageBoxBar}>
          <Pressable
            style={{
              width: 30,
              height: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              setEditingMessage(null);
              setCurrentText('');
            }}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcon
                name="close-circle"
                size={16}
                color={currentTheme.foregroundPrimary}
              />
            </View>
          </Pressable>
          <Text style={{marginTop: -1}}> Editing message</Text>
        </View>
      ) : null}
      <View style={localStyles.messageBoxInner}>
        {Platform.OS !== 'web' &&
        app.settings.get('ui.messaging.sendAttachments') &&
        attachments.length < 5 ? (
          <Pressable
            style={{
              ...localStyles.sendButton,
              ...localStyles.attachmentsButton,
            }}
            onPress={async () => {
              try {
                let res = await DocumentPicker.pickSingle({
                  type: [DocumentPicker.types.allFiles],
                });
                let tooBig = false;
                if (res.size && res.size > 20000000) {
                  showToast('Attachments must be less than 20MB!');
                  tooBig = true;
                }
                if (!tooBig) {
                  let isDuplicate = false;
                  for (const a of attachments) {
                    if (a.uri === res.uri) {
                      console.log(
                        `[MESSAGEBOX] Not pushing duplicate attachment ${res.name} (${res.uri})`,
                      );
                      isDuplicate = true;
                    }
                  }

                  if (res.uri && !isDuplicate) {
                    console.log(
                      `[MESSAGEBOX] Pushing attachment ${res.name} (${res.uri})`,
                    );
                    setAttachments(existingAttachments => [
                      ...existingAttachments,
                      res,
                    ]);
                    console.log(attachments);
                  }
                }
              } catch (error) {
                console.log(`[MESSAGEBOX] Error: ${error}`);
              }
            }}>
            <MaterialIcon
              name="add-circle"
              size={24}
              color={currentTheme.foregroundPrimary}
            />
          </Pressable>
        ) : null}
        <TextInput
          multiline
          placeholderTextColor={currentTheme.foregroundSecondary}
          style={{
            ...localStyles.messageBox,
            fontSize: app.settings.get('ui.messaging.fontSize') as number,
          }}
          placeholder={t(`app.messaging.${placeholderText(props.channel)}`, {
            name:
              props.channel.channel_type === 'TextChannel' ||
              props.channel.channel_type === 'Group'
                ? props.channel.name
                : props.channel.channel_type === 'DirectMessage'
                ? props.channel.recipient?.username ?? 'User'
                : '',
          })}
          onChangeText={text => {
            setCurrentText(text);
            if (currentText.length === 0) {
              props.channel.stopTyping();
            } else {
              if (!typing) {
                typing = true;
                props.channel.startTyping();
                setTimeout(() => (typing = false), 3000);
              }
            }
          }}
          value={currentText}
        />
        {currentText.trim().length > 0 || attachments.length > 0 ? (
          <Pressable
            style={localStyles.sendButton}
            onPress={async () => {
              let thisCurrentText = currentText;
              setCurrentText('');
              if (editingMessage) {
                editingMessage.edit({content: thisCurrentText});
                setEditingMessage(null);
              } else {
                let nonce = ulid();
                app.pushToQueue({
                  content: thisCurrentText,
                  channel: props.channel,
                  nonce: nonce,
                  reply_ids: replyingMessages?.map(
                    (m: ReplyingMessage) => m.message._id,
                  ),
                });
                let uploaded = [];
                const token = storage.getString('token');
                if (token) {
                  for (let a of attachments) {
                    const formdata = new FormData();
                    formdata.append('file', a);
                    console.log(`[MESSAGEBOX] formdata: ${formdata}`);
                    const result = await fetch(
                      `${client.configuration?.features.autumn.url}/attachments`,
                      {
                        method: 'POST',
                        headers: {
                          'X-Session-Token': token,
                        },
                        body: formdata,
                      },
                    ).then(res => res.json());
                    if (result.type) {
                      console.error(
                        `[MESSAGEBOX] Error uploading attachment: ${result.type}`,
                      );
                    } else {
                      uploaded.push(result.id);
                    }
                  }
                }
                if (replyingMessages.length > 0) {
                  console.log(replyingMessages);
                }
                props.channel.sendMessage({
                  content: thisCurrentText,
                  attachments: uploaded.length > 0 ? uploaded : undefined,
                  replies: replyingMessages.map(m => {
                    return {id: m.message._id, mention: m.mentions};
                  }),
                  nonce,
                });
                props.channel.ack(
                  props.channel.last_message_id ?? undefined,
                  true,
                );
                setAttachments([]);
                setReplyingMessages([]);
              }
            }}>
            {editingMessage ? (
              <MaterialIcon
                name="edit"
                size={24}
                color={currentTheme.messageBox}
              />
            ) : (
              <MaterialIcon
                name="send"
                size={24}
                color={currentTheme.messageBox}
              />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

const AttachmentsBar = observer(
  ({
    attachments,
    setAttachments,
  }: {
    attachments: DocumentPickerResponse[];
    setAttachments: Function;
  }) => {
    const {currentTheme} = useContext(ThemeContext);
    const localStyles = generateLocalStyles(currentTheme);

    // TODO: add file previews?
    if (attachments?.length > 0) {
      return (
        <View
          key={'message-box-attachments-bar'}
          style={localStyles.attachmentsBar}>
          <Text
            key={'message-box-attachments-bar-header'}
            style={{fontWeight: 'bold'}}>
            {attachments.length}{' '}
            {attachments.length === 1 ? 'attachment' : 'attachments'}
          </Text>
          {attachments.map(a => {
            const fileNameStrings = a.name?.split('.');
            const fileType = fileNameStrings
              ? fileNameStrings[fileNameStrings?.length - 1].toLocaleUpperCase()
              : 'Unknown';
            return (
              <View
                style={{
                  flexDirection: 'row',
                  padding: commonValues.sizes.medium,
                  margin: commonValues.sizes.small,
                  backgroundColor: currentTheme.backgroundPrimary,
                  borderRadius: commonValues.sizes.small,
                  alignItems: 'center',
                }}
                key={`message-box-attachments-bar-attachment-${a.name}`}>
                <Pressable
                  style={{
                    width: 30,
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() =>
                    setAttachments(attachments?.filter(a2 => a2.uri !== a.uri))
                  }>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcon
                      name="close-circle"
                      size={16}
                      color={currentTheme.foregroundPrimary}
                    />
                  </View>
                </Pressable>
                <View style={{flexDirection: 'column'}}>
                  <Text
                    key={`message-box-attachments-bar-attachment-${a.name}-name`}
                    style={{fontWeight: 'bold'}}>
                    {a.name}
                  </Text>
                  <Text
                    key={`message-box-attachments-bar-attachment-${a.name}-details`}>
                    {fileType} file ({getReadableFileSize(a.size)})
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    return <View />;
  },
);

const TypingIndicator = observer(({channel}: {channel: Channel}) => {
  const {currentTheme} = useContext(ThemeContext);
  const localStyles = generateLocalStyles(currentTheme);

  if (channel) {
    let users = channel.typing?.filter(entry => !!entry) || undefined;
    !app.settings.get('ui.messaging.showSelfInTypingIndicator') &&
      (users = users?.filter(entry => entry?._id !== client.user?._id));
    let out = <></>;
    const server = channel.server ?? undefined;
    switch (users?.length) {
      case 1:
        out = (
          <>
            {<Username server={server} user={users[0]} />}
            <Text> is typing...</Text>
          </>
        );
        break;
      case 2:
        out = (
          <>
            {<Username server={server} user={users[0]} />}
            <Text> and </Text>
            {<Username server={server} user={users[1]} />}
            <Text> are typing...</Text>
          </>
        );
        break;
      case 3:
        out = (
          <>
            {<Username server={server} user={users[0]} />}
            <Text>, </Text>
            {<Username server={server} user={users[1]} />}
            <Text>, and </Text>
            {<Username server={server} user={users[2]} />}
            <Text> are typing...</Text>
          </>
        );
        break;
      default:
        out = <Text>{users?.length} people are typing...</Text>;
        break;
    }
    if (users?.length > 0) {
      return (
        <View style={localStyles.typingBar}>
          {users.map(u => {
            return (
              <View key={u?._id} style={{marginRight: -10}}>
                <Avatar user={u!} server={server} size={20} />
              </View>
            );
          })}
          <View style={{marginRight: 14}} />
          {out}
        </View>
      );
    }
  }

  return <View />;
});

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    messageBoxBar: {
      padding: commonValues.sizes.small,
      paddingVertical: commonValues.sizes.medium,
      borderBottomColor: currentTheme.backgroundPrimary,
      borderBottomWidth: 1,
      flexDirection: 'row',
    },
    messageBox: {
      backgroundColor: currentTheme.messageBoxInput,
      color: currentTheme.foregroundPrimary,
      paddingLeft: commonValues.sizes.large,
      padding: commonValues.sizes.medium,
      flex: 1,
      fontFamily: 'Open Sans',
      borderRadius: commonValues.sizes.medium,
    },
    messageBoxInner: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 50,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    messageBoxOuter: {
      backgroundColor: currentTheme.messageBox,
      overflow: 'hidden',
    },
    sendButton: {
      marginStart: commonValues.sizes.medium,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
      borderRadius: commonValues.sizes.medium,
      backgroundColor: currentTheme.accentColor,
    },
    attachmentsButton: {
      marginStart: 0,
      marginEnd: commonValues.sizes.medium,
      backgroundColor: currentTheme.messageBox,
    },
    noPermissionBox: {
      backgroundColor: currentTheme.backgroundSecondary,
      minHeight: 50,
      paddingVertical: 20,
      paddingHorizontal: commonValues.sizes.medium,
      alignItems: 'center',
      justifyContent: 'center',
    },
    typingBar: {
      height: 26,
      paddingLeft: 6,
      padding: 3,
      backgroundColor: currentTheme.backgroundSecondary,
      borderBottomColor: currentTheme.backgroundPrimary,
      borderBottomWidth: 1,
      flexDirection: 'row',
    },
    attachmentsBar: {
      padding: commonValues.sizes.medium,
      borderBottomColor: currentTheme.backgroundPrimary,
      borderBottomWidth: 1,
      flexDirection: 'column',
    },
    attachment: {
      flexDirection: 'row',
      padding: commonValues.sizes.medium,
      margin: commonValues.sizes.small,
      backgroundColor: currentTheme.backgroundPrimary,
      borderRadius: commonValues.sizes.small,
      alignItems: 'center',
    },
  });
};
