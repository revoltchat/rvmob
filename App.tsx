import 'react-native-get-random-values'; // react native moment

import {Component as ReactComponent, useState} from 'react';
import {
  View,
  StatusBar,
  StatusBarStyle,
  useWindowDimensions,
} from 'react-native';
import {ErrorBoundary} from 'react-error-boundary';
import {withTranslation} from 'react-i18next';

// import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import {useBackHandler} from '@react-native-community/hooks';
import {Drawer} from 'react-native-drawer-layout';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {Channel, Server} from 'revolt.js';

import {currentTheme, styles} from './src/Theme';
import {client, app, selectedRemark, randomizeRemark} from './src/Generic';
import {setFunction} from './src/Generic';
import {SideMenu} from './src/SideMenu';
import {Modals} from './src/Modals';
import {NetworkIndicator} from './src/components/NetworkIndicator';
import {Button, Text} from './src/components/common/atoms';
import {LoginPage} from '@rvmob/pages/auth/LoginPage';
import {LoginSettingsPage} from '@rvmob/pages/auth/LoginSettingsPage';
import {ChannelView} from './src/components/views/ChannelView';
import {Notification} from './src/components/Notification';
import {loginWithSavedToken} from './src/lib/auth';
import {
  createChannel,
  sendNotifeeNotification,
  setUpNotifeeListener,
} from '@rvmob/lib/notifications';
import {sleep} from '@rvmob/lib/utils';

async function openLastChannel() {
  try {
    const lastServer = await AsyncStorage.getItem('lastServer');
    if (lastServer) {
      app.openServer(client.servers.get(lastServer));
      try {
        const channelData = await AsyncStorage.getItem('serverLastChannels');
        let serverLastChannels = JSON.parse(channelData || '{}') || {};
        let lastChannel = serverLastChannels[lastServer];
        if (lastChannel) {
          let fetchedLastChannel = client.channels.get(lastChannel);
          if (fetchedLastChannel) {
            app.openChannel(fetchedLastChannel);
          }
        }
      } catch (channelErr) {
        console.log(`[APP] Error getting last channel: ${channelErr}`);
      }
    }
  } catch (serverErr) {
    console.log(`[APP] Error getting last server: ${serverErr}`);
  }
}

function checkLastVersion() {
  const lastVersion = app.settings.get('app.lastVersion');
  console.log(app.version, lastVersion);
  if (!lastVersion || lastVersion === '') {
    console.log(
      `[APP] lastVersion is null (${lastVersion}), setting to app.version (${app.version})`,
    );
    app.settings.set('app.lastVersion', app.version);
  } else {
    app.version === lastVersion
      ? console.log(
          `[APP] lastVersion (${lastVersion}) is equal to app.version (${app.version})`,
        )
      : console.log(
          `[APP] lastVersion (${lastVersion}) is different from app.version (${app.version})`,
        );
  }
}

const SideMenuHandler = ({
  coreObject,
  currentChannel,
  setChannel,
}: {
  coreObject: any;
  currentChannel: any;
  setChannel: any;
}) => {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  setFunction('openLeftMenu', async (o: boolean) => {
    console.log(`[APP] Setting left menu open state to ${o}`);
    setSideMenuOpen(o);
  });

  const {height, width} = useWindowDimensions();

  useBackHandler(() => {
    if (height > width && !sideMenuOpen) {
      setSideMenuOpen(true);
      return true;
    }

    return false;
  });

  return height < width ? (
    <View style={{flex: 1, flexDirection: 'row'}}>
      <View
        style={{
          width: '20%',
          flexDirection: 'column',
        }}>
        <SideMenu
          onChannelClick={setChannel}
          currentChannel={currentChannel}
          orderedServers={coreObject.state.orderedServers}
        />
      </View>
      <ChannelView channel={currentChannel} />
    </View>
  ) : (
    <Drawer
      swipeEdgeWidth={width * 2}
      swipeMinVelocity={250}
      drawerType={'slide'}
      open={sideMenuOpen}
      onOpen={() => setSideMenuOpen(true)}
      onClose={() => setSideMenuOpen(false)}
      renderDrawerContent={() => (
        <SideMenu
          onChannelClick={setChannel}
          currentChannel={currentChannel}
          orderedServers={coreObject.state.orderedServers}
        />
      )}
      style={styles.app}
      drawerStyle={{
        backgroundColor: currentTheme.backgroundPrimary,
        width: width - 50,
      }}>
      <ChannelView channel={currentChannel} />
    </Drawer>
  );
};

