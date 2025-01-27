import {useContext, useState} from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {app} from '@clerotri/Generic';
import {ThemeContext} from '@clerotri/lib/themes';
import {Setting} from '@clerotri/lib/types';
import {Input, Text} from '../../atoms';
import {IndicatorIcons} from './IndicatorIcons';

export const StringNumberSetting = ({sRaw}: {sRaw: Setting}) => {
  const {currentTheme} = useContext(ThemeContext);

  const {t} = useTranslation();

  const [value, setValue] = useState(app.settings.getRaw(sRaw.key));
  return (
    <View
      key={`settings_${sRaw.key}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
      }}>
      <View>
        <IndicatorIcons s={sRaw} />
        <Text style={{flex: 1, fontWeight: 'bold', marginBottom: 8}}>
          {t(`app.settings.${sRaw.key}`)}
        </Text>
        {sRaw.remark ? (
          <Text
            colour={currentTheme.foregroundSecondary}
            style={{marginBottom: 8}}>
            {t(`app.settings.${sRaw.key}_remark`)}
          </Text>
        ) : null}
        <Input
          value={value as string}
          keyboardType={sRaw.type === 'number' ? 'decimal-pad' : 'default'}
          onChangeText={v => {
            setValue(v);
            app.settings.set(sRaw.key, v);
          }}
        />
      </View>
    </View>
  );
};
