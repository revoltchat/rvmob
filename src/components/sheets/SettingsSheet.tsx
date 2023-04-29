import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {observer} from 'mobx-react-lite';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  getApiLevel,
  getBrand,
  getBundleId,
  getDevice,
} from 'react-native-device-info';
// import FastImage from 'react-native-fast-image';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {app, client, Setting} from '../../Generic';
import {currentTheme, styles} from '../../Theme';
import {Checkbox, ContextButton, Link, Text} from '../common/atoms';

// const Image = FastImage;

const icon = getBundleId().match('debug')
  ? require('../../../assets/images/icon_debug.png')
  : require('../../../assets/images/icon_release.png');

type Section = string | null;

const BoolSetting = observer(
  ({
    sRaw,
    experimentalFunction,
    devFunction,
  }: {
    sRaw: Setting;
    experimentalFunction: any;
    devFunction: any;
  }) => {
    const [value, setValue] = React.useState(
      app.settings.get(sRaw.key) as boolean,
    );
    return (
      <View
        key={`settings_${sRaw.key}`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 10,
        }}>
        {sRaw.experimental ? (
          <View style={styles.iconContainer}>
            <FA5Icon name="flask" size={16} color={currentTheme.accentColor} />
          </View>
        ) : null}
        {sRaw.developer ? (
          <View style={styles.iconContainer}>
            <FA5Icon name="bug" size={16} color={currentTheme.accentColor} />
          </View>
        ) : null}
        <Text style={{flex: 1, fontWeight: 'bold'}}>{sRaw.name}</Text>
        <Checkbox
          key={`checkbox-${sRaw.name}`}
          value={value}
          callback={() => {
            const newValue = !value;
            app.settings.set(sRaw.key, newValue);
            setValue(newValue);
            sRaw.key === 'ui.settings.showExperimental'
              ? experimentalFunction(newValue)
              : null;
            sRaw.key === 'ui.showDeveloperFeatures'
              ? devFunction(newValue)
              : null;
          }}
        />
      </View>
    );
  },
);

