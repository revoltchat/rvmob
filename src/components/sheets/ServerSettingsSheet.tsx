import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import Clipboard from '@react-native-clipboard/clipboard';
import FastImage from 'react-native-fast-image';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Server} from 'revolt.js';

import {app, client} from '../../Generic';
import {MAX_SIDE_HQ} from '../../lib/consts';
import {Setting, SettingsSection} from '../../lib/types';
import {currentTheme, styles} from '../../Theme';
import {ContextButton, InputWithButton, Link, Text} from '../common/atoms';
import {GapView} from '../layout';
const Image = FastImage;

export const ServerSettingsSheet = observer(
  ({server, setState}: {server: Server; setState: Function}) => {
    const [renderCount, rerender] = React.useState(0);
    const [section, setSection] = React.useState(null as SettingsSection);

    const iconURL = React.useMemo(() => server.generateIconURL(), []);
    const initials = React.useMemo(() => {
      let i = '';
      for (const word of server.name.split(' ')) {
        i += word.charAt(0);
      }
      return i;
    }, []);

    // React.useEffect(() => {
    //   async function getAuthInfo() {
    //     const e = await client.api.get('/auth/account/');
    //     const m = await client.api.get('/auth/mfa/');
    //     const s = await client.api.get('/auth/session/all');
    //     setAuthInfo({
    //       email: e.email,
    //       mfaEnabled: m.totp_mfa ?? m.security_key_mfa ?? false,
    //       sessions: s,
    //     });
    //   }
    //   getAuthInfo();
    // }, []);

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: currentTheme.backgroundPrimary,
          padding: 15,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
        }}>
        {section == null ? (
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
            onPress={() => {
              setState();
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
        ) : (
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
            onPress={() => {
              setSection(null);
            }}>
            <MaterialIcon
              name="arrow-back"
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
        )}
        <ScrollView
          style={{flex: 1}}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          {section == null ? (
            <>
              <View
                style={{
                  alignSelf: 'center',
                  alignItems: 'center',
                  marginVertical: 10,
                }}>
                {iconURL ? (
                  <Image
                    key={`server-settings-${server._id}-icon`}
                    source={{uri: `${iconURL}?max_side=${MAX_SIDE_HQ}`}}
                    style={{
                      width: 80,
                      height: 80,
                    }}
                  />
                ) : (
                  <View
                    style={styles.serverSettingsInitials}>
                    <Text
                      key={`server-settings-${server._id}-initials`}
                      style={{fontWeight: 'bold', fontSize: 20}}>
                      {initials}
                    </Text>
                  </View>
                )}
                <GapView size={5} />
                <Text type={'h1'}>{server.name}</Text>
              </View>
              <Text type={'header'}>General</Text>
              <ContextButton
                style={{flex: 1, marginBottom: 10}}
                backgroundColor={currentTheme.backgroundSecondary}
                onPress={() => {
                  setSection('overview');
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name={'person'}
                    color={currentTheme.foregroundPrimary}
                    size={24}
                  />
                </View>
                <Text>Overview</Text>
              </ContextButton>
              <ContextButton
                style={{flex: 1, marginBottom: 10}}
                backgroundColor={currentTheme.backgroundSecondary}
                onPress={() => {
                  setSection('overview');
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name={'tag'}
                    color={currentTheme.foregroundPrimary}
                    size={24}
                  />
                </View>
                <Text>Channels</Text>
              </ContextButton>
              <Text type={'header'}>Customisation</Text>
              <ContextButton
                style={{flex: 1, marginBottom: 10}}
                backgroundColor={currentTheme.backgroundSecondary}
                onPress={() => {
                  setSection('roles');
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name={'flag'}
                    color={currentTheme.foregroundPrimary}
                    size={24}
                  />
                </View>
                <Text>Roles</Text>
              </ContextButton>
              <ContextButton
                style={{flex: 1, marginBottom: 10}}
                backgroundColor={currentTheme.backgroundSecondary}
                onPress={() => {
                  setSection('emoji');
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name={'emoji-emotions'}
                    color={currentTheme.foregroundPrimary}
                    size={24}
                  />
                </View>
                <Text>Emoji</Text>
              </ContextButton>
              <Text type={'header'}>User Management</Text>
              <ContextButton
                style={{flex: 1, marginBottom: 10}}
                backgroundColor={currentTheme.backgroundSecondary}
                onPress={() => {
                  setSection('members');
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name={'group'}
                    color={currentTheme.foregroundPrimary}
                    size={24}
                  />
                </View>
                <Text>Members</Text>
              </ContextButton>
              <ContextButton
                style={{flex: 1, marginBottom: 10}}
                backgroundColor={currentTheme.backgroundSecondary}
                onPress={() => {
                  setSection('invites');
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name={'mail'}
                    color={currentTheme.foregroundPrimary}
                    size={24}
                  />
                </View>
                <Text>Invites</Text>
              </ContextButton>
              <ContextButton
                style={{flex: 1, marginBottom: 10}}
                backgroundColor={currentTheme.backgroundSecondary}
                onPress={() => {
                  setSection('bans');
                }}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcon
                    name={'hammer'}
                    color={currentTheme.foregroundPrimary}
                    size={24}
                  />
                </View>
                <Text>Bans</Text>
              </ContextButton>
              {server.owner === client.user?._id ? (
                <ContextButton
                  style={{flex: 1, marginBottom: 10}}
                  backgroundColor={currentTheme.error}
                  onPress={() => {
                    console.log('sussy');
                  }}>
                  <View style={styles.iconContainer}>
                    <MaterialIcon
                      name={'delete'}
                      color={currentTheme.foregroundPrimary}
                      size={24}
                    />
                  </View>
                  <Text>Delete Server</Text>
                </ContextButton>
              ) : null}
            </>
          ) : section === 'overview' ? (
            <View>
              <Text type={'header'}>Overview</Text>
              <Text key={'server-name-label'} type={'h2'}>
                Server name
              </Text>
              <InputWithButton
                placeholder="Server name"
                defaultValue={server.name}
                onPress={(v: string) => {
                  server.edit({
                    name: v,
                  });
                }}
                buttonContents={{
                  type: 'icon',
                  name: 'save',
                  pack: 'regular',
                }}
                backgroundColor={currentTheme.backgroundSecondary}
                skipIfSame
                cannotBeEmpty
                emptyError={'Server names cannot be empty!'}
              />
              <GapView size={4} />
              <Text key={'server-desc-label'} type={'h2'}>
                Server description
              </Text>
              <View>
              <Text
              style={{
                color: currentTheme.foregroundSecondary,
              }}>
              Server descriptions support Markdown formatting.
              </Text>
                      <Link
                        link={'https://support.revolt.chat/kb/account/badges'}
                        label={'Learn more.'}
                        style={{fontWeight: 'bold'}}
                      />
                    </View>
              <GapView size={2} />
              <InputWithButton
                placeholder="Add a description..."
                defaultValue={server.description ?? undefined}
                onPress={(v: string) => {
                  server.edit({
                    description: v,
                  });
                }}
                buttonContents={{type: 'string', content: 'Set description'}}
                backgroundColor={currentTheme.backgroundSecondary}
                skipIfSame
                // @ts-expect-error this is passed down to the TextInput
                multiline
                extraStyles={{
                  container: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  },
                  input: {width: '100%'},
                  button: {marginHorizontal: 0},
                }}
              />
            </View>
          ) : section === 'info' ? (
            <>
              <Text type={'h1'}>About</Text>
            </>
          ) : null}
        </ScrollView>
      </View>
    );
  },
);