class MainView extends ReactComponent {
  constructor(props) {
    super(props);
    this.state = {
      status: 'tryingLogin',
      askForTFACode: false,
      currentChannel: null,
      tokenInput: '',
      emailInput: '',
      passwordInput: '',
      tfaInput: '',
      tfaTicket: '',
      notificationMessage: null,
      orderedServers: [],
      serverNotifications: null,
      channelNotifications: null,
    };
    setFunction('openChannel', async c => {
      // if (!this.state.currentChannel || this.state.currentChannel?.server?._id != c.server?._id) c.server?.fetchMembers()
      this.setState({currentChannel: c});
      app.openLeftMenu(false);
    });
    setFunction('joinInvite', async (i: string) => {
      await client.joinInvite(i);
    });
    setFunction('logOut', async () => {
      console.log(
        `[AUTH] Logging out of current session... (user: ${client.user?._id})`,
      );
      AsyncStorage.multiSet([
        ['token', ''],
        ['sessionID', ''],
      ]);
      client.logout();
      this.setState({status: 'awaitingLogin'});
    });
  }
  componentDidUpdate(_, prevState) {
    if (
      prevState.status !== this.state.status &&
      this.state.status === 'tryingLogin'
    ) {
      randomizeRemark();
    }
  }
  async componentDidMount() {
    console.log(`[APP] Mounted component (${new Date().getTime()})`);

    let defaultNotif = await createChannel();
    console.log(`[NOTIFEE] Created channel: ${defaultNotif}`);

    checkLastVersion();

    client.on('connecting', () => {
      this.setState({loadingStage: 'connecting'});
      console.log(`[APP] Connecting to instance... (${new Date().getTime()})`);
    });

    client.on('connected', () => {
      this.setState({loadingStage: 'connected'});
      console.log(`[APP] Connected to instance (${new Date().getTime()})`);
    });

    client.on('ready', async () => {
      let orderedServers,
        server,
        channel = null;
      try {
        const rawSettings = await client.syncFetchSettings([
          'ordering',
          'notifications',
        ]);
        try {
          orderedServers = JSON.parse(rawSettings.ordering[1]).servers;
          ({server, channel} = JSON.parse(rawSettings.notifications[1]));
        } catch (err) {
          console.log(`[APP] Error parsing fetched settings: ${err}`);
        }
      } catch (err) {
        console.log(`[APP] Error fetching settings: ${err}`);
      }

      this.setState({
        status: 'loggedIn',
        network: 'ready',
        orderedServers,
        serverNotifications: server,
        channelNotifications: channel,
      });
      console.log(`[APP] Client is ready (${new Date().getTime()})`);

      setUpNotifeeListener(client, this.setState);

      if (app.settings.get('app.reopenLastChannel')) {
        await openLastChannel();
      }
    });

    client.on('dropped', async () => {
      this.setState({network: 'dropped'});
    });

    client.on('message', async msg => {
      console.log(`[APP] Handling message ${msg._id}`);

      let channelNotif = this.state.channelNotifications
        ? this.state.channelNotifications[msg.channel?._id]
        : undefined;
      let serverNotif = this.state.serverNotifications
        ? this.state.serverNotifications[msg.channel?.server?._id]
        : undefined;

      const isMuted =
        (channelNotif && channelNotif === 'none') ||
        channelNotif === 'muted' ||
        (serverNotif && serverNotif === 'none') ||
        serverNotif === 'muted';

      const alwaysNotif =
        channelNotif === 'all' || (!isMuted && serverNotif === 'all');

      const mentionsUser =
        (msg.mention_ids?.includes(client.user?._id!) &&
          (app.settings.get('app.notifications.notifyOnSelfPing') ||
            msg.author?._id !== client.user?._id)) ||
        msg.channel?.channel_type === 'DirectMessage';

      const shouldNotif =
        (alwaysNotif &&
          (app.settings.get('app.notifications.notifyOnSelfPing') ||
            msg.author?._id !== client.user?._id)) ||
        (!isMuted && mentionsUser);

      console.log(
        `[NOTIFICATIONS] Should notify for ${msg._id}: ${shouldNotif} (channel/server muted? ${isMuted}, notifications for all messages enabled? ${alwaysNotif}, message mentions the user? ${mentionsUser})`,
      );

      if (app.settings.get('app.notifications.enabled') && shouldNotif) {
        console.log(
          `[NOTIFICATIONS] Pushing notification for message ${msg._id}`,
        );
        if (this.state.currentChannel !== msg.channel) {
          this.setState({notificationMessage: msg});
          await sleep(5000);
          this.setState({notificationMessage: null});
        }

        await sendNotifeeNotification(msg, client, defaultNotif);
      }
    });

    client.on('packet', async p => {
      if (p.type === 'UserSettingsUpdate') {
        console.log('[WEBSOCKET] Synced settings updated');
        try {
          if ('ordering' in p.update) {
            const orderedServers = JSON.parse(p.update.ordering[1]).servers;
            this.setState({orderedServers});
          }
          if ('notifications' in p.update) {
            const {server, channel} = JSON.parse(p.update.notifications[1]);
            this.setState({
              serverNotifications: server,
              channelNotifications: channel,
            });
          }
        } catch (err) {
          console.log(`[APP] Error fetching settings: ${err}`);
        }
      }
    });

    client.on('server/delete', async s => {
      const currentServer = app.getCurrentServer();
      if (currentServer === s) {
        app.openServer(undefined);
        app.openChannel(null);
      }
    });

    await loginWithSavedToken(this);
  }

