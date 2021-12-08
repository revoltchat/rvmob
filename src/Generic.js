import Markdown, { hasParents, MarkdownIt } from 'react-native-markdown-display';
import ReactNative, { View, TouchableOpacity, Linking } from 'react-native';
import { Client } from 'revolt.js';
import { currentTheme, setTheme, themes, styles } from './Theme';
import { MiniProfile } from './Profile';
import React from 'react';
import { observer } from 'mobx-react-lite';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import FastImage from 'react-native-fast-image';
import spoilerPlugin from '@traptitech/markdown-it-spoiler';
const Image = FastImage;
export const app = {
    settings: {
        "Theme": {
            default: "Dark",
            type: "string",
            options: Object.keys(themes),
            onChange: (v) => {
                setTheme(v);
            },
            onInitialize: (v) => {
                setTheme(v);
            }
        },
        "Show self in typing indicator": {
            default: true,
            type: "boolean"
        },
        "Show user status in chat avatars": {
            default: false,
            type: "boolean"
        },
        "Show masqueraded avatar in corner": {
            default: true,
            type: "boolean"
        },
        "Refetch messages on reconnect": {
            default: true,
            type: "boolean"
        },
        "Push notifications": {
            default: false,
            type: "boolean",
            experimental: true
        },
        "Notify for pings from yourself": {
            default: false,
            type: "boolean",
            developer: true
        },
        "Message spacing": {
            default: "3",
            type: "number"
        },
        "Consented to 18+ content": {
            default: false,
            type: "boolean"
        },
        "Show experimental features": {
            default: false,
            type: "boolean"
        },
        "Show developer tools": {
            default: false,
            type: "boolean"
        }
    }
};

app.settings.getRaw = (k) => {
    return (typeof app.settings[k].value == (app.settings[k].type == "number" ? "string" : app.settings[k].type) ? app.settings[k].value : app.settings[k].default);
}
app.settings.get = (k) => {
    if (!app.settings[k]) {console.warn(`No setting named "${k}"`); return null;}
    let raw = (typeof(app.settings[k].value) == (
        app.settings[k].type == "number" ? "string"
        :
        app.settings[k].type
    ) && 
    (app.settings[k].experimental ? app.settings["Show experimental features"].value : true) && 
    (app.settings[k].developer ? app.settings["Show developer tools"].value : true) ? 
        app.settings[k].value
        : 
        app.settings[k].default
    );
    return app.settings[k].type == "number" ? (parseInt(raw) || 0) : raw;
}
app.settings.set = (k, v) => {
    app.settings[k].value = v;
    app.settings[k].onChange && app.settings[k].onChange(v);
    app.settings.save();
}
app.settings.save = async () => {
    let out = {}
    Object.keys(app.settings).filter(
        s => typeof app.settings[s] == "object"
    ).forEach(
        s => out[s] = app.settings[s].value
    )
    await AsyncStorage.setItem("settings", JSON.stringify(out));
}
app.settings.clear = async () => {
    await AsyncStorage.setItem("settings", "{}");
    Object.keys(app.settings).forEach(s => {
        delete app.settings[s].value;
        app.settings[s].onChange && app.settings[s].onChange(app.settings[s].default);
    })
}

// i gotta say github copilot is actually pretty good at this
AsyncStorage.getItem('settings').then(s => {
    console.log(s)
    if (s) {
        try {
            const settings = JSON.parse(s);
            Object.keys(settings).forEach(key => {
                if (app.settings[key]) {
                    app.settings[key].value = settings[key];
                    app.settings[key].onInitialize && app.settings[key].onInitialize(settings[key]);
                } else {
                    console.warn(`Unknown setting ${key}`);
                }
            })
        } catch (e) {
            console.error(e);
        }
    }
});

app.openProfile = (u) => {};
app.openLeftMenu = (o) => {};
app.openRightMenu = (o) => {};
app.openInvite = (i) => {};
app.openBotInvite = (i) => {};
app.openServer = (s) => {};
app.openChannel = (c) => {};
app.openImage = (a) => {};
app.openMessage = (m) => {};
app.openServerContextMenu = (s) => {};
app.openSettings = (o) => {};
app.setMessageBoxInput = (t) => {};
app.setReplyingMessages = (m, a) => {};
app.getReplyingMessages = () => {};
app.pushToQueue = (m) => {};

export function setFunction(name, func) {
    app[name] = func;
}

export const defaultMaxSide = "128";
export const defaultMessageLoadCount = 50;

export const client = new Client();

