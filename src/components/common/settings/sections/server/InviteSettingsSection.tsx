import React, {useEffect, useState} from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {API, Server} from 'revolt.js';

import {currentTheme, styles} from '../../../../../Theme';
import {Text} from '../../../atoms';

export const InviteSettingsSection = observer(({server}: {server: Server}) => {
  const {t} = useTranslation();

  const [reload, triggerReload] = useState(0);
  const [invites, setInvites] = useState(null as API.Invite[] | null);
  useEffect(() => {
    async function fetchInvites() {
      const i = await server.fetchInvites();
      setInvites(i);
    }

    fetchInvites();
  }, [server, reload]);

  return (
    <>
      <Text type={'h1'}>{t('app.servers.settings.invites.title')}</Text>
      {invites ? (
        invites.length ? (
          invites.map(i => (
            <View
              style={styles.settingsEntry}
              key={`invite-settings-entry-${i._id}`}>
              <View style={{flex: 1, flexDirection: 'column'}}>
                <Text
                  key={`invite-settings-entry-${i._id}-id`}
                  style={{fontWeight: 'bold'}}>
                  {i._id}
                </Text>
                <Text colour={currentTheme.foregroundSecondary}>
                  @{i.creator} - #{i.channel}
                </Text>
              </View>
              {i._id.length === 8 ? (
                <Pressable
                  style={{
                    width: 30,
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    server.client.deleteInvite(i._id);
                    triggerReload(reload + 1);
                  }}>
                  <View style={styles.iconContainer}>
                    <MaterialIcon
                      name={'delete'}
                      size={20}
                      color={currentTheme.foregroundPrimary}
                    />
                  </View>
                </Pressable>
              ) : null}
            </View>
          ))
        ) : (
          <Text>{t('app.servers.settings.invites.empty')}</Text>
        )
      ) : (
        <Text>{t('app.servers.settings.invites.loading')}</Text>
      )}
    </>
  );
});
