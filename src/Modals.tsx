import React from 'react';
import {Modal, Pressable, ScrollView, View} from 'react-native';
import {observer} from 'mobx-react';

import Modal2 from 'react-native-modal';
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

const BottomSheet = observer(
  ({
    sheetKey,
    visible,
    callback,
    includeScrollView,
    children,
  }: {
    sheetKey: string;
    visible: boolean;
    callback: Function;
    includeScrollView?: boolean;
    children: any;
  }) => {
    return (
      <Modal2
        key={sheetKey}
        isVisible={visible}
        onBackdropPress={() => callback()}
        onBackButtonPress={() => callback()}
        swipeDirection={'down'}
        onSwipeComplete={() => callback()}
        propagateSwipe
        style={{
          width: '100%',
          marginHorizontal: 0,
          marginBottom: 0,
          justifyContent: 'flex-end',
        }}>
        <View style={styles.sheetBackground}>
          <View
            style={{
              alignSelf: 'center',
              width: '25%',
              height: '1%',
              backgroundColor: currentTheme.foregroundPrimary,
              borderRadius: 16,
              marginBottom: 12,
            }}
          />
          {includeScrollView ? <ScrollView>{children}</ScrollView> : children}
        </View>
      </Modal2>
    );
  },
);

@observer
export class Modals extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // MESSAGE SHEET
      showMessageMenu: false,
      contextMenuMessage: null,
      // PROFILE SHEET
      showUserMenu: false,
      contextMenuUser: null,
      contextMenuUserServer: null,
      // IMAGE VIEWER
      imageViewerImage: null,
      // SETTINGS
      settingsOpen: false,
      // SERVER SHEET
      showServerMenu: false,
      contextMenuServer: null,
      // INVITE MENUS
      inviteServer: null,
      inviteServerCode: '',
      inviteBot: null,
      // STATUS MENU
      showStatusMenu: false,
      // MEMBER LIST
      showMemberList: false,
      memberListContext: null,
      memberListUsers: null,
      // CHANNEL MENU
      showChannelMenu: false,
      contextMenuChannel: null,
      // REPORT MENU
      showReportMenu: false,
      reportObject: null,
      reportType: null,
    };
    setFunction('openProfile', async (u: User | null, s: Server | null) => {
      this.setState(
        u
          ? {
              showUserMenu: true,
              contextMenuUser: u,
              contextMenuUserServer: s,
            }
          : {showUserMenu: false},
      );
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
    setFunction('openImage', async (a: any) => {
      this.setState({imageViewerImage: a});
    });
    setFunction('openServerContextMenu', async (s: Server | null) => {
      this.setState(
        s
          ? {showServerMenu: true, contextMenuServer: s}
          : {showServerMenu: false},
      );
    });
    setFunction('openMessage', async (m: Message | null) => {
      this.setState(
        m
          ? {showMessageMenu: true, contextMenuMessage: m}
          : {showMessageMenu: false},
      );
    });
    setFunction('openSettings', async (o: boolean) => {
      this.setState({settingsOpen: o || !this.state.settingsOpen});
    });
    setFunction('openDirectMessage', async (dm: Channel) => {
      this.setState({
        showUserMenu: false,
      });
      app.openChannel(dm);
    });
    setFunction('openStatusMenu', async (show: boolean) => {
      this.setState({showStatusMenu: show});
    });
    setFunction(
      'openReportMenu',
      async (object: User | Server | Message | null, type: string | null) => {
        this.setState(
          object
            ? {showReportMenu: true, reportObject: object, reportType: type}
            : {showReportMenu: false},
        );
      },
    );
    setFunction(
      'openMemberList',
      async (context: Channel | Server | null, users: User[] | null) => {
        this.setState(
          context
            ? {
                showMemberList: true,
                memberListContext: context,
                memberListUsers: users,
              }
            : {showMemberList: false},
        );
      },
    );
    setFunction('openChannelContextMenu', async (channel: Channel | null) => {
      this.setState(
        channel
          ? {showChannelMenu: true, contextMenuChannel: channel}
          : {showChannelMenu: false},
      );
    });
  }
  render() {
    return (
      <>
        <BottomSheet
          sheetKey={'messageMenu'}
          visible={this.state.showMessageMenu}
          callback={() => app.openMessage(null)}>
          <MessageMenuSheet
            setState={() => {
              app.openMessage(null);
            }}
            message={this.state.contextMenuMessage}
          />
        </BottomSheet>
        <BottomSheet
          sheetKey={'statusMenu'}
          visible={this.state.showStatusMenu}
          callback={() => {
            app.openStatusMenu(false);
            this.setState({userStatusInput: ''});
          }}>
          <StatusSheet />
        </BottomSheet>
        <BottomSheet
          sheetKey={'profileMenu'}
          visible={this.state.showUserMenu}
          callback={() => app.openProfile(null)}
          includeScrollView>
          <ProfileSheet
            user={this.state.contextMenuUser}
            server={this.state.contextMenuUserServer}
          />
        </BottomSheet>
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
        <BottomSheet
          sheetKey={'serverMenu'}
          visible={this.state.showServerMenu}
          callback={() => app.openServerContextMenu(null)}>
          <ServerInfoSheet
            setState={() => {
              this.setState({contextMenuServer: null});
            }}
            server={this.state.contextMenuServer}
          />
        </BottomSheet>
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
        <BottomSheet
          sheetKey={'reportModal'}
          visible={this.state.showReportMenu}
          callback={() => app.openReportMenu(null, null)}>
          <ReportSheet
            object={this.state.reportObject}
            type={this.state.reportType}
          />
        </BottomSheet>
        <BottomSheet
          sheetKey={'memberList'}
          visible={this.state.showMemberList}
          callback={() => app.openMemberList(null, null)}>
          <MemberListSheet
            context={this.state.memberListContext}
            users={this.state.memberListUsers}
          />
        </BottomSheet>
        <BottomSheet
          sheetKey={'channelMenu'}
          visible={this.state.showChannelMenu}
          callback={() => app.openChannelContextMenu(null)}>
          <ChannelInfoSheet channel={this.state.contextMenuChannel} />
        </BottomSheet>
      </>
    );
  }
}
