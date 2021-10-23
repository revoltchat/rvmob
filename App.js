import 'react-native-get-random-values' // react native moment
import './shim' // react native moment 2

import React from 'react';
import { StyleSheet, View, TouchableOpacity, Pressable, Modal, ScrollView, TextInput, StatusBar, Dimensions, Linking, FlatList } from 'react-native';
import FastImage from 'react-native-fast-image'
const Image = FastImage
import ReactNative from 'react-native';
import { Client } from 'revolt.js';
import SideMenu from 'react-native-side-menu';
import { observer } from "mobx-react";
import { Channel } from 'revolt.js/dist/maps/Channels';
import { Message as MessageType } from 'revolt.js/dist/maps/Messages';
import { RelationshipStatus } from "revolt-api/types/Users";
import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import dayjs from 'dayjs'
import { decodeTime } from 'ulid'
import ImageViewer from 'react-native-image-zoom-viewer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressViewIOSComponent } from 'react-native';

const client = new Client();

let typing = false;
let defaultMaxSide = "128";
let didUpdateFirstTime = false;

let openProfile = (u) => {};
let openInvite = (i) => {};
let openBotInvite = (i) => {};
let openServer = (s) => {};




// <miscellaneous stuff>
const Text = (props) => {
    let newProps = {...props}
    if (!props.style) newProps = Object.assign({style: {}}, newProps)
    newProps.style = Object.assign({color: styles.textDefault.color}, newProps.style)
    return (
        <ReactNative.Text {...newProps}>{newProps.children}</ReactNative.Text>
    )
}

const defaultMarkdownIt = MarkdownIt({typographer: true, linkify: true}).disable([ 'image' ]);

const INVITE_PATHS = [
    "app.revolt.chat/invite",
    "nightly.revolt.chat/invite",
    "local.revolt.chat/invite",
    "rvlt.gg",
];
const RE_INVITE = new RegExp(
    `(?:${INVITE_PATHS.map((x) => x.split(".").join("\\.")).join(
        "|",
    )})/([A-Za-z0-9]*)`,
    "g",
);

const BOT_INVITE_PATHS = [
    "app.revolt.chat/bot",
    "nightly.revolt.chat/bot",
    "local.revolt.chat/bot"
];
const RE_BOT_INVITE = new RegExp(
    `(?:${BOT_INVITE_PATHS.map((x) => x.split(".").join("\\.")).join(
        "|",
    )})/([A-Za-z0-9]*)`,
    "g",
);

const openUrl = (url) => {
    if (url.startsWith("/@")) {
        let id = url.slice(2)
        let user = client.users.get(id)
        if (user) {
            openProfile(user)
        }
        return
    }
    let match = url.match(RE_INVITE);
    if (match) {
        openInvite(match[0].split("/").pop())
        return
    }
    let botmatch = url.match(RE_BOT_INVITE);
    if (botmatch) {
        openBotInvite(botmatch[0].split("/").pop())
        return
    }
    
    Linking.openURL(url)
}

const MarkdownView = (props) => {
    let newProps = {...props}
    if (!newProps.onLinkPress) newProps = Object.assign({onLinkPress: openUrl}, newProps)
    if (!newProps.markdownit) newProps = Object.assign({markdownit: defaultMarkdownIt}, newProps)
    if (!newProps.style) newProps = Object.assign({style: {}}, newProps)
    if (!newProps.style.body) newProps.style = Object.assign({body: {}}, newProps.style)
    newProps.style.body = Object.assign({color: currentTheme.textPrimary}, newProps.style.body)
    if (!newProps.style.paragraph) newProps.style = Object.assign({paragraph: {}}, newProps.style)
    newProps.style.paragraph = Object.assign({color: currentTheme.textPrimary, marginTop: -3, marginBottom: 2}, newProps.style.paragraph)
    if (!newProps.style.link) newProps.style = Object.assign({link: {}}, newProps.style)
    newProps.style.link = Object.assign({color: currentTheme.accentColor}, newProps.style.link)
    // if (!newProps.styles.block_quote) newProps.styles = Object.assign({blockQuote: {}}, newProps.styles)
    // newProps.styles.block_quote = Object.assign({borderRadius: 3, borderLeftWidth: 3, borderColor: currentTheme.backgroundSecondary, backgroundColor: currentTheme.blockQuoteBackground}, newProps.styles.blockQuote)
    try {
        return (
            <Markdown {...newProps}>{newProps.children}</Markdown>
        )
    } catch (e) {
        return (
            <Text>Error rendering markdown</Text>
        )
    }
}

