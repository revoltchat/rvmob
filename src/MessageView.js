import { client, Text, MarkdownView, app, parseRevoltNodes, defaultMessageLoadCount, setFunction, selectedRemark, randomizeRemark, openUrl } from './Generic';
import { View, ScrollView, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import { Avatar, Username } from './Profile'
import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { autorun } from 'mobx';
import { styles, currentTheme } from './Theme';
import { differenceInMinutes, formatRelative } from 'date-fns';
import { decodeTime } from 'ulid'
import FastImage from 'react-native-fast-image';
const Image = FastImage;
let didUpdateFirstTime = false;


export class Messages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            queuedMessages: [],
            loading: true,
            forceUpdate: false,
            newMessageCount: 0,
            error: null,
            atLatestMessages: true
        };
        this.renderMessage = this.renderMessage.bind(this);
        setFunction("pushToQueue", (m) => {
            m.rendered = (
                <Message key={m.nonce} 
                message={m}
                grouped={this.state.queuedMessages.length > 0} 
                queued={true}
                />
            )
            this.setState((prev) => {
                return {queuedMessages: prev.queuedMessages.concat(m)}
            })
        })
    }
    componentDidCatch(error, errorInfo) {
        this.setState({error})
        console.error(error)
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.rerender != this.props.rerender) return true
        if (nextState.newMessageCount != this.state.newMessageCount) return true
        if (nextState.forceUpdate) {
            this.setState({forceUpdate: false})
            return true
        }
        if (nextState?.messages) {
            let res = (nextState.messages[nextState.messages.length - 1]?.message._id != this.state.messages[this.state.messages?.length - 1]?.message._id) || (this.props.channel?._id != nextProps.channel?._id) || (!didUpdateFirstTime) || (this.state.forceUpdate)
            return res
        }
        return true
    }
    componentDidMount() {
        console.log("mount component")
    	client.on('message', async message => {
    		if (this.state.atLatestMessages && this.props.channel) { // !this.props.loading && 
    			if (this.props.channel._id == message.channel._id && this.state.messages?.length > 0) {
    	    		this.setState((prev) => {
                        let newMessages = prev.messages
                        if (newMessages.length >= (!this.state.bottomOfPage ? 150 : 50)) {
                            newMessages = newMessages.slice(newMessages.length - 50, newMessages.length)
                        }
                        let grouped = newMessages.length > 0 && ((newMessages[newMessages.length - 1].message?.author?._id == message.author?._id) && !(message.reply_ids && message.reply_ids.length > 0) && differenceInMinutes(decodeTime(message._id), decodeTime(newMessages[newMessages.length - 1].message?._id)) < 5)
                        newMessages.push({message, grouped, rendered: this.renderMessage({grouped, message})})
                        return {messages: newMessages, newMessageCount: !this.state.bottomOfPage ? (this.state.newMessageCount + 1) || 1 : 0, queuedMessages: this.state.queuedMessages.filter(m => m.nonce != message.nonce)}
                    })
    	    	}
    	    }
    	});
    	client.on('message/delete', async id => {
    		if (this.props.channel) {
                this.setState((prev) => {
                    if (prev.messages.filter(m => m.message._id == id).length > 0) return {messages: prev.messages.filter(m => m.message._id != id), forceUpdate: true}
                    return {}
                })
    	    }
    	});
        autorun(async () => {
            if (client.user?.online && this.props.channel && app.settings.get("Refetch messages on reconnect")) {
                this.setState({loading: true, messages: []})
                await this.fetchMessages()
                this.setState({loading: false})
            }
        })
        didUpdateFirstTime = false
        this.componentDidUpdate(this.state)
    }
    async componentDidUpdate(prev) {
        if (this.props.channel && (!didUpdateFirstTime || prev.channel._id != this.props.channel._id)) {
            didUpdateFirstTime = true
            randomizeRemark()
            this.setState({loading: true, messages: [], queuedMessages: []})
            await this.fetchMessages()
        }
    }
    async fetchMessages(input = {}) {
        console.log("fetch messages")
        let params = {limit: input.before ? defaultMessageLoadCount / 2 : defaultMessageLoadCount};
        params[input.type] = input.id;
        // if (input.type == "after") {
        //     params.sort = "Oldest"
        // }
        this.props.channel.fetchMessagesWithUsers(params).then((res) => {
            console.log("done fetching");
            let oldMessages = this.state.messages;
            if (input.type == "before") {
                oldMessages = oldMessages.slice(0, (defaultMessageLoadCount / 2) - 1)
            } else if (input.type == "after") {
                oldMessages = oldMessages.slice((defaultMessageLoadCount / 2) - 1, defaultMessageLoadCount - 1)
            }
            let messages = res.messages.reverse().map((message, i) => {
                try {
                let time = decodeTime(message._id)
                // let grouped = ((lastAuthor == message.author?._id) && !(message.reply_ids && message.reply_ids.length > 0) && (lastTime && time.diff(lastTime, "minute") < 5))
                let grouped = i != 0 && ((res.messages[i - 1].author._id == message.author?._id) && !(message.reply_ids && message.reply_ids.length > 0) && differenceInMinutes(time, decodeTime(res.messages[i - 1]._id)) < 5)
                let out = {grouped, message: message, rendered: this.renderMessage({grouped, message})}
                // lastAuthor = (message.author ? message.author._id : lastAuthor)
                // lastTime = time
                return out
                } catch (e) {
                    console.error(e)
                }
            })
            let result = input.type == "before" ? messages.concat(oldMessages) : input.type == "after" ? oldMessages.concat(messages) : messages;
            this.setState({
                messages: result, 
                loading: false, 
                newMessageCount: 0,
                atLatestMessages: true
                // atLatestMessages: input.type != "before" && this.props.channel.last_message_id == result[result.length - 1]?._id
            })
        });
    }
    renderMessage(m) {
        return (
            <Message key={m.message._id} 
            message={m.message} 
            grouped={m.grouped} 
            queued={m.queued}
            onLongPress={() => this.props.onLongPress(m.message)} 
            onUserPress={() => app.openProfile(m.message.author, this.props.channel?.server)}
            onUsernamePress={() => this.props.onUsernamePress(m.message)}
            />
        )
    }
    render() {
        if (this.state.error) return <Text style={{color: "#ff6666"}}>Error rendering: {this.state.error.message}</Text>
        return (
            this.state.loading ? 
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Text style={{fontSize: 30, fontWeight: 'bold'}}>Loading...</Text>
                <View style={{paddingLeft: 30, paddingRight: 30}}>{selectedRemark || null}</View>
            </View> 
            :
            <View style={{flex: 1}}>
                {this.state.newMessageCount > 0 ? <Text style={{height: 32, padding: 6, backgroundColor: currentTheme.accentColor, color: currentTheme.accentColorForeground}}>{this.state.newMessageCount} new messages...</Text> : null}
                {/* <FlatList data={this.state.messages} 
                removeClippedSubviews={false}
                disableVirtualization={true}
                maxToRenderPerBatch={12}
                initialNumToRender={12}
                inverted={true}
                windowSize={17}
                keyExtractor={this.keyExtractor}
                renderItem={this.renderItem} 
                ref={ref => {this.scrollView = ref}} 
                onScroll={e => {this.setState({
                    bottomOfPage: (e.nativeEvent.contentOffset.y >= 
                        (e.nativeEvent.contentSize.height - 
                        e.nativeEvent.layoutMeasurement.height)), 
                        newMessageCount: (e.nativeEvent.contentOffset.y >= 
                        (e.nativeEvent.contentSize.height - 
                        e.nativeEvent.layoutMeasurement.height)) 
                        ? 0 : 
                        this.state.newMessageCount}); 
                    }} 
                onLayout={() => {if (this.state.bottomOfPage) {this.scrollView.scrollToOffset({offset: 0, animated: false})}}}
                onContentSizeChange={() => {if (this.state.bottomOfPage) {this.scrollView.scrollToOffset({offset: 0, animated: true})}}} 
                style={styles.messagesView} /> */}
                <ScrollView style={styles.messagesView} 
                ref={ref => {this.scrollView = ref}} 
                onScroll={e => {
                    let bottomOfPage = (e.nativeEvent.contentOffset.y >= 
                    (e.nativeEvent.contentSize.height - 
                    e.nativeEvent.layoutMeasurement.height));
                    // if (e.nativeEvent.contentOffset.y == 0) {
                    //     this.fetchMessages({type: "before", id: this.state.messages[0].message._id})
                    // }
                    // if (!this.state.atLatestMessages && bottomOfPage) {
                    //     this.fetchMessages({type: "after", id: this.state.messages[this.state.messages.length - 1].message._id})
                    // }
                    this.setState({
                        bottomOfPage, 
                        newMessageCount: bottomOfPage ? 0 : this.state.newMessageCount
                    }); 
                }}
                onLayout={() => {if (this.state.bottomOfPage) {this.scrollView.scrollToEnd({animated: false})}}}
                onContentSizeChange={() => {if (this.state.bottomOfPage) {this.scrollView.scrollToEnd({animated: true})}}} >
                    {this.state.messages.map(m => m.rendered)}
                    {this.state.queuedMessages.map(m => m.rendered)}
                    <View style={{marginTop: 15}} />
                </ScrollView>
                {!this.state.atLatestMessages ? <TouchableOpacity style={{height: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: currentTheme.accentColor}} onPress={() => this.fetchMessages()}><Text style={{color: currentTheme.accentColorForeground}}>Go to latest messages</Text></TouchableOpacity> : null}
            </View>
        )
    }
}