  async setChannel(channel: string | Channel | null, server?: Server) {
    this.setState({
      currentChannel: channel,
      messages: [],
    });
    app.openLeftMenu(false);
    if (channel) {
      await AsyncStorage.getItem('serverLastChannels', async (err, data) => {
        if (!err) {
          let parsedData = JSON.parse(data || '{}') || {};
          parsedData[server?._id || 'DirectMessage'] =
            typeof channel === 'string' ? channel : channel._id;
          console.log(parsedData);
          await AsyncStorage.setItem(
            'serverLastChannels',
            JSON.stringify(parsedData),
          );
        } else {
          console.log(`[APP] Error getting last channel: ${err}`);
        }
      });
    }
  }

  render() {
    const {t} = this.props;
    return (
      <View style={styles.app}>
        {this.state.status === 'loggedIn' ? (
          <>
            <SideMenuHandler
              coreObject={this}
              currentChannel={this.state.currentChannel}
              setChannel={this.setChannel.bind(this)}
            />
            <Modals />
            <NetworkIndicator client={client} />
            <View
              style={{position: 'absolute', top: 20, left: 0, width: '100%'}}>
              <Notification
                message={this.state.notificationMessage}
                dismiss={() =>
                  this.setState({
                    notificationMessage: null,
                  })
                }
                openChannel={() =>
                  this.setState({
                    notificationMessage: null,
                    currentChannel: this.state.notificationMessage.channel,
                  })
                }
              />
            </View>
          </>
        ) : this.state.status === 'awaitingLogin' ? (
          <LoginPage state={this} />
        ) : this.state.status === 'tryingLogin' ? (
          <View style={styles.loadingScreen}>
            <Text style={{fontSize: 30, fontWeight: 'bold'}}>
              {this.state.loadingStage === 'connected'
                ? t('app.loading.generic')
                : t('app.loading.connecting')}
            </Text>
            <Text style={styles.remark}>{selectedRemark || null}</Text>
          </View>
        ) : this.state.status === 'loginSettings' ? (
          <LoginSettingsPage state={this} />
        ) : (
          <View style={styles.loadingScreen}>
            <Text style={{fontSize: 30, fontWeight: 'bold'}}>Uh oh...</Text>
            <Text style={styles.remark}>
              Please let the developers know that you saw this (value:{' '}
              {this.state.status})
            </Text>
          </View>
        )}
      </View>
    );
  }
}

const MainViewi18n = withTranslation()(MainView);

function ErrorMessage({
  error,
  resetErrorBoundary,
}: {
  error: any;
  resetErrorBoundary: Function;
}) {
  console.error(`[APP] Uncaught error: ${error}`);
  return (
    <View style={{flex: 1, padding: 16, justifyContent: 'center'}}>
      <Text
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}>
        <Text style={{fontSize: 30, fontWeight: 'bold'}}>
          OOPSIE WOOPSIE!! {'UwU\n'}
        </Text>
        We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our
        headquarters are working VEWY HAWD to fix this! {'>w<\n\n'}
        On a more serious note, please let us know that you experienced the
        following error:
      </Text>
      <View
        style={{
          backgroundColor: currentTheme.background,
          borderRadius: 8,
          marginVertical: 16,
          padding: 16,
        }}>
        <Text font={'JetBrains Mono'} colour={'#ff5555'}>
          {error.toString()}
        </Text>
      </View>
      <Button
        onPress={() => {
          Clipboard.setString(error.toString());
        }}>
        <Text>Copy error message</Text>
      </Button>
      <Button
        onPress={() => {
          resetErrorBoundary();
        }}>
        <Text>Reload app</Text>
      </Button>
    </View>
  );
}

export const App = () => {
  return (
    <GestureHandlerRootView style={styles.outer}>
      <StatusBar
        animated={true}
        backgroundColor={currentTheme.backgroundSecondary}
        barStyle={(currentTheme.contentType + '-content') as StatusBarStyle}
      />
      <ErrorBoundary fallbackRender={ErrorMessage}>
        <MainViewi18n />
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
};
