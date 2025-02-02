import {
  type MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {StatusBar, View} from 'react-native';

import type {API} from 'revolt.js';

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
  handleMessageNotification,
  setUpNotifeeListener,
} from '@clerotri/lib/notifications';
import {
  ChannelContext,
  OrderedServersContext,
} from '@clerotri/lib/state';
import {storage} from '@clerotri/lib/storage';
import {ThemeContext} from '@clerotri/lib/themes';
import {CVChannel} from '@clerotri/lib/types';
import {checkLastVersion, openLastChannel} from '@clerotri/lib/utils';
import {LoginViews} from '@clerotri/pages/LoginViews';

function handleUserSettingsPacket(
  packet: any,
  setOrderedServers: (servers: any) => void,
  channelNotificationSettings: any,
  serverNotificationSettings: any,
) {
  console.log('[WEBSOCKET] Synced settings updated');
  const newSettings = packet.update;
  try {
    if ('ordering' in newSettings) {
      const newOrderedServers = JSON.parse(newSettings.ordering[1]).servers;
      setOrderedServers(newOrderedServers);
    }
    if ('notifications' in newSettings) {
      const {server, channel} = JSON.parse(newSettings.notifications[1]);
      channelNotificationSettings.current = channel;
      serverNotificationSettings.current = server;
    }
  } catch (err) {
    console.log(`[APP] Error fetching settings: ${err}`);
  }
}

