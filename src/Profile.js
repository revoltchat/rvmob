import { observer } from 'mobx-react-lite';
import React from 'react';
import { Text, client, defaultMaxSide } from './Generic';
import { currentTheme, styles } from './Theme';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
const Image = FastImage;

export const Username = observer(({ server, user, noBadge, size }) => { 
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
            {!noBadge && user?.bot ?
                <Text style={{color: currentTheme.accentColorForeground, backgroundColor: currentTheme.accentColor, marginLeft: 4, paddingLeft: 3, paddingRight: 3, borderRadius: 3, fontSize: (size || 14)}}>
                    BOT
                </Text>
            : null}
        </View>
    )
})
export const Avatar = observer(({ channel, user, server, status, size, backgroundColor }) => {
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
            {status ? <View style={{width: size / statusScale, height: size / statusScale, backgroundColor: statusColor, borderRadius: 10000, marginTop: -(size / statusScale), left: size - (size / statusScale), borderWidth: size / 20, borderColor: backgroundColor || currentTheme.backgroundPrimary}} /> : null}
        </View>
    )
    if (channel)
    return (
        <View>
            {channel?.generateIconURL() ? <Image source={{uri: channel?.generateIconURL() + "?max_side=" + defaultMaxSide}} style={{width: size || 35, height: size || 35, borderRadius: 10000}} /> : null}
        </View>
    )
})
export const MiniProfile = observer(({ user, scale, channel, server}) => {
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
export const RoleView = observer(({ server, user }) => {
    let memberObject = client.members.getKey({server: server?._id, user: user?._id});
    let roles = memberObject?.roles?.map(r => server?.roles[r]) || []
    return (
        memberObject && roles ?
        <>
            <Text>{roles.length} Roles</Text>
            <View>{roles.map(r => <Text style={{flexDirection: 'row', padding: 8, paddingLeft: 12, paddingRight: 12, backgroundColor: currentTheme.backgroundPrimary, borderRadius: 8, color: r.colour}}>{r.name}</Text>)}</View>
        </>
        : null
    )
})