import {useState} from 'react';
import {TextInput, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import {app} from '@rvmob/Generic';
import {commonValues, currentTheme, styles} from '@rvmob/Theme';
import {Button, Text} from '@rvmob/components/common/atoms';
import {TextEditingModalProps} from '@rvmob/lib/types';

export const TextEditModal = observer(
  ({object}: {object: TextEditingModalProps}) => {
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
          <TextInput
            style={styles.input}
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
