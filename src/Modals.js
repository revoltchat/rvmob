import { View, TouchableOpacity, Pressable, Modal, ScrollView, Dimensions, TextInput } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import React from 'react';
import { client, Text, MarkdownView, app, GeneralAvatar, ServerName, ServerList, openUrl } from './Generic';
import { styles, currentTheme, themes, setTheme, currentThemeName } from './Theme';
import { ReplyMessage } from './MessageView';
import { Avatar, Username, MiniProfile, RoleView } from './Profile';
import { RelationshipStatus } from "revolt-api/types/Users";
import { ChannelPermission } from "revolt.js/dist/api/permissions";
import FastImage from 'react-native-fast-image';
const Image = FastImage;

export const Modals = ({state, setState}) => {
    function rerender() {
        setState({})
    }
    return (
        <>
        <Modal
        key="messageMenu"
        animationType="slide"
        transparent={true}
        visible={!!state.contextMenuMessage}
        onRequestClose={() => {
            () => setState({contextMenuMessage: null})
        }}
        >
            <Pressable onPress={() => setState({contextMenuMessage: null})} style={{width: Dimensions.get("window").width, height: Dimensions.get("window").height, position: 'absolute', backgroundColor: "#00000000"}} />
            <View style={{width: "100%", height: "40%", top: "60%", backgroundColor: currentTheme.backgroundSecondary}}>
                <View>
                    <ReplyMessage message={state.contextMenuMessage} style={{margin: 3, width: "100%"}} />
                    <TouchableOpacity
                        style={styles.actionTile}
                        onPress={() => setState({contextMenuMessage: null})}
                    >
                        <Text>Close</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionTile}
                        onPress={() => {
                            let replyingMessages = [...app.getReplyingMessages()]
                            if (replyingMessages.filter(m => m._id === state.contextMenuMessage._id).length > 0) return
                            if (replyingMessages.length >= 4) {
                                return
                            }
                            replyingMessages.push(state.contextMenuMessage)
                            app.setReplyingMessages(replyingMessages)
                            setState({contextMenuMessage: null})
                        }}
                    >
                        <Text>Reply</Text>
                    </TouchableOpacity>
                    {state.contextMenuMessage?.channel.permission & ChannelPermission.ManageMessages || state.contextMenuMessage?.author.relationship == RelationshipStatus.User ? (
                        <TouchableOpacity
                            style={styles.actionTile}
                            onPress={() => {
                                state.contextMenuMessage.delete()
                                setState({contextMenuMessage: null})
                            }}
                        >
                            <Text>Delete</Text>
                        </TouchableOpacity>
                    ) : null}
                    {state.contextMenuMessage?.author.relationship == RelationshipStatus.User ? (
                        <TouchableOpacity
                            style={styles.actionTile}
                            onPress={() => {
                                app.setMessageBoxInput(state.contextMenuMessage?.content)
                                app.setEditingMessage(state.contextMenuMessage)
                                app.setReplyingMessages([])
                                setState({contextMenuMessage: null})
                            }}
                        >
                            <Text>Edit</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        </Modal>
        <Modal
        key="profileMenu"
        animationType="slide"
        transparent={true}
        visible={!!state.contextMenuUser}
        onRequestClose={() => app.openProfile(null)}
        >
            <Pressable onPress={() => {app.openProfile(null); setState({userStatusInput: ""})}} style={{width: Dimensions.get("window").width, height: Dimensions.get("window").height, position: 'absolute', backgroundColor: "#00000000"}} />
            <View style={{width: "100%", height: Dimensions.get("window").height * 0.75, top: "25%", padding: 15, backgroundColor: currentTheme.backgroundSecondary}}>
                <View>
                    <View style={{flexDirection: 'row'}}>
                        <Pressable onPress={() => app.openImage(state.contextMenuUser?.avatar)}><Avatar size={100} user={state.contextMenuUser} server={state.contextMenuUserServer} backgroundColor={currentTheme.backgroundSecondary} status /></Pressable>
                        <View style={{justifyContent: 'center', marginLeft: 6}}>
                            <Username user={state.contextMenuUser} server={state.contextMenuUserServer} size={24} />
                            <View key={1} style={{flexDirection: 'row'}}>
                                {!!state.contextMenuUserServer &&
                                client.members.getKey({server: state.contextMenuUserServer?._id, user: state.contextMenuUser?._id})?.avatar?._id != state.contextMenuUser?.avatar?._id ?
                                <Avatar size={24} user={state.contextMenuUser} />
                                : null}
                                <Text style={{fontSize: 16}}>@</Text><Username user={state.contextMenuUser} size={16} noBadge />
                            </View>
                            {state.contextMenuUser?.status?.text ? <Text>{state.contextMenuUser?.status?.text}</Text> : <></>}
                        </View>
                    </View>
                    {state.contextMenuUser?.flags ?
                        state.contextMenuUser.flags & 1 ?
                        <Text style={{color: '#ff3333'}}>User is suspended</Text> :
                        state.contextMenuUser.flags & 2 ?
                        <Text style={{color: '#ff3333'}}>User deleted their account</Text> :
                        state.contextMenuUser.flags & 4 ?
                        <Text style={{color: '#ff3333'}}>User is banned</Text> : 
                        null
                    : null}
                    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                        {state.contextMenuUser?.badges ? <>
                            {state.contextMenuUser.badges & 1 ?
                            <Text style={{color: 'orange', marginLeft: 8}}>Revolt Developer</Text> : null}
                            {state.contextMenuUser.badges & 2 ?
                            <Text style={{color: 'green', marginLeft: 8}}>Revolt Translator</Text> : null}
                            {state.contextMenuUser.badges & 4 ?
                            <Text style={{color: 'yellow', marginLeft: 8}}>Revolt Supporter</Text> : null}
                            {state.contextMenuUser.badges & 8 ?
                            <Text style={{color: 'purple', marginLeft: 8}}>Bug Catcher</Text> : null}
                            {state.contextMenuUser.badges & 256 ?
                            <Text style={{color: 'cyan', marginLeft: 8}}>Early Adopter</Text> : null} 
                        </> : null}
                        {state.contextMenuUser?._id == "01FC1HP5H22F0M34MFFM9DZ099" ? 
                        <Text style={{color: currentTheme.accentColor, marginLeft: 8}}>RVMob Author (hi there!)</Text> : null}
                    </View>
                    {state.contextMenuUser?.relationship != RelationshipStatus.User ? 
                        !state.contextMenuUser?.bot ? 
                        (state.contextMenuUser?.relationship == RelationshipStatus.Friend ? 
                            <TouchableOpacity style={styles.actionTile} onPress={async () => {app.openProfile(null); setState({currentChannel: (await state.contextMenuUser.openDM()), messages: []})}}>
                                <Text>Message</Text>
                            </TouchableOpacity> 
                            :
                            state.contextMenuUser?.relationship == RelationshipStatus.Incoming ? 
                            <>
                            <TouchableOpacity style={styles.actionTile} onPress={() => {state.contextMenuUser?.addFriend(); setState({})}}>
                                <Text>Accept Friend</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionTile} onPress={() => {state.contextMenuUser?.removeFriend(); setState({})}}>
                                <Text>Reject Friend</Text>
                            </TouchableOpacity>
                            </>
                            :
                            state.contextMenuUser?.relationship == RelationshipStatus.Outgoing ? 
                            <TouchableOpacity style={styles.actionTile} onPress={() => {state.contextMenuUser?.removeFriend(); setState({})}}>
                                <Text>Cancel Friend</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity style={styles.actionTile} onPress={() => {state.contextMenuUser?.addFriend(); setState({})}}>
                                <Text>Add Friend</Text>
                            </TouchableOpacity>
                        ) 
                        :
                        <>
                            <Text style={{fontWeight: 'bold'}}>BOT OWNER</Text>
                            {client.users.get(state.contextMenuUser?.bot?.owner) ? 
                            <TouchableOpacity style={styles.actionTile} onPress={async () => {app.openProfile(client.users.get(state.contextMenuUser.bot.owner))}}>
                                <MiniProfile user={client.users.get(state.contextMenuUser.bot.owner)} />
                            </TouchableOpacity>
                            :
                            <Text style={{color: currentTheme.textSecondary}}>Unloaded user</Text>}
                        </>
                        : 
                        <>
                        <View style={{flexDirection: 'row'}}>
                            {["Online", "Idle", "Busy", "Invisible"].map((s) => <TouchableOpacity key={s} style={[styles.actionTile, {flex: 1, alignItems: 'center', justifyContent: 'center'}]} onPress={() => {client.users.edit({status: {...client.user.status, presence: s}})}}><View style={{backgroundColor: currentTheme["status" + s], height: 16, width: 16, borderRadius: 10000}} /></TouchableOpacity>)}
                        </View>
                        {/* <TextInput onChangeText={(v) => setState({userStatusInput: v})} value={state.userStatusInput || client.user.status.text || ""} onSubmitEditing={() => client.users.edit({...client.user.status, text: state.userStatusInput})} /> */}
                        </>
                    }
                    <ScrollView>
                        <RoleView user={state.contextMenuUser} server={state.contextMenuUserServer}/>
                        <Text style={{color: currentTheme.textSecondary, fontWeight: 'bold'}}>BIO</Text>
                        {state.contextMenuUserProfile?.content ? <MarkdownView>{state.contextMenuUserProfile?.content}</MarkdownView> : null}
                        <View style={{marginTop: 150}} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
        <Modal visible={!!state.imageViewerImage} transparent={true} animationType="fade">
            <ImageViewer imageUrls={state.imageViewerImage?.metadata ? [{url: client.generateFileURL(state.imageViewerImage), width: state.imageViewerImage.metadata.width, height: state.imageViewerImage.metadata.height}] : [{url: state.imageViewerImage}]} renderHeader={() => <View style={{height: 50, width: "100%", justifyContent: 'center', paddingLeft: 10, paddingRight: 10}}><Pressable onPress={() => openUrl(state.imageViewerImage?.metadata ? client.generateFileURL(state.imageViewerImage) : state.imageViewerImage)}><Text>Open URL</Text></Pressable><View style={{marginLeft: 20}}/><Pressable onPress={() => setState({imageViewerImage: null})}><Text>Close</Text></Pressable></View>} renderIndicator={(_1, _2) => null} enableSwipeDown={true} onCancel={() => setState({imageViewerImage: null})}/>
        </Modal>
        <Modal visible={state.settingsOpen} transparent={true} animationType="slide">
            <View style={{flex: 1, backgroundColor: currentTheme.backgroundPrimary, padding: 15, borderTopLeftRadius: 15, borderTopRightRadius: 15}}>
                <Pressable onPress={() => {setState({settingsOpen: false})}}><Text style={{fontSize: 24}}>Close</Text></Pressable>
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
        <Modal visible={!!state.contextMenuServer} transparent={true} animationType="slide">
            <Pressable onPress={() => app.openServerContextMenu(null)} style={{width: Dimensions.get("window").width, height: Dimensions.get("window").height, position: 'absolute', backgroundColor: "#00000000"}} />
            <View style={{width: "100%", height: Dimensions.get("window").height * 0.75, top: "25%", padding: 15, backgroundColor: currentTheme.backgroundSecondary}}>
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                    {state.contextMenuServer?.icon ? <GeneralAvatar attachment={state.contextMenuServer?.icon} size={72} /> : null}
                    <Text style={{color: currentTheme.textPrimary, fontWeight: 'bold', marginTop: 10, fontSize: 24, textAlign: 'center'}}>{state.contextMenuServer?.name}</Text>
                    <Text style={{color: currentTheme.textSecondary, fontSize: 16, textAlign: 'center'}}>{state.contextMenuServer?.description}</Text>
                </View>
            </View>
        </Modal>
        <Modal visible={!!state.inviteServer} transparent={true} animationType="fade">
            <View style={{flex: 1, backgroundColor: currentTheme.backgroundPrimary}}>
                <Pressable onPress={() => {setState({inviteServer: null})}}><Text style={{fontSize: 24}}>Close</Text></Pressable>
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    {state.inviteServer?.type === "Server" ? 
                    <>
                        {state.inviteServer.server_banner ? <Image source={state.inviteServer.server_banner ? {uri: client.generateFileURL(state.inviteServer.server_banner)} : {}} style={{width: "100%", height: "100%"}} /> : null}
                        <View style={{height: "100%", width: "100%", position: 'absolute', top: 0, left: 0, alignItems: 'center', justifyContent: 'center'}}>
                            <View style={{padding: 10, borderRadius: 8, margin: 10, backgroundColor: currentTheme.backgroundPrimary + "dd", justifyContent: 'center', alignItems: 'center'}}>
                                <View style={{alignItems: 'center', flexDirection: 'row'}}>
                                    <GeneralAvatar attachment={state.inviteServer.server_icon} size={60} />
                                    <View style={{marginLeft: 10}} />
                                    <ServerName server={state.inviteServer} size={26} />
                                </View>
                                <TouchableOpacity onPress={async () => {!client.servers.get(state.inviteServer?.server_id) && await client.joinInvite(state.inviteServerCode); openServer(client.servers.get(state.inviteServer?.server_id)); setState({inviteServer: null, inviteServerCode: null})}} style={styles.button}><Text>{client.servers.get(state.inviteServer) ? "Go to Server" : "Join Server"}</Text></TouchableOpacity>
                            </View>
                        </View>
                    </>
                    : 
                    <Text>{state.inviteServer?.toString()}</Text>}
                </View>
            </View>
        </Modal>
        <Modal visible={!!state.inviteBot} transparent={true} animationType="fade">
            {state.inviteBot ?
            <View style={{flex: 1, backgroundColor: currentTheme.backgroundPrimary}}>
                <Pressable onPress={() => {setState({inviteBot: null})}}><Text style={{fontSize: 24}}>Cancel</Text></Pressable>
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <GeneralAvatar attachment={state.inviteBot.avatar} size={48} /><Text style={{paddingLeft: 10, fontSize: 24, fontWeight: 'bold'}}>{state.inviteBot.username}</Text>
                    </View>
                    <View style={{height: 56}}>
                        <ScrollView horizontal={true}>
                            <ServerList onServerPress={s => setState({inviteBotDestination: s})} />
                        </ScrollView>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={() => {if (!state.inviteBotDestination) {return}; client.bots.invite(state.inviteBot._id, {server: state.inviteBotDestination._id}); setState({inviteBot: null, inviteBotDestination: null})}}><Text>Invite to {state.inviteBotDestination ? <Text style={{fontWeight: 'bold'}}>{state.inviteBotDestination?.name}</Text> : "which server?"}</Text></TouchableOpacity>
                </View>
            </View>
            : null}
        </Modal>
        </>
    );
}