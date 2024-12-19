import 'react-native-get-random-values'; // react native moment

import {Component as ReactComponent, useContext, useState} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {ErrorBoundary} from 'react-error-boundary';

// import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {Channel, Server} from 'revolt.js';

import {client, app, randomizeRemark} from './src/Generic';
import {setFunction} from './src/Generic';
import {SideMenuHandler} from './src/SideMenu';
import {Modals} from './src/Modals';
import {ErrorMessage} from '@rvmob/components/ErrorMessage';
import {NetworkIndicator} from './src/components/NetworkIndicator';
import {Notification} from './src/components/Notification';
import {loginWithSavedToken} from './src/lib/auth';
import {
  createChannel,
  sendNotifeeNotification,
  setUpNotifeeListener,
} from '@rvmob/lib/notifications';
import {sleep} from '@rvmob/lib/utils';
import {LoginViews} from '@rvmob/pages/LoginViews';
import {themes, Theme, ThemeContext} from '@rvmob/lib/themes';
import {LoadingScreen} from '@rvmob/components/views/LoadingScreen';

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

async function checkLastVersion() {
  const lastVersion = app.settings.get('app.lastVersion');
  console.log(app.version, lastVersion);
  if (!lastVersion || lastVersion === '') {
    console.log(
      `[APP] lastVersion is null (${lastVersion}), setting to app.version (${app.version})`,
    );
    await app.settings.set('app.lastVersion', app.version);
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

function LoggedInViews({state, setChannel}: {state: any; setChannel: any}) {
  return (
    <>
      <SideMenuHandler
        coreObject={state}
        currentChannel={state.state.currentChannel}
        setChannel={setChannel}
      />
      <Modals />
      <NetworkIndicator client={client} />
      <View style={{position: 'absolute', top: 20, left: 0, width: '100%'}}>
        <Notification
          message={state.state.notificationMessage}
          dismiss={() =>
            state.setState({
              notificationMessage: null,
            })
          }
          openChannel={() =>
            state.setState({
              notificationMessage: null,
              currentChannel: state.state.notificationMessage.channel,
            })
          }
        />
      </View>
    </>
  );
}

function AppViews({state, setChannel}: {state: any; setChannel: any}) {
  const {currentTheme} = useContext(ThemeContext);
  const localStyles = generateAppViewStyles(currentTheme);

  return (
    <>
      <StatusBar
        animated={true}
        backgroundColor={
          state.state.status !== 'loggedIn'
            ? currentTheme.backgroundPrimary
            : currentTheme.backgroundSecondary
        }
        barStyle={`${currentTheme.contentType}-content`}
      />
      <View style={localStyles.app}>
        {state.state.status === 'loggedIn' ? (
          <LoggedInViews state={state} setChannel={setChannel} />
        ) : state.state.status === 'loggedOut' ? (
          <LoginViews
            markAsLoggedIn={() => state.setState({status: 'loggedIn'})}
          />
        ) : (
          <LoadingScreen
            header={'app.loading.unknown_state'}
            body={'app.loading.unknown_state_body'}
            bodyParams={{state: state.state.status}}
          />
        )}
      </View>
    </>
  );
}

class MainView extends ReactComponent {
  constructor(props) {
    super(props);
    this.state = {
      status: 'loggedOut',
      currentChannel: null,
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
      this.setState({status: 'loggedOut', currentChannel: null});
      await client.logout();
      app.setLoggedOutScreen('loginPage');
    });
  }
  componentDidUpdate(_, prevState) {
    if (prevState.status !== this.state.status) {
      randomizeRemark();
    }
  }
  async componentDidMount() {
    console.log(`[APP] Mounted component (${new Date().getTime()})`);

    let defaultNotif = await createChannel();
    console.log(`[NOTIFEE] Created channel: ${defaultNotif}`);

    await checkLastVersion();

    client.on('connecting', () => {
      app.setLoadingStage('connecting');
      console.log(`[APP] Connecting to instance... (${new Date().getTime()})`);
    });

    client.on('connected', () => {
      app.setLoadingStage('connected');
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

    await loginWithSavedToken(this.state.status);
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
    return <AppViews state={this} setChannel={this.setChannel.bind(this)} />;
  }
}

export const App = () => {
  const [theme, setTheme] = useState<Theme>(themes.Dark);

  setFunction('setTheme', (themeName: string) => {
    const newTheme = themes[themeName] ?? themes.Dark;
    setTheme(newTheme);
  });

  const localStyles = generateLocalStyles(theme);

  return (
    <GestureHandlerRootView style={localStyles.outer}>
      <ThemeContext.Provider
        value={{currentTheme: theme, setCurrentTheme: setTheme}}>
        <ErrorBoundary fallbackRender={ErrorMessage}>
          <MainView />
        </ErrorBoundary>
      </ThemeContext.Provider>
    </GestureHandlerRootView>
  );
};

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    outer: {
      flex: 1,
      backgroundColor: currentTheme.backgroundSecondary,
    },
  });
};

const generateAppViewStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    app: {
      flex: 1,
      backgroundColor: currentTheme.backgroundPrimary,
    },
  });
};
