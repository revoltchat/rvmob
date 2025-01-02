import {useState} from 'react';
import {Modal, type ModalProps, StyleSheet, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {API, Channel, Server, User} from 'revolt.js';

import {app, setFunction} from '@rvmob/Generic';
import {client} from './lib/client';
import {
  CreateChannelModalProps,
  DeletableObject,
  TextEditingModalProps,
} from '@rvmob/lib/types';
import {ImageViewer} from '@rvmob/components/ImageViewer';
import {
  ConfirmDeletionModal,
  CreateChannelModal,
  TextEditModal,
} from '@rvmob/components/modals';
import {
  BotInviteSheet,
  ChannelInfoSheet,
  MemberListSheet,
  MessageMenuSheet,
  PinnedMessagesSheet,
  ProfileSheet,
  ReportSheet,
  ServerInfoSheet,
  ServerInviteSheet,
  ServerSettingsSheet,
  SettingsSheet,
  StatusSheet,
} from '@rvmob/components/sheets';

// Modals appear to break on the new architecture unless you wrap them in a View. see also https://github.com/react-navigation/react-navigation/issues/12301#issuecomment-2501692557
const FixedModal = observer((props: ModalProps) => {
  return (
    <View>
      <Modal {...props} />
    </View>
  );
});

export const Modals = observer(() => {
  const [imageViewerState, setImageViewerState] = useState({
    i: null as any,
  });
  const [settingsVisibility, setSettingsVisibility] = useState(false);
  const [serverSettingsServer, setServerSettingsServer] = useState(
    null as Server | null,
  );
  const [inviteServer, setInviteServer] = useState({
    inviteServer: null,
    inviteServerCode: '',
  } as {
    inviteServer: API.InviteResponse | null;
    inviteServerCode: string;
  });
  const [inviteBot, setInviteBot] = useState(null as User | null);
  const [deletableObject, setDeletableObject] = useState(
    null as DeletableObject | null,
  );
  const [editingText, setEditingText] = useState(
    null as TextEditingModalProps | null,
  );
  const [createChannelObject, setCreateChannelObject] = useState(
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
      <PinnedMessagesSheet />
      <ServerInfoSheet />
      <FixedModal
        visible={!!imageViewerState.i}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageViewerState({i: null})}>
        <ImageViewer
          state={imageViewerState}
          setState={() => setImageViewerState({i: null})}
        />
      </FixedModal>
      <FixedModal
        visible={settingsVisibility}
        transparent={true}
        animationType="slide"
        onRequestClose={() =>
          app.handleSettingsVisibility(setSettingsVisibility)
        }>
        <SettingsSheet setState={() => setSettingsVisibility(false)} />
      </FixedModal>
      <FixedModal
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
      </FixedModal>
      <FixedModal visible={!!inviteBot} transparent={true} animationType="fade">
        <BotInviteSheet
          setState={() => {
            setInviteBot(null);
          }}
          bot={inviteBot!}
        />
      </FixedModal>
      <FixedModal
        visible={!!serverSettingsServer}
        transparent={true}
        animationType="slide"
        onRequestClose={() =>
          app.handleServerSettingsVisibility(setServerSettingsServer)
        }>
        <ServerSettingsSheet
          server={serverSettingsServer!}
          setState={() => setServerSettingsServer(null)}
        />
      </FixedModal>
      <FixedModal
        visible={!!deletableObject}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeletableObject(null)}>
        <View style={localStyles.modalContainer}>
          <ConfirmDeletionModal target={deletableObject!} />
        </View>
      </FixedModal>
      <FixedModal
        visible={!!editingText}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditingText(null)}>
        <View style={localStyles.modalContainer}>
          <TextEditModal object={editingText!} />
        </View>
      </FixedModal>
      <FixedModal
        visible={!!createChannelObject}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditingText(null)}>
        <View style={localStyles.modalContainer}>
          <CreateChannelModal object={createChannelObject!} />
        </View>
      </FixedModal>
    </>
  );
});

const localStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000080',
  },
});
