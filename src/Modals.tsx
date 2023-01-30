import {
  View,
  TouchableOpacity,
  Pressable,
  Modal,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import React from 'react';
import {
  client,
  Text,
  MarkdownView,
  app,
  parseRevoltNodes,
  GeneralAvatar,
  ServerName,
  ServerList,
  openUrl,
  setFunction,
  ContextButton,
  Button,
  InputWithButton,
  Badges,
} from './Generic';
import {
  styles,
  currentTheme,
  themes,
  setTheme,
  currentThemeName,
} from './Theme';
import {ReplyMessage} from './MessageView';
import {Avatar, Username, MiniProfile, RoleView} from './Profile';
import {RelationshipStatus} from 'revolt-api';
import {Server, Permission, User} from 'revolt.js';
import Clipboard from '@react-native-clipboard/clipboard';
import AntIcon from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import FastImage from 'react-native-fast-image';
import {observer} from 'mobx-react';
const Image = FastImage;

@observer
export class Modals extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contextMenuMessage: null,
      contextMenuUser: null,
      contextMenuUserProfile: null,
      contextMenuUserServer: null,
      contextMenuUserMutual: null,
      contextMenuUserSection: 'Profile',
      imageViewerImage: null,
      settingsOpen: false,
      contextMenuServer: null,
      inviteServer: null,
      inviteServerCode: '',
      inviteBot: null,
    };
    setFunction('openProfile', async (u: User, s: Server) => {
      this.setState({
        contextMenuUser: u || null,
        contextMenuUserProfile: u ? await u.fetchProfile() : null,
        contextMenuUserMutual:
          u && u.relationship !== 'User' ? await u.fetchMutual() : null,
        contextMenuUserServer: s || null,
        contextMenuUserSection: 'Profile',
      });
    });
    setFunction('openInvite', async (i: string) => {
      try {
        let server = await client.fetchInvite(i);
        console.log(server.type, server.channel_name);
        this.setState({
          inviteServer: server,
          inviteServerCode: i,
        });
      } catch (e) {
        console.log(e);
      }
    });
    setFunction('openBotInvite', async (id: string) => {
      this.setState({
        inviteBot: await client.bots.fetchPublic(id).catch(e => e),
      });
    });
    setFunction('openImage', async a => {
      this.setState({imageViewerImage: a});
    });
    setFunction('openServerContextMenu', async s => {
      this.setState({contextMenuServer: s});
    });
    setFunction('openMessage', async m => {
      this.setState({contextMenuMessage: m});
    });
    setFunction('openSettings', async o => {
      this.setState({settingsOpen: o || !this.state.settingsOpen});
    });
  }
  render() {
    let rerender = (() => this.setState({})).bind(this);
    return (
      <>
        <Modal
          key="messageMenu"
          animationType="slide"
          transparent={true}
          visible={!!this.state.contextMenuMessage}
          onRequestClose={() => {
            () => this.setState({contextMenuMessage: null});
          }}>
          <Pressable
            onPress={() => this.setState({contextMenuMessage: null})}
            style={{
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
              position: 'absolute',
              backgroundColor: '#00000000',
            }}
          />
          <View
            style={{
              width: '100%',
              height: '45%',
              top: '55%',
              backgroundColor: currentTheme.backgroundSecondary,
            }}>
            <ReplyMessage
              message={this.state.contextMenuMessage}
              style={{margin: 3, width: '100%'}}
            />
            <ScrollView style={{flex: 1, padding: 3}}>
              <ContextButton
                onPress={() => this.setState({contextMenuMessage: null})}>
                <View style={styles.iconContainer}>
                  <AntIcon
                    name="closecircle"
                    size={16}
                    color={currentTheme.foregroundPrimary}
                  />
                </View>
                <Text>Close</Text>
              </ContextButton>
              <ContextButton
                onPress={() => {
                  let replyingMessages = [...app.getReplyingMessages()];
                  if (
                    replyingMessages.filter(
                      m => m.message._id === this.state.contextMenuMessage._id,
                    ).length > 0
                  )
                    return;
                  if (replyingMessages.length >= 5) {
                    return;
                  }
                  if (app.getEditingMessage()) {
                    return;
                  }
                  replyingMessages.push({
                    message: this.state.contextMenuMessage,
                    mentions: false,
                  });
                  app.setReplyingMessages(replyingMessages);
                  this.setState({contextMenuMessage: null});
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name="reply"
                    size={20}
                    color={currentTheme.foregroundPrimary}
                  />
                </View>
                <Text>Reply</Text>
              </ContextButton>
              <ContextButton
                onPress={() => {
                  Clipboard.setString(this.state.contextMenuMessage.content);
                }}>
                <View style={styles.iconContainer}>
                  <FA5Icon
                    name="clipboard"
                    size={18}
                    color={currentTheme.foregroundPrimary}
                  />
                </View>
                <Text>Copy content</Text>
              </ContextButton>
              {app.settings.get('Show developer tools') ? (
                <ContextButton
                  onPress={() => {
                    Clipboard.setString(this.state.contextMenuMessage._id);
                  }}>
                  <View style={styles.iconContainer}>
                    <FA5Icon
                      name="clipboard"
                      size={18}
                      color={currentTheme.foregroundPrimary}
                    />
                  </View>
                  <Text>
                    Copy ID{' '}
                    <Text
                      style={{
                        fontSize: 12,
                        color: currentTheme.foregroundSecondary,
                      }}>
                      ({this.state.contextMenuMessage?._id})
                    </Text>
                  </Text>
                </ContextButton>
              ) : null}
              {this.state.contextMenuMessage?.channel.havePermission(
                'ManageMessages',
              ) ||
              this.state.contextMenuMessage?.author.relationship == 'User' ? (
                <ContextButton
                  onPress={() => {
                    this.state.contextMenuMessage.delete();
                    this.setState({contextMenuMessage: null});
                  }}>
                  <View style={styles.iconContainer}>
                    <FA5Icon
                      name="trash"
                      size={18}
                      color={currentTheme.foregroundPrimary}
                    />
                  </View>
                  <Text>Delete</Text>
                </ContextButton>
              ) : null}
              {this.state.contextMenuMessage?.author.relationship == 'User' ? (
                <ContextButton
                  onPress={() => {
                    app.setMessageBoxInput(
                      this.state.contextMenuMessage?.content,
                    );
                    app.setEditingMessage(this.state.contextMenuMessage);
                    app.setReplyingMessages([]);
                    this.setState({contextMenuMessage: null});
                  }}>
                  <View style={styles.iconContainer}>
                    <FA5Icon
                      name="edit"
                      size={18}
                      color={currentTheme.foregroundPrimary}
                    />
                  </View>
                  <Text>Edit</Text>
                </ContextButton>
              ) : null}
              <View style={{marginTop: 7}} />
            </ScrollView>
          </View>
        </Modal>
        <Modal
          key="profileMenu"
          animationType="slide"
          transparent={true}
          visible={!!this.state.contextMenuUser}
          onRequestClose={() => app.openProfile(null)}>
          <Pressable
            onPress={() => {
              app.openProfile(null);
              this.setState({userStatusInput: ''});
            }}
            style={{
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
              position: 'absolute',
              backgroundColor: '#00000000',
            }}
          />
          <View
            style={{
              width: '100%',
              height: Dimensions.get('window').height * 0.75,
              top: '25%',
              padding: 15,
              backgroundColor: currentTheme.backgroundSecondary,
            }}>
            <View>
              <View style={{flexDirection: 'row'}}>
                <Avatar
                  size={100}
                  user={this.state.contextMenuUser}
                  server={this.state.contextMenuUserServer}
                  backgroundColor={currentTheme.backgroundSecondary}
                  status
                  pressable
                />
                <View style={{justifyContent: 'center', marginLeft: 6}}>
                  <Username
                    user={this.state.contextMenuUser}
                    server={this.state.contextMenuUserServer}
                    size={24}
                  />
                  <View key={1} style={{flexDirection: 'row'}}>
                    {!!this.state.contextMenuUserServer &&
                    client.members.getKey({
                      server: this.state.contextMenuUserServer?._id,
                      user: this.state.contextMenuUser?._id,
                    })?.avatar &&
                    client.members.getKey({
                      server: this.state.contextMenuUserServer?._id,
                      user: this.state.contextMenuUser?._id,
                    })?.avatar?._id !=
                      this.state.contextMenuUser?.avatar?._id ? (
                      <Avatar size={24} user={this.state.contextMenuUser} />
                    ) : null}
                    <Text style={styles.header}>@</Text>
                    <Username
                      user={this.state.contextMenuUser}
                      size={16}
                      noBadge
                    />
                  </View>
                  {this.state.contextMenuUser?.status?.text ? (
                    <Text>{this.state.contextMenuUser?.status?.text}</Text>
                  ) : (
                    <></>
                  )}
                </View>
              </View>
              {this.state.contextMenuUser?.flags ? (
                this.state.contextMenuUser.flags & 1 ? (
                  <Text style={{color: '#ff3333'}}>User is suspended</Text>
                ) : this.state.contextMenuUser.flags & 2 ? (
                  <Text style={{color: '#ff3333'}}>
                    User deleted their account
                  </Text>
                ) : this.state.contextMenuUser.flags & 4 ? (
                  <Text style={{color: '#ff3333'}}>User is banned</Text>
                ) : null
              ) : null}
              {this.state.contextMenuUser?.relationship != 'User' ? (
                <View style={{flexDirection: 'row'}}>
                  <Button
                    backgroundColor={currentTheme.backgroundPrimary}
                    style={{
                      padding: 5,
                      paddingLeft: 8,
                      paddingRight: 8,
                      margin: 3,
                      flex: 1,
                    }}
                    onPress={() =>
                      this.setState({contextMenuUserSection: 'Profile'})
                    }>
                    <Text>Profile</Text>
                  </Button>
                  <Button
                    backgroundColor={currentTheme.backgroundPrimary}
                    style={{
                      padding: 5,
                      paddingLeft: 8,
                      paddingRight: 8,
                      margin: 3,
                      flex: 1,
                    }}
                    onPress={() =>
                      this.setState({contextMenuUserSection: 'Mutual Servers'})
                    }>
                    <Text>Mut. Servers</Text>
                  </Button>
                  <Button
                    backgroundColor={currentTheme.backgroundPrimary}
                    style={{
                      padding: 5,
                      paddingLeft: 8,
                      paddingRight: 8,
                      margin: 3,
                      flex: 1,
                    }}
                    onPress={() =>
                      this.setState({contextMenuUserSection: 'Mutual Friends'})
                    }>
                    <Text>Mut. Friends</Text>
                  </Button>
                </View>
              ) : null}
              {this.state.contextMenuUserSection == 'Profile' ? (
                <ScrollView>
                  {this.state.contextMenuUser?.relationship != 'User' ? (
                    <>
                      {!this.state.contextMenuUser?.bot ? (
                        this.state.contextMenuUser?.relationship ===
                        'Friend' ? (
                          <ContextButton
                            onPress={async () => {
                              app.openProfile(null);
                              this.setState({
                                currentChannel:
                                  await this.state.contextMenuUser.openDM(),
                                messages: [],
                              });
                            }}>
                            <View style={styles.iconContainer}>
                              <MaterialIcon
                                name="message"
                                size={20}
                                color={currentTheme.foregroundPrimary}
                              />
                            </View>
                            <Text>Message</Text>
                          </ContextButton>
                        ) : this.state.contextMenuUser?.relationship ==
                          'Incoming' ? (
                          <>
                            <ContextButton
                              onPress={() => {
                                this.state.contextMenuUser?.addFriend();
                                this.setState({});
                              }}>
                              <View style={styles.iconContainer}>
                                <FA5Icon
                                  name="user-plus"
                                  size={16}
                                  color={currentTheme.foregroundPrimary}
                                />
                              </View>
                              <Text>Accept Friend Request</Text>
                            </ContextButton>
                            <ContextButton
                              onPress={() => {
                                this.state.contextMenuUser?.removeFriend();
                                this.setState({});
                              }}>
                              <View style={styles.iconContainer}>
                                <FA5Icon
                                  name="user-times"
                                  size={16}
                                  color={currentTheme.foregroundPrimary}
                                />
                              </View>
                              <Text>Reject Friend</Text>
                            </ContextButton>
                          </>
                        ) : this.state.contextMenuUser?.relationship ==
                          'Outgoing' ? (
                          <ContextButton
                            onPress={() => {
                              this.state.contextMenuUser?.removeFriend();
                              this.setState({});
                            }}>
                            <Text>Cancel Friend</Text>
                          </ContextButton>
                        ) : (
                          <ContextButton
                            onPress={() => {
                              this.state.contextMenuUser?.addFriend();
                              this.setState({});
                            }}>
                            <View style={styles.iconContainer}>
                              <FA5Icon
                                name="user-plus"
                                size={16}
                                color={currentTheme.foregroundPrimary}
                              />
                            </View>
                            <Text>Add Friend</Text>
                          </ContextButton>
                        )
                      ) : (
                        <>
                          <Text style={{fontWeight: 'bold'}}>BOT OWNER</Text>
                          {client.users.get(
                            this.state.contextMenuUser?.bot?.owner,
                          ) ? (
                            <ContextButton
                              onPress={async () => {
                                app.openProfile(
                                  client.users.get(
                                    this.state.contextMenuUser.bot.owner,
                                  ),
                                );
                              }}>
                              <MiniProfile
                                user={client.users.get(
                                  this.state.contextMenuUser.bot.owner,
                                )}
                              />
                            </ContextButton>
                          ) : (
                            <Text
                              style={{color: currentTheme.foregroundSecondary}}>
                              Unloaded user
                            </Text>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {app.settings.get('Show developer tools') ? (
                        <ContextButton
                          key={'Copy ID'}
                          onPress={() => {
                            Clipboard.setString(this.state.contextMenuUser._id);
                          }}>
                          <View style={styles.iconContainer}>
                            <FA5Icon
                              name="clipboard"
                              size={18}
                              color={currentTheme.foregroundPrimary}
                            />
                          </View>
                          <Text>
                            Copy ID{' '}
                            <Text
                              style={{
                                marginTop: 3,
                                fontSize: 12,
                                color: currentTheme.foregroundSecondary,
                              }}>
                              ({this.state.contextMenuUser?._id})
                            </Text>
                          </Text>
                        </ContextButton>
                      ) : null}
                      <Text
                        style={{
                          color: currentTheme.foregroundSecondary,
                          fontWeight: 'bold',
                        }}>
                        STATUS
                      </Text>
                      <View style={{flexDirection: 'row'}}>
                        {['Online', 'Idle', 'Focus', 'Busy', 'Invisible'].map(
                          s => (
                            <ContextButton
                              key={s}
                              style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 3,
                              }}
                              onPress={() => {
                                client.users.edit({
                                  status: {...client.user.status, presence: s},
                                });
                              }}>
                              <View
                                style={{
                                  backgroundColor: currentTheme['status' + s],
                                  height: 16,
                                  width: 16,
                                  borderRadius: 10000,
                                }}
                              />
                            </ContextButton>
                          ),
                        )}
                      </View>
                      <InputWithButton
                        placeholder="Custom status"
                        defaultValue={client.user.status.text}
                        onPress={v => {
                          client.users.edit({
                            status: {
                              ...client.user.status,
                              text: v ? v : undefined,
                            },
                          });
                        }}
                        buttonLabel="Set"
                        backgroundColor={currentTheme.backgroundPrimary}
                      />
                      <View style={{marginBottom: -6}} />
                    </>
                  )}
                  <RoleView
                    user={this.state.contextMenuUser}
                    server={this.state.contextMenuUserServer}
                  />
                  {this.state.contextMenuUser?.badges ? (
                    <>
                      <Text
                        style={{
                          color: currentTheme.foregroundSecondary,
                          fontWeight: 'bold',
                        }}>
                        BADGES
                      </Text>
                      <ScrollView
                        style={{
                          flexDirection: 'row',
                          height: 38,
                          marginTop: 2,
                          marginBottom: 2,
                        }}
                        contentContainerStyle={{alignItems: 'center'}}
                        horizontal={true}>
                        <>
                          {Object.keys(Badges).map(b => {
                            if (this.state.contextMenuUser.badges & Badges[b]) {
                              return (
                                <View
                                  style={{
                                    height: 32,
                                    width: 32,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 8,
                                  }}
                                  key={b}>
                                  {(() => {
                                    switch (b) {
                                      case 'Founder':
                                        return (
                                          <FA5Icon
                                            name="star"
                                            size={28}
                                            color={'red'}
                                          />
                                        );
                                      case 'Developer':
                                        return (
                                          <FA5Icon
                                            name="wrench"
                                            size={28}
                                            color={'orange'}
                                          />
                                        );
                                      case 'Translator':
                                        return (
                                          <MaterialIcon
                                            name="translate"
                                            size={28}
                                            color={'green'}
                                          />
                                        );
                                      case 'Supporter':
                                        return (
                                          <FA5Icon
                                            name="money-bill"
                                            size={20}
                                            color={'yellow'}
                                          />
                                        );
                                      case 'ResponsibleDisclosure':
                                        return (
                                          <FA5Icon
                                            name="shield-alt"
                                            size={28}
                                            color={'purple'}
                                          />
                                        );
                                      case 'EarlyAdopter':
                                        return (
                                          <FA5Icon
                                            name="clock"
                                            size={28}
                                            color={'cyan'}
                                          />
                                        );
                                      case 'PlatformModeration':
                                        return (
                                          <FA5Icon
                                            name="gavel"
                                            size={28}
                                            color={'brown'}
                                          />
                                        );
                                      default:
                                        return (
                                          <Text
                                            style={{
                                              color:
                                                currentTheme.foregroundSecondary,
                                              fontSize: 8,
                                            }}>
                                            [{b}]
                                          </Text>
                                        );
                                    }
                                  })()}
                                </View>
                              );
                            }
                          })}
                          {this.state.contextMenuUser?._id ==
                          '01FC1HP5H22F0M34MFFM9DZ099' ? (
                            <View
                              style={{
                                borderRadius: 3,
                                backgroundColor: currentTheme.accentColor,
                                height: 21,
                                padding: 4,
                              }}>
                              <Text
                                style={{
                                  color: currentTheme.accentColorForeground,
                                  fontWeight: 'bold',
                                  fontSize: 16,
                                  marginTop: -5,
                                  marginLeft: -1,
                                }}>
                                RV
                              </Text>
                            </View>
                          ) : null}
                        </>
                      </ScrollView>
                    </>
                  ) : null}
                  <Text
                    style={{
                      color: currentTheme.foregroundSecondary,
                      fontWeight: 'bold',
                    }}>
                    BIO
                  </Text>
                  {this.state.contextMenuUserProfile?.content ? (
                    <MarkdownView>
                      {parseRevoltNodes(
                        this.state.contextMenuUserProfile?.content,
                      )}
                    </MarkdownView>
                  ) : null}
                  <View style={{marginTop: 200}} />
                </ScrollView>
              ) : this.state.contextMenuUserSection == 'Mutual Servers' ? (
                <ScrollView>
                  <Text
                    style={{
                      color: currentTheme.foregroundSecondary,
                      fontWeight: 'bold',
                    }}>
                    MUTUAL SERVERS
                  </Text>
                  {this.state.contextMenuUserMutual.servers.map(s => {
                    s = client.servers.get(s);
                    return (
                      <ContextButton
                        key={s._id}
                        onPress={() => {
                          app.openServer(s);
                          app.openProfile(null);
                          app.openLeftMenu(true);
                        }}>
                        <GeneralAvatar attachment={s.icon} size={32} />
                        <Text>{s.name}</Text>
                      </ContextButton>
                    );
                  })}
                  <View style={{marginTop: 200}} />
                </ScrollView>
              ) : this.state.contextMenuUserSection == 'Mutual Friends' ? (
                <ScrollView>
                  <Text
                    style={{
                      color: currentTheme.foregroundSecondary,
                      fontWeight: 'bold',
                    }}>
                    MUTUAL FRIENDS
                  </Text>
                  {this.state.contextMenuUserMutual.users.map(u => {
                    u = client.users.get(u);
                    return (
                      <ContextButton
                        key={u._id}
                        onPress={() => {
                          app.openProfile(u);
                        }}>
                        <MiniProfile user={u} />
                      </ContextButton>
                    );
                  })}
                  <View style={{marginTop: 200}} />
                </ScrollView>
              ) : null}
            </View>
          </View>
        </Modal>
        <Modal
          visible={!!this.state.imageViewerImage}
          transparent={true}
          animationType="fade">
          <ImageViewer
            imageUrls={
              this.state.imageViewerImage?.metadata
                ? [
                    {
                      url: client.generateFileURL(this.state.imageViewerImage),
                      width: this.state.imageViewerImage.metadata.width,
                      height: this.state.imageViewerImage.metadata.height,
                    },
                  ]
                : [{url: this.state.imageViewerImage}]
            }
            renderHeader={() => (
              <View
                style={{
                  height: 50,
                  width: '100%',
                  justifyContent: 'center',
                  paddingLeft: 10,
                  paddingRight: 10,
                  flexDirection: 'row',
                }}>
                <Button
                  onPress={() =>
                    openUrl(
                      this.state.imageViewerImage?.metadata
                        ? client.generateFileURL(this.state.imageViewerImage)
                        : this.state.imageViewerImage,
                    )
                  }>
                  <Text>Open URL</Text>
                </Button>
                <View style={{marginLeft: 20}} />
                <Button onPress={() => this.setState({imageViewerImage: null})}>
                  <Text>Close</Text>
                </Button>
              </View>
            )}
            renderIndicator={(_1, _2) => null}
            enableSwipeDown={true}
            onCancel={() => this.setState({imageViewerImage: null})}
          />
        </Modal>
        <Modal
          visible={this.state.settingsOpen}
          transparent={true}
          animationType="slide">
          <View
            style={{
              flex: 1,
              backgroundColor: currentTheme.backgroundPrimary,
              padding: 15,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
            }}>
            {this.state.settingsSection == null ? (
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
                onPress={() => {
                  this.setState({settingsOpen: false});
                }}>
                <AntIcon
                  name="closecircle"
                  size={24}
                  color={currentTheme.foregroundSecondary}
                />
                <Text
                  style={{
                    color: currentTheme.foregroundSecondary,
                    fontSize: 20,
                    marginLeft: 5,
                  }}>
                  Close
                </Text>
              </Pressable>
            ) : (
              <></>
            )}
            <ScrollView style={{flex: 1}}>
              {this.state.settingsSection == null ? (
                <>
                  <ContextButton
                    style={{flex: 1}}
                    backgroundColor={currentTheme.backgroundSecondary}
                    onPress={() => {
                      this.setState({settingsSection: 'App'});
                    }}>
                    <Text>App</Text>
                  </ContextButton>
                  <ContextButton
                    style={{flex: 1}}
                    backgroundColor={currentTheme.backgroundSecondary}
                    onPress={() => {
                      this.setState({settingsSection: 'Account'});
                    }}>
                    <Text>Account</Text>
                  </ContextButton>
                </>
              ) : this.state.settingsSection === 'App' ? (
                <>
                  <Pressable
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                    onPress={() => {
                      this.setState({settingsSection: null});
                    }}>
                    <AntIcon
                      name="back"
                      size={24}
                      color={currentTheme.foregroundSecondary}
                    />
                    <Text
                      style={{
                        color: currentTheme.foregroundSecondary,
                        fontSize: 20,
                        marginLeft: 5,
                      }}>
                      Back
                    </Text>
                  </Pressable>
                  {Object.entries(app.settings).map(([k, v]) => {
                    if (
                      v.experimental &&
                      !app.settings.get('Show experimental features')
                    )
                      return null;
                    if (
                      v.developer &&
                      !app.settings.get('Show developer tools')
                    )
                      return null;
                    if (v.type == 'boolean') {
                      return (
                        <View
                          key={k}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 10,
                          }}>
                          {v.experimental ? (
                            <View style={styles.iconContainer}>
                              <FA5Icon
                                name="flask"
                                size={16}
                                color={currentTheme.accentColor}
                              />
                            </View>
                          ) : null}
                          {v.developer ? (
                            <View style={styles.iconContainer}>
                              <FA5Icon
                                name="bug"
                                size={16}
                                color={currentTheme.accentColor}
                              />
                            </View>
                          ) : null}
                          <Text style={{flex: 1, fontWeight: 'bold'}}>
                            {v.name}
                          </Text>
                          <TouchableOpacity
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              backgroundColor: app.settings.get(k)
                                ? currentTheme.accentColor
                                : currentTheme.backgroundSecondary,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onPress={() => {
                              app.settings.set(k, !app.settings.get(k));
                              rerender();
                            }}>
                            <Text
                              style={{
                                color: app.settings.get(k)
                                  ? currentTheme.accentColorForeground
                                  : currentTheme.foregroundPrimary,
                              }}>
                              {app.settings.get(k) ? (
                                <FA5Icon
                                  name="check"
                                  color={currentTheme.accentColorForeground}
                                  size={24}
                                />
                              ) : null}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    } else if (v.type == 'string' || v.type == 'number') {
                      return (
                        <View
                          key={k}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 10,
                          }}>
                          {v.options ? (
                            <View>
                              {v.experimental ? (
                                <View style={styles.iconContainer}>
                                  <FA5Icon
                                    name="flask"
                                    size={16}
                                    color={currentTheme.accentColor}
                                  />
                                </View>
                              ) : null}
                              {v.developer ? (
                                <View style={styles.iconContainer}>
                                  <FA5Icon
                                    name="bug"
                                    size={16}
                                    color={currentTheme.accentColor}
                                  />
                                </View>
                              ) : null}
                              <Text style={{flex: 1, fontWeight: 'bold'}}>
                                {v.name}
                              </Text>
                              <ScrollView
                                style={{
                                  borderRadius: 8,
                                  /*maxHeight: 160,*/ minWidth: '100%',
                                  backgroundColor:
                                    currentTheme.backgroundSecondary,
                                  padding: 8,
                                  paddingRight: 12,
                                }}>
                                {v.options.map(o => (
                                  <TouchableOpacity
                                    key={o}
                                    style={styles.actionTile}
                                    onPress={() => {
                                      app.settings.set(k, o);
                                      rerender();
                                    }}>
                                    <Text>
                                      {o}{' '}
                                      {app.settings.getRaw(k) == o ? (
                                        <Text>(active)</Text>
                                      ) : null}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                                <View style={{marginTop: 2}} />
                              </ScrollView>
                            </View>
                          ) : (
                            <View>
                              {v.experimental ? (
                                <FA5Icon
                                  name="flask"
                                  size={16}
                                  color={currentTheme.accentColor}
                                />
                              ) : null}
                              {v.developer ? (
                                <FA5Icon
                                  name="bug"
                                  size={16}
                                  color={currentTheme.accentColor}
                                />
                              ) : null}
                              <Text style={{flex: 1, fontWeight: 'bold'}}>
                                {v.name}
                              </Text>
                              <TextInput
                                style={{
                                  minWidth: '100%',
                                  borderRadius: 8,
                                  backgroundColor:
                                    currentTheme.backgroundSecondary,
                                  padding: 6,
                                  paddingLeft: 10,
                                  paddingRight: 10,
                                  color: currentTheme.foregroundPrimary,
                                }}
                                value={app.settings.getRaw(k)}
                                keyboardType={
                                  v.type == 'number' ? 'decimal-pad' : 'default'
                                }
                                onChangeText={v => {
                                  app.settings.set(k, v);
                                  rerender();
                                }}
                              />
                            </View>
                          )}
                        </View>
                      );
                    }
                  })}
                  <ContextButton
                    backgroundColor={currentTheme.accentColor}
                    style={{justifyContent: 'center', marginTop: 10}}
                    onPress={() => {
                      app.settings.clear();
                      rerender();
                    }}>
                    <Text style={{color: currentTheme.accentColorForeground}}>
                      Reset Settings
                    </Text>
                  </ContextButton>
                </>
              ) : this.state.settingsSection == 'Account' ? (
                <View>
                  <Pressable
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                    onPress={() => {
                      this.setState({settingsSection: null});
                    }}>
                    <AntIcon
                      name="back"
                      size={24}
                      color={currentTheme.foregroundSecondary}
                    />
                    <Text
                      style={{
                        color: currentTheme.foregroundSecondary,
                        fontSize: 20,
                        marginLeft: 5,
                      }}>
                      Back
                    </Text>
                  </Pressable>
                  <Text style={{fontSize: 24, fontWeight: 'bold'}}>
                    Account
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </Modal>
        <Modal
          visible={!!this.state.contextMenuServer}
          transparent={true}
          animationType="slide">
          <Pressable
            onPress={() => app.openServerContextMenu(null)}
            style={{
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
              position: 'absolute',
              backgroundColor: '#00000000',
            }}
          />
          <View
            style={{
              width: '100%',
              height: Dimensions.get('window').height * 0.75,
              top: '25%',
              padding: 15,
              backgroundColor: currentTheme.backgroundSecondary,
            }}>
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              {this.state.contextMenuServer?.icon ? (
                <GeneralAvatar
                  attachment={this.state.contextMenuServer?.icon}
                  size={72}
                />
              ) : null}
              <Text
                style={{
                  color: currentTheme.foregroundPrimary,
                  fontWeight: 'bold',
                  fontSize: 24,
                  textAlign: 'center',
                }}>
                {this.state.contextMenuServer?.name}
              </Text>
              {this.state.contextMenuServer?.description ? (
                <Text
                  style={{
                    color: currentTheme.foregroundSecondary,
                    fontSize: 16,
                    textAlign: 'center',
                  }}>
                  {this.state.contextMenuServer?.description}
                </Text>
              ) : null}
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10,
              }}>
              {app.settings.get('Show developer tools') ? (
                <ContextButton
                  key={'Copy ID'}
                  onPress={() => {
                    Clipboard.setString(this.state.contextMenuServer._id);
                  }}>
                  <View style={styles.iconContainer}>
                    <FA5Icon
                      name="clipboard"
                      size={18}
                      color={currentTheme.foregroundPrimary}
                    />
                  </View>
                  <Text>
                    Copy ID{' '}
                    <Text
                      style={{
                        fontSize: 12,
                        color: currentTheme.foregroundSecondary,
                      }}>
                      ({this.state.contextMenuServer?._id})
                    </Text>
                  </Text>
                </ContextButton>
              ) : null}
            </View>
          </View>
        </Modal>
        <Modal
          visible={!!this.state.inviteServer}
          transparent={true}
          animationType="fade">
          <View
            style={{flex: 1, backgroundColor: currentTheme.backgroundPrimary}}>
            <Pressable
              onPress={() => {
                this.setState({inviteServer: null});
              }}>
              <Text style={{fontSize: 24}}>Close</Text>
            </Pressable>
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              {this.state.inviteServer?.type === 'Server' ? (
                <>
                  {this.state.inviteServer.server_banner ? (
                    <Image
                      source={
                        this.state.inviteServer.server_banner
                          ? {
                              uri: client.generateFileURL(
                                this.state.inviteServer.server_banner,
                              ),
                            }
                          : {}
                      }
                      style={{width: '100%', height: '100%'}}
                    />
                  ) : null}
                  <View
                    style={{
                      height: '100%',
                      width: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <View
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        margin: 10,
                        backgroundColor: currentTheme.backgroundPrimary + 'dd',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{alignItems: 'center', flexDirection: 'row'}}>
                        <GeneralAvatar
                          attachment={this.state.inviteServer.server_icon}
                          size={60}
                        />
                        <View style={{marginLeft: 10}} />
                        <ServerName
                          server={this.state.inviteServer}
                          size={26}
                        />
                      </View>
                      <Button
                        onPress={async () => {
                          !client.servers.get(
                            this.state.inviteServer?.server_id,
                          ) &&
                            (await client.joinInvite(
                              this.state.inviteServerCode,
                            ));
                          app.openServer(
                            client.servers.get(
                              this.state.inviteServer?.server_id,
                            ),
                          );
                          app.openLeftMenu(true);
                          this.setState({
                            inviteServer: null,
                            inviteServerCode: null,
                          });
                        }}>
                        <Text>
                          {client.servers.get(
                            this.state.inviteServer?.server_id,
                          )
                            ? 'Go to Server'
                            : 'Join Server'}
                        </Text>
                      </Button>
                    </View>
                  </View>
                </>
              ) : (
                <Text>{this.state.inviteServer?.toString()}</Text>
              )}
            </View>
          </View>
        </Modal>
        <Modal
          visible={!!this.state.inviteBot}
          transparent={true}
          animationType="fade">
          {this.state.inviteBot ? (
            <View
              style={{
                flex: 1,
                backgroundColor: currentTheme.backgroundPrimary,
              }}>
              <Pressable
                onPress={() => {
                  this.setState({inviteBot: null});
                }}>
                <Text style={{fontSize: 24}}>Cancel</Text>
              </Pressable>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <GeneralAvatar
                    attachment={this.state.inviteBot.avatar}
                    size={48}
                  />
                  <Text
                    style={{paddingLeft: 10, fontSize: 24, fontWeight: 'bold'}}>
                    {this.state.inviteBot.username}
                  </Text>
                </View>
                <View style={{height: 56}}>
                  <ScrollView horizontal={true}>
                    <ServerList
                      onServerPress={(s: Server) =>
                        this.setState({inviteBotDestination: s})
                      }
                      filter={(s: Server) => s.havePermission('ManageServer')}
                      showUnread={false}
                    />
                  </ScrollView>
                </View>
                <Button
                  onPress={() => {
                    if (!this.state.inviteBotDestination) {
                      return;
                    }
                    client.bots.invite(this.state.inviteBot._id, {
                      server: this.state.inviteBotDestination._id,
                    });
                    this.setState({
                      inviteBot: null,
                      inviteBotDestination: null,
                    });
                  }}>
                  <Text>
                    Invite to{' '}
                    {this.state.inviteBotDestination ? (
                      <Text style={{fontWeight: 'bold'}}>
                        {this.state.inviteBotDestination?.name}
                      </Text>
                    ) : (
                      'which server?'
                    )}
                  </Text>
                </Button>
              </View>
            </View>
          ) : null}
        </Modal>
      </>
    );
  }
}