export const Text = (props) => {
    let newProps = {...props}
    if (!props.style) newProps = Object.assign({style: {}}, newProps)
    newProps.style = Object.assign({color: currentTheme.textPrimary, flexWrap: 'wrap'}, newProps.style)
    return (
        <ReactNative.Text {...newProps}>{newProps.children}</ReactNative.Text>
    )
}

export const defaultMarkdownIt = MarkdownIt({ typographer: true, linkify: true }).disable(['image']).use(spoilerPlugin);

export const INVITE_PATHS = [
    "app.revolt.chat/invite",
    "nightly.revolt.chat/invite",
    "local.revolt.chat/invite",
    "rvlt.gg",
];
export const RE_INVITE = new RegExp(
    `(?:${INVITE_PATHS.map((x) => x.split(".").join("\\.")).join(
        "|",
    )})/([A-Za-z0-9]*)`,
    "g",
);

export const BOT_INVITE_PATHS = [
    "app.revolt.chat/bot",
    "nightly.revolt.chat/bot",
    "local.revolt.chat/bot"
];
export const RE_BOT_INVITE = new RegExp(
    `(?:${BOT_INVITE_PATHS.map((x) => x.split(".").join("\\.")).join(
        "|",
    )})/([A-Za-z0-9]*)`,
    "g",
);

export const openUrl = (url) => {
    if (url.startsWith("/@")) {
        let id = url.slice(2)
        let user = client.users.get(id)
        if (user) {
            app.openProfile(user)
        }
        return
    }
    let match = url.match(RE_INVITE);
    if (match) {
        app.openInvite(match[0].split("/").pop())
        return
    }
    let botmatch = url.match(RE_BOT_INVITE);
    if (botmatch) {
        app.openBotInvite(botmatch[0].split("/").pop())
        return
    }
    
    Linking.openURL(url)
}

const spoilerStyle = {
    hiddenSpoiler: {
        backgroundColor: '#000',
        color: 'transparent',
    },
    revealedSpoiler: {
        backgroundColor: currentTheme.backgroundSecondary,
        color: currentTheme.textPrimary,
    },
};


const SpoilerContext = React.createContext()
const Spoiler = ({ content }) => {
    const [revealed, setRevealed] = React.useState(false)
    return (
      <SpoilerContext.Provider value={revealed}>
        <Text
          onPress={() => setRevealed(!revealed)}>
          {content}
        </Text>
      </SpoilerContext.Provider>
    );
}

