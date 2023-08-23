import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  // Dimensions,
  // Keyboard,
} from 'react-native';
import {autorun} from 'mobx';

import {Message as RevoltMessage} from 'revolt.js';

import {
  client,
  app,
  setFunction,
  selectedRemark,
  randomizeRemark,
} from './Generic';
import {styles, currentTheme} from './Theme';
import {Text} from './components/common/atoms';
import {Message} from './components/common/messaging';
import {DEFAULT_MESSAGE_LOAD_COUNT} from './lib/consts';
import {calculateGrouped} from './lib/utils';

let didUpdateFirstTime = false;

export class Messages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      firstLoaded: true,
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
    // Keyboard.addListener('keyboardDidShow', () => {
    //   this.state.scrollView?.scrollToEnd({animated: false});
    // });
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
            // this.scrollView.scrollToEnd({animated: false});
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
          let grouped =
            i !== 0 && calculateGrouped(res.messages[i - 1], message);
          let out = {
            grouped,
            message: message,
            rendered: this.renderMessage({grouped, message}),
          };
          return out;
        } catch (e) {
          console.error(e);
        }
      });
      let result: Array<RevoltMessage> =
        input.type === 'before'
          ? messages.concat(oldMessages)
          : input.type === 'after'
          ? oldMessages.concat(messages)
          : messages;
      // const lastResultID = result[result.length - 1]._id;
      // console.log(`result last message id: ${lastResultID}`);
      this.setState({
        messages: result,
        loading: false,
        firstLoaded: true,
        atLatestMessages: true,
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
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-end',
            flexDirection: 'column',
          }}
          style={styles.messagesView}
          ref={ref => {
            this.scrollView = ref;
          }}
          onLayout={e => {
            this.setState({firstLoaded: false});
            if (this.state.bottomOfPage) {
              this.scrollView.scrollToEnd({animated: false});
            }
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
                this.props.channel.ack(
                  this.props.channel.last_message_id,
                  true,
                );
              }
              this.setState({
                bottomOfPage,
              });
            }
          }}
          // onContentSizeChange={e => {
          //   if (this.state.firstLoaded) {
          //     this.scrollView.scrollToEnd({animated: false});
          //   }
          // }}
        >
          {/* <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              marginBottom: 16,
              marginTop: 16,
            }}>
            <Text style={{...styles.loadingHeader, textAlign: 'left'}}>
              {this.props.channel?.channel_type === 'DirectMessage'
                ? '@' + this.props.channel?.recipient?.username
                : this.props.channel?.channel_type === 'SavedMessages'
                ? 'Saved Notes'
                : '#' + this.props.channel?.name}
            </Text>
            <Text style={styles.beginningRemark}>
              This is the start of your conversation.
            </Text>
          </View> */}
          <View style={{marginBottom: 15, justifyContent: 'flex-end'}}>
            {this.state.messages.map(m => m.rendered)}
            {this.state.queuedMessages.map(m => m.rendered)}
          </View>
        </ScrollView>
        {!this.state.atLatestMessages ? (
          <TouchableOpacity
            style={{
              height: 32,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: currentTheme.accentColor,
            }}
            onPress={() => {
              this.fetchMessages();
              this.scrollView.scrollToEnd({animated: true});
            }}>
            <Text colour={currentTheme.accentColorForeground}>
              Go to latest messages
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
}
