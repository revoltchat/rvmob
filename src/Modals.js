import { View, TouchableOpacity, Pressable, Modal, ScrollView, Dimensions, TextInput } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import React from 'react';
import { client, Text, MarkdownView, app, parseRevoltNodes, GeneralAvatar, ServerName, ServerList, openUrl, setFunction } from './Generic';
import { styles, currentTheme, themes, setTheme, currentThemeName } from './Theme';
import { ReplyMessage } from './MessageView';
import { Avatar, Username, MiniProfile, RoleView } from './Profile';
import { RelationshipStatus, Badges } from "revolt-api/types/Users";
import { ChannelPermission } from "revolt.js/dist/api/permissions";
import Clipboard from '@react-native-community/clipboard';
import AntIcon from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import FastImage from 'react-native-fast-image';
import { observer } from 'mobx-react';
const Image = FastImage;

@observer
export class Modals extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contextMenuMessage: null,
            contextMenuUser: null,
            contextMenuUserProfile: null,
            contextMenuUserServer: null,
            imageViewerImage: null,
            settingsOpen: false,
            contextMenuServer: null,
            inviteServer: null,
            inviteServerCode: "",
            inviteBot: null
        }
        setFunction("openProfile", async (u, s) => {
            this.setState({contextMenuUser: u || null, contextMenuUserProfile: u ? (await u.fetchProfile()) : null, contextMenuUserServer: s || null})
        })
        setFunction("openInvite", async (i) => {
            this.setState({inviteServer: (await client.fetchInvite(i).catch(e => e)), inviteServerCode: i})
        })
        setFunction("openBotInvite", async (id) => {
            this.setState({inviteBot: (await client.bots.fetchPublic(id).catch(e => e))})
        })
        setFunction("openImage", async (a) => {
            this.setState({imageViewerImage: a})
        })
        setFunction("openServerContextMenu", async (s) => {
            this.setState({contextMenuServer: s})
        })
        setFunction("openMessage", async (m) => {
            this.setState({contextMenuMessage: m})
        })
        setFunction("openSettings", async (o) => {
            this.setState({settingsOpen: o || !this.state.settingsOpen})
        })
    }
    render() {
        let rerender = (() => this.setState({})).bind(this);
        return (
            <>
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
                <View style={{width: "100%", height: "45%", top: "55%", backgroundColor: currentTheme.backgroundSecondary}}>
                    <ReplyMessage message={this.state.contextMenuMessage} style={{margin: 3, width: "100%"}} />
                    <ScrollView style={{flex: 1, padding: 3}}>
                        <TouchableOpacity
                            style={styles.actionTile}
                            onPress={() => this.setState({contextMenuMessage: null})}
                        >
                            <View style={styles.iconContainer}>
                                <AntIcon name="closecircle" size={16} color={currentTheme.textPrimary} />
                            </View>
                            <Text>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionTile}
                            onPress={() => {
                                let replyingMessages = [...app.getReplyingMessages()]
                                if (replyingMessages.filter(m => m.message._id === this.state.contextMenuMessage._id).length > 0) return
                                if (replyingMessages.length >= 5) {
                                    return
                                }
                                if (app.getEditingMessage()) {
                                    return
                                }
                                replyingMessages.push({message: this.state.contextMenuMessage, mentions: false})
                                app.setReplyingMessages(replyingMessages)
                                this.setState({contextMenuMessage: null})
                            }}
                        >
                            <View style={styles.iconContainer}>
                                <MaterialIcon name="reply" size={20} color={currentTheme.textPrimary} />
                            </View>
                            <Text>Reply</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionTile}
                            onPress={() => {
                                Clipboard.setString(this.state.contextMenuMessage.content);
                            }}
                        >
                            <View style={styles.iconContainer}>
                                <FA5Icon name="clipboard" size={18} color={currentTheme.textPrimary} />
                            </View>
                            <Text>Copy content</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionTile}
                            onPress={() => {
                                Clipboard.setString(this.state.contextMenuMessage._id);
                            }}
                        >
                            <View style={styles.iconContainer}>
                                <FA5Icon name="clipboard" size={18} color={currentTheme.textPrimary} />
                            </View>
                            <Text>Copy ID <Text style={{fontSize: 12, color: currentTheme.textSecondary}}>({this.state.contextMenuMessage?._id})</Text></Text>
                        </TouchableOpacity>
                        {this.state.contextMenuMessage?.channel.permission & ChannelPermission.ManageMessages || this.state.contextMenuMessage?.author.relationship == RelationshipStatus.User ? (
                            <TouchableOpacity
                                style={styles.actionTile}
                                onPress={() => {
                                    this.state.contextMenuMessage.delete()
                                    this.setState({contextMenuMessage: null})
                                }}
                            >
                                <View style={styles.iconContainer}>
                                    <FA5Icon name="trash" size={18} color={currentTheme.textPrimary} />
                                </View>
                                <Text>Delete</Text>
                            </TouchableOpacity>
                        ) : null}
                        {this.state.contextMenuMessage?.author.relationship == RelationshipStatus.User ? (
                            <TouchableOpacity
                                style={styles.actionTile}
                                onPress={() => {
                                    app.setMessageBoxInput(this.state.contextMenuMessage?.content)
                                    app.setEditingMessage(this.state.contextMenuMessage)
                                    app.setReplyingMessages([])
                                    this.setState({contextMenuMessage: null})
                                }}
                            >
                                <View style={styles.iconContainer}>
                                    <FA5Icon name="edit" size={18} color={currentTheme.textPrimary} />
                                </View>
                                <Text>Edit</Text>
                            </TouchableOpacity>
                        ) : null}
                        <View style={{marginTop: 7}} />
                    </ScrollView>
                </View>
            </Modal>
            <Modal
            key="profileMenu"
            animationType="slide"
            transparent={true}
            visible={!!this.state.contextMenuUser}
            onRequestClose={() => app.openProfile(null)}
            >
                <Pressable onPress={() => {app.openProfile(null); this.setState({userStatusInput: ""})}} style={{width: Dimensions.get("window").width, height: Dimensions.get("window").height, position: 'absolute', backgroundColor: "#00000000"}} />
                <View style={{width: "100%", height: Dimensions.get("window").height * 0.75, top: "25%", padding: 15, backgroundColor: currentTheme.backgroundSecondary}}>
                    <View>
                        <View style={{flexDirection: 'row'}}>
                            <Pressable onPress={() => app.openImage(this.state.contextMenuUser?.avatar)}><Avatar size={100} user={this.state.contextMenuUser} server={this.state.contextMenuUserServer} backgroundColor={currentTheme.backgroundSecondary} status /></Pressable>
                            <View style={{justifyContent: 'center', marginLeft: 6}}>
                                <Username user={this.state.contextMenuUser} server={this.state.contextMenuUserServer} size={24} />
                                <View key={1} style={{flexDirection: 'row'}}>
                                    {!!this.state.contextMenuUserServer &&
                                    client.members.getKey({server: this.state.contextMenuUserServer?._id, user: this.state.contextMenuUser?._id})?.avatar &&
                                    client.members.getKey({server: this.state.contextMenuUserServer?._id, user: this.state.contextMenuUser?._id})?.avatar?._id != this.state.contextMenuUser?.avatar?._id ?
                                    <Avatar size={24} user={this.state.contextMenuUser} />
                                    : null}
                                    <Text style={{fontSize: 16}}>@</Text><Username user={this.state.contextMenuUser} size={16} noBadge />
                                </View>
                                {this.state.contextMenuUser?.status?.text ? <Text>{this.state.contextMenuUser?.status?.text}</Text> : <></>}
                            </View>
                        </View>
                        {this.state.contextMenuUser?.flags ?
                            this.state.contextMenuUser.flags & 1 ?
                            <Text style={{color: '#ff3333'}}>User is suspended</Text> :
                            this.state.contextMenuUser.flags & 2 ?
                            <Text style={{color: '#ff3333'}}>User deleted their account</Text> :
                            this.state.contextMenuUser.flags & 4 ?
                            <Text style={{color: '#ff3333'}}>User is banned</Text> : 
                            null
                        : null}
                        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                            {this.state.contextMenuUser?.badges ? <>
                                {Object.keys(Badges).map(b => {
                                    if (this.state.contextMenuUser.badges & Badges[b]) {
                                        switch (b) {
                                            case "Founder":
                                                return <Text style={{color: 'red', marginLeft: 8}}>Revolt Founder</Text> 
                                            case "Developer":
                                                return <Text style={{color: 'orange', marginLeft: 8}}>Revolt Developer</Text>
                                            case "Translator":
                                                return <Text style={{color: 'green', marginLeft: 8}}>Revolt Translator</Text>
                                            case "Supporter":
                                                return <Text style={{color: 'yellow', marginLeft: 8}}>Revolt Supporter</Text>
                                            case "ResponsibleDisclosure":
                                                return <Text style={{color: 'purple', marginLeft: 8}}>Bug Catcher</Text>
                                            case "EarlyAdopter":
                                                return <Text style={{color: 'cyan', marginLeft: 8}}>Early Adopter</Text>
                                            case "PlatformModeration":
                                                return <Text style={{color: 'darkcyan', marginLeft: 8}}>Platform Moderation</Text>
                                            default:
                                                return <Text style={{color: currentTheme.textSecondary, marginLeft: 8}}>[{b}]</Text>
                                        }
                                    }
                                })}
                            </> : null}
                            {this.state.contextMenuUser?._id == "01FC1HP5H22F0M34MFFM9DZ099" ? 
                            <Text style={{color: currentTheme.accentColor, marginLeft: 8}}>RVMob Author (hi there!)</Text> : null}
                        </View>
                        <ScrollView>
                            {this.state.contextMenuUser?.relationship != RelationshipStatus.User ? 
                                !this.state.contextMenuUser?.bot ? 
                                (this.state.contextMenuUser?.relationship == RelationshipStatus.Friend ? 
                                    <TouchableOpacity style={styles.actionTile} onPress={async () => {app.openProfile(null); this.setState({currentChannel: (await this.state.contextMenuUser.openDM()), messages: []})}}>
                                        <View style={styles.iconContainer}>
                                            <MaterialIcon name="message" size={20} color={currentTheme.textPrimary} />
                                        </View>
                                        <Text>Message</Text>
                                    </TouchableOpacity> 
                                    :
                                    this.state.contextMenuUser?.relationship == RelationshipStatus.Incoming ? 
                                    <>
                                    <TouchableOpacity style={styles.actionTile} onPress={() => {this.state.contextMenuUser?.addFriend(); this.setState({})}}>
                                        <View style={styles.iconContainer}>
                                            <FA5Icon name="user-plus" size={16} color={currentTheme.textPrimary} />
                                        </View>
                                        <Text>Accept Friend</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionTile} onPress={() => {this.state.contextMenuUser?.removeFriend(); this.setState({})}}>
                                        <View style={styles.iconContainer}>
                                            <FA5Icon name="user-times" size={16} color={currentTheme.textPrimary} />
                                        </View>
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
                                    <TouchableOpacity style={styles.actionTile} onPress={async () => {app.openProfile(client.users.get(this.state.contextMenuUser.bot.owner))}}>
                                        <MiniProfile user={client.users.get(this.state.contextMenuUser.bot.owner)} />
                                    </TouchableOpacity>
                                    :
                                    <Text style={{color: currentTheme.textSecondary}}>Unloaded user</Text>}
                                </>
                                : 
                                <>
                                <View style={{flexDirection: 'row'}}>
                                    {["Online", "Idle", "Busy", "Invisible"].map((s) => <TouchableOpacity key={s} style={[styles.actionTile, {flex: 1, alignItems: 'center', justifyContent: 'center', marginRight: 3}]} onPress={() => {client.users.edit({status: {...client.user.status, presence: s}})}}><View style={{backgroundColor: currentTheme["status" + s], height: 16, width: 16, borderRadius: 10000}} /></TouchableOpacity>)}
                                </View>
                                {/* <TextInput onChangeText={(v) => this.setState({userStatusInput: v})} value={this.state.userStatusInput || client.user.status.text || ""} onSubmitEditing={() => client.users.edit({...client.user.status, text: this.state.userStatusInput})} /> */}
                                </>
                            }
                            <TouchableOpacity key={"Copy ID"} style={styles.actionTile} onPress={() => {Clipboard.setString(this.state.contextMenuUser._id)}}>
                                <View style={styles.iconContainer}>
                                    <FA5Icon name="clipboard" size={18} color={currentTheme.textPrimary} />
                                </View>
                                <Text>Copy ID <Text style={{fontSize: 12, color: currentTheme.textSecondary}}>({this.state.contextMenuUser?._id})</Text></Text>
                            </TouchableOpacity>
                            <RoleView user={this.state.contextMenuUser} server={this.state.contextMenuUserServer}/>
                            <Text style={{color: currentTheme.textSecondary, fontWeight: 'bold'}}>BIO</Text>
                            {this.state.contextMenuUserProfile?.content ? <MarkdownView>{parseRevoltNodes(this.state.contextMenuUserProfile?.content)}</MarkdownView> : null}
                            <View style={{marginTop: 130}} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <Modal visible={!!this.state.imageViewerImage} transparent={true} animationType="fade">
                <ImageViewer imageUrls={this.state.imageViewerImage?.metadata ? [{url: client.generateFileURL(this.state.imageViewerImage), width: this.state.imageViewerImage.metadata.width, height: this.state.imageViewerImage.metadata.height}] : [{url: this.state.imageViewerImage}]} renderHeader={() => <View style={{height: 50, width: "100%", justifyContent: 'center', paddingLeft: 10, paddingRight: 10}}><Pressable onPress={() => openUrl(this.state.imageViewerImage?.metadata ? client.generateFileURL(this.state.imageViewerImage) : this.state.imageViewerImage)}><Text>Open URL</Text></Pressable><View style={{marginLeft: 20}}/><Pressable onPress={() => this.setState({imageViewerImage: null})}><Text>Close</Text></Pressable></View>} renderIndicator={(_1, _2) => null} enableSwipeDown={true} onCancel={() => this.setState({imageViewerImage: null})}/>
            </Modal>
            <Modal visible={this.state.settingsOpen} transparent={true} animationType="slide">
                <View style={{flex: 1, backgroundColor: currentTheme.backgroundPrimary, padding: 15, borderTopLeftRadius: 15, borderTopRightRadius: 15}}>
                    <Pressable onPress={() => {this.setState({settingsOpen: false})}}><Text style={{fontSize: 24}}>Close</Text></Pressable>
                    <ScrollView style={{flex: 1}}>
                        {Object.entries(app.settings).map(([k, v]) => {
                            if (v.type == "boolean") {
                                return <View key={k} style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                                    <Text style={{flex: 1, fontWeight: 'bold'}}>{k}</Text>
                                    <TouchableOpacity style={{
                                        width: 40, height: 40, borderRadius: 8, 
                                        backgroundColor: app.settings.get(k) ? currentTheme.accentColor : currentTheme.backgroundSecondary,
                                        alignItems: 'center', justifyContent: 'center'
                                    }} onPress={() => {app.settings.set(k, !app.settings.get(k)); rerender()}}><Text style={{color: app.settings.get(k) ? currentTheme.accentColorForeground : currentTheme.textPrimary}}>{app.settings.get(k) ? "On" : "Off"}</Text></TouchableOpacity>
                                </View>
                            } else if (v.type == "string" || v.type == "number") {
                                return <View key={k} style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                                    {v.options ? 
                                    <View>
                                        <Text style={{flex: 1, fontWeight: 'bold'}}>{k}</Text>
                                        <ScrollView style={{borderRadius: 8, /*maxHeight: 160,*/ minWidth: "100%", backgroundColor: currentTheme.backgroundSecondary, padding: 8, paddingRight: 12}}>
                                            {v.options.map((o) => <TouchableOpacity key={o} style={styles.actionTile} onPress={() => {app.settings.set(k, o); rerender()}}><Text>{o} {app.settings.getRaw(k) == o ? <Text>(active)</Text> : null}</Text></TouchableOpacity>)}
                                            <View style={{marginTop: 2}} />
                                        </ScrollView>
                                    </View>
                                    :
                                    <View>
                                        <Text style={{flex: 1, fontWeight: 'bold'}}>{k}</Text>
                                        <TextInput style={{minWidth: "100%", borderRadius: 8, backgroundColor: currentTheme.backgroundSecondary, padding: 6, paddingLeft: 10, paddingRight: 10, color: currentTheme.textPrimary}} value={app.settings.getRaw(k)} keyboardType={v.type == "number" ? 'decimal-pad' : 'default'} onChangeText={(v) => {app.settings.set(k, v); rerender()}} />
                                    </View>}
                                </View>
                            }
                        })}
                        <TouchableOpacity style={{marginTop: 10, marginBottom: 10, backgroundColor: currentTheme.accentColor, borderRadius: 8, padding: 8, alignItems: 'center', justifyContent: 'center'}} onPress={() => {app.settings.clear(); rerender()}}><Text style={{color: currentTheme.accentColorForeground}}>Reset Settings</Text></TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={!!this.state.contextMenuServer} transparent={true} animationType="slide">
                <Pressable onPress={() => app.openServerContextMenu(null)} style={{width: Dimensions.get("window").width, height: Dimensions.get("window").height, position: 'absolute', backgroundColor: "#00000000"}} />
                <View style={{width: "100%", height: Dimensions.get("window").height * 0.75, top: "25%", padding: 15, backgroundColor: currentTheme.backgroundSecondary}}>
                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                        {this.state.contextMenuServer?.icon ? <GeneralAvatar attachment={this.state.contextMenuServer?.icon} size={72} /> : null}
                        <Text style={{color: currentTheme.textPrimary, fontWeight: 'bold', fontSize: 24, textAlign: 'center'}}>{this.state.contextMenuServer?.name}</Text>
                        {this.state.contextMenuServer?.description ? <Text style={{color: currentTheme.textSecondary, fontSize: 16, textAlign: 'center'}}>{this.state.contextMenuServer?.description}</Text> : null}
                    </View>
                        <TouchableOpacity key={"Copy ID"} style={styles.actionTile} onPress={() => {Clipboard.setString(this.state.contextMenuServer._id)}}>
                            <View style={styles.iconContainer}>
                                <FA5Icon name="clipboard" size={18} color={currentTheme.textPrimary} />
                            </View>
                            <Text>Copy ID <Text style={{fontSize: 12, color: currentTheme.textSecondary}}>({this.state.contextMenuServer?._id})</Text></Text>
                        </TouchableOpacity>
                </View>
            </Modal>
            <Modal visible={!!this.state.inviteServer} transparent={true} animationType="fade">
                <View style={{flex: 1, backgroundColor: currentTheme.backgroundPrimary}}>
                    <Pressable onPress={() => {this.setState({inviteServer: null})}}><Text style={{fontSize: 24}}>Close</Text></Pressable>
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        {this.state.inviteServer?.type === "Server" ? 
                        <>
                            {this.state.inviteServer.server_banner ? <Image source={this.state.inviteServer.server_banner ? {uri: client.generateFileURL(this.state.inviteServer.server_banner)} : {}} style={{width: "100%", height: "100%"}} /> : null}
                            <View style={{height: "100%", width: "100%", position: 'absolute', top: 0, left: 0, alignItems: 'center', justifyContent: 'center'}}>
                                <View style={{padding: 10, borderRadius: 8, margin: 10, backgroundColor: currentTheme.backgroundPrimary + "dd", justifyContent: 'center', alignItems: 'center'}}>
                                    <View style={{alignItems: 'center', flexDirection: 'row'}}>
                                        <GeneralAvatar attachment={this.state.inviteServer.server_icon} size={60} />
                                        <View style={{marginLeft: 10}} />
                                        <ServerName server={this.state.inviteServer} size={26} />
                                    </View>
                                    <TouchableOpacity onPress={async () => {!client.servers.get(this.state.inviteServer?.server_id) && await client.joinInvite(this.state.inviteServerCode); app.openServer(client.servers.get(this.state.inviteServer?.server_id)); app.openLeftMenu(true); this.setState({inviteServer: null, inviteServerCode: null})}} style={styles.button}><Text>{client.servers.get(this.state.inviteServer?.server_id) ? "Go to Server" : "Join Server"}</Text></TouchableOpacity>
                                </View>
                            </View>
                        </>
                        : 
                        <Text>{this.state.inviteServer?.toString()}</Text>}
                    </View>
                </View>
            </Modal>
            <Modal visible={!!this.state.inviteBot} transparent={true} animationType="fade">
                {this.state.inviteBot ?
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
                : null}
            </Modal>
            </>
        );  
    }
}