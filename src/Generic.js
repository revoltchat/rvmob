import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import ReactNative, { View } from 'react-native';
import { Client } from 'revolt.js';
import { currentTheme } from './Theme';
import React from 'react';
import FastImage from 'react-native-fast-image';
const Image = FastImage;

export const defaultMaxSide = "128";

export const client = new Client();

export const Text = (props) => {
    let newProps = {...props}
    if (!props.style) newProps = Object.assign({style: {}}, newProps)
    newProps.style = Object.assign({color: currentTheme.textPrimary}, newProps.style)
    return (
        <ReactNative.Text {...newProps}>{newProps.children}</ReactNative.Text>
    )
}

export const defaultMarkdownIt = MarkdownIt({typographer: true, linkify: true}).disable([ 'image' ]);

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

export const MarkdownView = (props) => {
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

export const GeneralAvatar = ({ attachment, size }) => {
    return (
        <View>
            {<Image source={{uri: client.generateFileURL(attachment) + "?max_side=" + defaultMaxSide}} style={{width: size || 35, height: size || 35, borderRadius: 10000}} />}
        </View>
    )
}