import {useContext, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {ErrorBoundary} from 'react-error-boundary';
import {observer} from 'mobx-react-lite';

import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import type {Channel, Message} from 'revolt.js';

import {app} from '@clerotri/Generic';
import {Messages} from '@clerotri/LegacyMessageView';
import {MessageView} from '@clerotri/MessageView';
import {MessageBox} from '@clerotri/components/MessageBox';
import {styles} from '@clerotri/Theme';
import {Button, Text} from '@clerotri/components/common/atoms';
import {ChannelIcon} from '@clerotri/components/navigation/ChannelIcon';
import {ChannelHeader} from '@clerotri/components/navigation/ChannelHeader';
import {SpecialChannelIcon} from '@clerotri/components/navigation/SpecialChannelIcon';
import {FriendsPage} from '@clerotri/components/pages/FriendsPage';
import {HomePage} from '@clerotri/components/pages/HomePage';
import {VoiceChannel} from '@clerotri/components/pages/VoiceChannel';
import {ChannelContext} from '@clerotri/lib/state';
import {ThemeContext} from '@clerotri/lib/themes';
import {SpecialChannel} from '@clerotri/lib/types';
import {DiscoverPage} from '@clerotri/pages/discover/DiscoverPage';

function MessageViewErrorMessage({
  error,
  resetErrorBoundary,
}: {
  error: any;
  resetErrorBoundary: Function;
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

const SpecialChannelViews = observer(({channel}: {channel: SpecialChannel}) => {
  return channel === 'friends' ? (
    <FriendsPage />
  ) : channel === 'discover' ? (
    <DiscoverPage />
  ) : channel === 'debug' ? (
    <View style={styles.flex}>
      <ChannelHeader
        icon={<SpecialChannelIcon channel={'Debug'} />}
        name={'Debug Menu'}
      />
      <Text type={'h1'}>howdy</Text>
    </View>
  ) : (
    <HomePage />
  );
});

const RegularChannelView = observer(({channel}: {channel: Channel}) => {
  const {currentTheme} = useContext(ThemeContext);

  const [renderCount, rerender] = useState(0);

  return (
    <View style={styles.flex}>
      <ChannelHeader
        icon={
          channel.channel_type === 'SavedMessages' ? (
            <SpecialChannelIcon channel={'Saved Notes'} />
          ) : (
            <ChannelIcon channel={channel} />
          )
        }
        name={
          channel.channel_type === 'DirectMessage'
            ? channel.recipient?.username
            : channel.channel_type === 'SavedMessages'
              ? 'Saved Notes'
              : (channel.name ?? '')
        }>
        {channel.channel_type !== 'VoiceChannel' ? (
          <View style={{marginEnd: 16}}>
            <TouchableOpacity
              onPress={() => app.openPinnedMessagesMenu(channel)}>
              <MaterialCommunityIcon
                name="pin"
                size={24}
                color={currentTheme.foregroundPrimary}
              />
            </TouchableOpacity>
          </View>
        ) : null}
        {channel.channel_type === 'Group' || channel.server ? (
          <View style={{marginEnd: 16}}>
            <TouchableOpacity
              onPress={() => app.openChannelContextMenu(channel)}>
              <MaterialIcon
                name="info"
                size={24}
                color={currentTheme.foregroundPrimary}
              />
            </TouchableOpacity>
          </View>
        ) : null}
        {channel.channel_type === 'Group' ? (
          <View style={{marginEnd: 16}}>
            <TouchableOpacity
              onPress={() => {
                app.openMemberList(channel);
              }}>
              <MaterialIcon
                name="group"
                size={24}
                color={currentTheme.foregroundPrimary}
              />
            </TouchableOpacity>
          </View>
        ) : null}
      </ChannelHeader>
      {channel?.channel_type === 'VoiceChannel' ? (
        <VoiceChannel />
      ) : !channel?.nsfw || app.settings.get('ui.messaging.showNSFWContent') ? (
        <ErrorBoundary fallbackRender={MessageViewErrorMessage}>
          {app.settings.get('ui.messaging.useNewMessageView') ? (
            <MessageView channel={channel} />
          ) : (
            <>
              <Messages
                // @ts-expect-error the legacy message view is going to be removed, not going to fix this
                channel={channel}
                onLongPress={(m: Message) => {
                  app.openMessage(m);
                }}
                onUserPress={(m: Message) => {
                  app.openProfile(m.author, channel.server);
                }}
                onUsernamePress={(m: Message) => {
                  const currentText = app.getMessageBoxInput();
                  app.setMessageBoxInput(
                    `${currentText}${currentText.length > 0 ? ' ' : ''}<@${
                      m.author?._id
                    }>`,
                  );
                }}
              />
              <MessageBox channel={channel} />
            </>
          )}
        </ErrorBoundary>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 25,
          }}>
          <Text style={{fontWeight: 'bold', fontSize: 28}}>Hold it!</Text>
          <Text style={{textAlign: 'center', fontSize: 16}}>
            This is an NSFW channel. Are you sure you want to enter?
            {'\n'}
            (This can be reversed in Settings.)
          </Text>
          <Button
            onPress={async () => {
              app.settings.set('ui.messaging.showNSFWContent', true);
              rerender(renderCount + 1);
            }}>
            <Text style={styles.buttonText}>
              I am 18 or older and wish to enter
            </Text>
          </Button>
        </View>
      )}
    </View>
  );
});

export const ChannelView = observer(() => {
  const {currentChannel} = useContext(ChannelContext);
  console.log(
    `[CHANNELVIEW] Rendering channel view for ${
      currentChannel
        ? typeof currentChannel !== 'string'
          ? currentChannel._id
          : currentChannel
        : currentChannel
    }...`,
  );

  return (
    <View style={localStyles.mainView}>
      {!currentChannel || typeof currentChannel === 'string' ? (
        <SpecialChannelViews channel={currentChannel} />
      ) : (
        <RegularChannelView channel={currentChannel} />
      )}
    </View>
  );
});

const localStyles = StyleSheet.create({
  mainView: {
    flex: 1,
  },
});
