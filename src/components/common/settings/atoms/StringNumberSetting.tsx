import React from 'react';
import {TextInput, TouchableOpacity, View} from 'react-native';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {app} from '../../../../Generic';
import {currentTheme, styles} from '../../../../Theme';
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
  const [value, setValue] = React.useState(app.settings.getRaw(sRaw.key));
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
          <Text style={{fontWeight: 'bold', marginBottom: 8}}>{sRaw.name}</Text>
          {sRaw.remark ? (
            <Text
              colour={currentTheme.foregroundSecondary}
              style={{marginBottom: 8}}>
              {sRaw.remark}
            </Text>
          ) : null}
          <View
            style={{
              borderRadius: 8,
              minWidth: '100%',
              backgroundColor: currentTheme.backgroundSecondary,
              padding: 8,
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
                <Text style={{flex: 1}}>{o}</Text>
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
            {sRaw.name}
          </Text>
          {sRaw.remark ? (
            <Text
              colour={currentTheme.foregroundSecondary}
              style={{marginBottom: 8}}>
              {sRaw.remark}
            </Text>
          ) : null}
          <TextInput
            style={{
              fontFamily: 'Open Sans',
              minWidth: '100%',
              borderRadius: 8,
              backgroundColor: currentTheme.backgroundSecondary,
              padding: 6,
              paddingLeft: 10,
              paddingRight: 10,
              color: currentTheme.foregroundPrimary,
            }}
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
