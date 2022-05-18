import { StyleSheet } from 'react-native';
export const themes = {
    "Light": {
        background: '#F6F6F6',
        backgroundPrimary: '#FFFFFF',
        backgroundSecondary: '#F1F1F1',
        backgroundTertiary: '#4D4D4D',
        foregroundPrimary: '#000000',
        foregroundSecondary: '#F1F1F1',
        foregroundTertiary: '#4D4D4D',
        headerPrimary: '#F1F1F1',
        headerSecondary: '#F1F1F1',
        hover: '#0000002B',
        messageBox: '#F1F1F1',
        blockQuoteBackground: '#11111166',
        accentColor: '#1AD4B2',
        accentColorForeground: '#000000',
        contentType: 'light',
        statusOnline: "#3ABF7E",
        statusIdle: "#F39F00",
        statusBusy: "#F84848",
        statusStreaming: "#977EFF",
        statusOffline: "#A5A5A5",
        statusInvisible: "#A5A5A5",
        error: "#ED4245",
        pingColor: "#FBFF0050"
    },
    "Dark": {
        background: '#191919',
        backgroundPrimary: '#242424',
        backgroundSecondary: '#1E1E1E',
        backgroundTertiary: '#4D4D4D',
        foregroundPrimary: '#F6F6F6',
        foregroundSecondary: '#C8C8C8',
        foregroundTertiary: '#848484',
        headerPrimary: '#363636',
        headerSecondary: '#2D2D2D',
        hover: '#0000001A',
        messageBox: '#363636',
        blockQuoteBackground: '#11111166',
        accentColor: '#1AD4B2',
        accentColorForeground: '#000000',
        contentType: 'light',
        statusOnline: "#3ABF7E",
        statusIdle: "#F39F00",
        statusBusy: "#F84848",
        statusStreaming: "#977EFF",
        statusOffline: "#A5A5A5",
        statusInvisible: "#A5A5A5",
        error: "#ED4245",
        pingColor: "#FBFF000F"
    },
    // "Solarized": {
    //     backgroundPrimary: '#001a20',
    //     backgroundSecondary: '#05252d',
    //     blockQuoteBackground: '#11111166',
    //     textPrimary: '#dddddd',
    //     textSecondary: '#888888',
    //     accentColor: '#1ad4b2',
    //     accentColorForeground: '#000000',
    //     contentType: 'light',
    //     buttonBorderWidth: 0,
    //     messageBoxBorderWidth: 0,
    //     generalBorderWidth: 0,
    //     buttonBorderColorActive: "#3333ff",
    //     statusOnline: "#3abf7e",
    //     statusIdle: "#f39f00",
    //     statusBusy: "#f84848",
    //     statusStreaming: "#977eff",
    //     statusOffline: "#a5a5a5",
    //     statusInvisible: "#a5a5a5",
    //     pingColor: "#f84848",
    //     pingColorForeground: "#ffffff"
    // },
    // "Vibrant Pink": {
    //     backgroundPrimary: '#f9bae9',
    //     backgroundSecondary: '#e99cd6',
    //     blockQuoteBackground: '#11111166',
    //     textPrimary: '#000000',
    //     textSecondary: '#555555',
    //     accentColor: '#1ad4b2',
    //     accentColorForeground: '#000000',
    //     contentType: 'dark',
    //     buttonBorderWidth: 0,
    //     messageBoxBorderWidth: 0,
    //     generalBorderWidth: 0,
    //     buttonBorderColorActive: "#3333ff",
    //     statusOnline: "#3abf7e",
    //     statusIdle: "#f39f00",
    //     statusBusy: "#f84848",
    //     statusStreaming: "#977eff",
    //     statusOffline: "#a5a5a5",
    //     statusInvisible: "#a5a5a5",
    //     pingColor: "#f84848",
    //     pingColorForeground: "#ffffff"
    // },
    // "AMOLED": {
    //     backgroundPrimary: '#000000',
    //     backgroundSecondary: '#000000',
    //     blockQuoteBackground: '#111111',
    //     textPrimary: '#dddddd',
    //     textSecondary: '#888888',
    //     accentColor: '#1ad4b2',
    //     accentColorForeground: '#000000',
    //     contentType: 'light',
    //     buttonBorderColor: "#ffffff99",
    //     buttonBorderWidth: 1,
    //     messageBoxBorderColor: "#ffffff99",
    //     messageBoxBorderWidth: 1,
    //     generalBorderColor: "#ffffff22",
    //     generalBorderWidth: 1,
    //     buttonBorderColorActive: "#3333ff",
    //     statusOnline: "#3abf7e",
    //     statusIdle: "#f39f00",
    //     statusBusy: "#f84848",
    //     statusStreaming: "#977eff",
    //     statusOffline: "#a5a5a5",
    //     statusInvisible: "#a5a5a5",
    //     pingColor: "#f84848",
    //     pingColorForeground: "#ffffff"
    // }
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
            backgroundColor: currentTheme.backgroundPrimary
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
            color: currentTheme.foregroundPrimary
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
            width: 60,
            flexShrink: 1,
            backgroundColor: currentTheme.background,
            paddingTop: 4,
            paddingBottom: 4,
        },
        channelList: {
            flexGrow: 1000,
            flex: 1000
        },
        channelButton: {
            marginLeft: 8,
            marginRight: 8,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
        },
        button: {
            padding: 10,
            paddingLeft: 16,
            paddingRight: 16,
            borderRadius: 8,
            backgroundColor: currentTheme.headerSecondary,
            margin: 5,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row'
        },
        buttonSecondary: {
            padding: 10,
            paddingLeft: 16,
            paddingRight: 16,
            borderRadius: 8,
            backgroundColor: currentTheme.backgroundPrimary,
            margin: 5,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row'
        },
        channelButtonSelected: {
            backgroundColor: currentTheme.hover
        },
        iconContainer: {
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 30, 
            height: 30, 
            marginRight: 8
        },
        messagesView: {
            padding: 10,
            flex: 1
        },
        messageBoxInner: {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 50,
            paddingLeft: 8,
            paddingRight: 8
        },
        messageBoxOuter: {
            backgroundColor: currentTheme.messageBox,
            overflow: "hidden"
        },
        sendButton: {
            margin: 3,
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
            color: currentTheme.foregroundPrimary,
            paddingLeft: 10,
            padding: 6,
            flex: 1
        },
        channelHeader: {
            height: 50,
            backgroundColor: currentTheme.headerPrimary,
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
            color: currentTheme.foregroundTertiary,
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