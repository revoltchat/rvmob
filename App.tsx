import 'react-native-get-random-values'; // react native moment

import {Component as ReactComponent} from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
  StatusBarStyle,
} from 'react-native';
import {ErrorBoundary} from 'react-error-boundary';
import {withTranslation} from 'react-i18next';

// import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import {getBundleId} from 'react-native-device-info';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import SideMenuBase from '@rexovolt/react-native-side-menu';

import {Channel, Server} from 'revolt.js';

import {currentTheme, styles} from './src/Theme';
import {client, app, selectedRemark, randomizeRemark} from './src/Generic';
import {setFunction} from './src/Generic';
import {SideMenu} from './src/SideMenu';
import {Modals} from './src/Modals';
import {NetworkIndicator} from './src/components/NetworkIndicator';
import {BackButton, Button, Link, Text} from './src/components/common/atoms';
import {LoginSettingsPage} from './src/pages/auth/LoginSettingsPage';
import {ChannelView} from './src/components/views/ChannelView';
import {Notification} from './src/components/Notification';
import {
  loginRegular,
  loginWithSavedToken,
  loginWithToken,
} from './src/lib/auth';
import {OFFICIAL_INSTANCE_SIGNUP_URL} from '@rvmob/lib/consts';
import {openUrl, sleep} from '@rvmob/lib/utils';

const isFoss = getBundleId().match('foss');

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

class MainView extends ReactComponent {
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
    (isFoss
      ? import('./src/lib/notifications/foss')
      : import('./src/lib/notifications/regular')
    ).then(async imports => {
      let defaultNotif = await imports.createChannel();
      console.log(`[NOTIFEE] Created channel: ${defaultNotif}`);
      console.log(app.version, app.settings.get('app.lastVersion'));
      const lastVersion = app.settings.get('app.lastVersion');
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
      client.on('connecting', () => {
        this.setState({loadingStage: 'connecting'});
        console.log(
          `[APP] Connecting to instance... (${new Date().getTime()})`,
        );
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
        if (!isFoss) {
          imports.setUpNotifeeListener(client, this.setState);
        }

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
          if (!isFoss) {
            await imports.sendNotifeeNotification(msg, client, defaultNotif);
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
    });
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
      <View style={styles.app}>
        {this.state.status === 'loggedIn' ? (
          <>
            {Dimensions.get('window').width >
            Dimensions.get('window').height ? (
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View
                  style={{
                    width: '20%',
                    flexDirection: 'column',
                  }}>
                  <SideMenu
                    onChannelClick={this.setChannel.bind(this)}
                    currentChannel={this.state.currentChannel}
                    orderedServers={this.state.orderedServers}
                  />
                </View>
                <ChannelView state={this} channel={this.state.currentChannel} />
              </View>
            ) : (
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
            )}
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
          <>
            <View
              style={{
                marginTop: 12,
                marginStart: 8,
                marginEnd: 4,
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              {this.state.loginType !== '' ? (
                <BackButton
                  callback={() => {
                    this.setState({loginType: ''});
                  }}
                />
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
                    placeholder={t('app.login.forms.email_placeholder')}
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
                    placeholder={t('app.login.forms.password_placeholder')}
                    onChangeText={text => {
                      this.setState({passwordInput: text});
                    }}
                    value={this.state.passwordInput}
                  />
                  {this.state.askForTFACode === true ? (
                    <>
                      <TextInput
                        placeholderTextColor={currentTheme.foregroundSecondary}
                        style={styles.loginInput}
                        placeholder={t('app.login.forms.mfa_placeholder')}
                        onChangeText={text => {
                          this.setState({tfaInput: text});
                        }}
                        value={this.state.tfaInput}
                      />
                    </>
                  ) : null}
                  <Button onPress={async () => await loginRegular(this)}>
                    <Text font={'Inter'}>Log in</Text>
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
                    placeholder={t('app.login.forms.session_token_placeholder')}
                    onChangeText={text => {
                      this.setState({tokenInput: text});
                    }}
                    value={this.state.tokenInput}
                  />
                  <Link
                    link={
                      'https://infi.sh/posts/revolt-tokens?utm_source=rvmob'
                    }
                    label={t('app.login.token_info_label')}
                    style={{fontFamily: 'Inter', fontWeight: 'bold'}}
                  />
                  <Button onPress={async () => await loginWithToken(this)}>
                    <Text font={'Inter'}>Log in</Text>
                  </Button>
                  {this.state.logInError ? (
                    <Text>
                      {this.state.logInError.message ?? this.state.logInError}
                    </Text>
                  ) : null}
                </>
              ) : (
                <>
                  <Text
                    font={'Inter'}
                    style={{
                      marginVertical: 8,
                      fontSize: 18,
                      fontWeight: 'bold',
                    }}>
                    {t('app.login.subheader')}
                  </Text>
                  <Button
                    onPress={() => {
                      this.setState({loginType: 'email'});
                    }}
                    style={{alignItems: 'center', width: '80%'}}>
                    <Text
                      font={'Inter'}
                      style={{fontSize: 16, fontWeight: 'bold'}}>
                      {t('app.login.options.login_regular')}
                    </Text>
                  </Button>
                  <Button
                    onPress={() => {
                      this.setState({loginType: 'token'});
                    }}
                    style={{alignItems: 'center', width: '80%'}}>
                    <Text
                      font={'Inter'}
                      style={{fontSize: 16, fontWeight: 'bold'}}>
                      {t('app.login.options.login_session_token')}
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
                        font={'Inter'}
                        style={{fontSize: 16, fontWeight: 'bold'}}>
                        {t('app.login.options.signup')}
                      </Text>
                      <Text font={'Inter'}>
                        {t('app.login.options.signup_body')}
                      </Text>
                    </View>
                  </Button>
                  <Text
                    font={'Inter'}
                    colour={currentTheme.foregroundSecondary}>
                    {t('app.login.instance_notice', {
                      url: app.settings.get('app.instance'),
                    })}
                  </Text>
                </>
              )}
            </View>
          </>
        ) : this.state.status === 'tryingLogin' ? (
          <View style={styles.loggingInScreen}>
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
          <View style={styles.loggingInScreen}>
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
