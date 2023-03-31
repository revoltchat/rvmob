import 'react-native-get-random-values'; // react native moment
import './shim'; // react native moment 2
import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Dimensions,
  StatusBarStyle,
} from 'react-native';
import {ErrorBoundary} from 'react-error-boundary';
import SideMenu from 'react-native-side-menu-updated';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import ConfirmHcaptcha from '@hcaptcha/react-native-hcaptcha';
import {currentTheme, styles} from './src/Theme';
import {
  client,
  app,
  selectedRemark,
  randomizeRemark,
  Button,
  ChannelIcon,
  Input,
  openUrl,
  defaultAPIURL,
} from './src/Generic';
import {Messages} from './src/MessageView';
import {MessageBox} from './src/MessageBox';
import {setFunction} from './src/Generic';
import {LeftMenu, RightMenu} from './src/SideMenus';
import {Modals} from './src/Modals';
import {NetworkIndicator} from './src/components/NetworkIndicator';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import {decodeTime} from 'ulid';
const Image = FastImage;
import notifee from '@notifee/react-native';
import {HomePage} from './src/components/pages/HomePage';
import {FriendsPage} from './src/components/pages/FriendsPage';
import {Text} from './src/components/common/atoms';

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
      username: null,
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
      rightMenuOpen: false,
      imageViewerImage: null,
      nsfwConsented: false,
      rerender: 0,
    };
    setFunction('openChannel', async c => {
      // if (!this.state.currentChannel || this.state.currentChannel?.server?._id != c.server?._id) c.server?.fetchMembers()
      this.setState({currentChannel: c, leftMenuOpen: false});
    });
    setFunction('joinInvite', async i => {
      await client.joinInvite(i);
    });
    setFunction('openLeftMenu', async o => {
      this.setState(
        typeof o === 'boolean'
          ? {leftMenuOpen: o}
          : {leftMenuOpen: !this.state.leftMenuOpen},
      );
    });
    setFunction('openRightMenu', async o => {
      this.setState(
        typeof o === 'boolean'
          ? {rightMenuOpen: o}
          : {rightMenuOpen: !this.state.rightMenuOpen},
      );
    });
  }
  componentDidUpdate(_, prevState) {
    if (
      prevState.status !== this.state.status &&
      this.state.status === 'tryingLogin'
    ) {
      randomizeRemark();
    }
    if (
      prevState.rightMenuOpen !== this.state.rightMenuOpen &&
      this.state.rightMenuOpen &&
      this.state.currentChannel?.server
    ) {
      this.state.currentChannel.server?.fetchMembers();
    }
  }
  async componentDidMount() {
    let defaultnotif = await createChannel();
    console.log(`[NOTIFEE] Created channel: ${defaultnotif}`);
    console.log('[APP] Mounted component');
    client.on('ready', async () => {
      this.setState({status: 'loggedIn', network: 'ready'});
      if (this.state.tokenInput) {
        console.log(`[AUTH] Setting saved token to ${this.state.tokenInput}`);
        AsyncStorage.setItem('token', this.state.tokenInput);
        AsyncStorage.multiSet([
          ['token', this.state.tokenInput],
          ['instance', defaultAPIURL],
        ]);
        this.setState({tokenInput: ''});
      }
    });
    client.on('dropped', async () => {
      this.setState({network: 'dropped'});
    });
    client.on('message', async msg => {
      if (
        (app.settings.get('app.notifications.notifyOnSelfPing')
          ? true
          : msg.author?._id !== client.user?._id) &&
        (msg.mention_ids?.includes(client.user?._id!) ||
          msg.channel?.channel_type === 'DirectMessage') &&
        app.settings.get('app.notifications.enabled')
      ) {
        let notifs = (await notifee.getDisplayedNotifications()).filter(
          n => n.id === msg.channel?._id,
        );
        const title = `${
          msg.channel?.server?.name
            ? `${msg.channel.server.name}, #`
            : 'Direct Message'
        }${msg.channel?.name} (RVMob)`;

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
    console.log(await AsyncStorage.getItem('settings'));
    AsyncStorage.getItem('token', async (err, res) => {
      if (!err) {
        if (typeof res !== 'string') {
          console.log(`token was not string: ${typeof res}, ${res}`);
          this.setState({status: 'awaitingLogin'});
          return;
        }
        try {
          await client.useExistingSession({token: res});
        } catch (e: any) {
          console.log(e);
          !(
            e.message.startsWith('Read error') || e.message === 'Network Error'
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
      <ErrorBoundary fallbackRender={ErrorMessage}>
        {this.state.status === 'loggedIn' ? (
          <View style={styles.app}>
            <SideMenu
              openMenuOffset={Dimensions.get('window').width - 50}
              menuPosition="right"
              disableGestures={this.state.leftMenuOpen}
              overlayColor={'#00000040'}
              edgeHitWidth={120}
              isOpen={this.state.rightMenuOpen}
              onChange={open => this.setState({rightMenuOpen: open})}
              menu={<RightMenu currentChannel={this.state.currentChannel} />}
              style={styles.app}
              bounceBackOnOverdraw={false}>
              <SideMenu
                openMenuOffset={Dimensions.get('window').width - 50}
                disableGestures={this.state.rightMenuOpen}
                overlayColor={'#00000040'}
                edgeHitWidth={120}
                isOpen={this.state.leftMenuOpen}
                onChange={open => this.setState({leftMenuOpen: open})}
                menu={
                  <LeftMenu
                    rerender={this.state.rerender}
                    onChannelClick={s => {
                      this.setState({
                        currentChannel: s,
                        leftMenuOpen: false,
                        messages: [],
                      });
                    }}
                    currentChannel={this.state.currentChannel}
                    onLogOut={() => {
                      AsyncStorage.setItem('token', '');
                      this.setState({status: 'awaitingLogin'});
                    }}
                  />
                }
                style={styles.app}
                bounceBackOnOverdraw={false}>
                <View style={styles.mainView}>
                  {this.state.currentChannel ? (
                    this.state.currentChannel === 'friends' ? (
                      <FriendsPage />
                    ) : (
                      <View style={styles.flex}>
                        <ChannelHeader>
                          <View style={styles.iconContainer}>
                            <ChannelIcon
                              channel={
                                this.state.currentChannel.channel_type ===
                                'SavedMessages'
                                  ? {type: 'special', channel: 'Saved Notes'}
                                  : {
                                      type: 'channel',
                                      channel: this.state.currentChannel,
                                    }
                              }
                            />
                          </View>
                          <Text style={styles.channelName}>
                            {this.state.currentChannel.channel_type ===
                            'DirectMessage'
                              ? this.state.currentChannel.recipient?.username
                              : this.state.currentChannel.channel_type ===
                                'SavedMessages'
                              ? 'Saved Notes'
                              : this.state.currentChannel.name}
                          </Text>
                        </ChannelHeader>
                        {this.state.currentChannel?.channel_type ===
                        'VoiceChannel' ? (
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
                              In the meantime, you can join them via the web app
                              or Revolt Desktop.
                            </Text>
                          </View>
                        ) : !this.state.currentChannel?.nsfw ||
                          app.settings.get('ui.messaging.showNSFWContent') ? (
                          <>
                            <Messages
                              channel={this.state.currentChannel}
                              onLongPress={async m => {
                                app.openMessage(m);
                              }}
                              onUserPress={m => {
                                app.openProfile(
                                  m.author,
                                  this.state.currentChannel.server,
                                );
                              }}
                              onImagePress={a => {
                                this.setState({imageViewerImage: a});
                              }}
                              rerender={this.state.rerender}
                              onUsernamePress={m =>
                                this.setState({
                                  currentText:
                                    this.state.currentText +
                                    '<@' +
                                    m.author?._id +
                                    '>',
                                })
                              }
                            />
                            <MessageBox channel={this.state.currentChannel} />
                          </>
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
                              This is an NSFW channel. Are you sure you want to
                              enter?{'\n'}(This can be reversed in Settings.)
                            </Text>
                            <Button
                              onPress={() => {
                                app.settings.set(
                                  'ui.messaging.showNSFWContent',
                                  true,
                                );
                                this.setState({});
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
              </SideMenu>
            </SideMenu>
            <Modals state={this.state} setState={this.setState.bind(this)} />
            <NetworkIndicator client={client} />
          </View>
        ) : this.state.status === 'awaitingLogin' ? (
          <View style={styles.app}>
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
                        let session = await client.api.post(
                          '/auth/session/login',
                          {
                            email: this.state.emailInput,
                            password: this.state.passwordInput,
                            friendly_name: 'RVMob',
                          },
                        );

                        // Prompt for MFA verificaiton if necessary
                        if (session.result === 'MFA') {
                          if (this.state.tfaTicket === '') {
                            return this.setState({
                              status: 'awaitingLogin',
                              askForTFACode: true,
                              tfaTicket: session.ticket,
                            });
                          } else {
                            try {
                              const isRecovery = this.state.tfaInput.length > 7;
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
                              console.log(`result: ${session.result}`);
                              if (session.result !== 'Success') {
                                throw Error;
                              }
                              const token = session.token;
                              await client.useExistingSession({token: token});
                              await AsyncStorage.setItem('token', token);
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
                  <TouchableOpacity
                    onPress={() =>
                      openUrl('https://infi.sh/posts/revolt-tokens')
                    }>
                    <Text
                      style={{
                        fontFamily: 'Inter',
                        color: currentTheme.accentColor,
                        fontWeight: 'bold',
                        textDecorationLine: 'underline',
                      }}>
                      How do I get my token?
                    </Text>
                  </TouchableOpacity>
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
      </ErrorBoundary>
    );
  }
}

export const ChannelHeader = ({children}) => {
  return (
    <View style={styles.channelHeader}>
      <TouchableOpacity
        style={styles.headerIcon}
        onPress={() => {
          app.openLeftMenu();
        }}>
        <View style={styles.iconContainer}>
          <MaterialIcon
            name="menu"
            size={20}
            color={currentTheme.foregroundPrimary}
          />
        </View>
      </TouchableOpacity>
      {children}
    </View>
  );
};

function ErrorMessage({
  error,
  resetErrorBoundary,
}: {
  error: any;
  resetErrorBoundary: Function;
}) {
  console.error(`[APP] Uncaught error: ${error}`);
  return (
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
      <Button
        onPress={() => {
          resetErrorBoundary();
        }}>
        <Text>Reload app</Text>
      </Button>
    </Text>
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
      <MainView />
    </View>
  );
};
