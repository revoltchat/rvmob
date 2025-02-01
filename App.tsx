import 'react-native-get-random-values'; // react native moment

import {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {ErrorBoundary} from 'react-error-boundary';

import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {setFunction} from '@clerotri/Generic';
import {MainView} from '@clerotri/MainView';
import {ErrorMessage} from '@clerotri/components/ErrorMessage';
import {initialiseSettings} from '@clerotri/lib/storage/utils';
import {themes, Theme, ThemeContext} from '@clerotri/lib/themes';

export const App = () => {
  const [theme, setTheme] = useState<Theme>(themes.Dark);

  const localStyles = generateLocalStyles(theme);

  setFunction('setTheme', (themeName: string) => {
    const newTheme = themes[themeName] ?? themes.Dark;
    setTheme(newTheme);
  });

  useEffect(() => {
    initialiseSettings();
  }, []);

  return (
    <GestureHandlerRootView style={localStyles.outer}>
      <ThemeContext.Provider
        value={{currentTheme: theme, setCurrentTheme: setTheme}}>
        {/* <ErrorBoundary fallbackRender={ErrorMessage}> */}
          <MainView />
        {/* </ErrorBoundary> */}
      </ThemeContext.Provider>
    </GestureHandlerRootView>
  );
};

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    outer: {
      flex: 1,
      backgroundColor: currentTheme.backgroundPrimary,
    },
  });
};
