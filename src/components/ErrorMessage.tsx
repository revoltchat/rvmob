import {useContext} from 'react';
import {StyleSheet, View} from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';

import {Button, Text} from '@clerotri/components/common/atoms';
import {commonValues, Theme, ThemeContext} from '@clerotri/lib/themes';

export function ErrorMessage({
  error,
  resetErrorBoundary,
}: {
  error: any;
  resetErrorBoundary: Function;
}) {
  const {currentTheme} = useContext(ThemeContext);
  const localStyles = generateLocalStyles(currentTheme);

  const errorMessage = `${error}`;

  console.error(`[APP] Uncaught error: ${errorMessage}`);
  return (
    <View style={localStyles.container}>
      <Text style={localStyles.textContainer}>
        <Text style={localStyles.header}>OOPSIE WOOPSIE!! {'UwU\n'}</Text>
        We made a fucky wucky!! A wittle fucko boingo! The code monkeys at our
        headquarters are working VEWY HAWD to fix this! {'>w<\n\n'}
        On a more serious note, please let us know that you experienced the
        following error:
      </Text>
      <View style={localStyles.errorMessageBox}>
        <Text font={'JetBrains Mono'} colour={currentTheme.error}>
          {errorMessage}
        </Text>
      </View>
      <Button
        onPress={() => {
          Clipboard.setString(errorMessage);
        }}>
        <Text>Copy error message</Text>
      </Button>
      <Button
        onPress={() => {
          resetErrorBoundary();
        }}>
        <Text>Reload app</Text>
      </Button>
    </View>
  );
}

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: commonValues.sizes.xl,
      justifyContent: 'center',
    },
    textContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    },
    header: {
      fontSize: 30,
      fontWeight: 'bold',
    },
    errorMessageBox: {
      backgroundColor: currentTheme.background,
      borderRadius: commonValues.sizes.medium,
      marginVertical: commonValues.sizes.xl,
      padding: commonValues.sizes.xl,
    },
  });
};
