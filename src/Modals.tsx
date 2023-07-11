import React from 'react';
import {View, Pressable, Modal, Dimensions} from 'react-native';
import {observer} from 'mobx-react';

import ImageViewer from 'react-native-image-zoom-viewer';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Server, User, Message, Channel} from 'revolt.js';

import {app, client, openUrl, setFunction} from './Generic';
import {styles, currentTheme} from './Theme';
import {GapView} from './components/layout';
import {
  BotInviteSheet,
  ChannelInfoSheet,
  MemberListSheet,
  MessageMenuSheet,
  ProfileSheet,
  ReportSheet,
  ServerInfoSheet,
  ServerInviteSheet,
  SettingsSheet,
  StatusSheet,
} from './components/sheets/';

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
      memberListContext: null,
      memberListUsers: null,
      contextMenuChannel: null,
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
    setFunction(
      'openMemberList',
      async (context: Channel | Server | null, users: User[] | null) => {
        this.setState({memberListContext: context, memberListUsers: users});
      },
    );
    setFunction('openChannelContextMenu', async (channel: Channel | null) => {
      this.setState({contextMenuChannel: channel});
    });
  }
  render() {
    return (
      <>
        <Modal
          key={'messageMenu'}
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
              height: '50%',
              top: '50%',
              backgroundColor: currentTheme.backgroundSecondary,
            }}>
            <MessageMenuSheet
              setState={() => {
                this.setState({contextMenuMessage: null});
              }}
              message={this.state.contextMenuMessage}
            />
          </View>
        </Modal>
        <Modal
          key={'statusMenu'}
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
            <StatusSheet />
          </View>
        </Modal>
        <Modal
          key={'profileMenu'}
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
                      url: client.generateFileURL(this.state.imageViewerImage)!,
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
                  paddingHorizontal: 10,
                  justifyContent: 'space-between',
                  paddingVertical: 9,
                  flexDirection: 'row',
                }}>
                <Pressable
                  onPress={() =>
                    openUrl(
                      this.state.imageViewerImage?.metadata
                        ? client.generateFileURL(this.state.imageViewerImage)
                        : this.state.imageViewerImage,
                    )
                  }>
                  <MaterialCommunityIcon
                    name="web"
                    size={32}
                    color={currentTheme.foregroundSecondary}
                  />
                </Pressable>
                <GapView size={5} type={'horizontal'} />
                <Pressable
                  onPress={() => this.setState({imageViewerImage: null})}>
                  <MaterialCommunityIcon
                    name="close-circle"
                    size={32}
                    color={currentTheme.foregroundSecondary}
                  />
                </Pressable>
              </View>
            )}
            renderIndicator={(_1, _2) => <></>}
            enableSwipeDown={true}
            onCancel={() => this.setState({imageViewerImage: null})}
          />
        </Modal>
        <Modal
          visible={this.state.settingsOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => this.setState({settingsOpen: false})}>
          <SettingsSheet
            setState={() => this.setState({settingsOpen: false})}
          />
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
              setState={() => {
                this.setState({contextMenuServer: null});
              }}
              server={this.state.contextMenuServer}
            />
          </View>
        </Modal>
        <Modal
          visible={!!this.state.inviteServer}
          transparent={true}
          animationType="fade"
          onRequestClose={() => this.setState({inviteServer: null})}>
          <ServerInviteSheet
            setState={() => {
              this.setState({
                inviteServer: null,
                inviteServerCode: null,
              });
            }}
            server={this.state.inviteServer}
            inviteCode={this.state.inviteServerCode}
          />
        </Modal>
        <Modal
          visible={!!this.state.inviteBot}
          transparent={true}
          animationType="fade">
          <BotInviteSheet
            setState={() => {
              this.setState({
                inviteBot: null,
              });
            }}
            bot={this.state.inviteBot}
          />
        </Modal>
        <Modal
          key={'reportModal'}
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
        <Modal
          key={'memberList'}
          animationType="slide"
          transparent={true}
          visible={
            !!this.state.memberListContext && !!this.state.memberListUsers
          }
          onRequestClose={() =>
            this.setState({memberListContext: null, memberListUsers: null})
          }>
          <Pressable
            onPress={() =>
              this.setState({memberListContext: null, memberListUsers: null})
            }
            style={{
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
              position: 'absolute',
              backgroundColor: '#00000000',
            }}
          />
          <View style={styles.sheetBackground}>
            <MemberListSheet
              context={this.state.memberListContext}
              users={this.state.memberListUsers}
            />
          </View>
        </Modal>
        <Modal
          visible={!!this.state.contextMenuChannel}
          transparent={true}
          animationType="slide"
          onRequestClose={() => app.openChannelContextMenu(null)}>
          <Pressable
            onPress={() => app.openChannelContextMenu(null)}
            style={{
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
              position: 'absolute',
              backgroundColor: '#00000000',
            }}
          />
          <View style={styles.sheetBackground}>
            <ChannelInfoSheet channel={this.state.contextMenuChannel} />
          </View>
        </Modal>
      </>
    );
  }
}
