import React, {useEffect} from 'react';
import {Image, ScrollView, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import Clipboard from '@react-native-clipboard/clipboard';
// import FastImage from 'react-native-fast-image';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Member, Server, User} from 'revolt.js';

import {GeneralAvatar, app, client} from '../../Generic';
import {SPECIAL_SERVERS} from '../../lib/consts';
import {currentTheme, styles} from '../../Theme';
import {ContextButton, Text} from '../common/atoms';
import {MarkdownView} from '../common/MarkdownView';

// const Image = FastImage;

export const ServerInfoSheet = observer(
  ({state, server}: {state: any; server: Server}) => {
    const [members, setMembers] = React.useState(
      {} as {members: Member[]; users: User[]},
    );

    useEffect(() => {
      async function fetchMembers() {
        if (server._id !== SPECIAL_SERVERS.lounge.id) {
          const start = new Date().getTime();
          console.log(`[SERVERINFOSHEET] Fetching members... (${start})`);
          const m = await server.fetchMembers();
          const mid = new Date().getTime();
          console.log(`[SERVERINFOSHEET] Fetched members (${mid})`);
          setMembers(m);
          const end = new Date().getTime();
          console.log(`[SERVERINFOSHEET] Set members (${end})`);
        }
      }
      fetchMembers();
    }, [server]);

    return (
      <ScrollView>
        <View style={{justifyContent: 'center'}}>
          {server.banner ? (
            <Image
              source={{uri: server.generateBannerURL()}}
              style={{width: '100%', height: 110, marginBottom: 4}}
            />
          ) : null}
          {server.icon ? (
            <GeneralAvatar attachment={server.icon} size={72} />
          ) : null}
          <Text
            type={'header'}
            style={{
              marginBottom: 0,
              fontSize: 24,
            }}>
            {server.name}
          </Text>
          <Text
            colour={currentTheme.foregroundSecondary}
            style={{
              marginVertical: 4,
            }}>
            {server._id === SPECIAL_SERVERS.lounge.id
              ? 'Member count disabled for this server'
              : members.members
              ? `${members.members.length} ${
                  members.members.length === 1 ? 'member' : 'members'
                }`
              : 'Fetching member count...'}
          </Text>
          {server.description ? (
            <View
              style={{
                backgroundColor: currentTheme.background,
                padding: 8,
                borderRadius: 8,
              }}>
              <MarkdownView
                style={{
                  color: currentTheme.foregroundSecondary,
                  fontSize: 16,
                  textAlign: 'center',
                }}>
                {server.description}
              </MarkdownView>
            </View>
          ) : null}
        </View>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {app.settings.get('ui.showDeveloperFeatures') ? (
            <ContextButton
              key={'Copy ID'}
              onPress={() => {
                Clipboard.setString(server._id);
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name="content-copy"
                  size={20}
                  color={currentTheme.foregroundPrimary}
                />
              </View>
              <Text>
                Copy ID{' '}
                <Text colour={currentTheme.foregroundSecondary}>
                  ({server._id})
                </Text>
              </Text>
            </ContextButton>
          ) : null}
          {server.owner !== client.user?._id ? (
            <>
              <ContextButton
                key={'server-ctx-menu-leave'}
                onPress={async () => {
                  await app.openServer();
                  state.setState({contextMenuServer: null});
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
              <ContextButton
                key={'server-ctx-menu-report'}
                onPress={() => {
                  app.openReportMenu(server, 'Server');
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name="flag"
                    size={20}
                    color={currentTheme.foregroundPrimary}
                  />
                </View>
                <Text>Report Server</Text>
              </ContextButton>
            </>
          ) : null}
        </View>
      </ScrollView>
    );
  },
);
