import {useContext, useState} from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import type {Channel, Server} from 'revolt.js';

import {app} from '@clerotri/Generic';
import {styles} from '@clerotri/Theme';
import {GapView} from '@clerotri/components/layout';
import {
  BackButton,
  InputWithButton,
  Text,
} from '@clerotri/components/common/atoms';
import {ChannelIcon} from '@clerotri/components/navigation/ChannelIcon';
import {
  PressableSettingsEntry,
  SettingsEntry,
} from '@clerotri/components/common/settings/atoms';
import {commonValues, ThemeContext} from '@clerotri/lib/themes';
import {SettingsSection} from '@clerotri/lib/types';

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
    const {currentTheme} = useContext(ThemeContext);

    const {t} = useTranslation();

    const [channel, setChannel] = useState<Channel | null>(null);

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
              <SettingsEntry
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
              </SettingsEntry>
            ))}
          </>
        ) : (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: commonValues.sizes.medium,
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
                    marginVertical: commonValues.sizes.small,
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
                  {/* TODO: add category settings <Pressable
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
                  </Pressable> */}
                </View>
                {cat.channels.map(c => (
                  <PressableSettingsEntry
                    key={`channel-settings-entry-${c._id}`}
                    onPress={() => {
                      setChannel(c);
                      setSection({section: 'channels', subsection: c._id});
                    }}>
                    <View style={{marginEnd: 8}}>
                      <ChannelIcon channel={c} showUnread={false} />
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
                  </PressableSettingsEntry>
                ))}
              </View>
            ))}
          </>
        )}
      </>
    );
  },
);
