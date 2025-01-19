import {useContext, useState} from 'react';
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

import type {Server} from 'revolt.js';

import {app, setFunction} from '@clerotri/Generic';
import {SettingsSection} from '@clerotri/lib/types';
import {styles} from '@clerotri/Theme';
import {
  BackButton,
  Button,
  Checkbox,
  InputWithButton,
  Text,
} from '@clerotri/components/common/atoms';
import {PressableSettingsEntry} from '@clerotri/components/common/settings/atoms';
import {GapView} from '@clerotri/components/layout';
import {commonValues, ThemeContext} from '@clerotri/lib/themes';
import {showToast} from '@clerotri/lib/utils';

export const RoleSettingsSection = observer(
  ({
    server,
    section,
    setSection,
  }: {
    server: Server;
    section: SettingsSection;
    setSection: Function;
  }) => {
    const {currentTheme} = useContext(ThemeContext);

    const {t} = useTranslation();

    const [colour, setColour] = useState('');
    const [showColourPicker, setShowColourPicker] = useState(false);

    const onSelectColour = ({hex}: {hex: string}) => {
      setColour(hex);
    };

    setFunction('closeRoleSubsection', () => {
      setSection({section: 'roles', subsection: undefined});
    });

    return (
      <>
        <BackButton
          callback={() => {
            section!.subsection
              ? setSection({section: 'roles', subsection: undefined})
              : setSection(null);
          }}
          margin
        />
        {section!.subsection !== undefined ? (
          <>
            <Text
              type={'h1'}
              colour={
                server.roles![section!.subsection].colour ??
                currentTheme.foregroundPrimary
              }>
              {server.roles![section!.subsection].name}
            </Text>
            <Text colour={currentTheme.foregroundSecondary}>
              {section!.subsection}
            </Text>
            <GapView size={2} />
            <Text type={'h2'}>{t('app.servers.settings.roles.name')}</Text>
            <InputWithButton
              placeholder={t('app.servers.settings.roles.name_placeholder')}
              defaultValue={server.roles![section!.subsection].name}
              onPress={async (v: string) => {
                await server.editRole(section!.subsection!, {
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
                      borderRadius: commonValues.sizes.medium,
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
            <Text>{server.roles![section!.subsection].rank}</Text>
            <GapView size={2} />
            <Text type={'h2'}>
              {t('app.servers.settings.roles.options_header')}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View style={{flex: 1, flexDirection: 'column'}}>
                <Text style={{fontWeight: 'bold'}}>
                  {t('app.servers.settings.roles.options.hoist')}
                </Text>
                <Text colour={currentTheme.foregroundSecondary}>
                  {t('app.servers.settings.roles.options.hoist_body')}
                </Text>
              </View>
              <Checkbox
                value={server.roles![section!.subsection].hoist ?? false}
                callback={async () => {
                  try {
                    await server.editRole(section!.subsection!, {
                      hoist: !server.roles![section!.subsection!].hoist,
                    });
                  } catch (error) {
                    `${error}`.match('429')
                      ? showToast(
                          t('app.misc.generic_errors.rateLimited_toast'),
                        )
                      : null;
                  }
                }}
              />
            </View>
            <GapView size={2} />
            <Text type={'h2'}>
              {t('app.servers.settings.roles.permissions')}
            </Text>
            <Text>{server.roles![section!.subsection].permissions.a}</Text>
            <GapView size={2} />
            <Text type={'h2'}>{t('app.servers.settings.roles.colour')}</Text>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: currentTheme.backgroundSecondary,
                padding: commonValues.sizes.medium,
                borderRadius: commonValues.sizes.medium,
              }}>
              <View style={{alignItems: 'center', flexDirection: 'row'}}>
                <View
                  style={{
                    padding: commonValues.sizes.xl,
                    borderRadius: commonValues.sizes.medium,
                    marginEnd: commonValues.sizes.medium,
                    backgroundColor:
                      server.roles![section!.subsection].colour ?? '#00000000',
                  }}
                />
                <Text>
                  {server.roles![section!.subsection].colour ?? 'No colour'}
                </Text>
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
                    setColour(
                      server.roles![section!.subsection!].colour ?? '#00000000',
                    );
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
                      server.roles![section!.subsection!].colour ?? 'No colour',
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
            <GapView size={8} />
            <Button
              style={{marginHorizontal: 0}}
              backgroundColor={currentTheme.error}
              onPress={() => {
                app.openDeletionConfirmationModal({
                  type: 'Role',
                  object: {role: section!.subsection!, server},
                });
              }}>
              <Text>{t('app.servers.settings.roles.delete')}</Text>
            </Button>
            <Modal visible={showColourPicker} animationType="slide">
              <View
                style={{
                  flex: 1,
                  padding: commonValues.sizes.large,
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
                  <Text
                    colour={colour}
                    style={{
                      alignSelf: 'center',
                      fontWeight: 'bold',
                      fontSize: 18,
                    }}>
                    {server.roles![section!.subsection].name}
                  </Text>
                  <GapView size={8} />
                  <ColourPicker
                    style={{alignSelf: 'center', width: '70%'}}
                    value={
                      server.roles![section!.subsection].colour ?? '#00000000'
                    }
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
                  <Button
                    onPress={() => {
                      setShowColourPicker(false);
                      app.openTextEditModal({
                        initialString: colour,
                        id: 'role_colour',
                        callback: c => {
                          if (c.length < 10) {
                            server.editRole(section!.subsection!, {colour: c});
                          }
                        },
                      });
                    }}>
                    <Text>
                      {t('app.servers.settings.roles.open_colour_modal')}
                    </Text>
                  </Button>
                  <GapView size={8} />
                  <Button
                    onPress={() => {
                      setShowColourPicker(false);
                      server.editRole(section!.subsection!, {colour: colour});
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
              <PressableSettingsEntry
                key={`role-settings-entry-${r.id}`}
                onPress={() => {
                  setSection({section: 'roles', subsection: r.id});
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
              </PressableSettingsEntry>
            ))}
          </>
        )}
      </>
    );
  },
);
