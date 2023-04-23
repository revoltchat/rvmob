import React from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {ErrorBoundary} from 'react-error-boundary';

import {Channel, Message} from 'revolt.js';

import {app, ChannelIcon, client} from '../../Generic';
import {Messages, NewMessageView} from '../../MessageView';
import {MessageBox} from '../../MessageBox';
import {styles} from '../../Theme';
import {FriendsPage} from '../pages/FriendsPage';
import {HomePage} from '../pages/HomePage';
import {ChannelHeader} from '../navigation/ChannelHeader';
import {Button, Text} from '../common/atoms';

function MessageViewErrorMessage({
  error,
  resetErrorBoundary,
}: {
  error: any;
  resetErrorBoundary: Function;
}) {
  console.error(`[MESSAGEVIEW] Uncaught error: ${error}`);
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

type CVChannel = Channel | 'friends' | 'debug' | null;

export const ChannelView = observer(
  ({state, channel}: {state: any; channel: CVChannel}) => {
    const [replacementChannel, setReplacementChannel] = React.useState(
      undefined as Channel | undefined,
    );
    const handledMessages = [] as Message[];
    React.useEffect(() => {
      async function getChannel() {
        const type = 'spam';
        const c =
          type === 'spam'
            ? client.channels.get('01FBCT2PXQC0SSH6GD3V1BEHRP')
            : type === 'lounge'
            ? client.channels.get('01F7ZSBSFHCAAJQ92ZGTY67HMN')
            : await client.user?.openDM();
        setReplacementChannel(c);
      }
      getChannel();
    });
    console.log(
      `[CHANNELVIEW] Rendering channel view for ${
        channel instanceof Channel ? channel._id : channel
      }...`,
    );
    return (
      <View style={styles.mainView}>
        {channel ? (
          channel === 'friends' ? (
            <FriendsPage />
          ) : channel === 'debug' ? (
            <View style={styles.flex}>
              <ChannelHeader>
                <View style={styles.iconContainer}>
                  <ChannelIcon channel={{type: 'special', channel: 'Debug'}} />
                </View>
                <Text style={styles.channelName}>
                  Debug Menu (New MessageView)
                </Text>
              </ChannelHeader>
              <NewMessageView
                channel={replacementChannel!}
                handledMessages={handledMessages}
              />
            </View>
          ) : (
            <View style={styles.flex}>
              <ChannelHeader>
                <View style={styles.iconContainer}>
                  <ChannelIcon
                    channel={
                      channel.channel_type === 'SavedMessages'
                        ? {type: 'special', channel: 'Saved Notes'}
                        : {
                            type: 'channel',
                            channel: channel,
                          }
                    }
                  />
                </View>
                <Text style={styles.channelName}>
                  {channel.channel_type === 'DirectMessage'
                    ? channel.recipient?.username
                    : channel.channel_type === 'SavedMessages'
                    ? 'Saved Notes'
                    : channel.name}
                </Text>
              </ChannelHeader>
              {channel?.channel_type === 'VoiceChannel' ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 30,
                  }}>
                  <Text style={styles.loadingHeader}>
                    Voice channels aren't supported in RVMob yet!
                  </Text>
                  <Text style={styles.remark}>
                    In the meantime, you can join them via the web app or Revolt
                    Desktop.
                  </Text>
                </View>
              ) : !channel?.nsfw ||
                app.settings.get('ui.messaging.showNSFWContent') ? (
                <ErrorBoundary fallbackRender={MessageViewErrorMessage}>
                  <Messages
                    channel={channel}
                    onLongPress={async m => {
                      app.openMessage(m);
                    }}
                    onUserPress={m => {
                      app.openProfile(m.author, channel.server);
                    }}
                    onImagePress={a => {
                      state.setState({imageViewerImage: a});
                    }}
                    rerender={state.state.rerender}
                    onUsernamePress={m =>
                      state.setState({
                        currentText:
                          state.state.currentText + '<@' + m.author?._id + '>',
                      })
                    }
                  />
                  <MessageBox channel={channel} />
                </ErrorBoundary>
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 25,
                  }}>
                  <Text style={{fontWeight: 'bold', fontSize: 28}}>
                    Hold it!
                  </Text>
                  <Text style={{textAlign: 'center', fontSize: 16}}>
                    This is an NSFW channel. Are you sure you want to enter?
                    {'\n'}
                    (This can be reversed in Settings.)
                  </Text>
                  <Button
                    onPress={() => {
                      app.settings.set('ui.messaging.showNSFWContent', true);
                      state.setState({});
                    }}>
                    <Text style={styles.header}>
                      I am 18 or older and wish to enter
                    </Text>
                  </Button>
                </View>
              )}
            </View>
          )
        ) : (
          <HomePage />
        )}
      </View>
    );
  },
);
