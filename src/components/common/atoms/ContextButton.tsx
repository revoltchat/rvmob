import {useContext} from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';

import {commonValues, Theme, ThemeContext} from '@clerotri/lib/themes';

type ButtonProps = {
  children?: any;
  backgroundColor?: string;
  onPress?: any;
  onLongPress?: any;
  delayLongPress?: number;
  style?: any;
};

export function ContextButton({
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
        localStyles.contextButton,
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
    contextButton: {
      height: 40,
      width: '100%',
      alignItems: 'center',
      flexDirection: 'row',
      backgroundColor: currentTheme.backgroundPrimary,
      borderRadius: commonValues.sizes.medium,
      paddingLeft: 10,
      paddingRight: 10,
      marginVertical: commonValues.sizes.small,
    },
  });
};
