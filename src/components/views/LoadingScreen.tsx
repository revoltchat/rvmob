import {useContext} from 'react';
import {StyleSheet, type TextStyle, View, type ViewStyle} from 'react-native';
import {useTranslation} from 'react-i18next';

import {selectedRemark} from '@clerotri/Generic';
import {Text} from '@clerotri/components/common/atoms';
import {Theme, ThemeContext} from '@clerotri/lib/themes';

export function LoadingScreen({
  header,
  headerParams,
  body,
  bodyParams,
  styles,
}: {
  header?: string;
  headerParams?: any;
  body?: string;
  bodyParams?: any;
  styles?: {
    loadingScreen?: ViewStyle;
    loadingHeader?: TextStyle;
    remark?: TextStyle;
  };
}) {
  const {currentTheme} = useContext(ThemeContext);
  const localStyles = generateLocalStyles(currentTheme);

  const {t} = useTranslation();

  return (
    <View
      style={{
        ...localStyles.loadingScreen,
        ...(styles && styles.loadingScreen),
      }}>
      <Text
        style={{
          ...localStyles.loadingHeader,
          ...(styles && styles.loadingHeader),
        }}>
        {t(header ?? 'app.loading.generic', headerParams) as string}
      </Text>
      <Text style={{...localStyles.remark, ...(styles && styles.remark)}}>
        {body ? (t(body, bodyParams) as string) : selectedRemark}
      </Text>
    </View>
  );
}

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    loadingScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
    },
    loadingHeader: {
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: 30,
    },
    remark: {
      color: currentTheme.foregroundSecondary,
      textAlign: 'center',
      fontSize: 16,
      marginTop: 5,
      paddingHorizontal: 30,
    },
  });
};
