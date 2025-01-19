import {useContext} from 'react';
import {Pressable, type ViewStyle} from 'react-native';
import {useTranslation} from 'react-i18next';

import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Text} from './Text';
import {ThemeContext} from '@clerotri/lib/themes';

export function BackButton({
  callback,
  type,
  margin,
  label,
  style,
}: {
  callback: () => void;
  type?: 'back' | 'close';
  margin?: boolean;
  label?: string;
  style?: ViewStyle;
}) {
  const {currentTheme} = useContext(ThemeContext);

  const {t} = useTranslation();
  return (
    <Pressable
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: margin ? 10 : 0,
        ...style,
      }}
      onPress={() => {
        callback();
      }}>
      {type === 'close' ? (
        <MaterialCommunityIcon
          name="close-circle"
          size={24}
          color={currentTheme.foregroundSecondary}
        />
      ) : (
        <MaterialIcon
          name={'arrow-back'}
          size={24}
          color={currentTheme.foregroundSecondary}
        />
      )}
      <Text
        colour={currentTheme.foregroundSecondary}
        style={{
          fontSize: 20,
          marginLeft: 5,
        }}>
        {t(
          label ?? type === 'close' ? 'app.actions.close' : 'app.actions.back',
        )}
      </Text>
    </Pressable>
  );
}
