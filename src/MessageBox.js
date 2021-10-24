import React from 'react';
import { Pressable, View, TextInput, TouchableOpacity } from 'react-native';
import { Text } from './Generic';
import { styles, currentTheme } from './Theme';
import { observer } from 'mobx-react-lite';

let typing = false;
export class MessageBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentText: ""
        }
    }
    render() {
        return <View style={styles.messageBoxOuter}>
            <TypingIndicator channel={this.props.channel}/>
            {this.props.replyingMessages ? this.props.replyingMessages.map(m => 
                <View key={m._id} style={styles.replyingMessagePreview}>
                    <Pressable onPress={() => 
                        this.props.setReplyingMessages(this.props.replyingMessages?.filter(m2 => m2._id != m._id))
                    }><Text>X</Text></Pressable>
                    <Text> Replying to {m.author?.username}</Text>
                </View>
            ) : null}
            <View style={styles.messageBoxInner}>
                <TextInput placeholderTextColor={currentTheme.textSecondary} style={styles.messageBox} placeholder={"Message " + (this.props.channel?.channel_type != "Group" ? (this.props.channel?.channel_type == "DirectMessage" ? "@" : "#") : "") + (this.props.channel?.name || this.props.channel.recipient?.username)} onChangeText={(text) => {
                    this.setState({currentText: text})
                    if (this.state.currentText.length == 0) {
                        this.props.channel.stopTyping();
                    } else {
                        if (!typing) {
                            typing = true;
                            this.props.channel.startTyping();
                            setTimeout((() => typing = false).bind(this), 2500);
                        }
                    }
                }} value={this.state.currentText} />
                {this.state.currentText.length > 0 ? <TouchableOpacity style={styles.sendButton} onPress={() => {
                    this.props.channel.sendMessage({
                        content: this.state.currentText, 
                        replies: this.props.replyingMessages.map((m) => {
                            return {id: m._id, mention: false}
                        })
                    }); 
                    this.setState({currentText: ""})
                    this.props.setReplyingMessages([]);
                }}><Text>Send</Text></TouchableOpacity> 
                : null}
            </View>
        </View>
    }
}

export const TypingIndicator = observer(({ channel }) => {
    if (channel) {
        let users = channel.typing.filter(entry => !!entry);
        let text;
        switch (users.length) {
            case 1:
                text = `${users[0].username} is typing...`; break
            case 2:
                text = `${users[0].username} and ${users[1].username} are typing...`; break
            case 3:
                text = `${users[0].username}, ${users[1].username}, and ${users[2].username} are typing...`; break
            default:
                text = "Several people are typing..."; break
        }
        if (users.length > 0) {
            return (
                <View style={styles.typingBar}>
                    <Text>{text}</Text>
                </View>
            );
        }
    }
    
    return <View/>;
});