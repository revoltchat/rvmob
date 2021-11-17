import { StyleSheet } from 'react-native';
export const themes = {
    "Light": {
        backgroundPrimary: '#ffffff',
        backgroundSecondary: '#d8d8d8',
        blockQuoteBackground: '#11111111',
        textPrimary: '#000000',
        textSecondary: '#555555',
        accentColor: '#1ad4b2',
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
        accentColor: '#1ad4b2',
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
        accentColor: '#1ad4b2',
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
    "Vibrant Pink": {
        backgroundPrimary: '#f9bae9',
        backgroundSecondary: '#e99cd6',
        blockQuoteBackground: '#11111166',
        textPrimary: '#000000',
        textSecondary: '#555555',
        accentColor: '#1ad4b2',
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
    "AMOLED": {
        backgroundPrimary: '#000000',
        backgroundSecondary: '#000000',
        blockQuoteBackground: '#111111',
        textPrimary: '#dddddd',
        textSecondary: '#888888',
        accentColor: '#1ad4b2',
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
export var currentTheme = themes["Dark"]
export var currentThemeName = "Dark"

export var styles;
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
            flexDirection: "row"
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
            borderBottomWidth: 1,
            flexDirection: "row"
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
            padding: 10 - currentTheme.generalBorderWidth,
            margin: 3,
            marginRight: 5,
            borderRadius: 8,
            flexDirection: 'row',
            backgroundColor: currentTheme.backgroundPrimary,
            borderWidth: currentTheme.buttonBorderWidth,
            borderColor: currentTheme.buttonBorderColor
        },
        button: {
            padding: 10 - currentTheme.generalBorderWidth,
            paddingLeft: 16 - currentTheme.generalBorderWidth,
            paddingRight: 16 - currentTheme.generalBorderWidth,
            borderRadius: 8,
            backgroundColor: currentTheme.backgroundSecondary,
            margin: 5,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: currentTheme.buttonBorderWidth,
            borderColor: currentTheme.buttonBorderColor
        },
        buttonSecondary: {
            padding: 10 - currentTheme.generalBorderWidth,
            paddingLeft: 16 - currentTheme.generalBorderWidth,
            paddingRight: 16 - currentTheme.generalBorderWidth,
            borderRadius: 8,
            backgroundColor: currentTheme.backgroundPrimary,
            margin: 5,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: currentTheme.buttonBorderWidth,
            borderColor: currentTheme.buttonBorderColor
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
            borderRadius: 8,
            paddingLeft: 10,
            paddingRight: 10,
            marginTop: 5
        },
        messageBoxBar: {
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
export function setTheme(themeName) {
    currentThemeName = themeName
    currentTheme = themes[themeName]
    refreshStyles()
}
setTheme('Dark')