class MainView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        	username: null,
        	status: "tryingLogin",
        	currentChannel: null,
            currentText: "",
            tokenInput: "",
            replyingMessages: [],
            leftMenuOpen: false,
            rightMenuOpen: false,
            contextMenuMessage: null,
            contextMenuUser: null,
            inviteBot: null,
            inviteBotDestination: null,
            imageViewerImage: null,
            contextMenuUserProfile: null,
            inviteServer: null,
            inviteServerCode: "",
            settingsOpen: false,
            nsfwConsented: false,
            rerender: 0
        };
        console.log("construct app");
        openProfile = async (u, s) => {
            this.setState({contextMenuUser: u || null, contextMenuUserProfile: u ? (await u.fetchProfile()) : null, contextMenuUserServer: s || null})
        }
        openInvite = async (i) => {
            this.setState({inviteServer: (await client.fetchInvite(i).catch(e => e)), inviteServerCode: i})
        }
        openBotInvite = async (id) => {
            this.setState({inviteBot: (await client.bots.fetchPublic(id).catch(e => e))})
        }
    }
    async componentDidMount() {
        console.log("mount app")
        client.on('ready', (async () => {
            this.setState({status: "loggedIn"});
            if (this.state.tokenInput) {
                AsyncStorage.setItem('token', this.state.tokenInput)
                this.setState({tokenInput: ""})
            }
        }).bind(this));
        AsyncStorage.getItem('token', async (err, res) => {
            if (!err) {
                if ((typeof res) != "string") {
                    this.setState({status: "awaitingLogin"})
                    return
                }
                try {
                    await client.useExistingSession({token: res});
                } catch (e) {
                    this.setState({logInError: e, status: "awaitingLogin"})
                }
            } else {
                console.log(err)
                this.setState({status: "awaitingLogin"});
            }
        });
    }
    render() {
        return (
            (this.state.status == "loggedIn" ? 
                <View style={styles.app}>
                    <SideMenu openMenuOffset={Dimensions.get('window').width - 50}
                    menuPosition="right" 
                    disableGestures={this.state.leftMenuOpen} 
                    edgeHitWidth={120} 
                    isOpen={this.state.rightMenuOpen} 
                    onChange={(open) => this.setState({rightMenuOpen: open})} 
                    menu={<RightMenu currentChannel={this.state.currentChannel} />} 
                    style={styles.app} 
                    bounceBackOnOverdraw={false}>
                        <SideMenu openMenuOffset={Dimensions.get('window').width - 50} 
                        disableGestures={this.state.rightMenuOpen} 
                        edgeHitWidth={120} 
                        isOpen={this.state.leftMenuOpen} 
                        onChange={(open) => this.setState({leftMenuOpen: open})} 
                        menu={<LeftMenu rerender={this.state.rerender} onOpenSettings={() => this.setState({settingsOpen: true})} onChannelClick={(s) => this.setState({currentChannel: s, leftMenuOpen: false, messages: []})} currentChannel={this.state.currentChannel} onLogOut={() => {AsyncStorage.setItem('token', ""); this.setState({status: "awaitingLogin"})}} />} 
                        style={styles.app} 
                        bounceBackOnOverdraw={false}>
                            <View style={styles.mainView}>
                                {this.state.currentChannel ? 
                                    (this.state.currentChannel == "friends" ?
                                    <View style={{flex: 1}}>
                                        <View style={styles.channelHeader}>
                                            <TouchableOpacity style={styles.headerIcon} onPress={() => {this.setState({leftMenuOpen: !this.state.leftMenuOpen})}}><Text>☰</Text></TouchableOpacity>
                                            <Text style={{flex: 1}}>{this.state.currentChannel?.channel_type != "Group" && (this.state.currentChannel?.channel_type == "DirectMessage" ? "@" : "#")}{this.state.currentChannel.name || this.state.currentChannel.recipient?.username}</Text>
                                        </View>
                                        <ScrollView style={{flex: 1}}>
                                            <Text style={{fontWeight: 'bold', margin: 5, marginLeft: 10, marginTop: 10}}>INCOMING REQUESTS</Text>
                                            <View>
                                                {[...client.users.values()].filter((x) => x.relationship === RelationshipStatus.Incoming).map(f => {
                                                    return <TouchableOpacity key={f._id} onPress={() => openProfile(f)} style={{justifyContent: 'center', margin: 6, padding: 6, backgroundColor: currentTheme.backgroundSecondary, borderRadius: 8}}>
                                                        <MiniProfile user={f} scale={1.15} />
                                                    </TouchableOpacity>
                                                })}
                                            </View>
                                            <Text style={{fontWeight: 'bold', margin: 5, marginLeft: 10, marginTop: 10}}>OUTGOING REQUESTS</Text>
                                            <View>
                                                {[...client.users.values()].filter((x) => x.relationship === RelationshipStatus.Outgoing).map(f => {
                                                    return <TouchableOpacity key={f._id} onPress={() => openProfile(f)} style={{justifyContent: 'center', margin: 6, padding: 6, backgroundColor: currentTheme.backgroundSecondary, borderRadius: 8}}>
                                                        <MiniProfile user={f} scale={1.15} />
                                                    </TouchableOpacity>
                                                })}
                                            </View>
                                            <Text style={{fontWeight: 'bold', margin: 5, marginLeft: 10}}>FRIENDS</Text>
                                            <View>
                                                {[...client.users.values()].filter((x) => x.relationship === RelationshipStatus.Friend).map(f => {
                                                    return <TouchableOpacity key={f._id} onPress={() => openProfile(f)} style={{flexDirection: "row", alignItems: 'center', margin: 8, padding: 4, backgroundColor: currentTheme.backgroundSecondary, borderRadius: 8}}>
                                                        <MiniProfile user={f} scale={1.15} />
                                                    </TouchableOpacity>
                                                })}
                                            </View>
                                        </ScrollView>
                                    </View>
                                    :
                                    <View style={{flex: 1}}>
                                        <View style={styles.channelHeader}>
                                            <TouchableOpacity style={styles.headerIcon} onPress={() => {this.setState({leftMenuOpen: !this.state.leftMenuOpen})}}><Text>☰</Text></TouchableOpacity>
                                            <Text style={{flex: 1}}>#{this.state.currentChannel.name}</Text>
                                        </View>
                                        {(!this.state.currentChannel?.name?.includes("nsfw") || this.state.nsfwConsented) ?
                                        <>
                                            <Messages channel={this.state.currentChannel} onLongPress={async (m) => {this.setState({contextMenuMessage: m})}} onUserPress={(m) => {openProfile(m.author, this.state.currentChannel.server)}} onImagePress={(a) => {this.setState({imageViewerImage: a})}} rerender={this.state.rerender} onUsernamePress={(m) => this.setState({currentText: this.state.currentText + "<@" + m.author?._id + ">"})} />
                                            <View style={styles.messageBoxOuter}>
                                                <TypingIndicator channel={this.state.currentChannel}/>
                                                {this.state.replyingMessages && this.state.replyingMessages.map(m => <View key={m._id} style={styles.replyingMessagePreview}><Pressable onPress={() => this.setState(() => {return {replyingMessages: this.state.replyingMessages?.filter(m2 => m2._id != m._id)}})}><Text>X</Text></Pressable><Text> Replying to {m.author?.username}</Text></View>)}
                                                <View style={styles.messageBoxInner}>
                                                    <TextInput placeholderTextColor={currentTheme.textSecondary} style={styles.messageBox} placeholder={"Message " + (this.state.currentChannel?.channel_type != "Group" ? (this.state.currentChannel?.channel_type == "DirectMessage" ? "@" : "#") : "") + (this.state.currentChannel?.name || this.state.currentChannel.recipient?.username)} onChangeText={(text) => {
                                                        this.setState({currentText: text})
                                                        if (this.state.currentText.length == 0) {
                                                            this.state.currentChannel.stopTyping();
                                                        } else {
                                                            if (!typing) {
                                                                typing = true;
                                                                this.state.currentChannel.startTyping();
                                                                setTimeout((() => typing = false).bind(this), 2500);
                                                            }
                                                        }
                                                    }} value={this.state.currentText} />
                                                    {this.state.currentText.length > 0 && <TouchableOpacity style={styles.sendButton} onPress={() => {this.state.currentChannel.sendMessage({content: this.state.currentText, replies: this.state.replyingMessages.map((m) => {return {id: m._id, mention: false}})}); this.setState({currentText: "", replyingMessages: []})}}><Text>Send</Text></TouchableOpacity>}
                                                </View>
                                            </View>
                                        </>
                                        :
                                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25}}>
                                            <Text style={{fontWeight: 'bold', fontSize: 20}}>Hold it!</Text>
                                            <Text style={{textAlign: 'center'}}>This is an NSFW channel. Are you sure you want to enter?</Text>
                                            <TouchableOpacity style={{padding: 5, margin: 10, paddingLeft: 10, paddingRight: 10, backgroundColor: currentTheme.backgroundSecondary, borderRadius: 8}} onPress={() => this.setState({nsfwConsented: true})}><Text>Enter</Text></TouchableOpacity>
                                        </View>
                                        }
                                    </View>
                                    )
                                    :
                                    <>
                                        <View style={styles.channelHeader}>
                                            <TouchableOpacity style={styles.headerIcon} onPress={() => {this.setState({leftMenuOpen: !this.state.leftMenuOpen})}}><Text>☰</Text></TouchableOpacity>
                                            <Text style={{flex: 1}}>Home</Text>
                                        </View>
                                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20}}>
                                            <Text key="app-name" style={{fontWeight: 'bold', fontSize: 48, marginBottom: 10}}>RVMob</Text>
                                            <Text key="no-channel-selected">Swipe from the left of the screen, or press the three lines icon to open the server selector!</Text>
                                        </View>
                                    </>
                                }
                            </View>
                        </SideMenu>
                    </SideMenu>
                    <Modal
                    key="messageMenu"
                    animationType="slide"
                    transparent={true}
                    visible={!!this.state.contextMenuMessage}
                    onRequestClose={() => {
                        () => this.setState({contextMenuMessage: null})
                    }}
                    >
                        <Pressable onPress={() => this.setState({contextMenuMessage: null})} style={{width: Dimensions.get("window").width, height: Dimensions.get("window").height, position: 'absolute', backgroundColor: "#00000000"}} />
                        <View style={{width: "100%", height: "40%", top: "60%", backgroundColor: currentTheme.backgroundSecondary}}>
                            <View>
                                <ReplyMessage message={this.state.contextMenuMessage} style={{margin: 3, width: "100%"}} />
                                <TouchableOpacity
                                    style={styles.actionTile}
                                    onPress={() => this.setState({contextMenuMessage: null})}
                                >
                                    <Text>Close</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionTile}
                                    onPress={() => {
                                        let replyingMessages = this.state.replyingMessages || []
                                        if (replyingMessages.filter(m => m._id === this.state.contextMenuMessage._id).length > 0) return
                                        if (replyingMessages.length >= 4) {
                                            return
                                        }
                                        replyingMessages.push(this.state.contextMenuMessage)
                                        this.setState({replyingMessages, contextMenuMessage: null})
                                    }}
                                >
                                    <Text>Reply</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                    <Modal
                    key="profileMenu"
                    animationType="slide"
                    transparent={true}
                    visible={!!this.state.contextMenuUser}
                    onRequestClose={() => openProfile(null)}
                    >
                        <Pressable onPress={() => openProfile(null)} style={{width: Dimensions.get("window").width, height: Dimensions.get("window").height, position: 'absolute', backgroundColor: "#00000000"}} />
                        <View style={{width: "100%", height: "75%", top: "25%", padding: 15, backgroundColor: currentTheme.backgroundSecondary}}>
                            <View>
                                <View style={{flexDirection: 'row'}}>
                                    <Avatar size={100} user={this.state.contextMenuUser} server={this.state.contextMenuUserServer} backgroundColor={currentTheme.backgroundSecondary} status />
                                    <View style={{justifyContent: 'center', marginLeft: 6}}>
                                        <View key={0} style={{flexDirection: 'row'}}>
                                            {!!this.state.contextMenuUserServer &&
                                            client.members.getKey({server: this.state.contextMenuUserServer?._id, user: this.state.contextMenuUser?._id})?.avatar?._id != this.props.contextMenuUser?.avatar?._id &&
                                            <Avatar size={30} user={this.state.contextMenuUser} />}
                                            <Username user={this.state.contextMenuUser} server={this.state.contextMenuUserServer} size={24} />
                                        </View>
                                        <View key={1} style={{flexDirection: 'row'}}>
                                            <Text style={{fontSize: 16}}>@</Text><Username user={this.state.contextMenuUser} size={16} noBadge />
                                        </View>
                                        {this.state.contextMenuUser?.status?.text ? <Text>{this.state.contextMenuUser?.status?.text}</Text> : <></>}
                                    </View>
                                </View>
                                {this.state.contextMenuUser?.relationship != RelationshipStatus.User ? 
                                    !this.state.contextMenuUser?.bot ? 
                                    (this.state.contextMenuUser?.relationship == RelationshipStatus.Friend ? 
                                        <TouchableOpacity style={styles.actionTile} onPress={async () => {openProfile(null); this.setState({currentChannel: (await this.state.contextMenuUser.openDM()), messages: []})}}>
                                            <Text>Message</Text>
                                        </TouchableOpacity> 
                                        :
                                        this.state.contextMenuUser?.relationship == RelationshipStatus.Incoming ? 
                                        <>
                                        <TouchableOpacity style={styles.actionTile} onPress={() => {this.state.contextMenuUser?.addFriend(); this.setState({})}}>
                                            <Text>Accept Friend</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionTile} onPress={() => {this.state.contextMenuUser?.removeFriend(); this.setState({})}}>
                                            <Text>Reject Friend</Text>
                                        </TouchableOpacity>
                                        </>
                                        :
                                        this.state.contextMenuUser?.relationship == RelationshipStatus.Outgoing ? 
                                        <TouchableOpacity style={styles.actionTile} onPress={() => {this.state.contextMenuUser?.removeFriend(); this.setState({})}}>
                                            <Text>Cancel Friend</Text>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity style={styles.actionTile} onPress={() => {this.state.contextMenuUser?.addFriend(); this.setState({})}}>
                                            <Text>Add Friend</Text>
                                        </TouchableOpacity>
                                    ) 
                                    :
                                    <>
                                        <Text style={{fontWeight: 'bold'}}>BOT OWNER</Text>
                                        {client.users.get(this.state.contextMenuUser?.bot?.owner) ? 
                                        <TouchableOpacity style={styles.actionTile} onPress={async () => {openProfile(client.users.get(this.state.contextMenuUser.bot.owner))}}>
                                            <MiniProfile user={client.users.get(this.state.contextMenuUser.bot.owner)} />
                                        </TouchableOpacity>
                                        :
                                        <Text style={{color: currentTheme.textSecondary}}>Unloaded user</Text>}
                                    </>
                                    : 
                                    <View style={{flexDirection: 'row'}}>
                                        {["Online", "Idle", "Busy", "Invisible"].map((s) => <TouchableOpacity key={s} style={[styles.actionTile, {flex: 1, alignItems: 'center', justifyContent: 'center'}]} onPress={() => {client.users.edit({status: {...client.user.status, presence: s}})}}><View style={{backgroundColor: currentTheme["status" + s], height: 16, width: 16, borderRadius: 10000}} /></TouchableOpacity>)}
                                    </View>
                                }
                                <ScrollView>
                                    <RoleView user={this.state.contextMenuUser} server={this.state.contextMenuUserServer}/>
                                    <Text style={{color: currentTheme.textSecondary, fontWeight: 'bold'}}>BIO</Text>
                                    {this.state.contextMenuUserProfile?.content && <MarkdownView style={{margin: 5}}>{this.state.contextMenuUserProfile?.content}</MarkdownView>}
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>
                    <Modal visible={!!this.state.imageViewerImage} transparent={true} animationType="fade">
                        <ImageViewer imageUrls={this.state.imageViewerImage?.metadata ? [{url: client.generateFileURL(this.state.imageViewerImage), width: this.state.imageViewerImage.metadata.width, height: this.state.imageViewerImage.metadata.height}] : [{url: this.state.imageViewerImage}]} renderHeader={() => <View style={{height: 50, width: "100%", justifyContent: 'center', paddingLeft: 10, paddingRight: 10}}><Pressable onPress={() => Linking.openURL(this.state.imageViewerImage?.metadata ? client.generateFileURL(this.state.imageViewerImage) : this.state.imageViewerImage)}><Text>Open URL</Text></Pressable><View style={{marginLeft: 20}}/><Pressable onPress={() => this.setState({imageViewerImage: null})}><Text>Close</Text></Pressable></View>} renderIndicator={(_1, _2) => null} enableSwipeDown={true} onCancel={() => this.setState({imageViewerImage: null})}/>
                    </Modal>
                    <Modal visible={this.state.settingsOpen} transparent={true} animationType="slide">
                        <View style={{flex: 1, backgroundColor: currentTheme.backgroundPrimary, padding: 15, borderTopLeftRadius: 15, borderTopRightRadius: 15}}>
                            <Pressable onPress={() => {this.setState({settingsOpen: false})}}><Text style={{fontSize: 24}}>Close</Text></Pressable>
                            <ScrollView style={{flex: 1}}>
                                <Text>Change Theme</Text>
                                <ScrollView style={{height: "30%", width: "90%", margin: 10, padding: 10 - currentTheme.generalBorderWidth, borderRadius: 8, backgroundColor: currentTheme.backgroundSecondary, borderWidth: currentTheme.generalBorderWidth, borderColor: currentTheme.generalBorderColor}}>
                                    {Object.keys(themes).map(name => <Pressable style={{padding: 10 - currentTheme.generalBorderWidth, backgroundColor: currentTheme.backgroundPrimary, borderRadius: 8, marginBottom: 5, borderColor: currentTheme.buttonBorderColor, borderWidth: currentTheme.buttonBorderWidth}} onPress={() => {currentTheme = themes[name]; currentThemeName = name; refreshStyles(); this.setState({rerender: this.state.rerender + 1})}}><Text>{name}{currentThemeName == name ? " (active)" : ""}</Text></Pressable>)}
                                </ScrollView>
                                <Text>some text here</Text>
                            </ScrollView>
                        </View>
                    </Modal>
                    <Modal visible={!!this.state.inviteServer} transparent={true} animationType="fade">
                        <View style={{flex: 1, backgroundColor: currentTheme.backgroundPrimary}}>
                            <Pressable onPress={() => {this.setState({inviteServer: null})}}><Text style={{fontSize: 24}}>Close</Text></Pressable>
                            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                                {this.state.inviteServer?.type === "Server" ? 
                                <>
                                    {this.state.inviteServer.server_banner && <Image source={this.state.inviteServer.server_banner ? {uri: client.generateFileURL(this.state.inviteServer.server_banner)} : {}} style={{width: "100%", height: "100%"}} />}
                                    <View style={{height: "100%", width: "100%", position: 'absolute', top: 0, left: 0, alignItems: 'center', justifyContent: 'center'}}>
                                        <View style={{padding: 10, borderRadius: 8, margin: 10, backgroundColor: currentTheme.backgroundPrimary + "dd", justifyContent: 'center', alignItems: 'center'}}>
                                            <View style={{alignItems: 'center', flexDirection: 'row'}}>
                                                <GeneralAvatar attachment={this.state.inviteServer.server_icon} size={60} />
                                                <View style={{marginLeft: 10}} />
                                                <ServerName server={this.state.inviteServer} size={26} />
                                            </View>
                                            <TouchableOpacity onPress={async () => {!client.servers.get(this.state.inviteServer?.server_id) && await client.joinInvite(this.state.inviteServerCode); openServer(client.servers.get(this.state.inviteServer?.server_id)); this.setState({inviteServer: null, inviteServerCode: null})}} style={styles.button}><Text>{client.servers.get(this.state.inviteServer) ? "Go to Server" : "Join Server"}</Text></TouchableOpacity>
                                        </View>
                                    </View>
                                </>
                                : 
                                <Text>{this.state.inviteServer?.toString()}</Text>}
                            </View>
                        </View>
                    </Modal>
                    <Modal visible={!!this.state.inviteBot} transparent={true} animationType="fade">
                        {this.state.inviteBot &&
                        <View style={{flex: 1, backgroundColor: currentTheme.backgroundPrimary}}>
                            <Pressable onPress={() => {this.setState({inviteServer: null})}}><Text style={{fontSize: 24}}>Cancel</Text></Pressable>
                            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <GeneralAvatar attachment={this.state.inviteBot.avatar} size={48} /><Text style={{paddingLeft: 10, fontSize: 24, fontWeight: 'bold'}}>{this.state.inviteBot.username}</Text>
                                </View>
                                <View style={{height: 56}}>
                                    <ScrollView horizontal={true}>
                                        <ServerList onServerPress={s => this.setState({inviteBotDestination: s})} />
                                    </ScrollView>
                                </View>
                                <TouchableOpacity style={styles.button} onPress={() => {if (!this.state.inviteBotDestination) {return}; client.bots.invite(this.state.inviteBot._id, {server: this.state.inviteBotDestination._id}); this.setState({inviteBot: null, inviteBotDestination: null})}}><Text>Invite to {this.state.inviteBotDestination ? <Text style={{fontWeight: 'bold'}}>{this.state.inviteBotDestination?.name}</Text> : "which server?"}</Text></TouchableOpacity>
                            </View>
                        </View>
                        }
                    </Modal>
                </View>
                : 
                (this.state.status == "awaitingLogin" ? 
                <View style={styles.app}>
                    <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                        <Text style={{fontWeight: 'bold', fontSize: 48}}>RVMob</Text>
                        <TextInput placeholderTextColor={currentTheme.textSecondary} style={{borderRadius: 8, padding: 3, paddingLeft: 10, paddingRight: 10, margin: 8, width: "80%", backgroundColor: currentTheme.backgroundSecondary, color: currentTheme.textPrimary}} placeholder={"Token"} onChangeText={(text) => {
                            this.setState({tokenInput: text})
                        }} value={this.state.tokenInput} />
                        {this.state.logInError && <Text>{this.state.logInError.message}</Text>}
                        <TouchableOpacity onPress={async () => {
                            this.setState({status: "tryingLogin"})
                            try {
                                await client.useExistingSession({token: this.state.tokenInput})
                                this.setState({tokenInput: "", logInError: null})
                            } catch (e) {
                                console.error(e)
                                this.setState({logInError: e, status: "awaitingLogin"})
                            }
                        }} style={{borderRadius: 8, padding: 5, paddingLeft: 10, paddingRight: 10, backgroundColor: currentTheme.backgroundSecondary}}><Text>Log in</Text></TouchableOpacity>
                    </View>
                </View>
                :
                <View style={styles.app}>
                    <View style={styles.loggingInScreen}>
                        <Text>Logging in...</Text>
                    </View>
                </View>
                )
            )
        );
    }
}

