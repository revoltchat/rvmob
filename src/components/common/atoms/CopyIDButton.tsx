import {useContext} from 'react';
import {View} from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {styles} from '@clerotri/Theme';
import {ContextButton} from './ContextButton';
import {Text} from './Text';
import {ThemeContext} from '@clerotri/lib/themes';

export const CopyIDButton = ({id}: {id: string}) => {
  const {currentTheme} = useContext(ThemeContext);

  return (
    <ContextButton
      key={`copy-id-button-${id}`}
      onPress={() => {
        Clipboard.setString(id);
      }}>
      <View style={styles.iconContainer}>
        <MaterialIcon
          name="content-copy"
          size={20}
          color={currentTheme.foregroundPrimary}
        />
      </View>
      <Text>
        Copy ID <Text colour={currentTheme.foregroundSecondary}>({id})</Text>
      </Text>
    </ContextButton>
  );
};
