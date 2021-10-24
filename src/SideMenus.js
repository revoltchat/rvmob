import { View, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { ChannelList, ServerList, app, setFunction, client, Text } from './Generic';
import { MiniProfile, Avatar } from './Profile';
import { styles, currentTheme } from './Theme';
import FastImage from 'react-native-fast-image';
const Image = FastImage;
import React from 'react';

export class LeftMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentServer: null,
            rerender: 0
        };
        setFunction("openServer", (s) => {this.setState({currentServer: s})})
    }
    render() {
        return (
            <>
            <View style={styles.leftView}>
                <ScrollView style={styles.serverList}>
                    <TouchableOpacity onPress={
                        ()=>{this.setState({currentServer: null})}
                    } onLongPress={
                        ()=>{app.openProfile(client.user)}
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
export class RightMenu extends React.Component {
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