import {useEffect, useState} from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {API, Server} from 'revolt.js';

import {currentTheme, styles} from '@rvmob/Theme';
import {Text} from '@rvmob/components/common/atoms';

export const BanSettingsSection = observer(({server}: {server: Server}) => {
  const {t} = useTranslation();

  const [reload, triggerReload] = useState(0);
  const [bans, setBans] = useState(null as API.BanListResult | null);
  useEffect(() => {
    async function fetchInvites() {
      const b = await server.fetchBans();
      setBans(b);
    }

    fetchInvites();
  }, [server, reload]);

  return (
    <>
      <Text type={'h1'}>{t('app.servers.settings.bans.title')}</Text>
      {bans ? (
        bans.bans.length ? (
          bans.bans.map(b => (
            <View
              style={styles.settingsEntry}
              key={`invite-settings-entry-${b._id.user}`}>
              <View style={{flex: 1, flexDirection: 'column'}}>
                <Text
                  key={`invite-settings-entry-${b._id.user}-id`}
                  style={{fontWeight: 'bold'}}>
                  {bans.users.find(u => u._id === b._id.user)?.username ??
                    b._id.user}
                </Text>
                <Text colour={currentTheme.foregroundSecondary}>
                  {b.reason ?? t('app.servers.settings.bans.no_reason')}
                </Text>
              </View>
              {server.havePermission('BanMembers') ? (
                <Pressable
                  style={{
                    width: 30,
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    server.unbanUser(b._id.user);
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
          <Text>{t('app.servers.settings.bans.empty')}</Text>
        )
      ) : (
        <Text>{t('app.servers.settings.bans.loading')}</Text>
      )}
    </>
  );
});
