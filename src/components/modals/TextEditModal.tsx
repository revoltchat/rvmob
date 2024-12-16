import {useContext, useState} from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import {app} from '@rvmob/Generic';
import {Button, Input, Text} from '@rvmob/components/common/atoms';
import {commonValues, ThemeContext} from '@rvmob/lib/themes';
import {TextEditingModalProps} from '@rvmob/lib/types';

export const TextEditModal = observer(
  ({object}: {object: TextEditingModalProps}) => {
    const {currentTheme} = useContext(ThemeContext);

    const {t} = useTranslation();

    const [string, setString] = useState(object.initialString);
    return (
      <View
        style={{
          width: '80%',
          borderRadius: commonValues.sizes.medium,
          padding: 20,
          backgroundColor: currentTheme.backgroundPrimary,
          justifyContent: 'center',
          alignSelf: 'center',
        }}>
        <Text type={'h1'}>{t(`app.modals.edit_text.${object.id}_header`)}</Text>
        {}
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            marginTop: 10,
          }}>
          <Input
            value={string}
            placeholder={t(`app.modals.edit_text.${object.id}_placeholder`)}
            onChangeText={v => {
              setString(v);
            }}
          />
          <Button
            onPress={() => {
              app.openTextEditModal(null);
              object.callback(string);
            }}
            style={{marginHorizontal: 0}}>
            <Text>{t('app.actions.confirm')}</Text>
          </Button>
          <Button
            onPress={() => {
              app.openTextEditModal(null);
            }}
            style={{marginHorizontal: 0}}>
            <Text>{t('app.actions.cancel')}</Text>
          </Button>
        </View>
      </View>
    );
  },
);
