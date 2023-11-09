import React from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Server} from 'revolt.js';

import {currentTheme} from '../../../../../Theme';
import {GapView} from '../../../../layout';
import {InputWithButton, Link, Text} from '../../../atoms';

export const OverviewSettingsSection = observer(
  ({server}: {server: Server}) => {
    return (
      <>
        <Text type={'h1'}>Overview</Text>
        <Text key={'server-name-label'} type={'h2'}>
          Server name
        </Text>
        <InputWithButton
          placeholder="Server name"
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
          emptyError={'Server names cannot be empty!'}
        />
        <GapView size={4} />
        <Text key={'server-desc-label'} type={'h2'}>
          Server description
        </Text>
        <View>
          <Text
            style={{
              color: currentTheme.foregroundSecondary,
            }}>
            Server descriptions support Markdown formatting.
          </Text>
          <Link
            link={'https://support.revolt.chat/kb/account/badges'}
            label={'Learn more.'}
            style={{fontWeight: 'bold'}}
          />
        </View>
        <GapView size={2} />
        <InputWithButton
          placeholder="Add a description..."
          defaultValue={server.description ?? undefined}
          onPress={(v: string) => {
            server.edit({
              description: v,
            });
          }}
          buttonContents={{type: 'string', content: 'Set description'}}
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
        <Text type={'h2'}>System messages</Text>
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
