import {useContext} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';

import {commonValues, Theme, ThemeContext} from '@rvmob/lib/themes';

type ButtonProps = TouchableOpacityProps & {
  backgroundColor?: string;
};

export function Button({
  children,
  backgroundColor,
  onPress,
  onLongPress,
  delayLongPress,
  style,
  ...props
}: ButtonProps) {
  const {currentTheme} = useContext(ThemeContext);
  const localStyles = generateLocalStyles(currentTheme);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      style={[
        localStyles.button,
        backgroundColor ? {backgroundColor} : {},
        style,
      ]}
      {...props}>
      {children}
    </TouchableOpacity>
  );
}

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    button: {
      padding: commonValues.sizes.large,
      paddingHorizontal: commonValues.sizes.xl,
      borderRadius: commonValues.sizes.medium,
      backgroundColor: currentTheme.buttonBackground,
      margin: 5,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
  });
};
