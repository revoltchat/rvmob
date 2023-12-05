import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  getApiLevel,
  getBrand,
  getBundleId,
  getDevice,
} from 'react-native-device-info';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import AppInfo from '../../../package.json';
import {app, client} from '../../Generic';
import {SettingsSection} from '../../lib/types';
import {currentTheme, styles} from '../../Theme';
import {BackButton, ContextButton, Link, Text} from '../common/atoms';
import {SettingsCategory} from '../common/settings';
import {GapView} from '../layout';

import ReleaseIcon from '../../../assets/images/icon_release.svg';
import DebugIcon from '../../../assets/images/icon_debug.svg';

const AppIcon = getBundleId().match('debug') ? DebugIcon : ReleaseIcon;

async function copyDebugInfo() {
  const obj = {
    deviceInfo: {
      time: new Date().getTime(),
      model: `${getBrand()}/${await getDevice()}`,
      version: `${await getApiLevel()}`,
    },

    appInfo: {
      userID: client.user?._id ?? 'ERR_ID_UNDEFINED',
      settings: await AsyncStorage.getItem('settings'),
      version: app.version,
    },
  };

  Clipboard.setString(JSON.stringify(obj));
}

function copyDebugInfoWrapper() {
  copyDebugInfo().then(() => {
    return null;
  });
}

