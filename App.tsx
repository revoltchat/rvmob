import 'react-native-get-random-values'; // react native moment
import './shim'; // react native moment 2: the thrilling sequel

import React from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
  StatusBarStyle,
  Pressable,
} from 'react-native';
import {ErrorBoundary} from 'react-error-boundary';
import {withTranslation} from 'react-i18next';

import SideMenuBase from '@chakrahq/react-native-side-menu';
// import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';
import notifee, {EventType} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Channel, Server} from 'revolt.js';

import {currentTheme, styles} from './src/Theme';
import {
  client,
  app,
  selectedRemark,
  randomizeRemark,
  openUrl,
} from './src/Generic';
import {setFunction} from './src/Generic';
import {SideMenu} from './src/SideMenu';
import {Modals} from './src/Modals';
import {NetworkIndicator} from './src/components/NetworkIndicator';
import {Button, Link, Text} from './src/components/common/atoms';
import {LoginSettingsPage} from './src/components/pages/LoginSettingsPage';
import {ChannelView} from './src/components/views/ChannelView';
import {Notification} from './src/components/Notification';
import {
  loginRegular,
  loginWithSavedToken,
  loginWithToken,
} from './src/lib/auth';
import {OFFICIAL_INSTANCE_SIGNUP_URL} from '@rvmob/lib/consts';
import {sleep} from './src/lib/utils';

async function createChannel() {
  const channel = (await notifee.getChannel('rvmob'))
    ? 'rvmob'
    : await notifee.createChannel({
        id: 'rvmob',
        name: 'RVMob',
      });
  return channel;
}

