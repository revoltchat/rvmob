import React from 'react';
import {
  View,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  // Dimensions,
  // Keyboard,
} from 'react-native';
import {observer} from 'mobx-react-lite';

import {ErrorBoundary} from 'react-error-boundary';

import {Channel, Message as RevoltMessage} from 'revolt.js';

import {client, app, selectedRemark} from './Generic';
import {MessageBox} from './MessageBox';
import {styles} from './Theme';
import {Button, Text} from './components/common/atoms';
import {Message} from './components/common/messaging';
import {calculateGrouped, fetchMessages} from './lib/utils';

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

    client.on('message/delete', async (id, msg) => {
      if (msg?.channel?._id === channel._id) {
        setMessages(messages.filter(m => m._id !== id));
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
              contentContainerStyle={{
                paddingBottom: 20,
                flexGrow: 1,
                justifyContent: 'flex-end',
                flexDirection: 'column',
              }}
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