export const Message = observer((props) => { 
    let [error, setError] = React.useState(null)
    if (error) 
    return (
        <View key={props.message._id}>
            <Text style={{color: "#ff4444"}}>Failed to render message:{'\n'}{error?.message}</Text>
        </View>
    )
    try {
        if (typeof props.message.content == "object") 
        return (
            <View key={props.message._id} style={styles.messsageInner}>
                <View style={{marginTop: app.settings.get("Message spacing")}} />
                <View style={{flexDirection: 'row'}}>
                    <Username user={client.users.get(props.message.content.id)} server={props.message.channel?.server} />
                    {props.message.content.type === "user_joined" ? <Text> joined</Text> : 
                    props.message.content.type === "user_left" ? <Text> left</Text> :
                    props.message.content.type === "user_banned" ? <Text> was banned</Text> :
                    props.message.content.type === "user_kicked" ? <Text> was kicked</Text> :
                    props.message.content.type === "user_added" ? <Text> was added to the group</Text> :
                    props.message.content.type === "user_remove" ? <Text> was removed from the group</Text> :
                    props.message.content.type === "channel_renamed" ? <Text> renamed the channel to <Text style={{fontWeight: 'bold'}}>{props.message.content.name}</Text>.</Text> :
                    props.message.content.type === "channel_description_changed" ? <Text> changed the channel description.</Text> :
                    props.message.content.type === "channel_icon_changed" ? <Text> changed the channel icon.</Text> :
                    null}
                </View>
            </View>
        )
        if (props.message.queued) {
            return (
                <Pressable key={props.message._id} style={{opacity: 0.6}} delayLongPress={750} onLongPress={props.onLongPress}>
                    <View style={{marginTop: app.settings.get("Message spacing")}} />
                    {(props.message.reply_ids !== null) ? <View style={styles.repliedMessagePreviews}>{props.message.reply_ids.map(id => <ReplyMessage key={id} message={client.messages.get(id)} />)}</View> : null}
                    <View style={props.grouped ? styles.messageGrouped : styles.message}>
                        {(!props.grouped) ? <Avatar user={client.user} masquerade={props.message.masquerade?.avatar} server={props.message.channel?.server} size={35} {...(app.settings.get("Show user status in chat avatars") ? {status: true} : {})} /> : null}
                        <View style={styles.messageInner}>
                            {(!props.grouped) ? <View style={{flexDirection: 'row'}}><Username user={client.user} server={props.message.channel?.server} masquerade={props.message.masquerade?.name} /><Text style={styles.timestamp}> {formatRelative(decodeTime(props.message.nonce), new Date())}</Text></View> : null}
                            <MarkdownView>{props.message.content}</MarkdownView>
                        </View>
                    </View>
                </Pressable>
            );
        }
        return (
            <TouchableOpacity key={props.message._id} activeOpacity={0.8} delayLongPress={750} onLongPress={props.onLongPress}>
                <View style={{marginTop: app.settings.get("Message spacing")}} />
                {(props.message.reply_ids !== null) ? <View style={styles.repliedMessagePreviews}>{props.message.reply_ids.map(id => <ReplyMessage key={id} message={client.messages.get(id)} mention={props.message?.mention_ids?.includes(props.message?.author_id)} />)}</View> : null}
                <View style={props.grouped ? styles.messageGrouped : styles.message}>
                    {(props.message.author && !props.grouped) ? <Pressable onPress={() => props.onUserPress()}><Avatar user={props.message.author} masquerade={props.message.generateMasqAvatarURL()} server={props.message.channel?.server} size={35} {...(app.settings.get("Show user status in chat avatars") ? {status: true} : {})} /></Pressable> : null}
                    <View style={styles.messageInner}>
                        {(props.grouped && props.message.edited) ? <Text style={{fontSize: 12, color: currentTheme.textSecondary, position: 'relative', right: 47, marginBottom: -16}}> (edited)</Text> : null}
                        {(props.message.author && !props.grouped) ? <View style={{flexDirection: 'row'}}><Pressable onPress={props.onUsernamePress}><Username user={props.message.author} server={props.message.channel?.server} masquerade={props.message.masquerade?.name} /></Pressable><Text style={styles.timestamp}> {formatRelative(decodeTime(props.message._id), new Date())}</Text>{props.message.edited && <Text style={{fontSize: 12, color: currentTheme.textSecondary, position: 'relative', top: 2, left: 2}}> (edited)</Text>}</View> : null}
                        <MarkdownView>{parseRevoltNodes(props.message.content)}</MarkdownView>
                        {props.message.attachments?.map((a) => {
                            if (a.metadata?.type == "Image") {
                                let width = a.metadata.width;
                                let height = a.metadata.height;
                                if (width > (Dimensions.get("screen").width - 75)) {
                                    let sizeFactor = (Dimensions.get("screen").width - 75) / width;
                                    width = width * sizeFactor
                                    height = height * sizeFactor
                                }
                                return <Pressable onPress={() => app.openImage(a)}><Image source={{uri: client.generateFileURL(a)}} resizeMode={FastImage.resizeMode.contain} style={{width: width, height: height, marginBottom: 4, borderRadius: 3}} /></Pressable>
                            } else {
                                return <View style={{padding: 15, borderRadius: 6, backgroundColor: currentTheme.backgroundSecondary, marginBottom: 15}}><Text>{a.filename}</Text><Text>{a.size.toLocaleString()} bytes</Text></View>
                            }
                        })}
                        {props.message.embeds?.map((e) => {
                            return <MessageEmbed embed={e} />
                        })}
                    </View>
                </View>
            </TouchableOpacity>
        );
    } catch (e) {
        setError(e)
        console.error(e)
    }
})