class MainView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'tryingLogin',
      loginType: '',
      askForTFACode: false,
      currentChannel: null,
      currentText: '',
      tokenInput: '',
      emailInput: '',
      passwordInput: '',
      tfaInput: '',
      tfaTicket: '',
      leftMenuOpen: false,
      notificationMessage: null,
      orderedServers: [],
      serverNotifications: null,
      channelNotifications: null,
    };
    setFunction('openChannel', async c => {
      // if (!this.state.currentChannel || this.state.currentChannel?.server?._id != c.server?._id) c.server?.fetchMembers()
      this.setState({currentChannel: c, leftMenuOpen: false});
    });
    setFunction('joinInvite', async (i: string) => {
      await client.joinInvite(i);
    });
    setFunction('openLeftMenu', async (o: boolean) => {
      console.log(`[APP] Setting left menu open state to ${o}`);
      this.setState({leftMenuOpen: o});
    });
    setFunction('logOut', async () => {
      console.log(
        `[AUTH] Logging out of current session... (user: ${client.user?._id})`,
      );
      AsyncStorage.setItem('token', '');
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
    let defaultnotif = await createChannel();
    console.log(`[NOTIFEE] Created channel: ${defaultnotif}`);
    client.on('connecting', () => {
      console.log(`[APP] Connecting to instance... (${new Date().getTime()})`);
    });
    client.on('connected', () => {
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
        orderedServers = JSON.parse(rawSettings.ordering[1]).servers;
        ({server, channel} = JSON.parse(rawSettings.notifications[1]));
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
      notifee.onBackgroundEvent(async ({type, detail}) => {
        const {notification /*, pressAction */} = detail;
        if (type === EventType.PRESS) {
          console.log(
            `[NOTIFEE] User pressed on ${notification?.data?.channel}/${notification?.data?.messageID}`,
          );
          const notifChannel = client.channels.get(
            notification?.data?.channel as string,
          );
          this.setState({
            currentChannel: notifChannel ?? null,
          });
          await notifee.cancelNotification(notification!.id!);
        }
      });

      AsyncStorage.getItem('lastServer', async (err, lastServer) => {
        if (!err) {
          if (lastServer) {
            app.openServer(client.servers.get(lastServer));
            await AsyncStorage.getItem('serverLastChannels', (cerr, data) => {
              if (!cerr) {
                let serverLastChannels = JSON.parse(data || '{}') || {};
                let lastChannel = serverLastChannels[lastServer];
                if (lastChannel) {
                  let fetchedLastChannel = client.channels.get(lastChannel);
                  if (fetchedLastChannel) {
                    app.openChannel(fetchedLastChannel);
                  }
                }
              } else {
                console.log(`[APP] Error getting last channel: ${err}`);
              }
            });
          }
        } else {
          console.log(`[APP] Error getting last server: ${err}`);
        }
      });
    });
    client.on('dropped', async () => {
      this.setState({network: 'dropped'});
    });
    client.on('message', async msg => {
      console.log(`[APP] Handling message ${msg._id}`);

      let channelNotif = this.state.channelNotifications[msg.channel?._id];
      let serverNotif =
        this.state.serverNotifications[msg.channel?.server?._id];

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
        let notifs = (await notifee.getDisplayedNotifications()).filter(
          n => n.id === msg.channel?._id,
        );
        const title = `${
          msg.channel?.server?.name
            ? `#${msg.channel.name} (${msg.channel.server.name})`
            : msg.channel?.channel_type === 'Group'
            ? `${msg.channel.name}`
            : `@${msg.channel?.recipient?.username}`
        }`;

        try {
          notifee.displayNotification({
            title: title,
            data: {
              channel: msg.channel?._id ?? 'UNKNOWN',
              messageID: msg._id,
            },
            body:
              `<b>${msg.author?.username}</b>: ` +
              msg.content
                ?.replaceAll(
                  '<@' + client.user?._id + '>',
                  '@' + client.user?.username,
                )
                .replaceAll('\\', '\\\\')
                .replaceAll('<', '\\<')
                .replaceAll('>', '\\>') +
              '<br>' +
              (msg.embeds
                ? msg.embeds.map(_e => '[Embed]').join('<br>') + '<br>'
                : '') +
              (msg.attachments
                ? msg.attachments.map(a => a.metadata.type).join('<br>') +
                  '<br>'
                : '') +
              (notifs.length > 0 && notifs[0]?.notification.body
                ? notifs[0].notification.body.split('<br>')?.length > 1
                  ? ' <i><br>(and ' +
                    (Number.parseInt(
                      notifs[0]?.notification.body
                        ?.split('<br>')[1]
                        .split(' ')[1] ?? '',
                      10,
                    ) +
                      1) +
                    ' more messages)</i>'
                  : ' <i><br>(and 1 more message)</i>'
                : ''),
            android: {
              color: '#1AD4B2',
              smallIcon: 'ic_launcher_monochrome',
              largeIcon:
                msg.channel?.server?.generateIconURL() ||
                msg.author?.generateAvatarURL(),
              pressAction: {
                id: 'default',
                launchActivity: 'site.endl.taiku.rvmob.MainActivity',
              },
              channelId: defaultnotif,
            },
            id: msg.channel?._id,
          });
        } catch (notifErr) {
          console.log(`[NOTIFEE] Error sending notification: ${notifErr}`);
        }
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

  async setChannel(channel: string | Channel, server?: Server) {
    this.setState({
      currentChannel: channel,
      leftMenuOpen: false,
      messages: [],
    });
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

  render() {
    const {t} = this.props;
    return (
      <>
        {this.state.status === 'loggedIn' ? (
          <View style={styles.app}>
            <SideMenuBase
              openMenuOffset={Dimensions.get('window').width - 50}
              overlayColor={'#00000040'}
              edgeHitWidth={Dimensions.get('window').width}
              isOpen={this.state.leftMenuOpen}
              onChange={open => this.setState({leftMenuOpen: open})}
              menu={
                <SideMenu
                  onChannelClick={this.setChannel.bind(this)}
                  currentChannel={this.state.currentChannel}
                  orderedServers={this.state.orderedServers}
                />
              }
              style={styles.app}
              bounceBackOnOverdraw={false}>
              <ChannelView state={this} channel={this.state.currentChannel} />
            </SideMenuBase>
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
          </View>
        ) : this.state.status === 'awaitingLogin' ||
          this.state.status === 'tryingLogin' ? (
          <View style={styles.app}>
            {this.state.status === 'awaitingLogin' ? (
              <>
                <View
                  style={{
                    marginTop: 8,
                    marginStart: 8,
                    marginEnd: 4,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  {this.state.loginType !== '' ? (
                    <Pressable
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        this.setState({loginType: ''});
                      }}>
                      <MaterialIcon
                        name="arrow-back"
                        size={24}
                        color={currentTheme.foregroundSecondary}
                      />
                      <Text
                        style={{
                          color: currentTheme.foregroundSecondary,
                          fontSize: 20,
                          marginLeft: 5,
                        }}>
                        {t('app.actions.back')}
                      </Text>
                    </Pressable>
                  ) : (
                    <View />
                  )}
                  <TouchableOpacity
                    onPress={() => this.setState({status: 'loginSettings'})}>
                    <MaterialIcon
                      name="more-vert"
                      size={30}
                      color={currentTheme.foregroundPrimary}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 'bold',
                      fontSize: 48,
                    }}>
                    RVMob
                  </Text>
                  {this.state.loginType === 'email' ? (
                    <>
                      <TextInput
                        placeholderTextColor={currentTheme.foregroundSecondary}
                        style={styles.loginInput}
                        placeholder={'Email'}
                        keyboardType={'email-address'}
                        autoComplete={'email'}
                        onChangeText={(text: string) => {
                          this.setState({emailInput: text});
                        }}
                        value={this.state.emailInput}
                      />
                      <TextInput
                        placeholderTextColor={currentTheme.foregroundSecondary}
                        style={styles.loginInput}
                        secureTextEntry={true}
                        autoComplete={'password'}
                        placeholder={'Password'}
                        onChangeText={text => {
                          this.setState({passwordInput: text});
                        }}
                        value={this.state.passwordInput}
                      />
                      {this.state.askForTFACode === true ? (
                        <>
                          <TextInput
                            placeholderTextColor={
                              currentTheme.foregroundSecondary
                            }
                            style={styles.loginInput}
                            placeholder={'One-time code'} // /recovery code
                            onChangeText={text => {
                              this.setState({tfaInput: text});
                            }}
                            value={this.state.tfaInput}
                          />
                        </>
                      ) : null}
                      <Button onPress={async () => await loginRegular(this)}>
                        <Text useInter={true}>Log in</Text>
                      </Button>
                      {this.state.logInError ? (
                        <Text>
                          {this.state.logInError.message ||
                            this.state.logInError.toString()}
                        </Text>
                      ) : null}
                    </>
                  ) : this.state.loginType === 'token' ? (
                    <>
                      <TextInput
                        placeholderTextColor={currentTheme.foregroundSecondary}
                        style={styles.loginInput}
                        placeholder={'Token'}
                        onChangeText={text => {
                          this.setState({tokenInput: text});
                        }}
                        value={this.state.tokenInput}
                      />
                      <Link
                        link={
                          'https://infi.sh/posts/revolt-tokens?utm_source=rvmob'
                        }
                        label={'How do I get my token?'}
                        style={{fontFamily: 'Inter', fontWeight: 'bold'}}
                      />
                      <Button onPress={async () => await loginWithToken(this)}>
                        <Text useInter={true}>Log in</Text>
                      </Button>
                      {this.state.logInError ? (
                        <Text>
                          {this.state.logInError.message ??
                            this.state.logInError}
                        </Text>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <Text
                        useInter={true}
                        style={{
                          marginVertical: 8,
                          fontSize: 18,
                          fontWeight: 'bold',
                        }}>
                        Do you have an account?
                      </Text>
                      <Button
                        onPress={() => {
                          this.setState({loginType: 'email'});
                        }}
                        style={{alignItems: 'center', width: '80%'}}>
                        <Text
                          useInter={true}
                          style={{fontSize: 16, fontWeight: 'bold'}}>
                          Yes, log in with my email and password
                        </Text>
                      </Button>
                      <Button
                        onPress={() => {
                          this.setState({loginType: 'token'});
                        }}
                        style={{alignItems: 'center', width: '80%'}}>
                        <Text
                          useInter={true}
                          style={{fontSize: 16, fontWeight: 'bold'}}>
                          Yes, log in with a session token
                        </Text>
                      </Button>
                      <Button
                        onPress={() => {
                          openUrl(
                            client.configuration
                              ? `${client.configuration.app}/login/create`
                              : OFFICIAL_INSTANCE_SIGNUP_URL,
                          );
                        }}
                        style={{width: '80%'}}>
                        <View style={{alignItems: 'center'}}>
                          <Text
                            useInter={true}
                            style={{fontSize: 16, fontWeight: 'bold'}}>
                            No, sign up
                          </Text>
                          <Text useInter={true}>
                            You'll be redirected to the web app. Once you've
                            signed up, come back and log in.
                          </Text>
                        </View>
                      </Button>
                    </>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.loggingInScreen}>
                <Text style={{fontSize: 30, fontWeight: 'bold'}}>
                  {t('app.loading.connecting')}
                </Text>
                <Text style={styles.remark}>{selectedRemark || null}</Text>
              </View>
            )}
          </View>
        ) : this.state.status === 'loginSettings' ? (
          <LoginSettingsPage state={this} />
        ) : (
          <View style={styles.app}>
            <View style={styles.loggingInScreen}>
              <Text style={{fontSize: 30, fontWeight: 'bold'}}>Uh oh...</Text>
              <Text style={styles.remark}>
                Please let the developers know that you saw this (value:{' '}
                {this.state.status})
              </Text>
            </View>
          </View>
        )}
      </>
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
    <>
      <Text
        style={{
          flex: 1,
          padding: 15,
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}>
        <Text style={{fontSize: 30, fontWeight: 'bold'}}>
          OOPSIE WOOPSIE!! {'UwU\n'}
        </Text>
        We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our
        headquarters are working VEWY HAWD to fix this! {'>w<\n\n'}
        <Text style={{color: '#ff5555', fontWeight: 'regular'}}>
          {error.toString()}
        </Text>
      </Text>
      <Button
        onPress={() => {
          resetErrorBoundary();
        }}>
        <Text>Reload app</Text>
      </Button>
    </>
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
