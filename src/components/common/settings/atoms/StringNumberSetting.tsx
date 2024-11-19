import {useState} from 'react';
import {TextInput, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {languages} from '@rvmob-i18n/languages';
import {app} from '../../../../Generic';
import {commonValues, currentTheme, styles} from '../../../../Theme';
import {Setting} from '../../../../lib/types';
import {Text} from '../../atoms';
import {IndicatorIcons} from './IndicatorIcons';

export const StringNumberSetting = ({
  sRaw,
  renderCount,
  rerender,
}: {
  sRaw: Setting;
  renderCount: number;
  rerender: Function;
}) => {
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
      {sRaw.options ? (
        <View>
          <IndicatorIcons s={sRaw} />
          <Text
            style={{
              fontWeight: 'bold',
              marginBottom: commonValues.sizes.medium,
            }}>
            {t(`app.settings.${sRaw.key}`)}
          </Text>
          {sRaw.remark ? (
            <Text
              colour={currentTheme.foregroundSecondary}
              style={{marginBottom: commonValues.sizes.medium}}>
              {t(`app.settings.${sRaw.key}_remark`)}
            </Text>
          ) : null}
          <View
            style={{
              borderRadius: commonValues.sizes.medium,
              minWidth: '100%',
              backgroundColor: currentTheme.backgroundSecondary,
              padding: commonValues.sizes.medium,
            }}>
            {sRaw.options.map(o => (
              <TouchableOpacity
                key={o}
                style={styles.actionTile}
                onPress={() => {
                  app.settings.set(sRaw.key, o);
                  setValue(o);

                  // if this is the theme toggle, re-render the category
                  if (sRaw.key === 'ui.theme') {
                    rerender(renderCount + 1);
                  }
                }}>
                {sRaw.key === 'app.language' ? (
                  <View style={{flex: 1, flexDirection: 'row'}}>
                    <Text style={{alignSelf: 'center', marginEnd: 8}}>
                      {languages[o].emoji}
                    </Text>
                    <View style={{flexDirection: 'column'}}>
                      <Text style={{fontWeight: 'bold'}}>
                        {languages[o].name}
                      </Text>
                      <Text colour={currentTheme.foregroundSecondary}>
                        {languages[o].englishName}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={{flex: 1}}>{o}</Text>
                )}
                <View style={{...styles.iconContainer, marginRight: 0}}>
                  <MaterialIcon
                    name={`radio-button-${value === o ? 'on' : 'off'}`}
                    size={28}
                    color={currentTheme.accentColor}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
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
          <TextInput
            style={styles.input}
            value={value as string}
            keyboardType={sRaw.type === 'number' ? 'decimal-pad' : 'default'}
            onChangeText={v => {
              app.settings.set(sRaw.key, v);
              setValue(v);
            }}
          />
        </View>
      )}
    </View>
  );
};