const StringNumberSetting = observer(({sRaw}: {sRaw: Setting}) => {
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
          {sRaw.experimental ? (
            <View style={styles.iconContainer}>
              <FA5Icon
                name="flask"
                size={16}
                color={currentTheme.accentColor}
              />
            </View>
          ) : null}
          {sRaw.developer ? (
            <View style={styles.iconContainer}>
              <FA5Icon name="bug" size={16} color={currentTheme.accentColor} />
            </View>
          ) : null}
          <Text style={{flex: 1, fontWeight: 'bold'}}>{sRaw.name}</Text>
          <ScrollView
            style={{
              borderRadius: 8,
              maxHeight: 160,
              minWidth: '100%',
              backgroundColor: currentTheme.backgroundSecondary,
              padding: 8,
              paddingRight: 12,
            }}>
            {sRaw.options.map(o => (
              <TouchableOpacity
                key={o}
                style={styles.actionTile}
                onPress={() => {
                  app.settings.set(sRaw.key, o);
                  setValue(o);
                }}>
                <Text>
                  {o} {value === o ? <Text>(active)</Text> : null}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={{marginTop: 2}} />
          </ScrollView>
        </View>
      ) : (
        <View>
          {sRaw.experimental ? (
            <View style={styles.iconContainer}>
              <FA5Icon
                name="flask"
                size={16}
                color={currentTheme.accentColor}
              />
            </View>
          ) : null}
          {sRaw.developer ? (
            <View style={styles.iconContainer}>
              <FA5Icon name="bug" size={16} color={currentTheme.accentColor} />
            </View>
          ) : null}
          <Text style={{flex: 1, fontWeight: 'bold'}}>{sRaw.name}</Text>
          <TextInput
            style={{
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
});

async function copyDebugInfo() {
  const obj = {
    deviceInfo: {
      time: new Date().getTime(),
      model: `${getBrand()}/${await getDevice()}`,
      version: `${await getApiLevel()}`,
    },

    appInfo: {
      userID: client.user?._id,
      settings: await AsyncStorage.getItem('settings'),
      version: app.version,
    },
  };

  Clipboard.setString(JSON.stringify(obj));
}

function copyDebugInfoWrapper() {
  copyDebugInfo().then(() => {
    return null;
  });
}

const SettingsCategory = observer(
  ({category, friendlyName}: {category: string; friendlyName: string}) => {
    const [showExperimental, setShowExperimental] = React.useState(
      app.settings.get('ui.settings.showExperimental') as boolean,
    );

    const [showDev, setShowDev] = React.useState(
      app.settings.get('ui.showDeveloperFeatures') as boolean,
    );

    return (
      <View key={`settings-category-${category}`}>
        <Text key={`settings-category-${category}-header`} type={'header'}>
          {friendlyName}
        </Text>
        {app.settings.list.map(sRaw => {
          try {
            if (sRaw.experimental && !showExperimental) {
              return null;
            }
            if (sRaw.developer && !showDev) {
              return null;
            }
            if (sRaw.category !== category) {
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

export const SettingsSheet = observer(({state}: {state: any}) => {
  const [section, setSection] = React.useState(null as Section);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: currentTheme.backgroundPrimary,
        padding: 15,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
      }}>
      {section == null ? (
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}
          onPress={() => {
            state.setState({settingsOpen: false});
          }}>
          <MaterialCommunityIcon
            name="close-circle"
            size={24}
            color={currentTheme.foregroundSecondary}
          />
          <Text
            style={{
              color: currentTheme.foregroundSecondary,
              fontSize: 20,
              marginLeft: 5,
            }}>
            Close
          </Text>
        </Pressable>
      ) : (
        <></>
      )}
      <ScrollView style={{flex: 1}}>
        {section == null ? (
          <>
            <Text type={'header'}>Account</Text>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                setSection('account');
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'person'}
                  color={currentTheme.foregroundPrimary}
                  size={25}
                />
              </View>
              <Text>Account</Text>
            </ContextButton>
            <Text type={'header'}>App</Text>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                setSection('appearance');
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'palette'}
                  color={currentTheme.foregroundPrimary}
                  size={25}
                />
              </View>
              <Text>Appearance</Text>
            </ContextButton>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                setSection('functionality');
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'build'}
                  color={currentTheme.foregroundPrimary}
                  size={20}
                />
              </View>
              <Text>Features</Text>
            </ContextButton>
            <Text type={'header'}>Advanced</Text>
            <ContextButton
              style={{flex: 1, marginBottom: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                copyDebugInfoWrapper();
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'bug-report'}
                  color={currentTheme.foregroundPrimary}
                  size={25}
                />
              </View>
              <Text>Copy Debug Info</Text>
            </ContextButton>
            <ContextButton
              style={{flex: 1, marginTop: 10}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                setSection('info');
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name={'info'}
                  color={currentTheme.foregroundPrimary}
                  size={20}
                />
              </View>
              <Text>About RVMob</Text>
            </ContextButton>
          </>
        ) : section === 'appearance' ? (
          <>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
              }}
              onPress={() => {
                setSection(null);
              }}>
              <MaterialIcon
                name="arrow-back"
                size={24}
                color={currentTheme.foregroundSecondary}
              />
              <Text
                style={{
                  color: currentTheme.foregroundSecondary,
                  fontSize: 20,
                  marginLeft: 5,
                }}>
                Back
              </Text>
            </Pressable>
            <SettingsCategory
              category={'appearance'}
              friendlyName={'Appearance'}
            />
          </>
        ) : section === 'functionality' ? (
          <>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
              }}
              onPress={() => {
                setSection(null);
              }}>
              <MaterialIcon
                name="arrow-back"
                size={24}
                color={currentTheme.foregroundSecondary}
              />
              <Text
                style={{
                  color: currentTheme.foregroundSecondary,
                  fontSize: 20,
                  marginLeft: 5,
                }}>
                Back
              </Text>
            </Pressable>
            <SettingsCategory
              category={'functionality'}
              friendlyName={'Features'}
            />
          </>
        ) : section === 'account' ? (
          <View>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
              }}
              onPress={() => {
                setSection(null);
              }}>
              <MaterialIcon
                name="arrow-back"
                size={24}
                color={currentTheme.foregroundSecondary}
              />
              <Text
                style={{
                  color: currentTheme.foregroundSecondary,
                  fontSize: 20,
                  marginLeft: 5,
                }}>
                Back
              </Text>
            </Pressable>
            <Text type={'header'}>Account</Text>
            <ContextButton
              style={{flex: 1}}
              backgroundColor={currentTheme.backgroundSecondary}
              onPress={() => {
                Clipboard.setString(client.user?.username!);
              }}>
              <Text>
                Username{'\n'}
                <Text
                  style={{
                    marginTop: 3,
                    fontSize: 12,
                    color: currentTheme.foregroundSecondary,
                  }}>
                  {client.user?.username}
                </Text>
              </Text>
            </ContextButton>
          </View>
        ) : section === 'info' ? (
          <View>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
              }}
              onPress={() => {
                setSection(null);
              }}>
              <MaterialIcon
                name="arrow-back"
                size={24}
                color={currentTheme.foregroundSecondary}
              />
              <Text
                style={{
                  color: currentTheme.foregroundSecondary,
                  fontSize: 20,
                  marginLeft: 5,
                }}>
                Back
              </Text>
            </Pressable>
            <Text type={'header'}>About</Text>
            <View style={{alignItems: 'center'}}>
              <Image
                source={icon}
                style={{height: 150, width: 150, marginVertical: 4}}
              />
              <Text type={'header'}>RVMob {app.version}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text>Made by </Text>
              <Link link={'https://github.com/TaiAurori'} label={'TaiAurori'} />
              <Text>, </Text>
              <Link link={'https://github.com/Rexogamer'} label={'Rexogamer'} />
              <Text> and </Text>
              <Link
                link={'https://github.com/revoltchat/rvmob/graphs/contributors'}
                label={'other contributors'}
              />
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text>Licensed under the </Text>
              <Link
                link={'https://github.com/revoltchat/rvmob/blob/master/LICENSE'}
                label={'GNU GPL v3.0'}
              />
            </View>
            <ContextButton
              backgroundColor={currentTheme.error}
              style={{justifyContent: 'center', marginTop: 10}}
              onPress={() => {
                app.settings.clear();
              }}>
              <Text style={{color: currentTheme.accentColorForeground}}>
                Reset Settings
              </Text>
            </ContextButton>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
});
