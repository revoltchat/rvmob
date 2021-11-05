import React, { useEffect } from 'react';
import { Pressable, View, TextInput, TouchableOpacity } from 'react-native';
import { Text, app, client, setFunction } from './Generic';
import { styles, currentTheme } from './Theme';
import { observer } from 'mobx-react-lite';
import { Username, Avatar } from './Profile';
import { ChannelPermission } from "revolt.js/dist/api/permissions";
let typing = false;

export const MessageBox = observer((props) => {
    let [currentText, setCurrentText] = React.useState('');
    let [editingMessage, setEditingMessage] = React.useState(null);
    let [replyingMessages, setReplyingMessages] = React.useState([]);
    setFunction('setMessageBoxInput', setCurrentText.bind(this))
    setFunction('setReplyingMessages', setReplyingMessages.bind(this))
    setFunction('getReplyingMessages', () => {return replyingMessages})
    setFunction('setEditingMessage', setEditingMessage.bind(this))
    setFunction('getEditingMessage', () => {return editingMessage})
    // let memberObject = client.members.getKey({server: this.props.channel?.server, user: client.user?._id})
    if (!(props.channel.permission & ChannelPermission.SendMessage)) {
        return <View style={{backgroundColor: currentTheme.backgroundSecondary, height: 80, padding: 20, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{textAlign: 'center'}}>You do not have permission to send messages in this channel.</Text>
        </View>
    }     
    return <View style={styles.messageBoxOuter}>
        <TypingIndicator channel={props.channel}/>
        {replyingMessages ? replyingMessages.map(m => 
            <View key={m._id} style={styles.messageBoxBar}>
                <Pressable style={{width: 30, height: 20, alignItems: 'center', justifyContent: 'center'}} onPress={() => 
                    setReplyingMessages(replyingMessages?.filter(m2 => m2._id != m._id))
                }><Text style={{fontSize: 20, margin: -4}}>X</Text></Pressable>
                <Text> Replying to </Text>
                <Username user={m.author} server={props.channel.server}/>
            </View>
        ) : null}
        {editingMessage ? (
            <View key={"editing"} style={styles.messageBoxBar}>
                <Pressable style={{width: 30, height: 20, alignItems: 'center', justifyContent: 'center'}} onPress={() => {
                    setEditingMessage(null)
                    setCurrentText("")
                }}><Text style={{fontSize: 20, margin: -4}}>X</Text></Pressable>
                <Text> Editing message</Text>
            </View>
        ) : null}
        <View style={styles.messageBoxInner}>
            <TextInput multiline placeholderTextColor={currentTheme.textSecondary} style={styles.messageBox} placeholder={"Message " + (props.channel?.channel_type != "Group" ? (props.channel?.channel_type == "DirectMessage" ? "@" : "#") : "") + (props.channel?.name || props.channel.recipient?.username)} onChangeText={(text) => {
                setCurrentText(text)
                if (currentText.length == 0) {
                    props.channel.stopTyping();
                } else {
                    if (!typing) {
                        typing = true;
                        props.channel.startTyping();
                        setTimeout((() => typing = false).bind(this), 2500);
                    }
                }
            }} value={currentText} />
            {currentText.trim().length > 0 ? <TouchableOpacity style={styles.sendButton} onPress={() => {
                let thisCurrentText = currentText;
                setCurrentText('');
                if (editingMessage) {
                    editingMessage.edit({content: thisCurrentText});
                    setEditingMessage(null);
                } else {
                    props.channel.sendMessage({
                        content: thisCurrentText, 
                        replies: replyingMessages.map((m) => {
                            return {id: m._id, mention: false}
                        })
                    });
                    setReplyingMessages([]);
                }
            }}>
                {editingMessage ? <Text>Edit</Text> : <Text>Send</Text>}
            </TouchableOpacity> 
            : null}
        </View>
    </View>
})

export const TypingIndicator = observer(({ channel }) => {
    if (channel) {
        let users = channel.typing.filter(entry => !!entry);
        !app.settings.get("Show self in typing indicator") && (users = users.filter(entry => entry._id != client.user._id));
        let out = <></>;
        switch (users.length) {
            case 1:
                out = <>{<Username server={channel.server || undefined} user={users[0]} />}<Text> is typing...</Text></>; break
            case 2:
                out = <>{<Username server={channel.server || undefined} user={users[0]} />}<Text> and </Text>{<Username server={channel.server || undefined} user={users[1]} />}<Text> are typing...</Text></>; break
            case 3:
                out = <>{<Username server={channel.server || undefined} user={users[0]} />}<Text>, </Text>{<Username server={channel.server || undefined} user={users[1]} />}<Text>, and </Text>{<Username server={channel.server || undefined} user={users[2]} />}<Text> are typing...</Text></>; break
            default:
                out = <Text>{users.length} people are typing...</Text>; break
        }
        if (users.length > 0) {
            return (
                <View style={styles.typingBar}>
                    {users.map(u => {
                        return <View key={u._id} style={{marginRight: -10}}><Avatar user={u} server={channel.server || undefined} size={20} /></View>
                    })}<View style={{marginRight: 14}}/>{out}
                </View>
            );
        }
    }
    
    return <View/>;
});