// the text and code_inline rules are the same as the built-in ones,
// except with spoiler support
const spoilerRule = {
    spoiler: (node, children) => <Spoiler key={node.key} content={children} />,
    text: (node, children, parent, styles, inheritedStyles = {}) => {
        if (hasParents(parent, 'spoiler')) {
            return (
                <SpoilerContext.Consumer key={node.key}>
                    {isRevealed => (
                        <Text style={{ ...inheritedStyles, ...styles.text, ...(isRevealed ? spoilerStyle.revealedSpoiler : spoilerStyle.hiddenSpoiler), }}>
                            {node.content}
                        </Text>
                    )}
                </SpoilerContext.Consumer>
            );
        }

        return (
            <Text key={node.key} style={{...inheritedStyles, ...styles.text}}>
                {node.content}
            </Text>
        );
    },
    code_inline: (node, children, parent, styles, inheritedStyles = {}) => {
        if (hasParents(parent, 'spoiler')) {
            return (
                <SpoilerContext.Consumer key={node.key}>
                    {isRevealed => (
                        <Text style={{ ...inheritedStyles, ...styles.code_inline, ...(isRevealed ? spoilerStyle.revealedSpoiler : spoilerStyle.hiddenSpoiler), }}>
                            {node.content}
                        </Text>
                    )}
                </SpoilerContext.Consumer>
            );
        }

        return (
            <Text key={node.key} style={{...inheritedStyles, ...styles.code_inline}}>
                {node.content}
            </Text>
        );
    },
};
export const MarkdownView = (props) => {
    let newProps = {...props}
    if (!newProps.onLinkPress) newProps = Object.assign({onLinkPress: openUrl}, newProps)
    if (!newProps.markdownit) newProps = Object.assign({markdownit: defaultMarkdownIt}, newProps)
    if (!newProps.rules) newProps = Object.assign({rules: spoilerRule}, newProps)
    if (!newProps.style) newProps = Object.assign({style: {}}, newProps)
    if (!newProps.style.body) newProps.style = Object.assign({body: {}}, newProps.style)
    newProps.style.body = Object.assign({color: currentTheme.textPrimary}, newProps.style.body)
    if (!newProps.style.paragraph) newProps.style = Object.assign({paragraph: {}}, newProps.style)
    newProps.style.paragraph = Object.assign({color: currentTheme.textPrimary, marginTop: -3, marginBottom: 2}, newProps.style.paragraph)
    if (!newProps.style.link) newProps.style = Object.assign({link: {}}, newProps.style)
    newProps.style.link = Object.assign({color: currentTheme.accentColor}, newProps.style.link)
    if (!newProps.style.code_inline) newProps.style = Object.assign({ code_inline: {} }, newProps.style)
    newProps.style.code_inline = Object.assign({ color: currentTheme.textPrimary, backgroundColor: currentTheme.backgroundSecondary }, newProps.style.code_inline);
    if (!newProps.style.fence) newProps.style = Object.assign({fence: {}}, newProps.style);
    newProps.style.fence = Object.assign({ color: currentTheme.textPrimary, backgroundColor: currentTheme.backgroundSecondary, borderWidth: 0 }, newProps.style.fence);
    if (!newProps.style.code_block) newProps.style = Object.assign({code_block: {}}, newProps.style);
    newProps.style.code_block = Object.assign({ borderColor: currentTheme.textPrimary, color: currentTheme.textPrimary, backgroundColor: currentTheme.backgroundSecondary }, newProps.style.code_block);
    if (!newProps.style.blockquote) newProps.style = Object.assign({ blockquote: {} }, newProps.style)
    newProps.style.blockquote = Object.assign({ borderColor: currentTheme.textPrimary, color: currentTheme.textPrimary, backgroundColor: currentTheme.blockQuoteBackground }, newProps.style.block_quote);
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

export function parseRevoltNodes(text) {
    text = text.replace(/<@[0-9A-Z]*>/g, ping => {
        let id = ping.slice(2, -1)
        let user = client.users.get(id)
        if (user) {
            return `[@${user.username}](/@${user._id})`
        }
        return ping
    })
    text = text.replace(/<#[0-9A-Z]*>/g, ping => {
        let id = ping.slice(2, -1)
        let channel = client.channels.get(id)
        if (channel) { 
            return `[#${channel.name.split("]").join("\\]").split("[").join("\\[").split("*").join("\\*").split("`").join("\\`")}](/server/${channel.server._id}/channel/${channel._id})`
        }
        return ping
    })
    return text
}

export const GeneralAvatar = ({ attachment, size }) => {
    return (
        <View>
            {<Image source={{uri: client.generateFileURL(attachment) + "?max_side=" + defaultMaxSide}} style={{width: size || 35, height: size || 35, borderRadius: 10000}} />}
        </View>
    )
}


export const ServerList = observer(({ onServerPress, onServerLongPress, showUnread }) => {
    return [...client.servers.values()].map((s) => {
        let iconURL = s.generateIconURL();
        return <TouchableOpacity onPress={
            ()=>{onServerPress(s)}
        } onLongPress={
            ()=>{onServerLongPress(s)}
        } 
        key={s._id} 
        style={styles.serverButton}>
            {/* {showUnread ? <View style={{borderRadius: 10000, backgroundColor: getUnread()}}></View> } */}
            {iconURL ? <Image source={{uri: iconURL + "?max_side=" + defaultMaxSide}} style={styles.serverIcon}/> : <Text>{s.name}</Text>}
        </TouchableOpacity>
    })
})

export const ChannelButton = observer(({channel, onClick, selected}) => {
    return <TouchableOpacity onPress={
        ()=>onClick()
    } 
    key={channel._id} 
    style={
        selected ? 
        [styles.channelButton, styles.channelButtonSelected] : 
        styles.channelButton
    }>
        {(channel.generateIconURL && channel.generateIconURL()) ? 
        <Image 
        source={{uri: channel.generateIconURL() + "?max_side=" + defaultMaxSide}} 
        style={{width: 20, height: 20}}/> 
        : 
        <View style={{alignItems: 'center', justifyContent: 'center', width: 20}}>
            {channel.channel_type == "DirectMessage" ? 
            <FontistoIcon name="at" size={16} color={currentTheme.textPrimary}/>
            :
            channel.channel_type == "VoiceChannel" ? 
            <FA5Icon name="volume-up" size={16} color={currentTheme.textPrimary}/>
            :
            <FontistoIcon name="hashtag" size={16} color={currentTheme.textPrimary} />
            }
        </View>
        }
        <Text style={{marginLeft: 5}}>{channel.name}</Text>
    </TouchableOpacity>
})

