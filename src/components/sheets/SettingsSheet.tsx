import {useEffect, useState} from 'react';
import {Platform, Pressable, ScrollView, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  getApiLevel,
  getBrand,
  getBundleId,
  getDevice,
  getUserAgent,
} from 'react-native-device-info';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import AppInfo from '../../../package.json';
import {app, client, openUrl, setFunction} from '../../Generic';
import {
  CONTRIBUTORS_LIST,
  FEDI_PROFILE,
  GITHUB_REPO,
  OPEN_ISSUES,
} from '@rvmob/lib/consts';
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
      platform: Platform.OS,
      model:
        Platform.OS === 'android'
          ? `${getBrand()}/${await getDevice()}`
          : 'N/A',
      browser: Platform.OS === 'web' ? `${await getUserAgent()}` : 'N/A',
      version: Platform.OS === 'android' ? `${await getApiLevel()}` : 'N/A',
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
  const {t} = useTranslation();

  const [renderCount, rerender] = useState(0);
  const [section, setSection] = useState(null as SettingsSection);

  const [authInfo, setAuthInfo] = useState({
    email: '',
    mfaEnabled: false,
    sessions: [] as {_id: string; name: string}[],
    sessionID: '' as string | null,
  });
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    async function getAuthInfo() {
      const e = await client.api.get('/auth/account/');
      const m = await client.api.get('/auth/mfa/');
      const s = await client.api.get('/auth/session/all');
      const i = await AsyncStorage.getItem('sessionID');
      setAuthInfo({
        email: e.email,
        mfaEnabled: m.totp_mfa ?? m.security_key_mfa ?? false,
        sessions: s,
        sessionID: i,
      });
    }
    getAuthInfo();
  }, []);

  setFunction(
    'handleSettingsVisibility',
    (setVisibility: (state: boolean) => void) => {
      if (section) {
        setSection(null);
      } else {
        setVisibility(false);
      }
    },
  );

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
      {section !== null ? (
        <Text type={'h1'}>
          {t(`app.settings_menu.${section.section}.title`)}
        </Text>
      ) : null}
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={
          section && section.section === 'info'
            ? {
                flex: 1,
              }
            : null
        }
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        {section == null ? (
          <>
            <Text type={'header'}>{t('app.settings_menu.groups.user')}</Text>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                setSection({section: 'account'});
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'person'}
                  color={currentTheme.foregroundPrimary}
                  size={24}
                />
              </View>
              <Text>{t('app.settings_menu.account.title')}</Text>
            </ContextButton>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                setSection({section: 'profile'});
              }}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcon
                  name={'card-account-details'}
                  color={currentTheme.foregroundPrimary}
                  size={24}
                />
              </View>
              <Text>{t('app.settings_menu.profile.title')}</Text>
            </ContextButton>
            <Text type={'header'}>{t('app.settings_menu.groups.app')}</Text>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                setSection({section: 'appearance'});
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'palette'}
                  color={currentTheme.foregroundPrimary}
                  size={24}
                />
              </View>
              <Text>{t('app.settings_menu.appearance.title')}</Text>
            </ContextButton>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                setSection({section: 'functionality'});
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'build'}
                  color={currentTheme.foregroundPrimary}
                  size={24}
                />
              </View>
              <Text>{t('app.settings_menu.functionality.title')}</Text>
            </ContextButton>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                setSection({section: 'i18n'});
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'translate'}
                  color={currentTheme.foregroundPrimary}
                  size={24}
                />
              </View>
              <Text>Language</Text>
            </ContextButton>
            <Text type={'header'}>
              {t('app.settings_menu.groups.advanced')}
            </Text>
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
                  size={24}
                />
              </View>
              <Text>{t('app.settings_menu.other.debug_info')}</Text>
            </ContextButton>
            <Text type={'header'}>{t('app.settings_menu.groups.other')}</Text>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                setSection({section: 'info'});
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'info'}
                  color={currentTheme.foregroundPrimary}
                  size={24}
                />
              </View>
              <Text>{t('app.settings_menu.info.title')}</Text>
            </ContextButton>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                openUrl(OPEN_ISSUES);
              }}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcon
                  name={'github'}
                  color={currentTheme.foregroundPrimary}
                  size={24}
                />
              </View>
              <Text>{t('app.settings_menu.other.view_issues')}</Text>
            </ContextButton>
            <ContextButton
              style={{flex: 1}}
              backgroundColor={currentTheme.error}
              onPress={() => {
                setState();
                app.logOut();
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'logout'}
                  color={currentTheme.foregroundPrimary}
                  size={24}
                />
              </View>
              <Text>{t('app.settings_menu.other.logout')}</Text>
            </ContextButton>
          </>
        ) : section.section === 'appearance' ? (
          <SettingsCategory
            category={'appearance'}
            renderCount={renderCount}
            rerender={rerender}
          />
        ) : section.section === 'functionality' ? (
          <SettingsCategory
            category={'functionality'}
            renderCount={renderCount}
            rerender={rerender}
          />
        ) : section.section === 'i18n' ? (
          <SettingsCategory
            category={'i18n'}
            renderCount={renderCount}
            rerender={rerender}
          />
        ) : section.section === 'account' ? (
          <View>
            <View style={styles.settingsEntry} key={'username-settings'}>
              <View style={{flex: 1, flexDirection: 'column'}}>
                <Text key={'username-label'} style={{fontWeight: 'bold'}}>
                  Username{' '}
                </Text>
                <Text key={'username'}>
                  {client.user?.username}
                  <Text colour={currentTheme.foregroundSecondary}>
                    #{client.user?.discriminator}
                  </Text>
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
              {/* <Pressable
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
              </Pressable> */}
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
              {/* <Pressable
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
              </Pressable> */}
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
            <GapView size={2} />
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
                  {authInfo.sessionID === s._id ? (
                    <Text colour={currentTheme.foregroundSecondary}>
                      Current session
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  style={{
                    width: 30,
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    app.openTextEditModal({
                      initialString: s.name,
                      id: 'session_name',
                      callback: newName => {
                        client.api.patch(`/auth/session/${s._id}`, {
                          friendly_name: newName,
                        });
                      },
                    });
                  }}>
                  <View style={styles.iconContainer}>
                    <MaterialIcon
                      name="edit"
                      size={20}
                      color={currentTheme.foregroundPrimary}
                    />
                  </View>
                </Pressable>
                {authInfo.sessionID !== s._id ? (
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
                ) : null}
              </View>
            ))}
          </View>
        ) : section.section === 'profile' ? (
          <View>
            <View style={styles.settingsEntry} key={'display-name-settings'}>
              <View style={{flex: 1, flexDirection: 'column'}}>
                <Text key={'display-name-label'} style={{fontWeight: 'bold'}}>
                  Display name
                </Text>
                <Text
                  key={'display-name'}
                  colour={
                    client.user?.display_name
                      ? currentTheme.foregroundPrimary
                      : currentTheme.foregroundSecondary
                  }>
                  {client.user?.display_name ?? 'No display name set'}
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
                  Clipboard.setString(
                    client.user?.display_name ?? 'No display name set',
                  );
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
                onPress={() => {
                  app.openTextEditModal({
                    initialString: client.user?.display_name ?? '',
                    id: 'display_name',
                    callback: newName => {
                      client.api.patch('/users/@me', {display_name: newName});
                    },
                  });
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name="edit"
                    size={20}
                    color={currentTheme.foregroundPrimary}
                  />
                </View>
              </Pressable>
            </View>
          </View>
        ) : section.section === 'info' ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View style={{alignItems: 'center'}}>
              <AppIcon height={250} width={250} />
            </View>
            <View style={{alignItems: 'center', marginVertical: 16}}>
              <Text type={'header'}>RVMob v{app.version}</Text>
              <View
                style={{
                  justifyContent: 'center',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}>
                <Text>Powered by </Text>
                <Link link={'https://reactnative.dev'} label={'React Native'} />
                <Text>
                  {' v'}
                  {Platform.OS === 'web'
                    ? AppInfo.dependencies['react-native'].replace('^', '')
                    : `${Platform.constants.reactNativeVersion.major}.${
                        Platform.constants.reactNativeVersion.minor
                      }.${Platform.constants.reactNativeVersion.patch}${
                        Platform.constants.reactNativeVersion.prerelease
                          ? `-${Platform.constants.reactNativeVersion.prerelease}`
                          : ''
                      }`}
                  {' and '}
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
                <Link link={CONTRIBUTORS_LIST} label={'other contributors'} />
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text>Licensed under the </Text>
                <Link
                  link={`${GITHUB_REPO}/blob/main/LICENSE`}
                  label={'GNU GPL v3.0'}
                />
              </View>
            </View>
            <View style={{flexDirection: 'row', marginBottom: 16}}>
              <Pressable
                onPress={() => openUrl(GITHUB_REPO)}
                style={{marginEnd: 16}}>
                <MaterialCommunityIcon
                  name={'github'}
                  color={currentTheme.foregroundPrimary}
                  size={60}
                />
              </Pressable>
              <Pressable
                onPress={() => openUrl(FEDI_PROFILE)}
                style={{marginStart: 16}}>
                <MaterialCommunityIcon
                  name={'mastodon'}
                  color={currentTheme.foregroundPrimary}
                  size={60}
                />
              </Pressable>
            </View>
            <ContextButton
              backgroundColor={currentTheme.error}
              style={{
                justifyContent: 'center',
              }}
              onPress={() => {
                app.settings.clear();
              }}>
              <Text>Reset Settings</Text>
            </ContextButton>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
});
