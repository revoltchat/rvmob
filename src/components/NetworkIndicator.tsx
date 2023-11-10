import React, {useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Client} from 'revolt.js';

import {currentTheme} from '../Theme';
import {Text} from './common/atoms';

export const NetworkIndicator = observer(({client}: {client: Client}) => {
  const [collapsed, setCollapsed] = useState(false);
  if (!client.user?.online && client.user?.status?.presence && !collapsed) {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: currentTheme.background,
          flexDirection: 'row',
        }}>
        <Text
          colour={currentTheme.accentColor}
          style={{
            fontSize: 16,
            fontWeight: 'bold',
          }}>
          Connection lost{' '}
        </Text>
        <TouchableOpacity onPress={() => setCollapsed(true)}>
          <Text
            colour={currentTheme.accentColor}
            style={{
              fontSize: 16,
              fontWeight: 'bold',
            }}>
            (hide)
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  return <></>;
});
