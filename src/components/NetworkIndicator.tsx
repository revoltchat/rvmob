import React from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Client} from 'revolt.js';

import {Text} from '../Generic';
import {currentTheme} from '../Theme';

export const NetworkIndicator = observer(({client}: {client: Client}) => {
  if (!client.user?.online) {
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
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: currentTheme.accentColorForeground,
          }}>
          Connection lost
        </Text>
      </View>
    );
  }
  return <></>;
});
