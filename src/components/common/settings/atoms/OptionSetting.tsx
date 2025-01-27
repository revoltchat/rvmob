import {useContext, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {languages} from '@clerotri-i18n/languages';
import {app} from '@clerotri/Generic';
import {styles} from '@clerotri/Theme';
import {commonValues, Theme, ThemeContext} from '@clerotri/lib/themes';
import {Setting} from '@clerotri/lib/types';
import {Text} from '@clerotri/components/common/atoms';
import {IndicatorIcons} from './IndicatorIcons';

export const OptionSetting = ({sRaw}: {sRaw: Setting}) => {
  const {currentTheme} = useContext(ThemeContext);
  const localStyles = generateLocalStyles(currentTheme);

  const {t} = useTranslation();

  const [value, setValue] = useState(app.settings.getRaw(sRaw.key));
  return (
    <View style={{marginTop: 10}}>
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
      <View style={localStyles.optionsContainer}>
        {sRaw.options!.map(o => (
          <TouchableOpacity
            key={o}
            style={localStyles.option}
            onPress={() => {
              app.settings.set(sRaw.key, o);
              setValue(o);
            }}>
            {sRaw.key === 'app.language' ? (
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={{alignSelf: 'center', marginEnd: 8}}>
                  {languages[o].emoji}
                </Text>
                <View style={{flexDirection: 'column'}}>
                  <Text style={{fontWeight: 'bold'}}>{languages[o].name}</Text>
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
  );
};

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    optionsContainer: {
      borderRadius: commonValues.sizes.medium,
      minWidth: '100%',
      backgroundColor: currentTheme.backgroundSecondary,
      padding: commonValues.sizes.medium,
    },
    option: {
      height: 40,
      width: '100%',
      alignItems: 'center',
      flexDirection: 'row',
      backgroundColor: currentTheme.backgroundPrimary,
      borderRadius: commonValues.sizes.medium,
      paddingLeft: 10,
      paddingRight: 10,
      marginVertical: commonValues.sizes.small,
    },
  });
};
