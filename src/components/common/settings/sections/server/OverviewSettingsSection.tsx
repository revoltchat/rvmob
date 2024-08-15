import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

// import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Server} from 'revolt.js';

import {GapView} from '@rvmob/components/layout';
import {InputWithButton, Link, Text} from '@rvmob/components/common/atoms';
import {SYSTEM_MESSAGE_CHANNEL_TYPES} from '@rvmob/lib/consts';
import {currentTheme, styles} from '@rvmob/Theme';

export const OverviewSettingsSection = observer(
  ({server}: {server: Server}) => {
    const {t} = useTranslation();

    return (
      <>
        <Text type={'h1'}>{t('app.servers.settings.overview.title')}</Text>
        <Text key={'server-name-label'} type={'h2'}>
          {t('app.servers.settings.overview.name')}
        </Text>
        <InputWithButton
          placeholder={t('app.servers.settings.overview.name')}
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
          emptyError={t(
            'app.servers.settings.overview.errors.empty_server_name',
          )}
        />
        <GapView size={4} />
        <Text key={'server-desc-label'} type={'h2'}>
          {t('app.servers.settings.overview.description')}
        </Text>
        <View>
          <Text
            style={{
              color: currentTheme.foregroundSecondary,
            }}>
            {t('app.servers.settings.overview.markdown_tip')}
          </Text>
          <Link
            link={'https://support.revolt.chat/kb/account/badges'}
            label={t('app.servers.settings.overview.markdown_tip_link')}
            style={{fontWeight: 'bold'}}
          />
        </View>
        <GapView size={2} />
        <InputWithButton
          placeholder={t(
            'app.servers.settings.overview.description_placeholder',
          )}
          defaultValue={server.description ?? undefined}
          onPress={(v: string) => {
            server.edit({
              description: v,
            });
          }}
          buttonContents={{
            type: 'string',
            content: t('app.servers.settings.overview.set_description'),
          }}
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
        <GapView size={2} />
        <Text type={'h2'}>
          {t('app.servers.settings.overview.system_messages')}
        </Text>
        <Text colour={currentTheme.foregroundSecondary}>
          {t('app.servers.settings.overview.system_messages_description')}
        </Text>
        {SYSTEM_MESSAGE_CHANNEL_TYPES.map(type => (
          <Pressable
            style={styles.settingsEntry}
            key={`overview-settings-system-channels-${type}`}
            onPress={() => {}}>
            <View style={{flex: 1, flexDirection: 'column'}}>
              <Text
                key={`overview-settings-system-channels-${type}-name`}
                style={{fontWeight: 'bold'}}>
                {t(
                  `app.servers.settings.overview.system_message_channel_types.${type}`,
                )}
              </Text>
              <Text colour={currentTheme.foregroundSecondary}>
                {server.system_messages?.[type] ?? 'None'}
              </Text>
            </View>
            <View
              style={{
                width: 30,
                height: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {/* <View style={styles.iconContainer}>
              <MaterialIcon
                name={'edit'}
                size={20}
                color={currentTheme.foregroundPrimary}
              />
            </View> */}
            </View>
          </Pressable>
        ))}
      </>
    );
  },
);