export const ChannelList = observer((props) => {
    return (
        <>
            {!props.currentServer ? <>
            <TouchableOpacity onPress={
                async ()=>{props.onChannelClick(null)}
            } 
            key={"home"} 
            style={props.currentChannel?._id == null ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                <View style={styles.iconContainer}>
                    <FA5Icon name="house-user" size={16} color={currentTheme.textPrimary} />
                </View>
                <Text>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={
                ()=>{props.onChannelClick("friends")}
            } 
            key={"friends"} 
            style={props.currentChannel == "friends" ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                <View style={styles.iconContainer}>
                    <FA5Icon name="users" size={16} color={currentTheme.textPrimary} />
                </View>
                <Text>Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={
                async ()=>{props.onChannelClick(await client.user.openDM())}
            } 
            key={"notes"} 
            style={props.currentChannel?.channel_type == "SavedMessages" ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                <View style={styles.iconContainer}>
                    <MaterialIcon name="sticky-note-2" size={20} color={currentTheme.textPrimary} />
                </View>
                <Text>Saved Notes</Text>
            </TouchableOpacity>
            {[...client.channels.values()].filter(c => c.channel_type == "DirectMessage" || c.channel_type == "Group").map(dm => {
                if (dm.channel_type == "DirectMessage") return <TouchableOpacity onPress={
                    ()=>{props.onChannelClick(dm)}
                } onLongPress={
                    ()=>{app.openProfile(dm.recipient)}
                } delayLongPress={750}
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
            : null}
            {props.currentServer ? <>
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
                                    return <ChannelButton key={c._id} channel={c} onClick={()=>{props.onChannelClick(c)}} selected={props.currentChannel?._id == c._id} />
                                }
                            })}
                        </View>
                    })
                    return <>
                        {props.currentServer.channels.map((c) => {
                            if (c) {
                                if (!processedChannels.includes(c._id))
                                return <ChannelButton key={c._id} channel={c} onClick={()=>{props.onChannelClick(c)}} selected={props.currentChannel?._id == c._id} />
                            }
                        })}
                        {res}
                    </>
                })()}
            </> : null}
        </>
    );
})



export const ServerName = observer(({ server, size }) => { 
    return (
        <View style={{flexDirection: 'row'}}>
            <Text style={{fontWeight: 'bold', fontSize: size || 14, flexWrap: 'wrap'}}>
                {server.server_name || server.name}
            </Text>
        </View>
    )
})


export const remarkStyle = {
    color: currentTheme.textSecondary, 
    textAlign: 'center', 
    fontSize: 16, 
    marginTop: 5
}
export const loadingScreenRemarks = [
    <Text style={remarkStyle}>I'm writing a complaint to the Head of Loading Screens.</Text>,
    <Text style={remarkStyle}>I don't think we can load any longer!</Text>,
    <Text style={remarkStyle}>Better grab a book or something.</Text>,
    <Text style={remarkStyle}>When will the madness end?</Text>,
    <Text style={remarkStyle}>You know, what does RVMob even stand for?</Text>,
    <Text style={remarkStyle}>Why do they call it a "building" if it's already built?</Text>,
]
export var selectedRemark = loadingScreenRemarks[Math.floor(Math.random() * loadingScreenRemarks.length)];
export function randomizeRemark() {
    selectedRemark = loadingScreenRemarks[Math.floor(Math.random() * loadingScreenRemarks.length)];
}

export var unreads = {servers: {}, channels: {}};
export function fetchUnreads() {
    unreads = {servers: {}, channels: {}};
    client.syncFetchUnreads().then((u) => {
        u.forEach(c => {
            // if (c.last_id != client.channels.get(c._id)?.last_message_id) {
            let server = client.channels.get(c._id)?.server_id;
            if (server) {
                if (!unreads.servers[server]) unreads.servers[server] = {};
                
            }
            unreads[c.channel_id] = {mentions: c.mentions.length};
            // }
        })
    })
}
export function getUnread(c) {
    if (unreads[c]) {
        return unreads[c].mentions ? unreads[c].mentions : true;
    }
    return false;
}
export function pushUnread(c, unread = null, mention = false) {
    if (!unread) delete unreads[c];
    else {
        if (mention) {
            if (!unreads[c]) unreads[c] = {mentions: 0};
            unreads[c].mentions += 1;
        } else {
            if (!unreads[c]) unreads[c] = {mentions: 0};
        }
    }
}