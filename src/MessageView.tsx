import {useContext, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  View,
  // Dimensions,
  // Keyboard,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import {ErrorBoundary} from 'react-error-boundary';

import {Channel, Message as RevoltMessage} from 'revolt.js';

import {client, app} from './Generic';
import {MessageBox} from './components/MessageBox';
import {styles} from './Theme';
import {Button, Text} from './components/common/atoms';
import {Message} from './components/common/messaging';
import {LoadingScreen} from './components/views/LoadingScreen';
import {ThemeContext} from './lib/themes';
import {calculateGrouped, fetchMessages} from './lib/utils';

type DoubleTapState = {
  count: number;
  message: string;
};

function renderMessage(
  msg: RevoltMessage,
  onPress: (m: RevoltMessage) => void,
  messages?: RevoltMessage[],
) {
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
      `[NEWMESSAGEVIEW] Error calculating grouped status for ${msg._id}: ${err}`,
    );
  }
  return (
    <Message
      key={`message-${msg._id}`}
      message={msg}
      grouped={grouped}
      onPress={() => onPress(msg)}
      onUserPress={() => app.openProfile(msg.author, msg.channel?.server)}
      onUsernamePress={() => {
        const currentText = app.getMessageBoxInput();
        app.setMessageBoxInput(
          `${currentText}${currentText.length > 0 ? ' ' : ''}<@${
            msg.author?._id
          }>`,
        );
      }}
      onLongPress={async () => app.openMessage(msg)}
    />
  );
}

let doubleTapStatus: DoubleTapState = {
  count: 0,
  message: '',
};

function handleTap(message: RevoltMessage) {
  if (message._id === doubleTapStatus.message) {
    if (doubleTapStatus.count === 1) {
      if (app.settings.get('ui.messaging.doubleTapToReply')) {
        const existingReplies = [...app.getReplyingMessages()];
        if (
          existingReplies.filter(m => m.message._id === message._id).length > 0
        ) {
          doubleTapStatus = {count: 0, message: ''};
          return;
        }
        if (existingReplies.length >= 5) {
          doubleTapStatus = {count: 0, message: ''};
          return;
        }
        app.setReplyingMessages([
          ...existingReplies,
          {message: message, mentions: false},
        ]);
      }
      doubleTapStatus = {count: 0, message: ''};
    }
  } else {
    doubleTapStatus = {count: 1, message: message._id};
  }
}

function MessageViewErrorMessage({
  error,
  resetErrorBoundary,
}: {
  error: any;
  resetErrorBoundary: () => void;
}) {
  const {currentTheme} = useContext(ThemeContext);

  const errorMessage = `${error}`;

  console.error(`[MESSAGEVIEW] Uncaught error: ${errorMessage}`);
  return (
    <>
      <Text colour={currentTheme.error}>
        Error rendering messages: {errorMessage}
      </Text>
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
    const {currentTheme} = useContext(ThemeContext);

    const {t} = useTranslation();

    const [messages, setMessages] = useState([] as RevoltMessage[]);
    const [loading, setLoading] = useState(true);
    const [atEndOfPage, setAtEndOfPage] = useState(false);
    const [error, setError] = useState(null as any);

    const scrollViewRef = useRef<FlatList>(null);

    useEffect(() => {
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
            scrollViewRef.current?.scrollToEnd();
          }
        } catch (err) {
          console.log(
            `[NEWMESSAGEVIEW] Error pushing new message (${msg._id}): ${err}`,
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
    const onPress = (m: RevoltMessage) => {
      handleTap(m);
    };

    const renderItem = ({item}: {item: RevoltMessage}) => {
      return renderMessage(item, onPress, messages);
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
        channel.ack(channel.last_message_id ?? '01ANOMESSAGES', true);
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

    return (
      <ErrorBoundary fallbackRender={MessageViewErrorMessage}>
        {error ? (
          <Text colour={currentTheme.error}>
            Error rendering messages: {error.message ?? error}
          </Text>
        ) : loading ? (
          <LoadingScreen />
        ) : (
          <View key={'messageview-outer-container'} style={{flex: 1}}>
            <FlatList
              key={'messageview-scrollview'}
              keyExtractor={keyExtractor}
              data={messages}
              style={styles.messagesView}
              contentContainerStyle={{
                paddingBottom: Platform.OS === 'web' ? 0 : 20,
                flexGrow: 1,
                justifyContent: 'flex-end',
                flexDirection: 'column',
              }}
              ref={scrollViewRef}
              renderItem={renderItem}
              onScroll={onScroll}
            />
            {messages.length === 0 && (
              <View style={{padding: 16}}>
                <Text type={'h1'}>{t('app.messaging.no_messages')}</Text>
                <Text>{t('app.messaging.no_messages_body')}</Text>
              </View>
            )}
          </View>
        )}
        <MessageBox channel={channel} />
      </ErrorBoundary>
    );
  },
);