const TypingIndicator = observer(({ channel }) => {
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

const GeneralAvatar = ({ attachment, size }) => {
    return (
        <View>
            {<Image source={{uri: client.generateFileURL(attachment) + "?max_side=" + defaultMaxSide}} style={{width: size || 35, height: size || 35, borderRadius: 10000}} />}
        </View>
    )
}
// </miscellaneous stuff>



// <messaging stuff>
class Messages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            loading: false,
            forceUpdate: false,
            newMessageCount: 0
        };
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.rerender != this.props.rerender) return true
        if (nextState.newMessageCount != this.state.newMessageCount) return true
        if (nextState.forceUpdate) {
            this.setState({forceUpdate: false})
            return true
        }
        if (nextState?.messages) {
            let res = (nextState.messages[nextState.messages.length - 1]?.message._id != this.state.messages[this.state.messages?.length - 1]?.message._id) || (this.props.channel?._id != nextProps.channel?._id) || (!didUpdateFirstTime) || (this.state.forceUpdate)
            return res
        }
        return true
    }
    componentDidMount() {
        console.log("mount component")
    	client.on('message', async message => {
    		if (this.props.channel) { // !this.props.loading && 
    			if (this.props.channel._id == message.channel._id && this.state.messages?.length > 0) {
    	    		this.setState((prev) => {
                        let newMessages = prev.messages
                        if (newMessages.length >= (!this.state.bottomOfPage ? 150 : 50)) {
                            newMessages = newMessages.slice(0, 50)
                        }
                        newMessages.unshift({message, grouped: (newMessages[0].message.author?._id == message.author?._id) && !(message.reply_ids && message.reply_ids.length > 0)})
                        return {messages: newMessages, newMessageCount: !this.state.bottomOfPage ? (this.state.newMessageCount + 1) || 1 : 0}
                    })
    	    	}
    	    }
    	});
    	client.on('message/delete', async id => {
    		if (this.props.channel) {
                this.setState((prev) => {
                    if (prev.messages.filter(m => m.message._id == id).length > 0) return {messages: prev.messages.filter(m => m.message._id != id), forceUpdate: true}
                    return {}
                })
    	    }
    	});
        didUpdateFirstTime = false
        this.componentDidUpdate(this.state)
    }
    componentDidUpdate(prev) {
        if (this.props.channel && (!didUpdateFirstTime || prev.channel._id != this.props.channel._id)) {
            didUpdateFirstTime = true
            this.setState({loading: true})
            requestAnimationFrame(() => {
                console.log("fetch messages")
                let lastAuthor = "";
                let lastTime = null;
                this.props.channel.fetchMessagesWithUsers({limit: 50}).then((res) => {console.log("done fetching"); this.setState({messages: res.messages.reverse().map((message) => {
                    let time = dayjs(decodeTime(message._id))
                    let res = {grouped: ((lastAuthor == message.author?._id) && !(message.reply_ids && message.reply_ids.length > 0) && (lastTime && time.diff(lastTime, "minute") < 5)), message: message}
                    lastAuthor = (message.author ? message.author._id : lastAuthor)
                    lastTime = time
                    return res
                }).reverse(), loading: false, newMessageCount: 0})});
            })
        }
    }
    render() {
        return (
            this.state.loading ? 
            <Text>Loading...</Text>
            :
            <View style={{flex: 1}}>
                {this.state.newMessageCount > 0 && <Text style={{height: 32, padding: 6, backgroundColor: currentTheme.accentColor, color: currentTheme.accentColorForeground}}>{this.state.newMessageCount} new messages...</Text>}
                <FlatList data={this.state.messages} 
                removeClippedSubviews={false}
                disableVirtualization={true}
                maxToRenderPerBatch={50}
                initialNumToRender={50}
                inverted={true}
                windowSize={51}
                keyExtractor={(item) => {return item.message._id}}
                renderItem={m => 
                    <Message key={m.item.message._id} 
                    message={m.item.message} 
                    grouped={m.item.grouped} 
                    onLongPress={() => this.props.onLongPress(m.item.message)} 
                    onUserPress={() => this.props.onUserPress(m.item.message)} 
                    onImagePress={(a) => this.props.onImagePress(a)} 
                    onUsernamePress={() => this.props.onUsernamePress(m.item.message)}
                    />
                } 
                ref={ref => {this.scrollView = ref}} 
                onScroll={e => {this.setState({
                    bottomOfPage: (e.nativeEvent.contentOffset.y >= 
                        (e.nativeEvent.contentSize.height - 
                        e.nativeEvent.layoutMeasurement.height)), 
                        newMessageCount: (e.nativeEvent.contentOffset.y >= 
                        (e.nativeEvent.contentSize.height - 
                        e.nativeEvent.layoutMeasurement.height)) 
                        ? 0 : 
                        this.state.newMessageCount}); 
                    }} 
                onLayout={() => {if (this.state.bottomOfPage) {this.scrollView.scrollToOffset({offset: 0, animated: false})}}}
                onContentSizeChange={() => {if (this.state.bottomOfPage) {this.scrollView.scrollToOffset({offset: 0, animated: true})}}} 
                style={styles.messagesView} />
            </View>
        )
    }
}
const Message = observer((props) => { 
    let [error, setError] = React.useState(null)
    if (error) 
    return (
        <View>
            <Text style={{color: "#ff4444"}}>Failed to render message:{'\n'}{error?.message}</Text>
        </View>
    )
    try {
        return (
            <TouchableOpacity activeOpacity={0.8} delayLongPress={750} onLongPress={props.onLongPress}>
                {(props.message.reply_ids !== null) && <View style={styles.repliedMessagePreviews}>{props.message.reply_ids.map(id => <ReplyMessage key={id} message={client.messages.get(id)} />)}</View>}
                <View style={props.grouped ? styles.messageGrouped : styles.message}>
                    {(props.message.author && !props.grouped) && <Pressable onPress={() => props.onUserPress()}><Avatar user={props.message.author} server={props.message.channel?.server} size={35} /></Pressable>}
                    <View style={styles.messageInner}>
                        {props.grouped && (props.message.edited && <Text style={{fontSize: 12, color: currentTheme.textSecondary, position: 'relative', right: 47, marginBottom: -16}}> (edited)</Text>)}
                        {(props.message.author && !props.grouped) && <View style={{flexDirection: 'row'}}><Pressable onPress={props.onUsernamePress}><Username user={props.message.author} server={props.message.channel?.server} /></Pressable><Text style={styles.timestamp}> {dayjs(decodeTime(props.message._id)).format('YYYY-MM-DD hh:mm:ss A')}</Text>{props.message.edited && <Text style={{fontSize: 12, color: currentTheme.textSecondary, position: 'relative', top: 2, left: 2}}> (edited)</Text>}</View>}
                        <MarkdownView>{props.message.content}</MarkdownView>
                        {props.message.attachments?.map((a) => {
                            if (a.metadata?.type == "Image") {
                                let width = a.metadata.width;
                                let height = a.metadata.height;
                                if (width > (Dimensions.get("screen").width - 75)) {
                                    let sizeFactor = (Dimensions.get("screen").width - 75) / width;
                                    width = width * sizeFactor
                                    height = height * sizeFactor
                                }
                                return <Pressable onPress={() => props.onImagePress(a)}><Image source={{uri: client.generateFileURL(a)}} resizeMode={FastImage.resizeMode.contain} style={{width: width, height: height, marginBottom: 4, borderRadius: 3}} /></Pressable>
                            } else {
                                return <View style={{padding: 15, borderRadius: 6, backgroundColor: currentTheme.backgroundSecondary, marginBottom: 15}}><Text>{a.filename}</Text><Text>{a.size.toLocaleString()} bytes</Text></View>
                            }
                        })}
                        {props.message.embeds?.map((e) => {
                            if (e.type=="Website")
                            return <View style={{backgroundColor: currentTheme.backgroundSecondary, padding: 8, borderRadius: 8}}>
                                {e.site_name && <Text style={{fontSize: 12, fontColor: currentTheme.textSecondary}}>{e.site_name}</Text>}
                                {e.title && 
                                    e.url ? <Pressable onPress={() => openUrl(e.url)}><Text style={{color: currentTheme.accentColor}}>{e.title}</Text></Pressable> : <Text>{e.title}</Text>}
                                {e.description && <Text>{e.description}</Text>}
                                {(() => {
                                    if (e.image) {
                                        let width = e.image.width;
                                        let height = e.image.height;
                                        if (width > (Dimensions.get("screen").width - 82)) {
                                            let sizeFactor = (Dimensions.get("screen").width - 82) / width;
                                            width = width * sizeFactor
                                            height = height * sizeFactor
                                        }
                                        return <Pressable onPress={() => props.onImagePress(e.image.url)}><Image source={{uri: client.proxyFile(e.image.url)}} style={{width: width, height: height, marginTop: 4, borderRadius: 3}} /></Pressable>
                                    }
                                })()}
                            </View>
                            if (e.type == "Image") {
                                // if (e.image?.size == "Large") {
                                let width = e.width;
                                let height = e.height;
                                if (width > (Dimensions.get("screen").width - 75)) {
                                    let sizeFactor = (Dimensions.get("screen").width - 75) / width;
                                    width = width * sizeFactor
                                    height = height * sizeFactor
                                }
                                return <Image source={{uri: client.proxyFile(e.url)}} style={{width: width, height: height, marginBottom: 4, borderRadius: 3}} />
                                // if (e.image?.size)
                            }
                        })}
                    </View>
                </View>
            </TouchableOpacity>
        );
    } catch (e) {
        setError(e)
        console.error(e)
    }
})
class ReplyMessage extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View style={{alignItems: 'center', flexDirection: 'row'}}>
                <Text style={{marginLeft: 15, marginRight: 15}}>↱</Text>
                {this.props.message ? 
                    this.props.message.author && <>
                        <Avatar user={this.props.message.author} server={this.props.message.channel?.server} size={16} />
                        <Username user={this.props.message.author} server={this.props.message.channel?.server} />
                        <Text style={styles.messageContentReply}>{this.props.message.content.split("\n").join(" ")}</Text>
                    </>
                : <Text style={styles.messageContentReply}>Message not loaded</Text>
                }
            </View>
        );
    }
}
// </messaging stuff>



