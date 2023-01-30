import React, {useEffect} from 'react';
import {Pressable, View, TextInput, TouchableOpacity} from 'react-native';
import {Text, app, client, setFunction} from './Generic';
import {styles, currentTheme} from './Theme';
import {observer} from 'mobx-react-lite';
import {Username, Avatar} from './Profile';
import {ulid} from 'ulid';
import DocumentPicker from 'react-native-document-picker';
import AntIcon from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import fs from 'react-native-fs';
import {Channel} from 'revolt.js';
let typing = false;

type MessageBoxProps = {
  channel: Channel;
};

export const MessageBox = observer((props: MessageBoxProps) => {
  let [currentText, setCurrentText] = React.useState('');
  let [editingMessage, setEditingMessage] = React.useState(null);
  let [replyingMessages, setReplyingMessages] = React.useState([]);
  let [attachments, setAttachments] = React.useState([]);

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
          height: 80,
          padding: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{textAlign: 'center'}}>
          You do not have permission to send messages in this channel.
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
                  <AntIcon
                    name="closecircle"
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
                  style={{
                    fontWeight: 'bold',
                    color: m.mentions
                      ? currentTheme.accentColor
                      : currentTheme.foregroundPrimary,
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
              <AntIcon
                name="closecircle"
                size={16}
                color={currentTheme.foregroundPrimary}
              />
            </View>
          </Pressable>
          <Text style={{marginTop: -1}}> Editing message</Text>
        </View>
      ) : null}
      <View style={styles.messageBoxInner}>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={async () => {
            let res = await DocumentPicker.pickSingle({
              type: [DocumentPicker.types.allFiles],
            });
            if (res.uri) {
              setAttachments([...attachments, res]);
            }
          }}>
          <AntIcon
            name="pluscircle"
            size={20}
            color={currentTheme.foregroundPrimary}
          />
        </TouchableOpacity>
        <TextInput
          multiline
          placeholderTextColor={currentTheme.foregroundSecondary}
          style={styles.messageBox}
          placeholder={
            'Message ' +
            (props.channel?.channel_type != 'Group'
              ? props.channel?.channel_type == 'DirectMessage'
                ? '@'
                : '#'
              : '') +
            (props.channel?.name || props.channel.recipient?.username)
          }
          onChangeText={text => {
            setCurrentText(text);
            if (currentText.length == 0) {
              props.channel.stopTyping();
            } else {
              if (!typing) {
                typing = true;
                props.channel.startTyping();
                setTimeout((() => (typing = false)).bind(this), 2500);
              }
            }
          }}
          value={currentText}
        />
        {currentText.trim().length > 0 ? (
          <TouchableOpacity
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
                  reply_ids: replyingMessages?.map(m => m._id),
                });
                // let uploaded = [];
                // for (let a of attachments) {
                //     const formdata = new FormData();
                //     //multipart/form-data
                //     let content = await fs.readFile(a.uri, 'base64');
                //     formdata.append('file', content)
                //     console.log(formdata)
                //     let result = await fetch(`${client.configuration?.features.autumn.url}/attachments`, {
                //         method: 'POST',
                //         body: formdata,
                //         headers: {
                //             'Content-Type': 'multipart/form-data; '
                //         }
                //     })
                //     console.log("out: ", await result.text())
                //     uploaded.push(id);
                // }
                props.channel.sendMessage({
                  content: thisCurrentText,
                  replies: replyingMessages.map(m => {
                    return {id: m.message._id, mention: m.mentions};
                  }),
                  nonce,
                });
                setReplyingMessages([]);
              }
            }}>
            {editingMessage ? (
              <FA5Icon
                name="edit"
                size={24}
                color={currentTheme.foregroundPrimary}
              />
            ) : (
              <MaterialIcon
                name="send"
                size={24}
                color={currentTheme.foregroundPrimary}
              />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
});

export const TypingIndicator = observer((channel: Channel) => {
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
