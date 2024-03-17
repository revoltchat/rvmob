import React from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Channel, Server} from 'revolt.js';

import {app} from '@rvmob/Generic';
import {SettingsSection} from '@rvmob/lib/types';
import {currentTheme, styles} from '@rvmob/Theme';
import {GapView} from '@rvmob/components/layout';
import {
  BackButton,
  InputWithButton,
  Text,
} from '@rvmob/components/common/atoms';
import {ChannelIcon} from '@rvmob/components/navigation/ChannelIcon';

export const ChannelSettingsSection = observer(
  ({
    server,
    section,
    setSection,
  }: {
    server: Server;
    section: SettingsSection;
    setSection: Function;
  }) => {
    const {t} = useTranslation();

    const [channel, setChannel] = React.useState<Channel | null>(null);

    const handleBackInSubsection = () => {
      setChannel(null);
      setSection({section: 'channels', subsection: undefined});
    };

    return (
      <>
        <BackButton
          callback={() => {
            channel ? handleBackInSubsection() : setSection(null);
          }}
          margin
        />
        {section!.subsection !== undefined && channel ? (
          <>
            <Text type={'h1'}>{channel.name}</Text>
            <Text colour={currentTheme.foregroundSecondary}>{channel._id}</Text>
            <GapView size={2} />
            <Text type={'h2'}>{t('app.servers.settings.channels.name')}</Text>
            <InputWithButton
              placeholder={t('app.servers.settings.channels.name_placeholder')}
              defaultValue={channel.name ?? ''}
              onPress={(v: string) => {
                channel.edit({name: v});
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
                key={`channel-settings-${channel._id}-perms-${r.id}`}>
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
                    {channel.role_permissions && channel.role_permissions[r.id]
                      ? `${channel.role_permissions[r.id].a} | ${
                          channel.role_permissions[r.id].d
                        }`
                      : 'Not set'}
                  </Text>
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 4,
              }}>
              <View style={{flex: 1}}>
                <Text type={'h1'}>
                  {t('app.servers.settings.channels.title')}
                </Text>
              </View>
              {server.havePermission('ManageChannel') ? (
                <Pressable
                  onPress={() => {
                    app.openCreateChannelModal({
                      server,
                      callback: () => {},
                    });
                  }}
                  style={{
                    width: 30,
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View style={styles.iconContainer}>
                    <MaterialIcon
                      name={'add'}
                      size={20}
                      color={currentTheme.foregroundPrimary}
                    />
                  </View>
                </Pressable>
              ) : null}
            </View>
            {server.orderedChannels.map(cat => (
              <View key={`channel-settings-category-${cat.id}`}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 4,
                  }}>
                  <View style={{flex: 1}}>
                    <Text type={'h2'}>
                      {cat.id === 'default' ? 'Uncategorised' : cat.title}
                    </Text>
                    {cat.id !== 'default' ? (
                      <Text colour={currentTheme.foregroundSecondary}>
                        {cat.id}
                      </Text>
                    ) : null}
                  </View>
                  {/* uncomment when revolt lets you create channels in categories
                  {server.havePermission('ManageChannel') ? (
                    <Pressable
                      onPress={() => {
                        app.openCreateChannelModal({
                          server,
                          callback: () => {},
                          category: cat.id,
                        });
                      }}
                      style={{
                        width: 30,
                        height: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <View style={styles.iconContainer}>
                        <MaterialIcon
                          name={'add'}
                          size={20}
                          color={currentTheme.foregroundPrimary}
                        />
                      </View>
                    </Pressable>
                  ) : null} */}
                  <Pressable
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
                  </Pressable>
                </View>
                {cat.channels.map(c => (
                  <Pressable
                    style={styles.settingsEntry}
                    key={`channel-settings-entry-${c._id}`}
                    onPress={() => {
                      setChannel(c);
                      setSection({section: 'channels', subsection: c._id});
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
