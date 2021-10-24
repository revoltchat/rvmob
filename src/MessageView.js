import { client, Text, MarkdownView, app } from './Generic';
import { View, FlatList, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import { Avatar, Username } from './Profile'
import React from 'react';
import { observer } from 'mobx-react-lite';
import { styles, currentTheme } from './Theme';
import dayjs from 'dayjs'
import { decodeTime } from 'ulid'
import FastImage from 'react-native-fast-image';
const Image = FastImage;
let didUpdateFirstTime = false;

export class Messages extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            loading: false,
            forceUpdate: false,
            newMessageCount: 0,
            error: null
        };
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
    		if (this.props.channel) { // !this.props.loading && 
    			if (this.props.channel._id == message.channel._id && this.state.messages?.length > 0) {
    	    		this.setState((prev) => {
                        let newMessages = prev.messages
                        if (newMessages.length >= (!this.state.bottomOfPage ? 150 : 50)) {
                            newMessages = newMessages.slice(0, 50)
                        }
                        newMessages.unshift({message, grouped: (newMessages[0].message.author?._id == message.author?._id) && !(message.reply_ids && message.reply_ids.length > 0)})
                        return {messages: newMessages, newMessageCount: !this.state.bottomOfPage ? (this.state.newMessageCount + 1) || 1 : 0}
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
        didUpdateFirstTime = false
        this.componentDidUpdate(this.state)
    }
    componentDidUpdate(prev) {
        if (this.props.channel && (!didUpdateFirstTime || prev.channel._id != this.props.channel._id)) {
            didUpdateFirstTime = true
            this.setState({loading: true})
            requestAnimationFrame(() => {
                console.log("fetch messages")
                let lastAuthor = "";
                let lastTime = null;
                this.props.channel.fetchMessagesWithUsers({limit: 50}).then((res) => {console.log("done fetching"); this.setState({messages: res.messages.reverse().map((message) => {
                    let time = dayjs(decodeTime(message._id))
                    let res = {grouped: ((lastAuthor == message.author?._id) && !(message.reply_ids && message.reply_ids.length > 0) && (lastTime && time.diff(lastTime, "minute") < 5)), message: message}
                    lastAuthor = (message.author ? message.author._id : lastAuthor)
                    lastTime = time
                    return res
                }).reverse(), loading: false, newMessageCount: 0})});
            })
        }
    }
    render() {
        if (this.state.error) return <Text style={{color: "#ff6666"}}>Error rendering: {this.state.error.message}</Text>
        return (
            this.state.loading ? 
            <Text>Loading...</Text>
            :
            <View style={{flex: 1}}>
                {this.state.newMessageCount > 0 ? <Text style={{height: 32, padding: 6, backgroundColor: currentTheme.accentColor, color: currentTheme.accentColorForeground}}>{this.state.newMessageCount} new messages...</Text> : null}
                <FlatList data={this.state.messages} 
                removeClippedSubviews={false}
                disableVirtualization={true}
                maxToRenderPerBatch={50}
                initialNumToRender={50}
                inverted={true}
                windowSize={51}
                keyExtractor={(item) => {return item.message._id}}
                renderItem={m => 
                    <Message key={m.item.message._id} 
                    message={m.item.message} 
                    grouped={m.item.grouped} 
                    onLongPress={() => this.props.onLongPress(m.item.message)} 
                    onUserPress={() => app.openProfile(m.item.message.author, this.props.channel?.server)} 
                    onImagePress={(a) => this.props.onImagePress(a)} 
                    onUsernamePress={() => this.props.onUsernamePress(m.item.message)}
                    />
                } 
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
                style={styles.messagesView} />
            </View>
        )
    }
}

export const Message = observer((props) => { 
    let [error, setError] = React.useState(null)
    if (error) 
    return (
        <View>
            <Text style={{color: "#ff4444"}}>Failed to render message:{'\n'}{error?.message}</Text>
        </View>
    )
    try {
        return (
            <TouchableOpacity activeOpacity={0.8} delayLongPress={750} onLongPress={props.onLongPress}>
                {(props.message.reply_ids !== null) ? <View style={styles.repliedMessagePreviews}>{props.message.reply_ids.map(id => <ReplyMessage key={id} message={client.messages.get(id)} />)}</View> : null}
                <View style={props.grouped ? styles.messageGrouped : styles.message}>
                    {(props.message.author && !props.grouped) ? <Pressable onPress={() => props.onUserPress()}><Avatar user={props.message.author} server={props.message.channel?.server} size={35} /></Pressable> : null}
                    <View style={styles.messageInner}>
                        {(props.grouped && props.message.edited) ? <Text style={{fontSize: 12, color: currentTheme.textSecondary, position: 'relative', right: 47, marginBottom: -16}}> (edited)</Text> : null}
                        {(props.message.author && !props.grouped) ? <View style={{flexDirection: 'row'}}><Pressable onPress={props.onUsernamePress}><Username user={props.message.author} server={props.message.channel?.server} /></Pressable><Text style={styles.timestamp}> {dayjs(decodeTime(props.message._id)).format('YYYY-MM-DD hh:mm:ss A')}</Text>{props.message.edited && <Text style={{fontSize: 12, color: currentTheme.textSecondary, position: 'relative', top: 2, left: 2}}> (edited)</Text>}</View> : null}
                        <MarkdownView>{props.message.content}</MarkdownView>
                        {props.message.attachments?.map((a) => {
                            if (a.metadata?.type == "Image") {
                                let width = a.metadata.width;
                                let height = a.metadata.height;
                                if (width > (Dimensions.get("screen").width - 75)) {
                                    let sizeFactor = (Dimensions.get("screen").width - 75) / width;
                                    width = width * sizeFactor
                                    height = height * sizeFactor
                                }
                                return <Pressable onPress={() => props.onImagePress(a)}><Image source={{uri: client.generateFileURL(a)}} resizeMode={FastImage.resizeMode.contain} style={{width: width, height: height, marginBottom: 4, borderRadius: 3}} /></Pressable>
                            } else {
                                return <View style={{padding: 15, borderRadius: 6, backgroundColor: currentTheme.backgroundSecondary, marginBottom: 15}}><Text>{a.filename}</Text><Text>{a.size.toLocaleString()} bytes</Text></View>
                            }
                        })}
                        {props.message.embeds?.map((e) => {
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
                                        return <Pressable onPress={() => props.onImagePress(e.image.url)}><Image source={{uri: client.proxyFile(e.image.url)}} style={{width: width, height: height, marginTop: 4, borderRadius: 3}} /></Pressable>
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
                                return <Image source={{uri: client.proxyFile(e.url)}} style={{width: width, height: height, marginBottom: 4, borderRadius: 3}} />
                                // if (e.image?.size)
                            }
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

export class ReplyMessage extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View style={{alignItems: 'center', flexDirection: 'row'}}>
                <Text style={{marginLeft: 15, marginRight: 15}}>↱</Text>
                {this.props.message ? 
                    this.props.message.author ? <>
                        <Avatar user={this.props.message.author} server={this.props.message.channel?.server} size={16} />
                        <Username user={this.props.message.author} server={this.props.message.channel?.server} />
                        <Text style={styles.messageContentReply}>{this.props.message.content.split("\n").join(" ")}</Text>
                    </> : null
                : <Text style={styles.messageContentReply}>Message not loaded</Text>
                }
            </View>
        );
    }
}