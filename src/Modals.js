import { View, TouchableOpacity, Pressable, Modal, ScrollView, Dimensions, Linking } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import React from 'react';
import { client, Text, MarkdownView } from './Generic';
import { styles, currentTheme, themes, setTheme, currentThemeName } from './Theme';
import { ReplyMessage } from './MessageView';
import { Avatar, Username, MiniProfile, RoleView } from './Profile';
import { RelationshipStatus } from "revolt-api/types/Users";

export const Modals = ({state, setState}) => {
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
                            let replyingMessages = state.replyingMessages || []
                            if (replyingMessages.filter(m => m._id === state.contextMenuMessage._id).length > 0) return
                            if (replyingMessages.length >= 4) {
                                return
                            }
                            replyingMessages.push(state.contextMenuMessage)
                            setState({replyingMessages, contextMenuMessage: null})
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
        visible={!!state.contextMenuUser}
        onRequestClose={() => openProfile(null)}
        >
            <Pressable onPress={() => openProfile(null)} style={{width: Dimensions.get("window").width, height: Dimensions.get("window").height, position: 'absolute', backgroundColor: "#00000000"}} />
            <View style={{width: "100%", height: "75%", top: "25%", padding: 15, backgroundColor: currentTheme.backgroundSecondary}}>
                <View>
                    <View style={{flexDirection: 'row'}}>
                        <Avatar size={100} user={state.contextMenuUser} server={state.contextMenuUserServer} backgroundColor={currentTheme.backgroundSecondary} status />
                        <View style={{justifyContent: 'center', marginLeft: 6}}>
                            <View key={0} style={{flexDirection: 'row'}}>
                                {!!state.contextMenuUserServer &&
                                client.members.getKey({server: state.contextMenuUserServer?._id, user: state.contextMenuUser?._id})?.avatar?._id != state.contextMenuUser?.avatar?._id ?
                                <Avatar size={30} user={state.contextMenuUser} />
                                : null}
                                <Username user={state.contextMenuUser} server={state.contextMenuUserServer} size={24} />
                            </View>
                            <View key={1} style={{flexDirection: 'row'}}>
                                <Text style={{fontSize: 16}}>@</Text><Username user={state.contextMenuUser} size={16} noBadge />
                            </View>
                            {state.contextMenuUser?.status?.text ? <Text>{state.contextMenuUser?.status?.text}</Text> : <></>}
                        </View>
                    </View>
                    {state.contextMenuUser?.relationship != RelationshipStatus.User ? 
                        !state.contextMenuUser?.bot ? 
                        (state.contextMenuUser?.relationship == RelationshipStatus.Friend ? 
                            <TouchableOpacity style={styles.actionTile} onPress={async () => {openProfile(null); setState({currentChannel: (await state.contextMenuUser.openDM()), messages: []})}}>
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
                            <TouchableOpacity style={styles.actionTile} onPress={async () => {openProfile(client.users.get(state.contextMenuUser.bot.owner))}}>
                                <MiniProfile user={client.users.get(state.contextMenuUser.bot.owner)} />
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
                        <RoleView user={state.contextMenuUser} server={state.contextMenuUserServer}/>
                        <Text style={{color: currentTheme.textSecondary, fontWeight: 'bold'}}>BIO</Text>
                        {state.contextMenuUserProfile?.content ? <MarkdownView style={{margin: 5}}>{state.contextMenuUserProfile?.content}</MarkdownView> : null}
                    </ScrollView>
                </View>
            </View>
        </Modal>
        <Modal visible={!!state.imageViewerImage} transparent={true} animationType="fade">
            <ImageViewer imageUrls={state.imageViewerImage?.metadata ? [{url: client.generateFileURL(state.imageViewerImage), width: state.imageViewerImage.metadata.width, height: state.imageViewerImage.metadata.height}] : [{url: state.imageViewerImage}]} renderHeader={() => <View style={{height: 50, width: "100%", justifyContent: 'center', paddingLeft: 10, paddingRight: 10}}><Pressable onPress={() => Linking.openURL(state.imageViewerImage?.metadata ? client.generateFileURL(state.imageViewerImage) : state.imageViewerImage)}><Text>Open URL</Text></Pressable><View style={{marginLeft: 20}}/><Pressable onPress={() => setState({imageViewerImage: null})}><Text>Close</Text></Pressable></View>} renderIndicator={(_1, _2) => null} enableSwipeDown={true} onCancel={() => setState({imageViewerImage: null})}/>
        </Modal>
        <Modal visible={state.settingsOpen} transparent={true} animationType="slide">
            <View style={{flex: 1, backgroundColor: currentTheme.backgroundPrimary, padding: 15, borderTopLeftRadius: 15, borderTopRightRadius: 15}}>
                <Pressable onPress={() => {setState({settingsOpen: false})}}><Text style={{fontSize: 24}}>Close</Text></Pressable>
                <ScrollView style={{flex: 1}}>
                    <Text>Change Theme</Text>
                    <ScrollView style={{height: "30%", width: "90%", margin: 10, padding: 10 - currentTheme.generalBorderWidth, borderRadius: 8, backgroundColor: currentTheme.backgroundSecondary, borderWidth: currentTheme.generalBorderWidth, borderColor: currentTheme.generalBorderColor}}>
                        {Object.keys(themes).map(name => <Pressable style={{padding: 10 - currentTheme.generalBorderWidth, backgroundColor: currentTheme.backgroundPrimary, borderRadius: 8, marginBottom: 5, borderColor: currentTheme.buttonBorderColor, borderWidth: currentTheme.buttonBorderWidth}} onPress={() => {
                            setTheme(name)
                            setState({rerender: state.rerender + 1})
                        }}><Text>{name}{currentThemeName == name ? " (active)" : ""}</Text></Pressable>)}
                    </ScrollView>
                    <Text>some text here</Text>
                </ScrollView>
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