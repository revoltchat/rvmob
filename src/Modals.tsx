import React from 'react';
import {Modal, Pressable, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import ImageViewer from 'react-native-image-zoom-viewer';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {API, Channel, Server, User} from 'revolt.js';

import {app, client, openUrl, setFunction} from './Generic';
import {
  CreateChannelModalProps,
  DeletableObject,
  TextEditingModalProps,
} from './lib/types';
import {currentTheme} from './Theme';
import {GapView} from './components/layout';
import {
  ConfirmDeletionModal,
  CreateChannelModal,
  TextEditModal,
} from './components/modals';
import {
  BotInviteSheet,
  ChannelInfoSheet,
  MemberListSheet,
  MessageMenuSheet,
  ProfileSheet,
  ReportSheet,
  ServerInfoSheet,
  ServerInviteSheet,
  ServerSettingsSheet,
  SettingsSheet,
  StatusSheet,
} from './components/sheets/';

export const Modals = observer(() => {
  const [imageViewerState, setImageViewerState] = React.useState({
    i: null as any,
  });
  const [settingsVisibility, setSettingsVisibility] = React.useState(false);
  const [serverSettingsServer, setServerSettingsServer] = React.useState(
    null as Server | null,
  );
  const [inviteServer, setInviteServer] = React.useState({
    inviteServer: null,
    inviteServerCode: '',
  } as {
    inviteServer: API.InviteResponse | null;
    inviteServerCode: string;
  });
  const [inviteBot, setInviteBot] = React.useState(null as User | null);
  const [deletableObject, setDeletableObject] = React.useState(
    null as DeletableObject | null,
  );
  const [editingText, setEditingText] = React.useState(
    null as TextEditingModalProps | null,
  );
  const [createChannelObject, setCreateChannelObject] = React.useState(
    null as CreateChannelModalProps | null,
  );

  setFunction('openDirectMessage', async (dm: Channel) => {
    app.openProfile(null);
    app.openChannel(dm);
  });
  setFunction('openImage', async (a: any) => {
    setImageViewerState({i: a});
  });
  setFunction('openSettings', async (o: boolean) => {
    setSettingsVisibility(o);
  });
  setFunction('openServerSettings', async (s: Server | null) => {
    setServerSettingsServer(s);
  });
  setFunction(
    'openDeletionConfirmationModal',
    async (o: DeletableObject | null) => {
      setDeletableObject(o);
    },
  );
  setFunction(
    'openTextEditModal',
    async (object: TextEditingModalProps | null) => {
      setEditingText(object);
    },
  );
  setFunction(
    'openCreateChannelModal',
    async (object: CreateChannelModalProps | null) => {
      setCreateChannelObject(object);
    },
  );
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

  return (
    <>
      <MessageMenuSheet />
      <StatusSheet />
      <ProfileSheet />
      <ReportSheet />
      <ChannelInfoSheet />
      <MemberListSheet />
      <ServerInfoSheet />
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
      <Modal
        visible={!!serverSettingsServer}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setServerSettingsServer(null)}>
        <ServerSettingsSheet
          server={serverSettingsServer!}
          setState={() => setServerSettingsServer(null)}
        />
      </Modal>
      <Modal
        visible={!!deletableObject}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeletableObject(null)}>
        <View
          style={{
            flex: 1,
            alignContent: 'center',
            justifyContent: 'center',
            backgroundColor: '#00000080',
          }}>
          <ConfirmDeletionModal target={deletableObject!} />
        </View>
      </Modal>
      <Modal
        visible={!!editingText}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditingText(null)}>
        <View
          style={{
            flex: 1,
            alignContent: 'center',
            justifyContent: 'center',
            backgroundColor: '#00000080',
          }}>
          <TextEditModal object={editingText!} />
        </View>
      </Modal>
      <Modal
        visible={!!createChannelObject}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditingText(null)}>
        <View
          style={{
            flex: 1,
            alignContent: 'center',
            justifyContent: 'center',
            backgroundColor: '#00000080',
          }}>
          <CreateChannelModal object={createChannelObject!} />
        </View>
      </Modal>
    </>
  );
});
