import React from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Server} from 'revolt.js';

import {ChannelSettingsSubsection} from '@rvmob/lib/types';
import {currentTheme, styles} from '@rvmob/Theme';
import {GapView} from '@rvmob/components/layout';
import {
  BackButton,
  InputWithButton,
  Text,
} from '@rvmob/components/common/atoms';
import {ChannelIcon} from '@rvmob/components/navigation/ChannelIcon';

export const ChannelSettingsSection = observer(
  ({server, callback}: {server: Server; callback: Function}) => {
    const {t} = useTranslation();

    const [subsection, setSubsection] = React.useState(
      null as ChannelSettingsSubsection,
    );

    return (
      <>
        <BackButton
          callback={() => {
            subsection ? setSubsection(null) : callback();
          }}
          margin
        />
        {subsection ? (
          <>
            <Text type={'h1'}>{subsection.name}</Text>
            <Text colour={currentTheme.foregroundSecondary}>
              {subsection._id}
            </Text>
            <GapView size={2} />
            <Text type={'h2'}>{t('app.servers.settings.channels.name')}</Text>
            <InputWithButton
              placeholder={t('app.servers.settings.channels.name_placeholder')}
              defaultValue={subsection.name ?? ''}
              onPress={(v: string) => {
                subsection.edit({name: v});
              }}
              buttonContents={{
                type: 'icon',
                name: 'save',
                pack: 'regular',
              }}
              backgroundColor={currentTheme.backgroundSecondary}
              skipIfSame
              cannotBeEmpty
              emptyError={t(
                'app.servers.settings.channels.errors.empty_channel_name',
              )}
            />
            <GapView size={2} />
            <Text type={'h2'}>
              {t('app.servers.settings.channels.permissions')}
            </Text>
            {server.orderedRoles.map(r => (
              <View
                style={styles.settingsEntry}
                key={`channel-settings-${subsection._id}-perms-${r.id}`}>
                <View style={{flex: 1}}>
                  <View>
                    <Text
                      key={`channel-settings-entry-${r.id}-name`}
                      colour={r.colour ?? currentTheme.foregroundPrimary}
                      style={{fontWeight: 'bold'}}>
                      {r.name}
                    </Text>
                    <Text colour={currentTheme.foregroundSecondary}>
                      {r.id}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text>
                    {subsection.role_permissions &&
                    subsection.role_permissions[r.id]
                      ? `${subsection.role_permissions[r.id].a} | ${
                          subsection.role_permissions[r.id].d
                        }`
                      : 'Not set'}
                  </Text>
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            <Text type={'h1'}>{t('app.servers.settings.channels.title')}</Text>
            {server.orderedChannels.map(cat => (
              <View key={`channel-settings-category-${cat.id}`}>
                <Text type={'h2'}>
                  {cat.id === 'default' ? 'Uncategorised' : cat.title}
                </Text>
                {cat.id !== 'default' ? (
                  <Text colour={currentTheme.foregroundSecondary}>
                    {cat.id}
                  </Text>
                ) : null}
                {cat.channels.map(c => (
                  <Pressable
                    style={styles.settingsEntry}
                    key={`channel-settings-entry-${c._id}`}
                    onPress={() => {
                      setSubsection(c);
                    }}>
                    <View style={{marginEnd: 8}}>
                      <ChannelIcon
                        channel={{type: 'channel', channel: c}}
                        showUnread={false}
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <View>
                        <Text
                          key={`channel-settings-entry-${c._id}-name`}
                          style={{fontWeight: 'bold'}}>
                          #{c.name}
                        </Text>
                        <Text colour={currentTheme.foregroundSecondary}>
                          {c._id}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        width: 30,
                        height: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <View style={styles.iconContainer}>
                        <MaterialIcon
                          name={'arrow-forward'}
                          size={20}
                          color={currentTheme.foregroundPrimary}
                        />
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            ))}
          </>
        )}
      </>
    );
  },
);
