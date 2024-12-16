import {useTranslation} from 'react-i18next';

import {LoadingScreen} from '../views/LoadingScreen';

export const VoiceChannel = () => {
  const {t} = useTranslation();
  return (
    <LoadingScreen
      header={'app.misc.voice.header'}
      body={'app.misc.voice.body'}
    />
  );
};
