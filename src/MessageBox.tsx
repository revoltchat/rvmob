import React from 'react';
import {Pressable, View, TextInput} from 'react-native';
import {observer} from 'mobx-react-lite';

import DocumentPicker, {
  DocumentPickerResponse,
} from 'react-native-document-picker';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Channel, Message} from 'revolt.js';
import {ulid} from 'ulid';

import {app, client, setFunction} from './Generic';
import {Avatar} from './Profile';
import {styles, currentTheme} from './Theme';
import {Text, Username} from './components/common/atoms';
import {USER_IDS} from './lib/consts';
import {ReplyingMessage} from './lib/types';
import {getReadableFileSize, showToast} from './lib/utils';

let typing = false;

type MessageBoxProps = {
  channel: Channel;
};

function placeholderText(channel: Channel) {
  switch (channel.channel_type) {
    case 'SavedMessages':
      return 'Save to your notes';
    case 'DirectMessage':
      return `@${channel.recipient?.username}`;
    case 'TextChannel':
    case 'Group':
      return `${channel.channel_type === 'TextChannel' ? '#' : ''}${
        channel.name
      }`;
    default:
      return `${channel.channel_type}`;
  }
}

export const MessageBox = observer((props: MessageBoxProps) => {
  let [currentText, setCurrentText] = React.useState('');
  let [editingMessage, setEditingMessage] = React.useState(
    null as Message | null,
  );
  let [replyingMessages, setReplyingMessages] = React.useState(
    [] as ReplyingMessage[],
  );
  let [attachments, setAttachments] = React.useState(
    [] as DocumentPickerResponse[],
  );

  setFunction('setMessageBoxInput', setCurrentText.bind(this));
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
      <View
        style={{
          backgroundColor: currentTheme.backgroundSecondary,
          minHeight: 50,
          paddingVertical: 20,
          paddingHorizontal: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
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
    <View style={styles.messageBoxOuter}>
      <TypingIndicator channel={props.channel} />
      {replyingMessages
        ? replyingMessages.map((m, i) => (
            <View key={m.message._id} style={styles.messageBoxBar}>
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
        <View key={'editing'} style={styles.messageBoxBar}>
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
      <View style={styles.messageBoxInner}>
        {app.settings.get('ui.messaging.sendAttachments') &&
        attachments.length < 5 ? (
          <Pressable
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginEnd: 8,
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
              size={20}
              color={currentTheme.foregroundPrimary}
            />
          </Pressable>
        ) : null}
        <TextInput
          multiline
          placeholderTextColor={currentTheme.foregroundSecondary}
          style={{
            backgroundColor: currentTheme.messageBoxInput,
            fontSize: app.settings.get('ui.messaging.fontSize'),
            ...styles.messageBox,
          }}
          placeholder={
            (props.channel.channel_type !== 'SavedMessages' ? 'Message ' : '') +
            placeholderText(props.channel)
          }
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
            style={styles.sendButton}
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
                for (let a of attachments) {
                  const formdata = new FormData();
                  formdata.append('file', a);
                  console.log(`[MESSAGEBOX] formdata: ${formdata}`);
                  const result = await fetch(
                    `${client.configuration?.features.autumn.url}/attachments`,
                    {
                      method: 'POST',
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
    // TODO: add file previews?
    if (attachments?.length > 0) {
      return (
        <View key={'message-box-attachments-bar'} style={styles.attachmentsBar}>
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
                  padding: 8,
                  margin: 4,
                  backgroundColor: currentTheme.backgroundPrimary,
                  borderRadius: 4,
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
        <View style={styles.typingBar}>
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
