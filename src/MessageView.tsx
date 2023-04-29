import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {autorun} from 'mobx';
import {observer} from 'mobx-react-lite';

import {ErrorBoundary} from 'react-error-boundary';

import {Channel, Message as RevoltMessage} from 'revolt.js';
import {decodeTime} from 'ulid';

import {
  client,
  app,
  setFunction,
  selectedRemark,
  randomizeRemark,
} from './Generic';
import {MessageBox} from './MessageBox';
import {styles, currentTheme} from './Theme';
import {Button, Text} from './components/common/atoms';
import {Message} from './components/common/messaging';
import {DEFAULT_MESSAGE_LOAD_COUNT} from './lib/consts';
import {calculateGrouped, fetchMessages} from './lib/utils';

let didUpdateFirstTime = false;

export class Messages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      queuedMessages: [],
      loading: true,
      forceUpdate: false,
      error: null,
      atLatestMessages: true,
    };
    this.renderMessage = this.renderMessage.bind(this);
    setFunction('pushToQueue', m => {
      console.log(
        `[MESSAGEVIEW] pushToQueue is handling ${m} (nonce: ${m.nonce})`,
      );
      m.rendered = (
        <Message
          key={m.nonce}
          message={m}
          grouped={this.state.queuedMessages.length > 0}
          queued={true}
        />
      );
      this.setState(prev => {
        return {queuedMessages: prev.queuedMessages.concat(m)};
      });
    });
  }
  // componentDidCatch(error, errorInfo) {
  //   this.setState({error});
  //   console.error(error);
  // }
  // TODO: should we try and fix this or just remove it? (relevant context: removing it doesn't seem to break anything? and we're currently moving to functional components, so this would need tweaking anyway)
  // shouldComponentUpdate(nextProps, nextState) {
  //   if (nextProps.rerender !== this.props.rerender) {
  //     console.log('rerender type 1');
  //     return true;
  //   }
  //   if (nextState.forceUpdate) {
  //     this.setState({forceUpdate: false});
  //     console.log('rerender type 2');
  //     return true;
  //   }
  //   if (nextState?.messages) {
  //     let res1 =
  //       nextState.messages[nextState.messages.length - 1]?.message._id !==
  //       this.state.messages[this.state.messages?.length - 1]?.message._id;
  //     let res2 = this.props.channel?._id !== nextProps.channel?._id;
  //     let res3 = !didUpdateFirstTime;
  //     let res4 = this.state.forceUpdate;
  //     console.log(
  //       res1,
  //       nextState.messages[nextState.messages.length - 1]?.message._id,
  //       this.state.messages[this.state.messages?.length - 1]?.message._id,
  //       res2,
  //       res3,
  //       res4,
  //     );
  //     let res = res1 || res2 || res3 || res4;
  //     console.log(`rerender type 3: ${res}`);
  //     return res;
  //   }
  //   console.log('rerender type 4');
  //   return true;
  // }
  componentDidMount() {
    console.log('[MESSAGERENDERER] Mounted component');
    client.on('message', async message => {
      console.log(`[MESSAGERENDERER] New message: ${message._id}`);
      if (this.state.atLatestMessages && this.props.channel) {
        // !this.props.loading &&
        if (
          this.props.channel._id === message.channel?._id &&
          this.state.messages?.length > 0
        ) {
          console.log(
            `[MESSAGERENDERER] Message ${message._id} is in current channel`,
          );
          try {
            this.setState(prev => {
              let newMessages = prev.messages;
              if (newMessages.length >= (!this.state.bottomOfPage ? 150 : 50)) {
                newMessages = newMessages.slice(
                  newMessages.length - 50,
                  newMessages.length,
                );
              }
              let grouped =
                newMessages.length > 0 &&
                calculateGrouped(
                  newMessages[newMessages.length - 1].message,
                  message,
                );
              console.log(
                `[MESSAGERENDERER] Pushing new message ${message._id}`,
              );
              console.log(
                `[MESSAGERENDERER] Message list length: ${newMessages.length}`,
              );
              newMessages.push({
                message,
                grouped,
                rendered: this.renderMessage({grouped, message}),
              });
              console.log(
                `[MESSAGERENDERER] New message list length: ${newMessages.length}`,
              );
              return {
                messages: newMessages,
                queuedMessages: this.state.queuedMessages.filter(
                  m => m.nonce !== message.nonce,
                ),
              };
            });
          } catch (err) {
            console.log(
              `[MESSAGERENDERER] Failed to push message (${message._id}): ${err}`,
            );
          }
        }
      }
    });
    client.on('message/delete', async id => {
      if (this.props.channel) {
        this.setState(prev => {
          if (prev.messages.filter(m => m.message._id === id).length > 0) {
            return {
              messages: prev.messages.filter(m => m.message._id !== id),
              forceUpdate: true,
            };
          }
          return {};
        });
      }
    });
    autorun(async () => {
      if (
        client.user?.online &&
        this.props.channel &&
        app.settings.get('app.refetchOnReconnect')
      ) {
        this.setState({loading: true, messages: []});
        await this.fetchMessages();
        this.setState({loading: false});
      }
    });
    didUpdateFirstTime = false;
    this.componentDidUpdate(this.state);
  }
  async componentDidUpdate(prev) {
    if (
      this.props.channel &&
      (!didUpdateFirstTime || prev.channel._id !== this.props.channel._id)
    ) {
      didUpdateFirstTime = true;
      randomizeRemark();
      this.setState({loading: true, messages: [], queuedMessages: []});
      await this.fetchMessages();
    }
  }
  async fetchMessages(input = {}) {
    console.log(
      `[MESSAGEVIEW] Fetching messages for ${this.props.channel._id}...`,
    );
    let params = {
      limit: input.before
        ? DEFAULT_MESSAGE_LOAD_COUNT / 2
        : DEFAULT_MESSAGE_LOAD_COUNT,
    };
    params[input.type] = input.id;
    // if (input.type == "after") {
    //     params.sort = "Oldest"
    // }
    this.props.channel.fetchMessagesWithUsers(params).then(res => {
      console.log(
        `[MESSAGEVIEW] Finished fetching messages for ${this.props.channel._id}`,
      );
      let oldMessages = this.state.messages;
      if (input.type === 'before') {
        oldMessages = oldMessages.slice(0, DEFAULT_MESSAGE_LOAD_COUNT / 2 - 1);
      } else if (input.type === 'after') {
        oldMessages = oldMessages.slice(
          DEFAULT_MESSAGE_LOAD_COUNT / 2 - 1,
          DEFAULT_MESSAGE_LOAD_COUNT - 1,
        );
      }
      let messages = res.messages.reverse().map((message, i) => {
        try {
          let time = decodeTime(message._id);
          // let grouped = ((lastAuthor == message.author?._id) && !(message.reply_ids && message.reply_ids.length > 0) && (lastTime && time.diff(lastTime, "minute") < 5))
          let grouped =
            i !== 0 && calculateGrouped(res.messages[i - 1], message);
          let out = {
            grouped,
            message: message,
            rendered: this.renderMessage({grouped, message}),
          };
          // lastAuthor = (message.author ? message.author._id : lastAuthor)
          // lastTime = time
          return out;
        } catch (e) {
          console.error(e);
        }
      });
      let result =
        input.type === 'before'
          ? messages.concat(oldMessages)
          : input.type === 'after'
          ? oldMessages.concat(messages)
          : messages;
      this.setState({
        messages: result,
        loading: false,
        atLatestMessages: true,
        // atLatestMessages: input.type != "before" && this.props.channel.last_message_id == result[result.length - 1]?._id
      });
    });
  }
  renderMessage(m) {
    return (
      <Message
        key={m.message._id}
        message={m.message}
        grouped={m.grouped}
        queued={m.queued}
        onLongPress={() => this.props.onLongPress(m.message)}
        onUserPress={() =>
          app.openProfile(m.message.author, this.props.channel?.server)
        }
        onUsernamePress={() => this.props.onUsernamePress(m.message)}
      />
    );
  }
  render() {
    if (this.state.error) {
      return (
        <Text color={'#ff6666'}>
          Error rendering message: {this.state.error.message}
        </Text>
      );
    }
    return this.state.loading ? (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={styles.loadingHeader}>Loading...</Text>
        <Text style={styles.remark}>{selectedRemark || null}</Text>
      </View>
    ) : (
      <View style={{flex: 1}}>
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
                        e.nativeEvent.layoutMeasurement.height))
                    }}
                onLayout={() => {if (this.state.bottomOfPage) {this.scrollView.scrollToOffset({offset: 0, animated: false})}}}
                onContentSizeChange={() => {if (this.state.bottomOfPage) {this.scrollView.scrollToOffset({offset: 0, animated: true})}}}
                style={styles.messagesView} /> */}
        <ScrollView
          style={styles.messagesView}
          ref={ref => {
            this.scrollView = ref;
          }}
          onScroll={e => {
            // FIXME: let the user go forward too
            let bottomOfPage =
              e.nativeEvent.contentOffset.y >=
              e.nativeEvent.contentSize.height -
                e.nativeEvent.layoutMeasurement.height;
            // console.log(
            //   bottomOfPage,
            //   e.nativeEvent.contentOffset.y,
            //   e.nativeEvent.contentSize.height,
            //   e.nativeEvent.layoutMeasurement.height,
            // );
            if (app.settings.get('ui.messaging.experimentalScrolling')) {
              if (e.nativeEvent.contentOffset.y === 0) {
                this.fetchMessages({
                  type: 'before',
                  id: this.state.messages[0].message._id,
                });
              }
              if (!this.state.atLatestMessages && bottomOfPage) {
                this.fetchMessages({
                  type: 'after',
                  id: this.state.messages[this.state.messages.length - 1]
                    .message._id,
                });
              }
              if (bottomOfPage && this.props.channel?.unread) {
                this.props.channel.ack(this.props.channel.last_message_id);
              }
              this.setState({
                bottomOfPage,
              });
            }
          }}
          onLayout={() => {
            if (this.state.bottomOfPage) {
              this.scrollView.scrollToEnd({animated: false});
            }
          }}
          onContentSizeChange={() => {
            if (this.state.bottomOfPage) {
              this.scrollView.scrollToEnd({animated: true});
            }
          }}>
          {this.state.messages.map(m => m.rendered)}
          {this.state.queuedMessages.map(m => m.rendered)}
          <View style={{marginTop: 15}} />
        </ScrollView>
        {!this.state.atLatestMessages ? (
          <TouchableOpacity
            style={{
              height: 32,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: currentTheme.accentColor,
            }}
            onPress={() => this.fetchMessages()}>
            <Text colour={currentTheme.accentColorForeground}>
              Go to latest messages
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
}

function renderMessage(msg: RevoltMessage, messages?: RevoltMessage[]) {
  let grouped: boolean;
  try {
    grouped = messages
      ? messages.indexOf(msg) !== -1
        ? calculateGrouped(msg, messages[messages.indexOf(msg) - 1])
        : false
      : false;
  } catch (err) {
    grouped = false;
    console.log(
      `[NEWMESSAGEVIEW] Error calculating grouped status for ${msg}: ${err}`,
    );
  }
  return (
    <Message
      key={`message-${msg._id}`}
      message={msg}
      grouped={grouped}
      onUserPress={() => app.openProfile(msg.author, msg.channel?.server)}
      onLongPress={async () => app.openMessage(msg)}
      queued={false}
    />
  );
}

function MessageViewErrorMessage({
  error,
  resetErrorBoundary,
}: {
  error: any;
  resetErrorBoundary: Function;
}) {
  // console.error(`[MESSAGEVIEW] Uncaught error: ${error}`);
  return (
    <>
      <Text color={'#ff6666'}>Error rendering messages: {error}</Text>
      <Button
        onPress={() => {
          resetErrorBoundary();
        }}>
        <Text>Retry</Text>
      </Button>
    </>
  );
}

export const NewMessageView = observer(
  ({
    channel,
    handledMessages,
  }: {
    channel: Channel;
    handledMessages: string[];
  }) => {
    console.log(`[NEWMESSAGEVIEW] Creating message view for ${channel._id}...`);
    const [messages, setMessages] = React.useState([] as RevoltMessage[]);
    const [loading, setLoading] = React.useState(true);
    const [atEndOfPage, setAtEndOfPage] = React.useState(false);
    const [error, setError] = React.useState(null as any);
    let scrollView: FlatList | null;
    React.useEffect(() => {
      console.log(`[NEWMESSAGEVIEW] Fetching messages for ${channel._id}...`);
      async function getMessages() {
        const msgs = await fetchMessages(channel, {}, []);
        console.log(
          `[NEWMESSAGEVIEW] Pushing ${msgs.length} initial message(s) for ${channel._id}...`,
        );
        setMessages(msgs);
        setLoading(false);
      }
      try {
        getMessages();
      } catch (err) {
        console.log(
          `[NEWMESSAGEVIEW] Error fetching initial messages for ${channel._id}: ${err}`,
        );
        setError(err);
      }
    }, [channel]);

    client.on('message', async msg => {
      // set this before anything happens that might change it
      const shouldScroll = atEndOfPage;
      if (msg.channel === channel && !handledMessages.includes(msg._id)) {
        try {
          console.log(atEndOfPage);
          handledMessages.push(msg._id);
          console.log(
            `[NEWMESSAGEVIEW] New message ${msg._id} is in current channel; pushing it to the message list... (debug: will scroll = ${atEndOfPage})`,
          );
          setMessages(oldMessages => [...oldMessages, msg]);
          if (shouldScroll) {
            scrollView?.scrollToEnd();
          }
        } catch (err) {
          console.log(
            `[NEWMESSAGEVIEW] Error pusshing new message (${msg._id}): ${err}`,
          );
          setError(err);
        }
      }
    });

    // set functions here so they don't get recreated
    const renderItem = ({item}: {item: RevoltMessage}) => {
      return renderMessage(item, messages);
    };

    const keyExtractor = (item: RevoltMessage) => {
      return `message-${item._id}`;
    };

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const position = e.nativeEvent.contentOffset.y;
      const viewHeight =
        e.nativeEvent.contentSize.height -
        e.nativeEvent.layoutMeasurement.height;
      // account for decimal weirdness by assuming that if the position is this close to the height that the user is at the bottom
      if (viewHeight - position <= 1) {
        console.log('bonk!');
        setAtEndOfPage(true);
      } else {
        if (atEndOfPage) {
          setAtEndOfPage(false);
        }
      }
      if (e.nativeEvent.contentOffset.y <= 0) {
        console.log('bonk2!');
        fetchMessages(
          channel,
          {
            type: 'before',
            id: messages[0]._id,
          },
          messages,
        ).then(newMsgs => {
          setMessages(newMsgs);
        });
      }
      // console.log(
      //   e.nativeEvent.contentOffset.y,
      //   e.nativeEvent.contentSize.height -
      //     e.nativeEvent.layoutMeasurement.height,
      // );
    };

    const ref = (view: FlatList) => {
      scrollView = view;
    };

    return (
      <ErrorBoundary fallbackRender={MessageViewErrorMessage}>
        {error ? (
          <Text color={'#ff6666'}>
            Error rendering messages: {error.message ?? error}
          </Text>
        ) : loading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={styles.loadingHeader}>Loading...</Text>
            <Text style={styles.remark}>{selectedRemark || null}</Text>
          </View>
        ) : (
          <View key={'messageview-outer-container'} style={{flex: 1}}>
            <FlatList
              key={'messageview-scrollview'}
              keyExtractor={keyExtractor}
              data={messages}
              style={styles.messagesView}
              contentContainerStyle={{paddingBottom: 20}}
              ref={ref}
              renderItem={renderItem}
              onScroll={onScroll}
            />
          </View>
        )}
        <MessageBox channel={channel} />
      </ErrorBoundary>
    );
  },
);
