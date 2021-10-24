import 'react-native-get-random-values' // react native moment
import './shim' // react native moment 2
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Pressable, Modal, ScrollView, TextInput, StatusBar, Dimensions, Linking, FlatList } from 'react-native';
import SideMenu from 'react-native-side-menu';
import { observer } from "mobx-react";
import { Channel } from 'revolt.js/dist/maps/Channels';
import { Message as MessageType } from 'revolt.js/dist/maps/Messages';
import { RelationshipStatus } from "revolt-api/types/Users";
import ImageViewer from 'react-native-image-zoom-viewer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';
import { setTheme, currentTheme, currentThemeName, styles, themes } from './src/Theme'
import { openUrl, Text, MarkdownView, client, defaultMaxSide } from './src/Generic'
import { Messages, ReplyMessage } from './src/MessageView'
import { MessageBox } from './src/MessageBox';
import { MiniProfile, Username, Avatar, RoleView, ServerName } from './src/Profile'
import FastImage from 'react-native-fast-image';
const Image = FastImage;

let typing = false;
let didUpdateFirstTime = false;

let openProfile = (u) => {};
let openInvite = (i) => {};
let openBotInvite = (i) => {};
let openServer = (s) => {};


// <miscellaneous stuff>

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
                                            <MessageBox channel={this.state.currentChannel} 
                                            setReplyingMessages={(r) => this.setState({replyingMessages: r})}
                                            replyingMessages={this.state.replyingMessages} />
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
                                    {Object.keys(themes).map(name => <Pressable style={{padding: 10 - currentTheme.generalBorderWidth, backgroundColor: currentTheme.backgroundPrimary, borderRadius: 8, marginBottom: 5, borderColor: currentTheme.buttonBorderColor, borderWidth: currentTheme.buttonBorderWidth}} onPress={() => {
                                        setTheme(name)
                                        this.setState({rerender: this.state.rerender + 1})
                                    }}><Text>{name}{currentThemeName == name ? " (active)" : ""}</Text></Pressable>)}
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
                            <Pressable onPress={() => {this.setState({inviteBot: null})}}><Text style={{fontSize: 24}}>Cancel</Text></Pressable>
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
                    {/* <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                        <Text style={{fontWeight: 'bold', fontSize: 48}}>RVMob</Text>
                        <TextInput placeholderTextColor={currentTheme.textSecondary} style={{borderRadius: 8, padding: 3, paddingLeft: 10, paddingRight: 10, margin: 8, width: "80%", backgroundColor: currentTheme.backgroundSecondary, color: currentTheme.textPrimary}} placeholder={"Email"} onChangeText={(text) => {
                            this.setState({emailInput: text})
                        }} value={this.state.emailInput} />
                        <TextInput placeholderTextColor={currentTheme.textSecondary} style={{borderRadius: 8, padding: 3, paddingLeft: 10, paddingRight: 10, margin: 8, width: "80%", backgroundColor: currentTheme.backgroundSecondary, color: currentTheme.textPrimary}} placeholder={"Password"} onChangeText={(text) => {
                            this.setState({passwordInput: text})
                        }} value={this.state.passwordInput} />
                        {this.state.logInError && <Text>{this.state.logInError.message}</Text>}
                        <TouchableOpacity onPress={async () => {
                            this.setState({status: "awaitingCaptcha"})
                        }} style={{borderRadius: 8, padding: 5, paddingLeft: 10, paddingRight: 10, backgroundColor: currentTheme.backgroundSecondary}}><Text>Log in</Text></TouchableOpacity>
                    </View> */}
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
                                this.setState({status: "loggedIn", tokenInput: "", passwordInput: "", emailInput: "", logInError: null})
                            } catch (e) {
                                console.error(e)
                                this.setState({logInError: e, status: "awaitingLogin"})
                            }
                        }} style={{borderRadius: 8, padding: 5, paddingLeft: 10, paddingRight: 10, backgroundColor: currentTheme.backgroundSecondary}}><Text>Log in</Text></TouchableOpacity>
                    </View>
                </View>
                :
                this.state.status == "awaitingCaptcha" ? 
                    <View style={styles.app}>
                        <ConfirmHcaptcha siteKey={"3daae85e-09ab-4ff6-9f24-e8f4f335e433"} backgroundColor={currentTheme.backgroundPrimary} baseUrl={"https://app.revolt.chat"} onMessage={async e => {
                            if (!['cancel', 'error', 'expired'].includes(e.nativeEvent.data)) {
                                try {
                                    await client.login({email: this.state.emailInput, password: this.state.passwordInput, captcha: e.nativeEvent.data});
                                    //await client.useExistingSession({token: this.state.tokenInput})
                                    this.setState({status: "loggedIn", tokenInput: "", passwordInput: "", emailInput: "", logInError: null})
                                } catch (e) {
                                    console.error(e)
                                    this.setState({logInError: e, status: "awaitingLogin"})
                                }
                                return;
                            }
                        }} />
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
// </miscellaneous stuff>



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
}////