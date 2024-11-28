import {useState} from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {setFunction, selectedRemark} from '@rvmob/Generic';
import {styles} from '@rvmob/Theme';
import {Text} from '@rvmob/components/common/atoms';
import {LoginPage} from '@rvmob/pages/auth/LoginPage';
import {LoginSettingsPage} from '@rvmob/pages/auth/LoginSettingsPage';

export const LoginViews = ({markAsLoggedIn}: {markAsLoggedIn: any}) => {
  const {t} = useTranslation();

  const [currentPage, setCurrentPage] = useState<
    'loginSettings' | 'loginPage' | 'loadingPage'
  >('loadingPage');

  const [loadingStage, setLoadingStage] = useState<
    'connecting' | 'connected' | ''
  >('');

  setFunction('setLoggedOutScreen', (screen: 'loginPage' | 'loadingPage') => {
    setCurrentPage(screen);
  });

  setFunction('setLoadingStage', (stage: 'connecting' | 'connected' | '') => {
    setLoadingStage(stage);
  });

  return currentPage === 'loginSettings' ? (
    <LoginSettingsPage callback={() => setCurrentPage('loginPage')} />
  ) : currentPage === 'loginPage' ? (
    <LoginPage
      openLoginSettings={() => setCurrentPage('loginSettings')}
      markAsLoggedIn={markAsLoggedIn}
    />
  ) : (
    <View style={styles.loadingScreen}>
      <Text style={{fontSize: 30, fontWeight: 'bold'}}>
        {loadingStage === 'connected'
          ? t('app.loading.generic')
          : t('app.loading.connecting')}
      </Text>
      <Text style={styles.remark}>{selectedRemark || null}</Text>
    </View>
  );
};