function LoggedInViews({
  channelNotificationSettings,
  serverNotificationSettings,
}: {
  channelNotificationSettings: MutableRefObject<any>;
  serverNotificationSettings: MutableRefObject<any>;
}) {
  const [currentChannel, setCurrentChannel] = useState<CVChannel>(null);

  setFunction('openChannel', async (c: CVChannel) => {
    setCurrentChannel(c);
  });

  setFunction('getCurrentChannel', () => {
    return currentChannel;
  });

  const {setOrderedServers} = useContext(OrderedServersContext);

  const [notificationMessage, setNotificationMessage] =
    useState<API.Message | null>(null);

  useEffect(() => {
    if (app.settings.get('app.reopenLastChannel')) {
      openLastChannel();
    }
  }, []);

  useEffect(() => {
    if (currentChannel) {
      const lastOpenedChannels = storage.getString('lastOpenedChannels');
      try {
        let parsedData = JSON.parse(lastOpenedChannels || '{}') || {};
        parsedData[
          typeof currentChannel === 'string' || !currentChannel.server
            ? 'DirectMessage'
            : currentChannel.server._id
        ] =
          typeof currentChannel === 'string'
            ? currentChannel
            : currentChannel._id;
        console.log(parsedData);
        storage.set('lastOpenedChannels', JSON.stringify(parsedData));
      } catch (err) {
        console.log(`[APP] Error getting last channel: ${err}`);
      }
    }
  }, [currentChannel]);

  useEffect(() => {
    console.log('[APP] Setting up packet listener...');

    async function onMessagePacket(msg: API.Message) {
      await handleMessageNotification(
        msg,
        channelNotificationSettings.current,
        serverNotificationSettings.current,
        setNotificationMessage,
        'clerotri',
      );
    }

    function onUserSettingsPacket(p: any) {
      handleUserSettingsPacket(
        p,
        setOrderedServers,
        channelNotificationSettings,
        serverNotificationSettings,
      );
    }

    async function onNewPacket(p: any) {
      if (p.type === 'Message') {
        await onMessagePacket(p);
      }
      if (p.type === 'UserSettingsUpdate') {
        onUserSettingsPacket(p);
      }
    }

    function setUpPacketListener() {
      client.on('packet', async p => await onNewPacket(p));
    }

    function cleanupPacketListener() {
      client.removeListener('packet');
    }

    try {
      setUpPacketListener();
    } catch (err) {
      console.log(`[NEWMESSAGEVIEW] Error seting up global listeners: ${err}`);
    }

    return () => cleanupPacketListener();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ChannelContext.Provider value={{currentChannel, setCurrentChannel}}>
        <SideMenuHandler />
        <Modals />
        <NetworkIndicator client={client} />
        <View style={{position: 'absolute', top: 20, left: 0, width: '100%'}}>
          <Notification
            message={notificationMessage}
            dismiss={() => setNotificationMessage(null)}
          />
        </View>
    </ChannelContext.Provider>
  );
}

export function MainView() {
  const {currentTheme} = useContext(ThemeContext);

  const [status, setStatus] = useState('loggedOut');

  const [orderedServers, setOrderedServers] = useState<string[]>([]);

  const channelNotificationSettings = useRef<any>();
  const serverNotificationSettings = useRef<any>();

  useEffect(() => {
    console.log('[APP] Setting up global functions...');

    setFunction('joinInvite', async (i: string) => {
      await client.joinInvite(i);
    });

    setFunction('logOut', async () => {
      console.log(
        `[AUTH] Logging out of current session... (user: ${client.user?._id})`,
      );
      storage.set('token', '');
      storage.set('sessionID', '');
      app.openChannel(null);
      setStatus('loggedOut');
      await client.logout();
      app.setLoggedOutScreen('loginPage');
    });
  }, []);

  useEffect(() => {
    console.log('[APP] Setting up global listeners...');

    function setUpListeners() {
      client.on('connecting', () => {
        app.setLoadingStage('connecting');
        console.log(
          `[APP] Connecting to instance... (${new Date().getTime()})`,
        );
      });

      client.on('connected', () => {
        app.setLoadingStage('connected');
        console.log(`[APP] Connected to instance (${new Date().getTime()})`);
      });

      client.on('ready', async () => {
        let fetchedOrderedServers = [];
        let fetchedChannelNotificationSettings = {};
        let fetchedServerNotificationSettings = {};

        try {
          const rawSettings = await client.syncFetchSettings([
            'ordering',
            'notifications',
          ]);
          try {
            fetchedOrderedServers = JSON.parse(rawSettings.ordering[1]).servers;
            const notificationSettings = JSON.parse(
              rawSettings.notifications[1],
            );
            fetchedChannelNotificationSettings = notificationSettings.channel;
            fetchedServerNotificationSettings = notificationSettings.server;
          } catch (err) {
            console.log(`[APP] Error parsing fetched settings: ${err}`);
          }
        } catch (err) {
          console.log(`[APP] Error fetching settings: ${err}`);
        }

        setOrderedServers(fetchedOrderedServers);
        channelNotificationSettings.current =
          fetchedChannelNotificationSettings;
        serverNotificationSettings.current = fetchedServerNotificationSettings;
        setStatus('loggedIn');

        console.log(`[APP] Client is ready (${new Date().getTime()})`);

        setUpNotifeeListener(client);
      });

      client.on('server/delete', async s => {
        const currentServer = app.getCurrentServer();
        if (currentServer === s) {
          app.openServer(undefined);
          app.openChannel(null);
        }
      });
    }

    function cleanupListeners() {
      client.removeListener('connecting');
      client.removeListener('connected');
      client.removeListener('ready');
      client.removeListener('server/delete');
    }

    try {
      setUpListeners();
    } catch (err) {
      console.log(`[NEWMESSAGEVIEW] Error seting up global listeners: ${err}`);
    }

    return () => cleanupListeners();
  }, []);

  useEffect(() => {
    randomizeRemark();
  }, [status]);

  useEffect(() => {
    async function login() {
      console.log(`[APP] Mounted component (${new Date().getTime()})`);

      let defaultNotif = await createChannel();
      console.log(`[NOTIFEE] Created channel: ${defaultNotif}`);

      checkLastVersion();

      await loginWithSavedToken(status);
    }

    login();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <OrderedServersContext.Provider value={{orderedServers, setOrderedServers}}>
      <StatusBar
        animated={true}
        backgroundColor={
          status !== 'loggedIn'
            ? currentTheme.backgroundPrimary
            : currentTheme.backgroundSecondary
        }
        barStyle={`${currentTheme.contentType}-content`}
      />
      {status === 'loggedIn' ? (
        <LoggedInViews
          channelNotificationSettings={channelNotificationSettings}
          serverNotificationSettings={serverNotificationSettings}
        />
      ) : status === 'loggedOut' ? (
        <LoginViews markAsLoggedIn={() => setStatus('loggedIn')} />
      ) : (
        <LoadingScreen
          header={'app.loading.unknown_state'}
          body={'app.loading.unknown_state_body'}
          bodyParams={{state: status}}
        />
      )}
    </OrderedServersContext.Provider>
  );
}
