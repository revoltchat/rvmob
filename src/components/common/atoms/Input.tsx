import {useContext} from 'react';
import {StyleSheet, TextInput, type TextInputProps} from 'react-native';

import {commonValues, Theme, ThemeContext} from '@rvmob/lib/themes';

type InputProps = TextInputProps & {
  isLoginInput?: boolean;
};

export function Input(props: InputProps) {
  const {currentTheme} = useContext(ThemeContext);
  const localStyles = generateLocalStyles(currentTheme);

  return (
    <TextInput
      style={[
        props.isLoginInput ? localStyles.loginInput : localStyles.input,
        props.style,
      ]}
      {...props}
    />
  );
}

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    input: {
      fontFamily: 'Open Sans',
      minWidth: '100%',
      borderRadius: commonValues.sizes.medium,
      backgroundColor: currentTheme.backgroundSecondary,
      padding: 6,
      paddingLeft: 10,
      paddingRight: 10,
      color: currentTheme.foregroundPrimary,
    },
    loginInput: {
      fontFamily: 'Inter',
      borderRadius: commonValues.sizes.medium,
      padding: 3,
      paddingLeft: 10,
      paddingRight: 10,
      margin: commonValues.sizes.medium,
      width: '80%',
      backgroundColor: currentTheme.backgroundSecondary,
      color: currentTheme.foregroundPrimary,
    },
  });
};
