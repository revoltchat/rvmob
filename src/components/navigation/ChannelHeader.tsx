import {TouchableOpacity, useWindowDimensions, View} from 'react-native';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {app} from '@rvmob/Generic';
import {currentTheme, styles} from '@rvmob/Theme';

export const ChannelHeader = ({children}: {children: any}) => {
  const {height, width} = useWindowDimensions();

  return (
    <View style={styles.channelHeader}>
      {height > width ? (
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => {
            app.openLeftMenu(true);
          }}>
          <View style={styles.iconContainer}>
            <MaterialIcon
              name="menu"
              size={20}
              color={currentTheme.foregroundPrimary}
            />
          </View>
        </TouchableOpacity>
      ) : null}
      {children}
    </View>
  );
};
