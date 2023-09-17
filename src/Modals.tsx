import React from 'react';
import {Modal, Pressable, ScrollView, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import BottomSheet from '@gorhom/bottom-sheet';
import Modal2 from 'react-native-modal';
import ImageViewer from 'react-native-image-zoom-viewer';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {API, Channel, Message, Server, User} from 'revolt.js';

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
import type {ReportedObject} from './lib/types';

const MBottomSheet = observer(
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

export const Modals = observer(() => {
  const [messageMenuState, setMessageMenuState] = React.useState({
    showMessageMenu: false,
    contextMenuMessage: null,
  } as {showMessageMenu: boolean; contextMenuMessage: Message | null});
  const [statusMenuState, setStatusMenuState] = React.useState(false);
  const [profileMenuState, setProfileMenuState] = React.useState({
    showUserMenu: false,
    contextMenuUser: null,
    contextMenuUserServer: null,
  } as {
    showUserMenu: boolean;
    contextMenuUser: User | null;
    contextMenuUserServer: Server | null;
  });
  const [imageViewerState, setImageViewerState] = React.useState({
    i: null as any,
  });
  const [settingsVisibility, setSettingsVisibility] = React.useState(false);
  const [reportMenuState, setReportMenuState] = React.useState({
    showReportMenu: false,
    reportObject: null,
  } as {
    showReportMenu: boolean;
    reportObject: ReportedObject | null;
  });
  const [channelMenuState, setChannelMenuState] = React.useState({
    showChannelMenu: false,
    channelMenuChannel: null,
  } as {
    showChannelMenu: boolean;
    channelMenuChannel: Channel | null;
  });
  const [inviteServer, setInviteServer] = React.useState({
    inviteServer: null,
    inviteServerCode: '',
  } as {
    inviteServer: API.InviteResponse | null;
    inviteServerCode: string;
  });
  const [inviteBot, setInviteBot] = React.useState(null as User | null);
  const [serverMenuState, setServerMenuState] = React.useState({
    showServerMenu: false,
    contextMenuServer: null,
  } as {
    showServerMenu: boolean;
    contextMenuServer: Server | null;
  });
  const [memberListState, setMemberListState] = React.useState({
    showMemberList: false,
    memberListContext: null,
    memberListUsers: null,
  } as {
    showMemberList: boolean;
    memberListContext: Channel | /* Server | */ null;
    memberListUsers: User[] | null;
  });

  setFunction('openMessage', async (m: Message | null) => {
    setMessageMenuState(
      m
        ? {showMessageMenu: true, contextMenuMessage: m}
        : {...messageMenuState, showMessageMenu: false},
    );
  });
  setFunction('openStatusMenu', async (show: boolean) => {
    setStatusMenuState(show);
  });
  setFunction('openProfile', async (u: User | null, s: Server | null) => {
    setProfileMenuState(
      u
        ? {
            showUserMenu: true,
            contextMenuUser: u,
            contextMenuUserServer: s,
          }
        : {...profileMenuState, showUserMenu: false},
    );
  });
  setFunction('openDirectMessage', async (dm: Channel) => {
    setProfileMenuState({
      ...profileMenuState,
      showUserMenu: false,
    });
    app.openChannel(dm);
  });
  setFunction('openImage', async (a: any) => {
    setImageViewerState({i: a});
  });
  setFunction('openSettings', async (o: boolean) => {
    setSettingsVisibility(o);
  });
  setFunction('openReportMenu', async (object: ReportedObject | null) => {
    setReportMenuState(
      object
        ? {showReportMenu: true, reportObject: object}
        : {...reportMenuState, showReportMenu: false},
    );
  });
  setFunction('openChannelContextMenu', async (channel: Channel | null) => {
    setChannelMenuState(
      channel
        ? {showChannelMenu: true, channelMenuChannel: channel}
        : {...channelMenuState, showChannelMenu: false},
    );
  });
  setFunction('openInvite', async (i: string) => {
    try {
      let community = await client.fetchInvite(i);
      if (community.type === 'Server') {
        setInviteServer({
          inviteServer: community,
          inviteServerCode: i,
        });
      }
    } catch (e) {
      console.log(e);
    }
  });
  setFunction('openBotInvite', async (id: string) => {
    setInviteBot(await client.bots.fetchPublic(id).catch(e => e));
  });
  setFunction('openServerContextMenu', async (s: Server | null) => {
    setServerMenuState(
      s
        ? {showServerMenu: true, contextMenuServer: s}
        : {...serverMenuState, showServerMenu: false},
    );
  });
  setFunction(
    'openMemberList',
    async (context: Channel | /* Server | */ null, users: User[] | null) => {
      setMemberListState(
        context
          ? {
              showMemberList: true,
              memberListContext: context,
              memberListUsers: users,
            }
          : {...memberListState, showMemberList: false},
      );
    },
  );

  return (
    <>
      <MBottomSheet
        sheetKey={'messageMenu'}
        visible={messageMenuState.showMessageMenu}
        callback={() => app.openMessage(null)}>
        <MessageMenuSheet
          setState={() => {
            app.openMessage(null);
          }}
          message={messageMenuState.contextMenuMessage!}
        />
      </MBottomSheet>
      <MBottomSheet
        sheetKey={'statusMenu'}
        visible={statusMenuState}
        callback={() => {
          app.openStatusMenu(false);
        }}>
        <StatusSheet />
      </MBottomSheet>
      <MBottomSheet
        sheetKey={'profileMenu'}
        visible={profileMenuState.showUserMenu}
        callback={() => app.openProfile(null)}
        includeScrollView>
        <ProfileSheet
          user={profileMenuState.contextMenuUser!}
          server={profileMenuState.contextMenuUserServer!}
        />
      </MBottomSheet>
      <Modal
        visible={!!imageViewerState.i}
        transparent={true}
        animationType="fade">
        <ImageViewer
          imageUrls={
            imageViewerState.i?.metadata
              ? [
                  {
                    url: client.generateFileURL(imageViewerState.i)!,
                    width: imageViewerState.i.metadata.width,
                    height: imageViewerState.i.metadata.height,
                  },
                ]
              : [{url: imageViewerState.i}]
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
                    imageViewerState.i?.metadata
                      ? client.generateFileURL(imageViewerState.i)
                      : imageViewerState.i,
                  )
                }>
                <MaterialCommunityIcon
                  name="web"
                  size={32}
                  color={currentTheme.foregroundSecondary}
                />
              </Pressable>
              <GapView size={5} type={'horizontal'} />
              <Pressable onPress={() => setImageViewerState({i: null})}>
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
          onCancel={() => setImageViewerState({i: null})}
        />
      </Modal>
      <Modal
        visible={settingsVisibility}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSettingsVisibility(false)}>
        <SettingsSheet setState={() => setSettingsVisibility(false)} />
      </Modal>
      <MBottomSheet
        sheetKey={'reportModal'}
        visible={reportMenuState.showReportMenu}
        callback={() => app.openReportMenu(null)}>
        <ReportSheet obj={reportMenuState.reportObject!} />
      </MBottomSheet>
      <MBottomSheet
        sheetKey={'channelMenu'}
        visible={channelMenuState.showChannelMenu}
        callback={() => app.openChannelContextMenu(null)}>
        <ChannelInfoSheet channel={channelMenuState.channelMenuChannel!} />
      </MBottomSheet>
      <Modal
        visible={!!inviteServer.inviteServer}
        transparent={true}
        animationType="fade"
        onRequestClose={() =>
          setInviteServer({inviteServer: null, inviteServerCode: ''})
        }>
        <ServerInviteSheet
          setState={() => {
            setInviteServer({
              inviteServer: null,
              inviteServerCode: '',
            });
          }}
          // @ts-expect-error this will always be a server response (TODO: figure out a solution?)
          server={inviteServer.inviteServer}
          inviteCode={inviteServer.inviteServerCode}
        />
      </Modal>
      <Modal visible={!!inviteBot} transparent={true} animationType="fade">
        <BotInviteSheet
          setState={() => {
            setInviteBot(null);
          }}
          bot={inviteBot!}
        />
      </Modal>
      <MBottomSheet
        sheetKey={'serverMenu'}
        visible={serverMenuState.showServerMenu}
        callback={() => app.openServerContextMenu(null)}>
        <ServerInfoSheet
          setState={() => {
            app.openServerContextMenu(null);
          }}
          server={serverMenuState.contextMenuServer!}
        />
      </MBottomSheet>
      <MBottomSheet
        sheetKey={'memberList'}
        visible={memberListState.showMemberList}
        callback={() => app.openMemberList(null, null)}>
        <MemberListSheet
          context={memberListState.memberListContext!}
          users={memberListState.memberListUsers!}
        />
      </MBottomSheet>
    </>
  );
});
