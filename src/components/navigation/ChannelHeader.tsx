import React from 'react';
import {View, TouchableOpacity} from 'react-native';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {app} from '../../Generic';
import {currentTheme, styles} from '../../Theme';

export const ChannelHeader = ({children}: {children: any}) => {
  return (
    <View style={styles.channelHeader}>
      <TouchableOpacity
        style={styles.headerIcon}
        onPress={() => {
          app.openLeftMenu();
        }}>
        <View style={styles.iconContainer}>
          <MaterialIcon
            name="menu"
            size={20}
            color={currentTheme.foregroundPrimary}
          />
        </View>
      </TouchableOpacity>
      {children}
    </View>
  );
};