const MessageEmbed = observer(({embed: e}) => {
    if (e.type=="Website")
    return <View style={{backgroundColor: currentTheme.backgroundSecondary, padding: 8, borderRadius: 8}}>
        {e.site_name ? <Text style={{fontSize: 12, color: currentTheme.textSecondary}}>{e.site_name}</Text> : null}
        {e.title && 
            e.url ? <Pressable onPress={() => openUrl(e.url)}><Text style={{color: currentTheme.accentColor}}>{e.title}</Text></Pressable> : <Text>{e.title}</Text>}
        {e.description ? <Text>{e.description}</Text> : null}
        {(() => {
            if (e.image) {
                let width = e.image.width;
                let height = e.image.height;
                if (width > (Dimensions.get("screen").width - 82)) {
                    let sizeFactor = (Dimensions.get("screen").width - 82) / width;
                    width = width * sizeFactor
                    height = height * sizeFactor
                }
                return <Pressable onPress={() => app.openImage(e.image.url)}><Image source={{uri: client.proxyFile(e.image.url)}} style={{width: width, height: height, marginTop: 4, borderRadius: 3}} /></Pressable>
            }
        })()}
    </View>
    if (e.type == "Image") {
        // if (e.image?.size == "Large") {
        let width = e.width;
        let height = e.height;
        if (width > (Dimensions.get("screen").width - 75)) {
            let sizeFactor = (Dimensions.get("screen").width - 75) / width;
            width = width * sizeFactor
            height = height * sizeFactor
        }
        return <Pressable onPress={() => app.openImage(client.proxyFile(e.url))}><Image source={{uri: client.proxyFile(e.url)}} style={{width: width, height: height, marginBottom: 4, borderRadius: 3}} /></Pressable>
        // if (e.image?.size)
    }
    return <></>
})

export class ReplyMessage extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        if (typeof this.props.message?.content === "string") 
        return (
            <View style={{alignItems: 'center', flexDirection: 'row'}}>
                <Text style={{marginLeft: 15, marginRight: 15}}>↱</Text>
                {this.props.message ? 
                    this.props.message.author ? <>
                        <Avatar user={this.props.message.author} server={this.props.message.channel?.server} masquerade={this.props.message.generateMasqAvatarURL()} size={16} />
                        {this.props.mention ? <Text>@</Text> : null}
                        <Username user={this.props.message.author} server={this.props.message.channel?.server} masquerade={this.props.message.masquerade?.name} />
                        <Text style={styles.messageContentReply}>{this.props.message.content.split("\n").join(" ")}</Text>
                    </> : null
                : <Text style={styles.messageContentReply}>Message not loaded</Text>
                }
            </View>
        );
        return <></>
    }
}