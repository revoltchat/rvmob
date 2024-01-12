import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import {Server} from 'revolt.js';

import {currentTheme} from '@rvmob/Theme';
import {GapView} from '@rvmob/components/layout';
import {InputWithButton, Link, Text} from '@rvmob/components/common/atoms';

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
        <Text>
          When members join/leave or are kicked/banned, you can receive
          messages. (not final copy)
        </Text>
        <Text>
          new {server.system_messages?.user_joined} leave{' '}
          {server.system_messages?.user_left} kick{' '}
          {server.system_messages?.user_kicked} ban{' '}
          {server.system_messages?.user_banned}
        </Text>
      </>
    );
  },
);
