import React from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Client} from 'revolt.js';

import {currentTheme} from '../Theme';
import {Text} from './common/atoms';

export const NetworkIndicator = observer(({client}: {client: Client}) => {
  if (!client.user?.online && client.user?.status?.presence) {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: currentTheme.accentColor,
        }}>
        <Text
          colour={currentTheme.accentColorForeground}
          style={{
            fontSize: 16,
            fontWeight: 'bold',
          }}>
          Connection lost
        </Text>
      </View>
    );
  }
  return <></>;
});
