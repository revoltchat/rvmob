import 'react-native-get-random-values'; // react native moment

import {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {ErrorBoundary} from 'react-error-boundary';

import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {setFunction} from '@rvmob/Generic';
import {MainView} from '@rvmob/MainView';
import {ErrorMessage} from '@rvmob/components/ErrorMessage';
import {LoadingScreen} from '@rvmob/components/views/LoadingScreen';
import {storage} from '@rvmob/lib/storage';
import {migrateToMMKV} from '@rvmob/lib/storage/migration';
import {initialiseSettings} from '@rvmob/lib/storage/utils';
import {themes, Theme, ThemeContext} from '@rvmob/lib/themes';

export const App = () => {
  const [checkedMigration, setCheckedMigration] = useState(false);
  const [theme, setTheme] = useState<Theme>(themes.Dark);

  const localStyles = generateLocalStyles(theme);

  setFunction('setTheme', (themeName: string) => {
    const newTheme = themes[themeName] ?? themes.Dark;
    setTheme(newTheme);
  });

  useEffect(() => {
    async function migrationCheck() {
      const hasMigrated = storage.getBoolean('hasMigrated');

      if (!hasMigrated) {
        await migrateToMMKV();
      }

      initialiseSettings();

      setCheckedMigration(true);
    }

    migrationCheck();
  }, []);

  return (
    <GestureHandlerRootView style={localStyles.outer}>
      <ThemeContext.Provider
        value={{currentTheme: theme, setCurrentTheme: setTheme}}>
        <ErrorBoundary fallbackRender={ErrorMessage}>
          {checkedMigration ? (
            <MainView />
          ) : (
            <LoadingScreen header={'app.loading.migrating_settings'} />
          )}
        </ErrorBoundary>
      </ThemeContext.Provider>
    </GestureHandlerRootView>
  );
};

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    outer: {
      flex: 1,
      backgroundColor: currentTheme.backgroundSecondary,
    },
  });
};
