import React from 'react';
import {Modal, Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import Clipboard from '@react-native-clipboard/clipboard';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import ColourPicker, {
  HueCircular,
  OpacitySlider,
  Panel1,
} from 'reanimated-color-picker';

import {Server} from 'revolt.js';

import {SettingsSection} from '../../../../../lib/types';
import {currentTheme, styles} from '../../../../../Theme';
import {GapView} from '../../../../layout';
import {BackButton, Button, InputWithButton, Text} from '../../../atoms';

export const RoleSettingsSection = observer(
  ({server, callback}: {server: Server; callback: Function}) => {
    const {t} = useTranslation();

    const [subsection, setSubsection] = React.useState(null as SettingsSection);

    const [colour, setColour] = React.useState('');
    const [showColourPicker, setShowColourPicker] = React.useState(false);

    const onSelectColour = ({hex}: {hex: string}) => {
      setColour(hex);
    };

    return (
      <>
        <BackButton
          callback={() => {
            subsection ? setSubsection(null) : callback();
          }}
          margin
        />
        {subsection ? (
          <>
            <Text
              type={'h1'}
              colour={
                server.roles![subsection].colour ??
                currentTheme.foregroundPrimary
              }>
              {server.roles![subsection].name}
            </Text>
            <Text colour={currentTheme.foregroundSecondary}>{subsection}</Text>
            <GapView size={2} />
            <Text type={'h2'}>{t('app.servers.settings.roles.name')}</Text>
            <InputWithButton
              placeholder={t('app.servers.settings.roles.name_placeholder')}
              defaultValue={server.roles![subsection].name}
              onPress={(v: string) => {
                server.editRole(subsection, {
                  name: v,
                });
              }}
              buttonContents={{
                type: 'icon',
                name: 'save',
                pack: 'regular',
              }}
              backgroundColor={currentTheme.backgroundSecondary}
              skipIfSame
              cannotBeEmpty
              emptyError={t(
                'app.servers.settings.roles.errors.empty_role_name',
              )}
            />
            <GapView size={2} />
            <Text type={'h2'}>{t('app.servers.settings.roles.rank')}</Text>
            {/* <TextInput
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
                    value={rankValue as string}
                    keyboardType={'decimal-pad'}
                    onChangeText={v => {
                      setRankValue(v);
                    }}
                  /> */}
            <Text>{server.roles![subsection].rank}</Text>
            <GapView size={2} />
            <Text type={'h2'}>
              {t('app.servers.settings.roles.permissions')}
            </Text>
            <Text>{server.roles![subsection].permissions.a}</Text>
            <GapView size={2} />
            <Text type={'h2'}>{t('app.servers.settings.roles.colour')}</Text>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: currentTheme.backgroundSecondary,
                padding: 8,
                borderRadius: 8,
              }}>
              <View style={{alignItems: 'center', flexDirection: 'row'}}>
                <View
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    marginEnd: 8,
                    backgroundColor:
                      server.roles![subsection].colour ?? '#00000000',
                  }}
                />
                <Text>{server.roles![subsection].colour ?? 'No colour'}</Text>
              </View>
              <View style={{alignItems: 'center', flexDirection: 'row'}}>
                <Pressable
                  style={{
                    width: 30,
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    setColour(server.roles![subsection].colour ?? '#00000000');
                    setShowColourPicker(true);
                  }}>
                  <View style={styles.iconContainer}>
                    <MaterialIcon
                      name={'edit'}
                      size={20}
                      color={currentTheme.foregroundPrimary}
                    />
                  </View>
                </Pressable>
                <Pressable
                  style={{
                    width: 30,
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() =>
                    Clipboard.setString(
                      server.roles![subsection].colour ?? 'No colour',
                    )
                  }>
                  <View style={styles.iconContainer}>
                    <MaterialIcon
                      name={'content-copy'}
                      size={20}
                      color={currentTheme.foregroundPrimary}
                    />
                  </View>
                </Pressable>
              </View>
            </View>
            <Modal visible={showColourPicker} animationType="slide">
              <View
                style={{
                  flex: 1,
                  padding: 12,
                  backgroundColor: currentTheme.backgroundPrimary,
                }}>
                <BackButton
                  callback={() => {
                    setShowColourPicker(false);
                  }}
                />
                <View
                  style={{
                    flex: 1,
                    alignContent: 'center',
                    justifyContent: 'center',
                  }}>
                  <ColourPicker
                    style={{alignSelf: 'center', width: '70%'}}
                    value={server.roles![subsection].colour ?? '#00000000'}
                    onComplete={onSelectColour}>
                    <HueCircular
                      containerStyle={{
                        backgroundColor: currentTheme.backgroundPrimary,
                      }}
                    />
                    <GapView size={8} />
                    <Panel1 />
                    <GapView size={8} />
                    <OpacitySlider />
                  </ColourPicker>
                  <GapView size={8} />
                  <Text
                    colour={colour}
                    style={{
                      alignSelf: 'center',
                      fontWeight: 'bold',
                      fontSize: 18,
                    }}>
                    {server.roles![subsection].name}
                  </Text>
                  <GapView size={8} />
                  <Button
                    onPress={() => {
                      setShowColourPicker(false);
                      server.editRole(subsection, {colour: colour});
                    }}>
                    <Text>{t('app.servers.settings.roles.set_colour')}</Text>
                  </Button>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <>
            <Text type={'h1'}>{t('app.servers.settings.roles.title')}</Text>
            {server.orderedRoles.map(r => (
              <Pressable
                style={styles.settingsEntry}
                key={`role-settings-entry-${r.id}`}
                onPress={() => {
                  setSubsection(r.id);
                }}>
                <View style={{flex: 1, flexDirection: 'column'}}>
                  <Text
                    key={`role-settings-entry-${r.id}-name`}
                    colour={r.colour ?? currentTheme.foregroundPrimary}
                    style={{fontWeight: 'bold'}}>
                    {r.name}
                  </Text>
                  <Text colour={currentTheme.foregroundSecondary}>{r.id}</Text>
                </View>
                <View
                  style={{
                    width: 30,
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View style={styles.iconContainer}>
                    <MaterialIcon
                      name={'arrow-forward'}
                      size={20}
                      color={currentTheme.foregroundPrimary}
                    />
                  </View>
                </View>
              </Pressable>
            ))}
          </>
        )}
      </>
    );
  },
);
