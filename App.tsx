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
} from 'react-native';
import {ErrorBoundary} from 'react-error-boundary';
import SideMenu from '@chakrahq/react-native-side-menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
// import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';
import {currentTheme, styles} from './src/Theme';
import {client, app, selectedRemark, randomizeRemark} from './src/Generic';
import {setFunction} from './src/Generic';
import {LeftMenu} from './src/SideMenus';
import {Modals} from './src/Modals';
import {NetworkIndicator} from './src/components/NetworkIndicator';
import {decodeTime} from 'ulid';
import notifee from '@notifee/react-native';
import {Button, Link, Text} from './src/components/common/atoms';
import {LoginSettingsPage} from './src/components/pages/LoginSettingsPage';
import {ChannelView} from './src/components/views/ChannelView';
import {Notification} from './src/components/Notification';

async function createChannel() {
  const channel = await notifee.createChannel({
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
      loginWithEmail: true,
      askForTFACode: false,
      currentChannel: null,
      currentText: '',
      tokenInput: '',
      emailInput: '',
      passwordInput: '',
      tfaInput: '',
      userStatusInput: '',
      tfaTicket: '',
      leftMenuOpen: false,
      notificationMessage: null,
      orderedServers: [],
    };
    setFunction('openChannel', async c => {
      // if (!this.state.currentChannel || this.state.currentChannel?.server?._id != c.server?._id) c.server?.fetchMembers()
      this.setState({currentChannel: c, leftMenuOpen: false});
    });
    setFunction('joinInvite', async (i: string) => {
      await client.joinInvite(i);
    });
    setFunction('openLeftMenu', async (o: any) => {
      const newState = typeof o === 'boolean' ? o : !this.state.leftMenuOpen;
      console.log(`[APP] Setting left menu open state to ${newState}`);
      this.setState({leftMenuOpen: newState});
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
      let orderedServers;
      try {
        const rawOrderedServers = await client.syncFetchSettings(['ordering']);
        orderedServers = JSON.parse(rawOrderedServers.ordering[1]).servers;
      } catch (err) {
        console.log(`[APP] Error fetching ordered servers: ${err}`);
        orderedServers === null;
      }
      this.setState({
        status: 'loggedIn',
        network: 'ready',
        orderedServers: orderedServers,
      });
      console.log(`[APP] Client is ready (${new Date().getTime()})`);
      if (this.state.tokenInput) {
        console.log(`[AUTH] Setting saved token to ${this.state.tokenInput}`);
        AsyncStorage.setItem('token', this.state.tokenInput);
        this.setState({tokenInput: ''});
      }
    });
    client.on('dropped', async () => {
      this.setState({network: 'dropped'});
    });
    client.on('message', async msg => {
      console.log(`[APP] Handling message ${msg._id}`);

      const shouldShowNotif = app.settings.get(
        'app.notifications.notifyOnSelfPing',
      )
        ? true
        : msg.author?._id !== client.user?._id;

      const mentionsUser =
        msg.mention_ids?.includes(client.user?._id!) ||
        msg.channel?.channel_type === 'DirectMessage';

      if (
        shouldShowNotif &&
        mentionsUser &&
        app.settings.get('app.notifications.enabled')
      ) {
        console.log(
          `[NOTIFICATIONS] Pushing notification for message ${msg._id}`,
        );
        if (this.state.currentChannel !== msg.channel) {
          this.setState({notificationMessage: msg});
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
            body:
              msg.author?.username +
              ': ' +
              msg.content
                ?.replaceAll(
                  '<@' + client.user?._id + '>',
                  '@' + client.user?.username,
                )
                .replaceAll('\\', '\\\\')
                .replaceAll('<', '\\<')
                .replaceAll('>', '\\>') +
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
              channelId: defaultnotif,
            },
            id: msg.channel?._id,
          });
        } catch (notifErr) {
          console.log(`[NOTIFEE] Error sending notification: ${notifErr}`);
        }
      }
    });
    // notifee.onBackgroundEvent(async ({type, detail}) => {});
    AsyncStorage.getItem('token', async (err, res) => {
      if (!err) {
        if (typeof res !== 'string') {
          console.log(
            `[AUTH] Saved token was not a string: ${typeof res}, ${res}`,
          );
          this.setState({status: 'awaitingLogin'});
          return;
        }
        try {
          await client.useExistingSession({token: res});
        } catch (e: any) {
          console.log(e);
          !(
            e.message?.startsWith('Read error') || e.message === 'Network Error'
          ) && client.user
            ? this.setState({logInError: e, status: 'awaitingLogin'})
            : this.state.status === 'loggedIn'
            ? this.setState({logInError: e})
            : this.setState({logInError: e, status: 'awaitingLogin'});
        }
      } else {
        console.log(err);
        this.setState({status: 'awaitingLogin'});
      }
    });
  }
  render() {
    return (
      <>
        {this.state.status === 'loggedIn' ? (
          <View style={styles.app}>
            <SideMenu
              openMenuOffset={Dimensions.get('window').width - 50}
              overlayColor={'#00000040'}
              edgeHitWidth={200}
              isOpen={this.state.leftMenuOpen}
              onChange={open => this.setState({leftMenuOpen: open})}
              menu={
                <LeftMenu
                  onChannelClick={s => {
                    this.setState({
                      currentChannel: s,
                      leftMenuOpen: false,
                      messages: [],
                    });
                  }}
                  currentChannel={this.state.currentChannel}
                  onLogOut={() => {
                    console.log(
                      `[AUTH] Logging out of current session... (user: ${client.user?._id})`,
                    );
                    AsyncStorage.setItem('token', '');
                    client.logout();
                    this.setState({status: 'awaitingLogin'});
                  }}
                  orderedServers={this.state.orderedServers}
                />
              }
              style={styles.app}
              bounceBackOnOverdraw={false}>
              <ChannelView state={this} channel={this.state.currentChannel} />
            </SideMenu>
            <Modals state={this.state} setState={this.setState.bind(this)} />
            <NetworkIndicator client={client} />
            <View
              style={{position: 'absolute', top: 20, left: 0, width: '100%'}}>
              <Notification
                message={this.state.notificationMessage}
                setState={() =>
                  this.setState({
                    notificationMessage: null,
                    currentChannel: this.state.notificationMessage.channel,
                  })
                }
              />
            </View>
          </View>
        ) : this.state.status === 'awaitingLogin' ? (
          <View style={styles.app}>
            <View
              style={{
                marginTop: 8,
                marginLeft: '90%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
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
              style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
              <Text
                style={{fontFamily: 'Inter', fontWeight: 'bold', fontSize: 48}}>
                RVMob
              </Text>
              {/* trans rights uwu */}
              {this.state.loginWithEmail === true ? (
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
                        placeholderTextColor={currentTheme.foregroundSecondary}
                        style={styles.loginInput}
                        placeholder={'One-time code'} // /recovery code
                        onChangeText={text => {
                          this.setState({tfaInput: text});
                        }}
                        value={this.state.tfaInput}
                      />
                    </>
                  ) : null}
                  <Button
                    onPress={async () => {
                      this.setState({status: 'tryingLogin'});
                      try {
                        console.log(
                          '[AUTH] Attempting login with email and password...',
                        );
                        let session = await client.api.post(
                          '/auth/session/login',
                          {
                            email: this.state.emailInput,
                            password: this.state.passwordInput,
                            friendly_name: 'RVMob',
                          },
                        );

                        // Check if account is disabled; if not, prompt for MFA verificaiton if necessary
                        if (session.result === 'Disabled') {
                          console.log(
                            '[AUTH] Account is disabled; need to add a proper handler for this',
                          );
                        } else if (session.result === 'MFA') {
                          if (this.state.tfaTicket === '') {
                            console.log(
                              `[AUTH] MFA required; prompting for code... (ticket: ${session.ticket})`,
                            );
                            return this.setState({
                              status: 'awaitingLogin',
                              askForTFACode: true,
                              tfaTicket: session.ticket,
                            });
                          } else {
                            try {
                              console.log(
                                `[AUTH] Attempting to log in with MFA (code: ${this.state.tfaInput})`,
                              );
                              const isRecovery = this.state.tfaInput.length > 7;
                              console.log(
                                `[AUTH] Using recovery code: ${isRecovery}`,
                              );
                              session = await client.api.post(
                                '/auth/session/login',
                                {
                                  mfa_response: isRecovery
                                    ? {recovery_code: this.state.tfaInput}
                                    : {totp_code: this.state.tfaInput},
                                  mfa_ticket: this.state.tfaTicket,
                                  friendly_name: 'RVMob',
                                },
                              );
                              console.log(`[AUTH] Result: ${session.result}`);
                              if (session.result !== 'Success') {
                                throw Error;
                              }
                              const token = session.token;
                              console.log(
                                '[AUTH] Logging in with a new token...',
                              );
                              await client.useExistingSession({token: token});
                              await AsyncStorage.setItem('token', token);
                              console.log(
                                '[AUTH] Successfuly logged in and saved the token!',
                              );
                              this.setState({
                                status: 'loggedIn',
                                tokenInput: '',
                                passwordInput: '',
                                emailInput: '',
                                tfaInput: '',
                                logInError: null,
                                tfaTicket: '',
                                askForTFACode: false,
                              });
                            } catch (err) {
                              this.setState({logInError: err});
                            }
                          }
                        } else {
                          const token = session.token;
                          console.log('[AUTH] Logging in with a new token...');
                          await client.useExistingSession({token: token});
                          await AsyncStorage.setItem('token', token);
                          console.log(
                            '[AUTH] Successfuly logged in and saved the token!',
                          );
                          this.setState({
                            status: 'loggedIn',
                            tokenInput: '',
                            passwordInput: '',
                            emailInput: '',
                            tfaInput: '',
                            logInError: null,
                            tfaTicket: '',
                            askForTFACode: false,
                          });
                        }
                      } catch (e) {
                        console.error(e);
                        this.setState({logInError: e, status: 'awaitingLogin'});
                      }
                    }}>
                    <Text useInter={true}>Log in</Text>
                  </Button>
                  {this.state.logInError ? (
                    <Text>
                      {this.state.logInError.message ||
                        this.state.logInError.toString()}
                    </Text>
                  ) : null}
                  <Button
                    onPress={() => {
                      this.setState({loginWithEmail: false});
                    }}>
                    <Text useInter={true}>Log in with token</Text>
                  </Button>
                </>
              ) : (
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
                  <Button
                    onPress={async () => {
                      this.setState({status: 'tryingLogin'});
                      try {
                        console.log(decodeTime(this.state.tokenInput));
                        this.setState({
                          logInError: 'That is a user ID, not a token.',
                          status: 'awaitingLogin',
                        });
                      } catch (e) {
                        try {
                          await client.useExistingSession({
                            token: this.state.tokenInput,
                          });
                          this.setState({
                            status: 'loggedIn',
                            tokenInput: '',
                            passwordInput: '',
                            emailInput: '',
                            logInError: null,
                          });
                        } catch (e) {
                          console.error(e);
                          this.setState({
                            logInError: e,
                            status: 'awaitingLogin',
                          });
                        }
                      }
                    }}>
                    <Text useInter={true}>Log in</Text>
                  </Button>
                  {this.state.logInError ? (
                    <Text>
                      {this.state.logInError.message ?? this.state.logInError}
                    </Text>
                  ) : null}
                  <Button
                    onPress={() => {
                      this.setState({loginWithEmail: true});
                    }}>
                    <Text useInter={true}>Log in with email</Text>
                  </Button>
                </>
              )}
            </View>
          </View>
        ) : this.state.status === 'loginSettings' ? (
          <LoginSettingsPage state={this} />
        ) : (
          <View style={styles.app}>
            <View style={styles.loggingInScreen}>
              <Text style={{fontSize: 30, fontWeight: 'bold'}}>
                Logging in...
              </Text>
              <Text style={styles.remark}>{selectedRemark || null}</Text>
            </View>
          </View>
        )}
      </>
    );
  }
}

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
    <View style={styles.outer}>
      <StatusBar
        animated={true}
        backgroundColor={currentTheme.backgroundSecondary}
        barStyle={(currentTheme.contentType + '-content') as StatusBarStyle}
      />
      <ErrorBoundary fallbackRender={ErrorMessage}>
        <MainView />
      </ErrorBoundary>
    </View>
  );
};