export const SettingsSheet = observer(({setState}: {setState: Function}) => {
  const [renderCount, rerender] = React.useState(0);
  const [section, setSection] = React.useState(null as SettingsSection);

  const [authInfo, setAuthInfo] = React.useState({
    email: '',
    mfaEnabled: false,
    sessions: [] as {_id: string; name: string}[],
  });
  const [showEmail, setShowEmail] = React.useState(false);

  React.useEffect(() => {
    async function getAuthInfo() {
      const e = await client.api.get('/auth/account/');
      const m = await client.api.get('/auth/mfa/');
      const s = await client.api.get('/auth/session/all');
      setAuthInfo({
        email: e.email,
        mfaEnabled: m.totp_mfa ?? m.security_key_mfa ?? false,
        sessions: s,
      });
    }
    getAuthInfo();
  }, []);

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
        <BackButton callback={() => setState()} type={'close'} margin />
      ) : (
        <BackButton callback={() => setSection(null)} margin />
      )}
      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        {section == null ? (
          <>
            <Text type={'header'}>Account</Text>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                setSection('account');
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'person'}
                  color={currentTheme.foregroundPrimary}
                  size={25}
                />
              </View>
              <Text>Account</Text>
            </ContextButton>
            <Text type={'header'}>App</Text>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                setSection('appearance');
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'palette'}
                  color={currentTheme.foregroundPrimary}
                  size={25}
                />
              </View>
              <Text>Appearance</Text>
            </ContextButton>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                setSection('functionality');
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'build'}
                  color={currentTheme.foregroundPrimary}
                  size={20}
                />
              </View>
              <Text>Features</Text>
            </ContextButton>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                setSection('i18n');
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'translate'}
                  color={currentTheme.foregroundPrimary}
                  size={20}
                />
              </View>
              <Text>Language</Text>
            </ContextButton>
            <Text type={'header'}>Advanced</Text>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                copyDebugInfoWrapper();
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'bug-report'}
                  color={currentTheme.foregroundPrimary}
                  size={25}
                />
              </View>
              <Text>Copy Debug Info</Text>
            </ContextButton>
            <ContextButton
              style={{flex: 1, marginTop: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                setSection('info');
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'info'}
                  color={currentTheme.foregroundPrimary}
                  size={20}
                />
              </View>
              <Text>About RVMob</Text>
            </ContextButton>
            <ContextButton
              style={{flex: 1, marginTop: 10}}
              backgroundColor={currentTheme.error}
              onPress={() => {
                setState();
                app.logOut();
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'logout'}
                  color={currentTheme.foregroundPrimary}
                  size={20}
                />
              </View>
              <Text>Log Out</Text>
            </ContextButton>
          </>
        ) : section === 'appearance' ? (
          <SettingsCategory
            category={'appearance'}
            friendlyName={'Appearance'}
            renderCount={renderCount}
            rerender={rerender}
          />
        ) : section === 'functionality' ? (
          <SettingsCategory
            category={'functionality'}
            friendlyName={'Features'}
            renderCount={renderCount}
            rerender={rerender}
          />
        ) : section === 'i18n' ? (
          <SettingsCategory
            category={'i18n'}
            friendlyName={'Language'}
            renderCount={renderCount}
            rerender={rerender}
          />
        ) : section === 'account' ? (
          <View>
            <Text type={'header'}>Account</Text>
            <View style={styles.settingsEntry} key={'username-settings'}>
              <View style={{flex: 1, flexDirection: 'column'}}>
                <Text key={'username-label'} style={{fontWeight: 'bold'}}>
                  Username{' '}
                </Text>
                <Text key={'username'}>{client.user?.username}</Text>
              </View>
              <Pressable
                style={{
                  width: 30,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  Clipboard.setString(client.user?.username!);
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name="content-copy"
                    size={20}
                    color={currentTheme.foregroundPrimary}
                  />
                </View>
              </Pressable>
              <Pressable
                style={{
                  width: 30,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={async () => {}}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name="edit"
                    size={20}
                    color={currentTheme.foregroundPrimary}
                  />
                </View>
              </Pressable>
            </View>
            <View style={styles.settingsEntry} key={'email-settings'}>
              <View style={{flex: 1, flexDirection: 'column'}}>
                <Text key={'email-label'} style={{fontWeight: 'bold'}}>
                  Email
                </Text>
                <Text key={'email'}>
                  {showEmail ? authInfo.email : '•••••••••••@••••••.•••'}
                </Text>
              </View>
              <Pressable
                style={{
                  width: 30,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setShowEmail(!showEmail);
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name={showEmail ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={currentTheme.foregroundPrimary}
                  />
                </View>
              </Pressable>
              <Pressable
                style={{
                  width: 30,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  Clipboard.setString(authInfo.email);
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name="content-copy"
                    size={20}
                    color={currentTheme.foregroundPrimary}
                  />
                </View>
              </Pressable>
              <Pressable
                style={{
                  width: 30,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={async () => {}}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name="edit"
                    size={20}
                    color={currentTheme.foregroundPrimary}
                  />
                </View>
              </Pressable>
            </View>
            <GapView size={4} />
            <Text type={'h1'}>Multi-factor authentication</Text>
            <Text
              style={{
                color: currentTheme.foregroundSecondary,
              }}>
              Make your account more secure by enabling multi-factor
              authentication (MFA).
            </Text>
            <Text type={'h2'}>Status</Text>
            <Text>
              MFA is currently {authInfo.mfaEnabled ? 'enabled' : 'disabled'}.
            </Text>
            <GapView size={4} />
            <Text type={'h1'}>Sessions</Text>
            <Text
              style={{
                color: currentTheme.foregroundSecondary,
              }}>
              Review your logged-in sessions.
            </Text>
            {authInfo.sessions.map(s => (
              <View style={styles.settingsEntry} key={`sessions-${s._id}`}>
                <View style={{flex: 1, flexDirection: 'column'}}>
                  <Text
                    key={`sessions-${s._id}-name`}
                    style={{fontWeight: 'bold'}}>
                    {s.name} {s.name.match(/RVMob/) ? '✨' : ''}
                  </Text>
                  <Text key={`sessions-${s._id}-id`}>{s._id}</Text>
                </View>
                <Pressable
                  style={{
                    width: 30,
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={async () => {
                    await client.api.delete(`/auth/session/${s._id}`);
                    setAuthInfo({
                      ...authInfo,
                      sessions: authInfo.sessions.filter(
                        ses => ses._id !== s._id,
                      ),
                    });
                  }}>
                  <View style={styles.iconContainer}>
                    <MaterialIcon
                      name="logout"
                      size={20}
                      color={currentTheme.foregroundPrimary}
                    />
                  </View>
                </Pressable>
              </View>
            ))}
          </View>
        ) : section === 'info' ? (
          <>
            <Text type={'h1'}>About</Text>
            <View
              style={{
                alignItems: 'center',
              }}>
              <View style={{alignItems: 'center'}}>
                <AppIcon height={250} width={250} style={{marginVertical: 4}} />
                <Text type={'header'}>RVMob v{app.version}</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text>Powered by </Text>
                <Link link={'https://reactnative.dev'} label={'React Native'} />
                <Text>
                  {' '}
                  v{AppInfo.dependencies['react-native'].replace(
                    '^',
                    '',
                  )} and{' '}
                </Text>
                <Link
                  link={'https://github.com/rexogamer/revolt.js'}
                  label={'revolt.js'}
                />
                <Text>
                  {' '}
                  v
                  {AppInfo.dependencies['revolt.js'].replace(
                    'npm:@rexovolt/revolt.js@^',
                    '',
                  )}
                </Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text>Made by </Text>
                <Link
                  link={'https://github.com/TaiAurori'}
                  label={'TaiAurori'}
                />
                <Text>, </Text>
                <Link
                  link={'https://github.com/Rexogamer'}
                  label={'Rexogamer'}
                />
                <Text> and </Text>
                <Link
                  link={
                    'https://github.com/revoltchat/rvmob/graphs/contributors'
                  }
                  label={'other contributors'}
                />
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text>Licensed under the </Text>
                <Link
                  link={
                    'https://github.com/revoltchat/rvmob/blob/master/LICENSE'
                  }
                  label={'GNU GPL v3.0'}
                />
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
      {section === 'info' ? (
        <ContextButton
          backgroundColor={currentTheme.error}
          style={{
            justifyContent: 'center',
            bottom: 10,
          }}
          onPress={() => {
            app.settings.clear();
          }}>
          <Text>Reset Settings</Text>
        </ContextButton>
      ) : null}
    </View>
  );
});
