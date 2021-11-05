import { observer } from 'mobx-react-lite';
import React from 'react';
import { Text, client, defaultMaxSide, app } from './Generic';
import { currentTheme, styles } from './Theme';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
const Image = FastImage;

export const Username = observer(({ server, user, noBadge, size, masquerade }) => { 
    if (typeof user != 'object') return <Text style={size ? {fontSize: size} : {}}>
        {"<Unknown User>"}
    </Text>
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
    let badgeSize = ((size || 14) * 0.6)
    let badgeStyle = {color: currentTheme.accentColorForeground, backgroundColor: currentTheme.accentColor, marginLeft: badgeSize * 0.3, paddingLeft: badgeSize * 0.4, paddingRight: badgeSize * 0.4, borderRadius: 3, fontSize: badgeSize, height: badgeSize + (badgeSize * 0.45), top: badgeSize * 0.5}
    return (
        <View style={{flexDirection: 'row'}}>
            <Text style={{color, fontWeight: 'bold', fontSize: (size || 14)}}>
                {masquerade ? masquerade : name}
            </Text>
            {!noBadge ?
                <>
                    {user?.bot ? <Text style={badgeStyle}>
                        BOT
                    </Text> : null}
                    {masquerade ? <Text style={badgeStyle}>
                        MASQ.
                    </Text> : null}
                    </>
            : null}
        </View>
    )
})
export const Avatar = observer(({ channel, user, server, status, size, backgroundColor, masquerade }) => {
    let memberObject = client.members.getKey({server: server?._id, user: user?._id});
    let statusColor
    let statusScale = 2.7
    if (status) {
        statusColor = currentTheme["status" + (user.online ? (user.status?.presence || "Online") : "Offline")]
    }
    if (user)
    return ( 
        <View>
            <Image source={{uri: (
                masquerade ? masquerade
                :
                (server && memberObject?.generateAvatarURL && memberObject?.generateAvatarURL()) ? 
                memberObject?.generateAvatarURL() : 
                user?.generateAvatarURL()
            ) + "?max_side=" + defaultMaxSide}} style={{width: size || 35, height: size || 35, borderRadius: 10000}} />
            {status ? <View style={{width: Math.round(size / statusScale), height: Math.round(size / statusScale), backgroundColor: statusColor, borderRadius: 10000, marginTop: -Math.round(size / statusScale), left: size - Math.round(size / statusScale), borderWidth: Math.round(size / 20), borderColor: backgroundColor || currentTheme.backgroundPrimary}} /> : null}
            {masquerade && app.settings.get("Show masqueraded avatar in corner") ? <Image style={{width: Math.round(size / statusScale), height: Math.round(size / statusScale), marginBottom: -Math.round(size / statusScale), bottom: size, borderRadius: 10000, borderWidth: Math.round(size / 30), borderColor: backgroundColor || currentTheme.backgroundPrimary}} source={{uri:
                (server && memberObject?.generateAvatarURL && memberObject?.generateAvatarURL()) ? 
                memberObject?.generateAvatarURL() : 
                user?.generateAvatarURL()
            }}/> : null}
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
            <View style={{flexDirection: 'row'}}>{roles.map(r => <View style={{flexDirection: 'row', padding: 6, paddingLeft: 8, paddingRight: 8, margin: 2, backgroundColor: currentTheme.backgroundPrimary, borderRadius: 8}}><View style={{borderRadius: 10000, backgroundColor: r.colour, height: 16, width: 16, margin: 2, marginRight: 6}} /><Text>{r.name}</Text></View>)}</View>
        </>
        : null
    )
})