// <side menus>
class LeftMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentServer: null,
            rerender: 0
        };
        openServer = (s) => {this.setState({currentServer: s})}
    }
    render() {
        return (
            <>
            <View style={styles.leftView}>
                <ScrollView style={styles.serverList}>
                    <TouchableOpacity onPress={
                        ()=>{this.setState({currentServer: null})}
                    } onLongPress={
                        ()=>{openProfile(client.user)}
                    } delayLongPress={750}
                    key={client.user?._id}
                    style={{margin: 4}}>
                        <Avatar user={client.user} size={48} backgroundColor={currentTheme.backgroundSecondary} status />
                    </TouchableOpacity>
                    <ServerList onServerPress={(s) => this.setState({currentServer: s})} />
                </ScrollView>
                <ScrollView style={styles.channelList}>
                    <ChannelList onChannelClick={this.props.onChannelClick} currentChannel={this.props.currentChannel} currentServer={this.state.currentServer} />
                </ScrollView>
            </View>
            <View style={{height: 50, width: "100%", 
            backgroundColor: currentTheme.backgroundSecondary, 
            borderTopWidth: currentTheme.generalBorderWidth,
            borderColor: currentTheme.generalBorderColor,
            flexDirection: 'row'}}>
                <Pressable onPress={this.props.onOpenSettings} style={{width: 60, height: 30, margin: 10, backgroundColor: currentTheme.backgroundPrimary, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderColor: currentTheme.buttonBorderColor, borderWidth: currentTheme.buttonBorderWidth}}><Text>Config</Text></Pressable>
                <Pressable onPress={this.props.onLogOut} style={{width: 80, height: 30, margin: 10, backgroundColor: currentTheme.backgroundPrimary, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderColor: currentTheme.buttonBorderColor, borderWidth: currentTheme.buttonBorderWidth}}><Text>Log Out</Text></Pressable>
            </View>
            </>
        );
    }
}
class RightMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentDidUpdate(newProps, newState) {
        if (newProps.currentChannel?._id != this.props.currentChannel?._id && newProps.currentChannel?.server) this.setState(async () => {return {users: (await this.props.currentChannel?.server?.fetchMembers()).users}})
    }
    render() {
        if (this.props.currentChannel?.channel_type == "Group" || this.props.currentChannel?.channel_type == "DirectMessage")
        return (
            <View style={styles.rightView}>
                {this.props.currentChannel?.recipients?.map(u => 
                    <TouchableOpacity style={{justifyContent: 'center', marginLeft: 6, marginRight: 6, marginTop: 3, padding: 6, backgroundColor: currentTheme.backgroundPrimary, borderRadius: 8}} onPress={() => this.props.onOpenProfile(u)}>
                        <MiniProfile user={u} />
                    </TouchableOpacity>
                )}
            </View>
        );
        if (this.props.currentChannel?.server)
        return (
            <View style={styles.rightView}>
                {this.state.users?.map(u => 
                    <TouchableOpacity style={{justifyContent: 'center', marginLeft: 6, marginRight: 6, marginTop: 3, padding: 6, backgroundColor: currentTheme.backgroundPrimary, borderRadius: 8}} onPress={() => this.props.onOpenProfile(u)}>
                        <MiniProfile user={u} server={this.props.currentChannel?.server} />
                    </TouchableOpacity>
                )}
            </View>
        );
        return (
            <View style={styles.rightView}>
                <Image source={
                    {uri: "https://upload.wikimedia.org/wikipedia/en/9/9a/Trollface_non-free.png"}
                } style={{width: 300, height: 250}} />
            </View>
        );
    }
}
const ServerList = observer(({ onServerPress }) => {
    return [...client.servers.values()].map((s) => {
        let iconURL = s.generateIconURL();
        return <TouchableOpacity onPress={
            ()=>{onServerPress(s)}
        } 
        key={s._id} 
        style={styles.serverButton}>
            {iconURL ? <Image source={{uri: iconURL + "?max_side=" + defaultMaxSide}} style={styles.serverIcon}/> : <Text>{s.name}</Text>}
        </TouchableOpacity>
    })
})
const ChannelList = observer((props) => {
    return (
        <>
            {!props.currentServer && <>
            <TouchableOpacity onPress={
                async ()=>{props.onChannelClick(null)}
            } 
            key={"home"} 
            style={props.currentChannel?._id == null ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                <Text>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={
                ()=>{props.onChannelClick("friends")}
            } 
            key={"friends"} 
            style={props.currentChannel == "friends" ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                <Text>Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={
                async ()=>{props.onChannelClick(await client.user.openDM())}
            } 
            key={"notes"} 
            style={props.currentChannel?.channel_type == "SavedMessages" ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                <Text>Saved Notes</Text>
            </TouchableOpacity>
            {[...client.channels.values()].filter(c => c.channel_type == "DirectMessage" || c.channel_type == "Group").map(dm => {
                if (dm.channel_type == "DirectMessage") return <TouchableOpacity onPress={
                    ()=>{props.onChannelClick(dm)}
                } onLongPress={
                    ()=>{openProfile(dm.recipient)}
                } 
                key={dm._id} 
                style={props.currentChannel?._id == dm._id ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <MiniProfile user={dm.recipient} />
                    </View>
                </TouchableOpacity>
                if (dm.channel_type == "Group") return <TouchableOpacity onPress={
                    ()=>{props.onChannelClick(dm)}
                } 
                key={dm._id} 
                style={props.currentChannel?._id == dm._id ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                    <MiniProfile channel={dm} />
                </TouchableOpacity>
            })}
            </>
            }
            {props.currentServer && <>
                {props.currentServer.banner ? <Image source={{uri: props.currentServer.generateBannerURL()}} style={{width: "100%", height: 110, justifyContent: 'flex-end'}}><Text style={{margin: 10, marginTop: 13, marginBottom: 9, fontSize: 18, fontWeight: 'bold'}}>{props.currentServer.name}</Text></Image> : <Text style={{margin: 10, marginTop: 13, marginBottom: 9, fontSize: 18, fontWeight: 'bold'}}>{props.currentServer.name}</Text>}
                {(() => {
                    let processedChannels = [];
                    let res = props.currentServer.categories?.map(c => {
                        return <View key={c.id}>
                            <Text style={{marginLeft: 5, marginTop: 10, fontSize: 12, fontWeight: 'bold'}}>{c.title?.toUpperCase()}</Text>
                            {c.channels.map((cid) => {
                                processedChannels.push(cid)
                                let c = client.channels.get(cid)
                                if (c) {
                                    return <TouchableOpacity onPress={
                                        ()=>{props.onChannelClick(c)}
                                    } 
                                    key={c._id} 
                                    style={props.currentChannel?._id == c._id ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                                        {(c.generateIconURL && c.generateIconURL()) ? <Image source={{uri: c.generateIconURL() + "?max_side=" + defaultMaxSide}} style={{width: 20, height: 20, marginRight: 5}}/> : <Text>#</Text>}<Text>{c.name}</Text>
                                    </TouchableOpacity>
                                }
                            })}
                        </View>
                    })
                    return <>
                        {props.currentServer.channels.map((c) => {
                            if (c) {
                                if (!processedChannels.includes(c._id))
                                return <TouchableOpacity onPress={
                                    ()=>{props.onChannelClick(c)}
                                } 
                                key={c._id} 
                                style={props.currentChannel?._id == c._id ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                                    {(c.generateIconURL && c.generateIconURL()) ? <Image source={{uri: c.generateIconURL() + "?max_side=" + defaultMaxSide}} style={{width: 20, height: 20, marginRight: 5}}/> : <Text>#</Text>}<Text>{c.name}</Text>
                                </TouchableOpacity>
                            }
                        })}
                        {res}
                    </>
                })()}
            </>}
        </>
    );
})
// </side menus>



// <profile stuff>
const Username = observer(({ server, user, noBadge, size }) => { 
    let memberObject = client.members.getKey({server: server?._id, user: user?._id})
    let color = styles.textDefault.color
    let name = server && memberObject?.nickname ? memberObject?.nickname : user.username;
    if (server && (memberObject?.roles && memberObject?.roles?.length > 0)) {
        let server = client.servers.get(memberObject._id.server);
        if (server?.roles) {
            for (let role of memberObject?.roles) {
                if (server.roles[role].colour) {
                    color = server.roles[role].colour
                }
            }
        }
    }
    return (
        <View style={{flexDirection: 'row'}}>
            <Text style={{color, fontWeight: 'bold', fontSize: size || 14}}>
                {name}
            </Text>
            {!noBadge && (
            user?.bot && 
                <Text style={{color: currentTheme.accentColorForeground, backgroundColor: currentTheme.accentColor, marginLeft: 4, paddingLeft: 3, paddingRight: 3, borderRadius: 3, fontSize: (size || 14)}}>
                    BOT
                </Text>
            )}
        </View>
    )
})
const Avatar = observer(({ channel, user, server, status, size, backgroundColor }) => {
    let memberObject = client.members.getKey({server: server?._id, user: user?._id});
    let statusColor
    let statusScale = 2.75
    if (status) {
        statusColor = currentTheme["status" + (user.online ? (user.status?.presence || "Online") : "Offline")]
    }
    if (user)
    return ( 
        <View>
            <Image source={{uri: ((server && memberObject?.generateAvatarURL && memberObject?.generateAvatarURL()) ? memberObject?.generateAvatarURL() : user?.generateAvatarURL()) + "?max_side=" + defaultMaxSide}} style={{width: size || 35, height: size || 35, borderRadius: 10000}} />
            {status && <View style={{width: size / statusScale, height: size / statusScale, backgroundColor: statusColor, borderRadius: 10000, marginTop: -(size / statusScale), left: size - (size / statusScale), borderWidth: size / 20, borderColor: backgroundColor || currentTheme.backgroundPrimary}} />}
        </View>
    )
    if (channel)
    return (
        <View>
            {channel?.generateIconURL() && <Image source={{uri: channel?.generateIconURL() + "?max_side=" + defaultMaxSide}} style={{width: size || 35, height: size || 35, borderRadius: 10000}} />}
        </View>
    )
})
const MiniProfile = observer(({ user, scale, channel, server}) => {
    if (user)
    return <View style={{flexDirection: 'row'}}>
        <Avatar user={user} server={server} size={35 * (scale || 1)} status />
        <View style={{marginLeft: 10 * (scale || 1)}}>
            <Username user={user} server={server} size={14 * (scale || 1)} />
            <Text style={{marginTop: -3 * (scale || 1), fontSize: 14 * (scale || 1)}}>{user.online ? (user.status?.text || (user.status?.presence || "Online")) : "Offline"}</Text>
        </View>
    </View>

    if (channel)
    return <View style={{flexDirection: 'row'}}>
        <Avatar channel={channel} size={35 * (scale || 1)} />
        <View style={{marginLeft: 10 * (scale || 1)}}>
            <Text style={{fontSize: 14 * (scale || 1), fontWeight: 'bold'}}>{channel.name}</Text>
            <Text style={{marginTop: -3 * (scale || 1), fontSize: 14 * (scale || 1)}}>{channel?.recipient_ids.length} members</Text>
        </View>
    </View>
})
const RoleView = observer(({ server, user }) => {
    let memberObject = client.members.getKey({server: server?._id, user: user?._id});
    let roles = memberObject?.roles?.map(r => server?.roles[r]) || []
    return (
        memberObject && roles ?
        <>
            <Text>{roles.length} Roles</Text>
            <View>{roles.map(r => <Text style={{flexDirection: 'row', padding: 8, paddingLeft: 12, paddingRight: 12, backgroundColor: currentTheme.backgroundPrimary, borderRadius: 8, color: r.colour}}>{r.name}</Text>)}</View>
        </>
        : <></>
    )
})
// </profile stuff>



// <server stuff>
const ServerName = observer(({ server, size }) => { 
    return (
        <View style={{flexDirection: 'row'}}>
            <Text style={{fontWeight: 'bold', fontSize: size || 14, flexWrap: 'wrap'}}>
                {server.server_name || server.name}
            </Text>
        </View>
    )
})
// </server stuff>




export default class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            error: null
        }
    }
    componentDidCatch(error, errorInfo) {
        this.setState({error})
        console.error(error)
    }
    render() {
        return (
            <View style={styles.outer}>
                {this.state.error ?
                <Text style={{flex: 1, padding: 15, alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>OOPSIE WOOPSIE!! Uwu We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our headquarters are working VEWY HAWD to fix this!{'\n\n'}<Text style={{color: "#ff5555", fontWeight: 'regular'}}>{this.state.error.toString()}</Text></Text>
                :
                <>
                <StatusBar
                animated={true}
                backgroundColor={currentTheme.backgroundSecondary}
                barStyle={currentTheme.contentType + "-content"} />
                <MainView />
                </>}
            </View>
        );
    }
}




// <themeing stuff>
const themes = {
    "Light": {
        backgroundPrimary: '#ffffff',
        backgroundSecondary: '#d8d8d8',
        blockQuoteBackground: '#11111166',
        textPrimary: '#000000',
        textSecondary: '#555555',
        accentColor: '#913edc',
        accentColorForeground: '#000000',
        contentType: 'dark',
        buttonBorderWidth: 0,
        messageBoxBorderWidth: 0,
        generalBorderWidth: 0,
        buttonBorderColorActive: "#3333ff",
        statusOnline: "#3abf7e",
        statusIdle: "#f39f00",
        statusBusy: "#f84848",
        statusStreaming: "#977eff",
        statusOffline: "#a5a5a5",
        statusInvisible: "#a5a5a5"
    },
    "Dark": {
        backgroundPrimary: '#151515',
        backgroundSecondary: '#202020',
        blockQuoteBackground: '#11111166',
        textPrimary: '#dddddd',
        textSecondary: '#888888',
        accentColor: '#913edc',
        accentColorForeground: '#000000',
        contentType: 'light',
        buttonBorderWidth: 0,
        messageBoxBorderWidth: 0,
        generalBorderWidth: 0,
        buttonBorderColorActive: "#3333ff",
        statusOnline: "#3abf7e",
        statusIdle: "#f39f00",
        statusBusy: "#f84848",
        statusStreaming: "#977eff",
        statusOffline: "#a5a5a5",
        statusInvisible: "#a5a5a5"
    },
    "Solarized": {
        backgroundPrimary: '#001a20',
        backgroundSecondary: '#05252d',
        blockQuoteBackground: '#11111166',
        textPrimary: '#dddddd',
        textSecondary: '#888888',
        accentColor: '#913edc',
        accentColorForeground: '#000000',
        contentType: 'light',
        buttonBorderWidth: 0,
        messageBoxBorderWidth: 0,
        generalBorderWidth: 0,
        buttonBorderColorActive: "#3333ff",
        statusOnline: "#3abf7e",
        statusIdle: "#f39f00",
        statusBusy: "#f84848",
        statusStreaming: "#977eff",
        statusOffline: "#a5a5a5",
        statusInvisible: "#a5a5a5"
    },
    "AMOLED": {
        backgroundPrimary: '#000000',
        backgroundSecondary: '#000000',
        blockQuoteBackground: '#111111',
        textPrimary: '#dddddd',
        textSecondary: '#888888',
        accentColor: '#913edc',
        accentColorForeground: '#000000',
        contentType: 'light',
        buttonBorderColor: "#ffffff99",
        buttonBorderWidth: 1,
        messageBoxBorderColor: "#ffffff99",
        messageBoxBorderWidth: 1,
        generalBorderColor: "#ffffff22",
        generalBorderWidth: 1,
        buttonBorderColorActive: "#3333ff",
        statusOnline: "#3abf7e",
        statusIdle: "#f39f00",
        statusBusy: "#f84848",
        statusStreaming: "#977eff",
        statusOffline: "#a5a5a5",
        statusInvisible: "#a5a5a5"
    }
}
var currentTheme = themes["Dark"]
var currentThemeName = "Dark"

var styles;
function refreshStyles() {
    styles = StyleSheet.create({
        outer: {
            flex: 1,
            backgroundColor: currentTheme.backgroundSecondary
        },
        app: {
            flex: 1,
            backgroundColor: currentTheme.backgroundPrimary
        },
        mainView: {
            flex: 1,
            backgroundColor: currentTheme.backgroundPrimary,
            borderRadius: 8
        },
        loggingInScreen: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
        },
        leftView: {
            flex: 1,
            backgroundColor: currentTheme.backgroundSecondary,
            flexDirection: "row",
            justifyContent: 'flex-start'
        },
        rightView: {
            flex: 1,
            backgroundColor: currentTheme.backgroundSecondary
        },
        textDefault: {
            color: currentTheme.textPrimary
        },
        message: {
            width: "100%",
            flex: 1,
            flexDirection: "row",
            marginBottom: 3
        },
        messageGrouped: {
            paddingLeft: 35,
            width: "100%"
        },
        messageInner: {
            flex: 1,
            paddingLeft: 10
        },
        messageAvatar: {
            width: 35,
            height: 35,
            borderRadius: 100000
        },
        messageAvatarReply: {
            width: 15,
            height: 15,
            borderRadius: 100000
        },
        messageUsernameReply: {
            marginLeft: 3,
            marginRight: 3
        },
        typingBar: {
            height: 26,
            paddingLeft: 6,
            padding: 3,
            backgroundColor: currentTheme.backgroundSecondary,
            borderBottomColor: currentTheme.backgroundPrimary,
            borderBottomWidth: 1
        },
        messageUsername: {
            fontWeight: 'bold'
        },
        serverButton: {
            borderRadius: 5000,
            width: 48,
            height: 48,
            margin: 4,
            backgroundColor: currentTheme.backgroundPrimary,
            overflow: "hidden"
        },
        serverIcon: {
            width: 48,
            height: 48
        },
        serverList: {
            width: 56,
            flexShrink: 1
        },
        channelList: {
            flexGrow: 1000,
            flex: 1000
        },
        channelButton: {
            padding: 8 - currentTheme.generalBorderWidth,
            margin: 3,
            marginRight: 5,
            borderRadius: 8,
            flexDirection: 'row',
            backgroundColor: currentTheme.backgroundPrimary,
            borderWidth: currentTheme.buttonBorderWidth,
            borderColor: currentTheme.buttonBorderColor
        },
        button: {
            padding: 5,
            paddingLeft: 10,
            paddingRight: 10,
            borderRadius: 8,
            backgroundColor: currentTheme.backgroundSecondary,
            margin: 5
        },
        channelButtonSelected: {
            borderColor: currentTheme.buttonBorderColorActive,
            borderWidth: currentTheme.buttonBorderWidth > 0 ? currentTheme.buttonBorderWidth : 1
        },
        messagesView: {
            padding: 10,
            flex: 1
        },
        messageBoxInner: {
            flexDirection: 'row'
        },
        messageBoxOuter: {
            backgroundColor: currentTheme.backgroundSecondary,
            margin: 5,
            borderRadius: 8,
            overflow: "hidden",
            borderColor: currentTheme.messageBoxBorderColor,
            borderWidth: currentTheme.messageBoxBorderWidth
        },
        sendButton: {
            margin: 3,
            marginLeft: 0,
            borderRadius: 8,
            backgroundColor: currentTheme.backgroundPrimary,
            width: 50,
            justifyContent: 'center',
            alignItems: 'center'
        },
        headerIcon: {
            margin: 5,
            marginRight: 10,
            justifyContent: 'center',
            alignItems: 'center'
        },
        messageBox: {
            color: currentTheme.textPrimary,
            paddingLeft: 10,
            padding: 6,
            flex: 1
        },
        channelHeader: {
            height: 50,
            backgroundColor: currentTheme.backgroundSecondary,
            alignItems: 'center',
            paddingLeft: 20,
            flexDirection: 'row'
        },
        messageContentReply: {
            height: 20,
            marginLeft: 4
        },
        actionTile: {
            height: 40,
            width: "100%",
            alignItems: 'center',
            flexDirection: 'row',
            backgroundColor: currentTheme.backgroundPrimary,
            marginBottom: 3,
            borderRadius: 8,
            paddingLeft: 10,
            paddingRight: 10,
            margin: 3
        },
        replyingMessagePreview: {
            padding: 4,
            borderBottomColor: currentTheme.backgroundPrimary,
            borderBottomWidth: 1,
            flexDirection: 'row'
        },
        repliedMessagePreviews: {
            paddingTop: 4
        },
        timestamp: {
            fontSize: 12,
            color: currentTheme.textSecondary,
            position: 'relative',
            top: 2,
            left: 2
        }
    });
}
refreshStyles()
// </themeing stuff>