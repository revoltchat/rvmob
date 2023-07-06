import React from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {client, InputWithButton} from '../../Generic';
import {STATUSES} from '../../lib/consts';
import {currentTheme} from '../../Theme';
import {ContextButton, Text} from '../common/atoms';

export const StatusSheet = observer(() => {
  return (
    <View>
      <Text key={'custom-status-selector-label'} type={'header'}>
        Status
      </Text>
      <View style={{marginBottom: 10}}>
        {STATUSES.map(s => (
          <ContextButton
            key={s}
            onPress={() => {
              client.users.edit({
                status: {...client.user?.status, presence: s},
              });
            }}>
            <View
              style={{
                // @ts-expect-error every status has a colour (TODO: find a solution?)
                backgroundColor: currentTheme['status' + s],
                height: 16,
                width: 16,
                borderRadius: 10000,
                marginRight: 10,
              }}
            />
            <Text style={{fontSize: 15}} key={`${s}-button-label`}>
              {s}
            </Text>
          </ContextButton>
        ))}
      </View>
      <Text key={'custom-status-input-label'} type={'header'}>
        Status text
      </Text>
      <InputWithButton
        placeholder="Custom status"
        defaultValue={client.user?.status?.text ?? undefined}
        onPress={(v: string) => {
          client.users.edit({
            status: {
              ...client.user?.status,
              text: v ? v : undefined,
            },
          });
        }}
        buttonLabel="Set text"
        backgroundColor={currentTheme.backgroundPrimary}
      />
    </View>
  );
});
