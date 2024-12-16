import {useState} from 'react';

import {setFunction} from '@rvmob/Generic';
import {LoadingScreen} from '@rvmob/components/views/LoadingScreen';
import {LoginPage} from '@rvmob/pages/auth/LoginPage';
import {LoginSettingsPage} from '@rvmob/pages/auth/LoginSettingsPage';

export const LoginViews = ({markAsLoggedIn}: {markAsLoggedIn: any}) => {
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
    <LoadingScreen
      header={
        loadingStage === 'connected'
          ? 'app.loading.generic'
          : 'app.loading.connecting'
      }
    />
  );
};
