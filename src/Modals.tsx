import {useState} from 'react';
import {Modal, Pressable, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {gestureHandlerRootHOC} from 'react-native-gesture-handler';
import ImageViewer2 from 'react-native-reanimated-image-viewer';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {API, Channel, Server, User} from 'revolt.js';

import {app, client, setFunction} from '@rvmob/Generic';
import {
  CreateChannelModalProps,
  DeletableObject,
  TextEditingModalProps,
} from '@rvmob/lib/types';
import {getReadableFileSize, openUrl} from '@rvmob/lib/utils';
import {currentTheme} from '@rvmob/Theme';
import {Text} from '@rvmob/components/common/atoms';
import {GapView} from '@rvmob/components/layout';
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
  ProfileSheet,
  ReportSheet,
  ServerInfoSheet,
  ServerInviteSheet,
  ServerSettingsSheet,
  SettingsSheet,
  StatusSheet,
} from '@rvmob/components/sheets/';

const WrappedImageViewer = gestureHandlerRootHOC(
  ({state, setState}: {state: any; setState: any}) => {
    const imageUrl = state.i?.metadata
      ? client.generateFileURL(state.i)!
      : state.i;

    return (
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <View
          style={{
            height: '7%',
            backgroundColor: currentTheme.background,
            paddingHorizontal: 12,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
            zIndex: 10,
          }}>
          <Pressable
            onPress={() =>
              openUrl(
                state.i?.metadata ? client.generateFileURL(state.i) : state.i,
              )
            }>
            <MaterialCommunityIcon
              name="web"
              size={32}
              color={currentTheme.foregroundSecondary}
            />
          </Pressable>
          <GapView size={5} type={'horizontal'} />
          <Pressable onPress={() => setState()}>
            <MaterialCommunityIcon
              name="close-circle"
              size={32}
              color={currentTheme.foregroundSecondary}
            />
          </Pressable>
        </View>
        <View style={{height: '86%'}}>
          <ImageViewer2
            imageUrl={imageUrl}
            width={state.i.metadata?.width ?? undefined}
            height={state.i.metadata?.height ?? undefined}
            onRequestClose={() => setState()}
          />
        </View>
        <View
          style={{
            height: '7%',
            backgroundColor: currentTheme.background,
            paddingHorizontal: 12,
            justifyContent: 'center',
            zIndex: 10,
          }}>
          <Text style={{fontWeight: 'bold'}}>
            {state.i.filename ?? 'Unknown filename'}
          </Text>
          <Text>
            {state.i.size ? getReadableFileSize(state.i.size) : 'Unknown size'}
          </Text>
        </View>
      </View>
    );
  },
  // if the user can see the root view something might be broken, so make it red
  {backgroundColor: 'red'},
);

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
      <ServerInfoSheet />
      <Modal
        visible={!!imageViewerState.i}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageViewerState({i: null})}>
        <WrappedImageViewer
          state={imageViewerState}
          setState={() => setImageViewerState({i: null})}
        />
      </Modal>
      <Modal
        visible={settingsVisibility}
        transparent={true}
        animationType="slide"
        onRequestClose={() =>
          app.handleSettingsVisibility(setSettingsVisibility)
        }>
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
        onRequestClose={() =>
          app.handleServerSettingsVisibility(setServerSettingsServer)
        }>
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
