import {useContext} from 'react';
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';

import {commonValues, Theme, ThemeContext} from '@rvmob/lib/themes';

export function SettingsEntry(props: ViewProps) {
  const {currentTheme} = useContext(ThemeContext);
  const localStyles = generateLocalStyles(currentTheme);

  let newProps = {...props};

  if (!newProps.style) {
    newProps.style = {};
  }
  newProps.style = {
    ...localStyles.settingsEntry,
    // @ts-expect-error the type error seems to be related to the various ways you can specify style props but it works so shhhh

    ...newProps.style,
  };

  return <View style={localStyles.settingsEntry} {...newProps} />;
}

export function PressableSettingsEntry(props: PressableProps) {
  const {currentTheme} = useContext(ThemeContext);
  const localStyles = generateLocalStyles(currentTheme);

  return <Pressable style={[localStyles.settingsEntry]} {...props} />;
}

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    settingsEntry: {
      flexDirection: 'row',
      padding: commonValues.sizes.medium,
      marginVertical: commonValues.sizes.small,
      backgroundColor: currentTheme.backgroundSecondary,
      borderRadius: commonValues.sizes.small,
      alignItems: 'center',
    },
  });
};
