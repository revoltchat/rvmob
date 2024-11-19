import {TouchableOpacity} from 'react-native';
import {observer} from 'mobx-react-lite';

import {commonValues, currentTheme} from '@rvmob/Theme';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Text} from './Text';

export const Checkbox = observer(
  ({value, callback}: {value: boolean; callback: any}) => {
    return (
      <TouchableOpacity
        style={{
          width: 40,
          height: 40,
          borderRadius: commonValues.sizes.medium,
          backgroundColor: value
            ? currentTheme.accentColor
            : currentTheme.backgroundSecondary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={callback}>
        <Text
          style={{
            color: value
              ? currentTheme.accentColorForeground
              : currentTheme.foregroundPrimary,
          }}>
          {value ? (
            <MaterialIcon
              name="check"
              color={currentTheme.accentColorForeground}
              size={24}
            />
          ) : null}
        </Text>
      </TouchableOpacity>
    );
  },
);
