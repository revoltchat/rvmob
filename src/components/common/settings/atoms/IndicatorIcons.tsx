import React from 'react';
import {View} from 'react-native';

import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Setting} from '../../../../lib/types';
import {currentTheme, styles} from '../../../../Theme';

export const IndicatorIcons = ({s}: {s: Setting}) => {
  return (
    <>
      {s.experimental ? (
        <View style={styles.iconContainer}>
          <MaterialCommunityIcon
            name="flask"
            size={28}
            color={currentTheme.accentColor}
          />
        </View>
      ) : null}
      {s.developer ? (
        <View style={styles.iconContainer}>
          <MaterialIcon
            name="bug-report"
            size={28}
            color={currentTheme.accentColor}
          />
        </View>
      ) : null}
    </>
  );
};
