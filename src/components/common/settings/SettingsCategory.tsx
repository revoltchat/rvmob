import {useState} from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {app} from '../../../Generic';
import {BoolSetting, StringNumberSetting} from './atoms';

export const SettingsCategory = observer(
  ({
    category,
    renderCount,
    rerender,
  }: {
    category: string;
    renderCount: number;
    rerender: Function;
  }) => {
    const [showExperimental, setShowExperimental] = useState(
      app.settings.get('ui.settings.showExperimental') as boolean,
    );

    const [showDev, setShowDev] = useState(
      app.settings.get('ui.showDeveloperFeatures') as boolean,
    );

    return (
      <View key={`settings-category-${category}`}>
        {app.settings.list.map(sRaw => {
          try {
            if (
              (sRaw.experimental && !showExperimental) ||
              (sRaw.developer && !showDev) ||
              sRaw.category !== category
            ) {
              return null;
            }
            if (sRaw.type === 'boolean') {
              return (
                <BoolSetting
                  key={`settings-${sRaw.key}-outer`}
                  sRaw={sRaw}
                  experimentalFunction={setShowExperimental}
                  devFunction={setShowDev}
                />
              );
            } else if (sRaw.type === 'string' || sRaw.type === 'number') {
              return (
                <StringNumberSetting
                  key={`settings-${sRaw.key}-outer`}
                  sRaw={sRaw}
                  renderCount={renderCount}
                  rerender={rerender}
                />
              );
            }
          } catch (err) {
            console.log(err);
          }
        })}
      </View>
    );
  },
);
