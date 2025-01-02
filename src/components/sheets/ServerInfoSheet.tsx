import {useContext, useEffect, useRef, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import BottomSheetCore from '@gorhom/bottom-sheet';
import {useBackHandler} from '@react-native-community/hooks';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Member, Server} from 'revolt.js';

import {app, setFunction} from '@rvmob/Generic';
import {client} from '@rvmob/lib/client';
import {styles} from '@rvmob/Theme';
import {SERVER_FLAGS, SPECIAL_SERVERS} from '@rvmob/lib/consts';
import {commonValues, ThemeContext} from '@rvmob/lib/themes';
import {showToast} from '@rvmob/lib/utils';
import {
  ContextButton,
  CopyIDButton,
  GeneralAvatar,
  Text,
} from '../common/atoms';
import {BottomSheet} from '../common/BottomSheet';
import {MarkdownView} from '../common/MarkdownView';
import {Image} from '@rvmob/crossplat/Image';

export const ServerInfoSheet = observer(() => {
  const {currentTheme} = useContext(ThemeContext);

  const [server, setServer] = useState(null as Server | null);
  const [members, setMembers] = useState(null as Member[] | null);

  const sheetRef = useRef<BottomSheetCore>(null);

  useBackHandler(() => {
    if (server) {
      sheetRef.current?.close();
      return true;
    }

    return false;
  });

  setFunction('openServerContextMenu', async (s: Server | null) => {
    if (s !== server) {
      setMembers(null);
    }
    setServer(s);
    s ? sheetRef.current?.expand() : sheetRef.current?.close();
  });

  useEffect(() => {
    async function fetchMembers() {
      if (!server || server._id === SPECIAL_SERVERS.lounge.id) {
        return;
      }
      // const start = new Date().getTime();
      // console.log(`[SERVERINFOSHEET] Fetching members... (${start})`);
      const m = await server.fetchMembers();
      // const mid = new Date().getTime();
      // console.log(`[SERVERINFOSHEET] Fetched members (${mid})`);
      setMembers(m.members);
      // const end = new Date().getTime();
      // console.log(`[SERVERINFOSHEET] Set members (${end})`);
    }
    fetchMembers();
  }, [server]);

  return (
    <BottomSheet sheetRef={sheetRef}>
      <View style={{paddingHorizontal: 16}}>
        {!server ? (
          <></>
        ) : (
          <>
            <View style={{justifyContent: 'center'}}>
              {server.banner ? (
                <Image
                  source={{uri: server.generateBannerURL()}}
                  style={{width: '100%', height: 120, marginBottom: 8}}
                />
              ) : null}
              {server.icon ? (
                <GeneralAvatar attachment={server.icon} size={72} />
              ) : null}
              <View style={{flexDirection: 'row'}}>
                {server.flags === SERVER_FLAGS.Official ? (
                  <TouchableOpacity
                    onPress={() => showToast('Official Server')}
                    style={{alignSelf: 'center', marginEnd: 4}}>
                    <MaterialCommunityIcon
                      name={'crown'}
                      color={currentTheme.foregroundPrimary}
                      size={24}
                    />
                  </TouchableOpacity>
                ) : server.flags === SERVER_FLAGS.Verified ? (
                  <TouchableOpacity
                    onPress={() => showToast('Verified Server')}
                    style={{alignSelf: 'center', marginEnd: 4}}>
                    <MaterialIcon
                      name={'verified'}
                      color={currentTheme.foregroundPrimary}
                      size={24}
                    />
                  </TouchableOpacity>
                ) : null}
                <Text
                  type={'h1'}
                  style={{
                    fontSize: 24,
                  }}>
                  {server.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  showToast(
                    server.discoverable
                      ? 'Anyone can join this server.'
                      : 'You need an invite to join this server.',
                  )
                }
                style={{flexDirection: 'row'}}>
                <MaterialIcon
                  name={server.discoverable ? 'public' : 'home'}
                  color={currentTheme.foregroundSecondary}
                  size={20}
                  style={{
                    alignSelf: 'center',
                    marginEnd: commonValues.sizes.small,
                  }}
                />
                <Text
                  colour={currentTheme.foregroundSecondary}
                  style={{alignSelf: 'center'}}>
                  {server.discoverable ? 'Public server' : 'Invite-only server'}
                </Text>
              </TouchableOpacity>
              <Text
                colour={currentTheme.foregroundSecondary}
                style={{
                  marginVertical: commonValues.sizes.small,
                }}>
                {server._id === SPECIAL_SERVERS.lounge.id
                  ? 'Member count disabled for this server'
                  : members
                  ? `${members.length} ${
                      members.length === 1 ? 'member' : 'members'
                    }`
                  : 'Fetching member count...'}
              </Text>
              {server.description ? (
                <View
                  style={{
                    backgroundColor: currentTheme.background,
                    padding: commonValues.sizes.xl,
                    borderRadius: commonValues.sizes.medium,
                  }}>
                  <MarkdownView>{server.description}</MarkdownView>
                </View>
              ) : null}
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {server.havePermission('ManageServer') ? (
                <ContextButton
                  key={'server-ctx-menu-settings'}
                  onPress={() => {
                    app.openServerSettings(server);
                  }}>
                  <View style={styles.iconContainer}>
                    <MaterialIcon
                      name={'settings'}
                      size={20}
                      color={currentTheme.foregroundPrimary}
                    />
                  </View>
                  <Text>Server Settings</Text>
                </ContextButton>
              ) : null}
              {app.settings.get('ui.showDeveloperFeatures') ? (
                <CopyIDButton id={server._id} />
              ) : null}
              {server.owner !== client.user?._id ? (
                <>
                  <ContextButton
                    key={'server-ctx-menu-report'}
                    onPress={() => {
                      app.openReportMenu({object: server, type: 'Server'});
                      app.openServerContextMenu(null);
                    }}>
                    <View style={styles.iconContainer}>
                      <MaterialIcon
                        name="flag"
                        size={20}
                        color={currentTheme.error}
                      />
                    </View>
                    <Text colour={currentTheme.error}>Report Server</Text>
                  </ContextButton>
                  <ContextButton
                    key={'server-ctx-menu-leave'}
                    onPress={async () => {
                      app.openServer();
                      app.openServerContextMenu(null);
                      server.delete();
                    }}>
                    <View style={styles.iconContainer}>
                      <MaterialIcon
                        name="exit-to-app"
                        size={20}
                        color={currentTheme.error}
                      />
                    </View>
                    <Text colour={currentTheme.error}>Leave Server</Text>
                  </ContextButton>
                </>
              ) : null}
            </View>
          </>
        )}
      </View>
    </BottomSheet>
  );
});
