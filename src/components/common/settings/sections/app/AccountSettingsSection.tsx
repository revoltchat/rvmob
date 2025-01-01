import {useContext, useEffect, useState} from 'react';
import {Pressable, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import Clipboard from '@react-native-clipboard/clipboard';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {app} from '@rvmob/Generic';
import { client } from '@rvmob/lib/client';
import {styles} from '@rvmob/Theme';
import {Text} from '@rvmob/components/common/atoms';
import {GapView} from '@rvmob/components/layout';
import {SettingsEntry} from '@rvmob/components/common/settings/atoms';
import {storage} from '@rvmob/lib/storage';
import {ThemeContext} from '@rvmob/lib/themes';

export const AccountSettingsSection = observer(() => {
  const {currentTheme} = useContext(ThemeContext);

  const [authInfo, setAuthInfo] = useState({
    email: '',
    mfaEnabled: false,
    sessions: [] as {_id: string; name: string}[],
    sessionID: '' as string | undefined,
  });
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    async function getAuthInfo() {
      const e = await client.api.get('/auth/account/');
      const m = await client.api.get('/auth/mfa/');
      const s = await client.api.get('/auth/session/all');
      const i = storage.getString('sessionID');
      setAuthInfo({
        email: e.email,
        mfaEnabled: m.totp_mfa ?? m.security_key_mfa ?? false,
        sessions: s,
        sessionID: i,
      });
    }
    getAuthInfo();
  }, []);

  return (
    <>
      <SettingsEntry key={'username-settings'}>
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
      </SettingsEntry>
      <SettingsEntry key={'email-settings'}>
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
      </SettingsEntry>
      <GapView size={4} />
      <Text type={'h1'}>Multi-factor authentication</Text>
      <Text
        style={{
          color: currentTheme.foregroundSecondary,
        }}>
        Make your account more secure by enabling multi-factor authentication
        (MFA).
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
        <SettingsEntry key={`sessions-${s._id}`}>
          <View style={{flex: 1, flexDirection: 'column'}}>
            <Text key={`sessions-${s._id}-name`} style={{fontWeight: 'bold'}}>
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
                  sessions: authInfo.sessions.filter(ses => ses._id !== s._id),
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
        </SettingsEntry>
      ))}
    </>
  );
});
