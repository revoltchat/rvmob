import React from 'react';
import {View} from 'react-native';

import {styles} from '../../Theme';
import {Text} from '../common/atoms';

export const VoiceChannel = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
      }}>
      <Text style={styles.loadingHeader}>
        Voice channels aren't supported in RVMob yet!
      </Text>
      <Text style={styles.remark}>
        In the meantime, you can join them via the web app or Revolt Desktop.
      </Text>
    </View>
  );
};
