import {View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {styles} from '../../Theme';
import {Text} from '../common/atoms';

export const VoiceChannel = () => {
  const {t} = useTranslation();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
      }}>
      <Text style={styles.loadingHeader}>{t('app.misc.voice.header')}</Text>
      <Text style={styles.remark}>{t('app.misc.voice.body')}</Text>
    </View>
  );
};
