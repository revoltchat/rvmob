import React from 'react';
import {
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {observer} from 'mobx-react-lite';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  getApiLevel,
  getBrand,
  getBundleId,
  getDevice,
} from 'react-native-device-info';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import AppInfo from '../../../package.json';
import {app, client} from '../../Generic';
import {Setting} from '../../lib/types';
import {currentTheme, styles} from '../../Theme';
import {Checkbox, ContextButton, Link, Text} from '../common/atoms';
import {GapView} from '../layout';

import ReleaseIcon from '../../../assets/images/icon_release.svg';
import DebugIcon from '../../../assets/images/icon_debug.svg';

const AppIcon = getBundleId().match('debug') ? DebugIcon : ReleaseIcon;

type Section = string | null;

const IndicatorIcons = ({s}: {s: Setting}) => {
  return (
    <>
      {s.experimental ? (
        <View style={styles.iconContainer}>
          <MaterialCommunityIcon
            name="flask"
            size={28}
            color={currentTheme.accentColor}
          />
        </View>
      ) : null}
      {s.developer ? (
        <View style={styles.iconContainer}>
          <MaterialIcon
            name="bug-report"
            size={28}
            color={currentTheme.accentColor}
          />
        </View>
      ) : null}
    </>
  );
};

const BoolSetting = ({
  sRaw,
  experimentalFunction,
  devFunction,
}: {
  sRaw: Setting;
  experimentalFunction: any;
  devFunction: any;
}) => {
  const [value, setValue] = React.useState(
    app.settings.get(sRaw.key) as boolean,
  );
  return (
    <View
      key={`settings_${sRaw.key}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
      }}>
      <IndicatorIcons s={sRaw} />
      <View style={{flex: 1, flexDirection: 'column'}}>
        <Text style={{fontWeight: 'bold'}}>{sRaw.name}</Text>
        {sRaw.remark ? (
          <Text colour={currentTheme.foregroundSecondary}>{sRaw.remark}</Text>
        ) : null}
      </View>
      <Checkbox
        key={`checkbox-${sRaw.name}`}
        value={value}
        callback={() => {
          const newValue = !value;
          app.settings.set(sRaw.key, newValue);
          setValue(newValue);
          sRaw.key === 'ui.settings.showExperimental'
            ? experimentalFunction(newValue)
            : null;
          sRaw.key === 'ui.showDeveloperFeatures'
            ? devFunction(newValue)
            : null;
        }}
      />
    </View>
  );
};

const StringNumberSetting = ({
  sRaw,
  renderCount,
  rerender,
}: {
  sRaw: Setting;
  renderCount: number;
  rerender: Function;
}) => {
  const [value, setValue] = React.useState(app.settings.getRaw(sRaw.key));
  return (
    <View
      key={`settings_${sRaw.key}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
      }}>
      {sRaw.options ? (
        <View>
          <IndicatorIcons s={sRaw} />
          <Text style={{fontWeight: 'bold', marginBottom: 8}}>{sRaw.name}</Text>
          {sRaw.remark ? (
            <Text
              colour={currentTheme.foregroundSecondary}
              style={{marginBottom: 8}}>
              {sRaw.remark}
            </Text>
          ) : null}
          <View
            style={{
              borderRadius: 8,
              minWidth: '100%',
              backgroundColor: currentTheme.backgroundSecondary,
              padding: 8,
            }}>
            {sRaw.options.map(o => (
              <TouchableOpacity
                key={o}
                style={styles.actionTile}
                onPress={() => {
                  app.settings.set(sRaw.key, o);
                  setValue(o);

                  // if this is the theme toggle, re-render the category
                  if (sRaw.key === 'ui.theme') {
                    rerender(renderCount + 1);
                  }
                }}>
                <Text style={{flex: 1}}>{o}</Text>
                <View style={{...styles.iconContainer, marginRight: 0}}>
                  <MaterialIcon
                    name={`radio-button-${value === o ? 'on' : 'off'}`}
                    size={28}
                    color={currentTheme.accentColor}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View>
          <IndicatorIcons s={sRaw} />
          <Text style={{flex: 1, fontWeight: 'bold', marginBottom: 8}}>
            {sRaw.name}
          </Text>
          {sRaw.remark ? (
            <Text
              colour={currentTheme.foregroundSecondary}
              style={{marginBottom: 8}}>
              {sRaw.remark}
            </Text>
          ) : null}
          <TextInput
            style={{
              fontFamily: 'Open Sans',
              minWidth: '100%',
              borderRadius: 8,
              backgroundColor: currentTheme.backgroundSecondary,
              padding: 6,
              paddingLeft: 10,
              paddingRight: 10,
              color: currentTheme.foregroundPrimary,
            }}
            value={value as string}
            keyboardType={sRaw.type === 'number' ? 'decimal-pad' : 'default'}
            onChangeText={v => {
              app.settings.set(sRaw.key, v);
              setValue(v);
            }}
          />
        </View>
      )}
    </View>
  );
};

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

const SettingsCategory = observer(
  ({
    category,
    friendlyName,
    renderCount,
    rerender,
  }: {
    category: string;
    friendlyName: string;
    renderCount: number;
    rerender: Function;
  }) => {
    const [showExperimental, setShowExperimental] = React.useState(
      app.settings.get('ui.settings.showExperimental') as boolean,
    );

    const [showDev, setShowDev] = React.useState(
      app.settings.get('ui.showDeveloperFeatures') as boolean,
    );

    return (
      <View key={`settings-category-${category}`}>
        <Text key={`settings-category-${category}-header`} type={'header'}>
          {friendlyName}
        </Text>
        {app.settings.list.map(sRaw => {
          try {
            if (
              (sRaw.experimental && !showExperimental) ||
              (sRaw.developer && !showDev) ||
              sRaw.category !== category
            ) {
              return null;
            }
            if (sRaw.type === 'boolean') {
              return (
                <BoolSetting
                  key={`settings-${sRaw.key}-outer`}
                  sRaw={sRaw}
                  experimentalFunction={setShowExperimental}
                  devFunction={setShowDev}
                />
              );
            } else if (sRaw.type === 'string' || sRaw.type === 'number') {
              return (
                <StringNumberSetting
                  key={`settings-${sRaw.key}-outer`}
                  sRaw={sRaw}
                  renderCount={renderCount}
                  rerender={rerender}
                />
              );
            }
          } catch (err) {
            console.log(err);
          }
        })}
      </View>
    );
  },
);

export const SettingsSheet = observer(({setState}: {setState: Function}) => {
  const [renderCount, rerender] = React.useState(0);
  const [section, setSection] = React.useState(null as Section);

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
                  link={'https://github.com/revoltchat/revolt.js'}
                  label={'revolt.js'}
                />
                <Text>
                  {' '}
                  v{AppInfo.dependencies['revolt.js'].replace('^', '')}
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
