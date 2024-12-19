import {useContext} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {app} from '@rvmob/Generic';
import {styles} from '@rvmob/Theme';
import {commonValues, Theme, ThemeContext} from '@rvmob/lib/themes';

export const ChannelHeader = ({children}: {children: any}) => {
  const {currentTheme} = useContext(ThemeContext);
  const localStyles = generateLocalStyles(currentTheme);

  const {height, width} = useWindowDimensions();

  return (
    <View style={localStyles.channelHeader}>
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

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    channelHeader: {
      height: 50,
      backgroundColor: currentTheme.messageBox,
      alignItems: 'center',
      paddingLeft: commonValues.sizes.xl,
      padding: 10,
      flexDirection: 'row',
    },
  });
};
