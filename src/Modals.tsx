import {View, Pressable, Modal, ScrollView, Dimensions} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import React from 'react';
import {
  client,
  Text,
  app,
  GeneralAvatar,
  ServerList,
  openUrl,
  setFunction,
  ContextButton,
  Button,
  InputWithButton,
} from './Generic';
import {styles, currentTheme} from './Theme';
import {
  MessageMenuSheet,
  ProfileSheet,
  ReportSheet,
  ServerInfoSheet,
  SettingsSheet,
} from './components/sheets/';
import {Server, User, Message, Channel} from 'revolt.js';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialIcons';
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
      contextMenuUserServer: null,
      imageViewerImage: null,
      settingsOpen: false,
      contextMenuServer: null,
      inviteServer: null,
      inviteServerCode: '',
      inviteBot: null,
      showStatusMenu: null,
    };
    setFunction('openProfile', async (u: User, s: Server) => {
      this.setState({
        contextMenuUser: u || null,
        contextMenuUserServer: s || null,
      });
    });
    setFunction('openInvite', async (i: string) => {
      try {
        let community = await client.fetchInvite(i);
        if (community.type === 'Server') {
          this.setState({
            inviteServer: community,
            inviteServerCode: i,
          });
        }
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
    setFunction('openSettings', async (o: boolean) => {
      this.setState({settingsOpen: o || !this.state.settingsOpen});
    });
    setFunction('openDirectMessage', async (dm: Channel) => {
      this.setState({
        contextMenuUser: null,
        contextMenuUserServer: null,
      });
      app.openChannel(dm);
    });
    setFunction('openStatusMenu', async (show: boolean) => {
      this.setState({showStatusMenu: show});
    });
    setFunction(
      'openReportMenu',
      async (object: User | Server | Message | null, type: string | null) => {
        this.setState({reportObject: object, reportType: type});
      },
    );
  }
  render() {
    return (
      <>
        <Modal
          key="messageMenu"
          animationType="slide"
          transparent={true}
          visible={!!this.state.contextMenuMessage}
          onRequestClose={() => this.setState({contextMenuMessage: null})}>
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
            <MessageMenuSheet
              state={this}
              message={this.state.contextMenuMessage}
            />
          </View>
        </Modal>
        <Modal
          key="statusMenu"
          animationType="slide"
          transparent={true}
          visible={!!this.state.showStatusMenu}
          onRequestClose={() => {
            app.openStatusMenu(null);
            this.setState({userStatusInput: ''});
          }}>
          <Pressable
            onPress={() => {
              app.openStatusMenu(null);
              this.setState({userStatusInput: ''});
            }}
            style={{
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
              position: 'absolute',
              backgroundColor: '#00000000',
            }}
          />
          <View style={styles.sheetBackground}>
            <View>
              <Text
                key={'custom-status-selector-label'}
                style={styles.headerv2}>
                Status
              </Text>
              <View style={{marginBottom: 10}}>
                {['Online', 'Idle', 'Focus', 'Busy', 'Invisible'].map(s => (
                  <ContextButton
                    key={s}
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
                        marginRight: 10,
                      }}
                    />
                    <Text style={{fontSize: 15}} key={`${s}-button-label`}>
                      {s}
                    </Text>
                  </ContextButton>
                ))}
              </View>
              <Text key={'custom-status-input-label'} style={styles.headerv2}>
                Status text
              </Text>
              <InputWithButton
                placeholder="Custom status"
                defaultValue={client.user?.status?.text}
                onPress={(v: string) => {
                  client.users.edit({
                    status: {
                      ...client.user?.status,
                      text: v ? v : undefined,
                    },
                  });
                }}
                buttonLabel="Set text"
                backgroundColor={currentTheme.backgroundPrimary}
              />
            </View>
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
            }}
            style={{
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
              position: 'absolute',
              backgroundColor: '#00000000',
            }}
          />
          <View style={styles.sheetBackground}>
            <ProfileSheet
              user={this.state.contextMenuUser}
              server={this.state.contextMenuUserServer}
            />
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
                  <Text>Open in Browser</Text>
                </Button>
                <View style={{marginLeft: 10}} />
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
          animationType="slide"
          onRequestClose={() => this.setState({settingsOpen: false})}>
          <SettingsSheet state={this} />
        </Modal>
        <Modal
          visible={!!this.state.contextMenuServer}
          transparent={true}
          animationType="slide"
          onRequestClose={() => app.openServerContextMenu(null)}>
          <Pressable
            onPress={() => app.openServerContextMenu(null)}
            style={{
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
              position: 'absolute',
              backgroundColor: '#00000000',
            }}
          />
          <View style={styles.sheetBackground}>
            <ServerInfoSheet
              state={this}
              server={this.state.contextMenuServer}
            />
          </View>
        </Modal>
        <Modal
          visible={!!this.state.inviteServer}
          transparent={true}
          animationType="fade"
          onRequestClose={() => this.setState({inviteServer: null})}>
          <View
            style={{flex: 1, backgroundColor: currentTheme.backgroundPrimary}}>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                margin: 15,
              }}
              onPress={() => {
                this.setState({inviteServer: null});
              }}>
              <MaterialCommunityIcon
                name="close-circle"
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
                        maxWidth: '80%',
                        backgroundColor: currentTheme.backgroundPrimary + 'dd',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{alignItems: 'center', flexDirection: 'row'}}>
                        <GeneralAvatar
                          attachment={this.state.inviteServer.server_icon?._id}
                          size={60}
                          directory={'/icons/'}
                        />
                        <View style={{marginLeft: 10}} />
                        <View style={{flexDirection: 'row'}}>
                          <Text
                            style={{
                              fontWeight: 'bold',
                              fontSize: 26,
                              flexWrap: 'wrap',
                            }}>
                            {this.state.inviteServer?.server_name}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{
                          marginVertical: 4,
                          color: currentTheme.foregroundSecondary,
                        }}>
                        {this.state.inviteServer?.member_count}{' '}
                        {this.state.inviteServer?.member_count === 1
                          ? 'member'
                          : 'members'}
                      </Text>
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
                      showDiscover={false}
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
        <Modal
          key="reportModal"
          animationType="slide"
          transparent={true}
          visible={!!this.state.reportObject}
          onRequestClose={() => app.openReportMenu(null, null)}>
          <Pressable
            onPress={() => {
              app.openReportMenu(null, null);
            }}
            style={{
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
              position: 'absolute',
              backgroundColor: '#00000000',
            }}
          />
          <View style={styles.sheetBackground}>
            <ReportSheet
              object={this.state.reportObject}
              type={this.state.reportType}
            />
          </View>
        </Modal>
      </>
    );
  }
}
