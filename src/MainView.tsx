import {
  Component as ReactComponent,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';

import type {Channel, Server} from 'revolt.js';

import {app, randomizeRemark, setFunction} from '@clerotri/Generic';
import {client} from '@clerotri/lib/client';
import {Modals} from '@clerotri/Modals';
import {SideMenuHandler} from '@clerotri/SideMenu';
import {NetworkIndicator} from '@clerotri/components/NetworkIndicator';
import {Notification} from '@clerotri/components/Notification';
import {LoadingScreen} from '@clerotri/components/views/LoadingScreen';
import {loginWithSavedToken} from '@clerotri/lib/auth';
import {
  createChannel,
  sendNotifeeNotification,
  setUpNotifeeListener,
} from '@clerotri/lib/notifications';
import {storage} from '@clerotri/lib/storage';
import {Theme, ThemeContext} from '@clerotri/lib/themes';
import {sleep} from '@clerotri/lib/utils';
import {LoginViews} from '@clerotri/pages/LoginViews';

function openLastChannel() {
  try {
    const lastServer = storage.getString('lastServer');
    if (lastServer) {
      const server = client.servers.get(lastServer);
      // if the server is undefined, either something hasn't loaded or the user left it at some point
      if (server) {
        app.openServer(server);
        try {
          const channelData = storage.getString('lastOpenedChannels');
          let lastOpenedChannels = JSON.parse(channelData || '{}') || {};
          let lastChannel = lastOpenedChannels[lastServer];
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
    }
  } catch (serverErr) {
    console.log(`[APP] Error getting last server: ${serverErr}`);
  }
}

function checkLastVersion() {
  const lastVersion = storage.getString('lastVersion');
  console.log(app.version, lastVersion);
  if (!lastVersion || lastVersion === '') {
    console.log(
      `[APP] lastVersion is null (${lastVersion}), setting to app.version (${app.version})`,
    );
    storage.set('lastVersion', app.version);
  } else if (app.version !== lastVersion) {
    console.log(
      `[APP] lastVersion (${lastVersion}) is different from app.version (${app.version})`,
    );
  } else {
    console.log(
      `[APP] lastVersion (${lastVersion}) is equal to app.version (${app.version})`,
    );
  }
}

function LoggedInViews({state, setChannel}: {state: any; setChannel: any}) {
  useEffect(() => {
    if (app.settings.get('app.reopenLastChannel')) {
      openLastChannel();
    }
  }, []);
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

function AppViews({state}: {state: any}) {
  const {currentTheme} = useContext(ThemeContext);

  const setChannel = useCallback(
    (channel: string | Channel | null, server?: Server) => {
      state.setState({
        currentChannel: channel,
        messages: [],
      });
      app.openLeftMenu(false);
      if (channel) {
        const lastOpenedChannels = storage.getString('lastOpenedChannels');
        try {
          let parsedData = JSON.parse(lastOpenedChannels || '{}') || {};
          parsedData[server?._id || 'DirectMessage'] =
            typeof channel === 'string' ? channel : channel._id;
          console.log(parsedData);
          storage.set('lastOpenedChannels', JSON.stringify(parsedData));
        } catch (err) {
          console.log(`[APP] Error getting last channel: ${err}`);
        }
      }
    },
    [state],
  );

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
    </>
  );
}

export class MainView extends ReactComponent {
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
      storage.set('token', '');
      storage.set('sessionID', '');
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

    checkLastVersion();

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

  render() {
    return <AppViews state={this} />;
  }
}
