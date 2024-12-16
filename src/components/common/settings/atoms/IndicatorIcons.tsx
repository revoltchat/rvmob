import {useContext} from 'react';
import {View} from 'react-native';

import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {styles} from '@rvmob/Theme';
import {ThemeContext} from '@rvmob/lib/themes';
import {Setting} from '@rvmob/lib/types';

export const IndicatorIcons = ({s}: {s: Setting}) => {
  const {currentTheme} = useContext(ThemeContext);

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
