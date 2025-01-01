import {useContext, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Server} from 'revolt.js';

import {app, setFunction} from '@rvmob/Generic';
import { client } from '@rvmob/lib/client';
import {Image} from '@rvmob/crossplat/Image';
import {MAX_SIDE_HQ} from '@rvmob/lib/consts';
import {Theme, ThemeContext} from '@rvmob/lib/themes';
import {SettingsSection} from '@rvmob/lib/types';
import {styles} from '@rvmob/Theme';
import {BackButton, ContextButton, Text} from '../common/atoms';
import {
  BanSettingsSection,
  ChannelSettingsSection,
  InviteSettingsSection,
  RoleSettingsSection,
  MemberSettingsSection,
  OverviewSettingsSection,
  EmojiSettingsSection,
} from '../common/settings/sections/server';
import {GapView} from '../layout';

export const ServerSettingsSheet = observer(
  ({server, setState}: {server: Server; setState: Function}) => {
    const {currentTheme} = useContext(ThemeContext);
    const localStyles = generateLocalStyles(currentTheme);

    const {t} = useTranslation();

    // const [renderCount, rerender] = useState(0);
    const [section, setSection] = useState<SettingsSection>(null);

    const iconURL = useMemo(() => server.generateIconURL(), [server]);
    const initials = useMemo(() => {
      let i = '';
      for (const word of server.name.split(' ')) {
        i += word.charAt(0);
      }
      return i;
    }, [server.name]);

    setFunction(
      'handleServerSettingsVisibility',
      (setVisibility: (state: null) => void) => {
        if (section) {
          setSection(section.subsection ? {section: section.section} : null);
        } else {
          setVisibility(null);
        }
      },
    );

    return (
      <View style={localStyles.background}>
        {section == null ? (
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
            onPress={() => {
              setState();
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
              {t('app.actions.close')}
            </Text>
          </Pressable>
        ) : /* the channel and role settings menus handle this themselves as they have subsections */
        section.section !== 'roles' && section.section !== 'channels' ? (
          <BackButton callback={() => setSection(null)} margin />
        ) : null}
        <ScrollView
          style={{flex: 1}}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          {section == null ? (
            <>
              <View
                style={{
                  alignSelf: 'center',
                  alignItems: 'center',
                  marginVertical: 10,
                }}>
                {iconURL ? (
                  <Image
                    key={`server-settings-${server._id}-icon`}
                    source={{uri: `${iconURL}?max_side=${MAX_SIDE_HQ}`}}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 5000,
                    }}
                  />
                ) : (
                  <View style={localStyles.serverNameInitials}>
                    <Text
                      key={`server-settings-${server._id}-initials`}
                      style={{fontWeight: 'bold', fontSize: 20}}>
                      {initials}
                    </Text>
                  </View>
                )}
                <GapView size={5} />
                <Text type={'h1'}>{server.name}</Text>
              </View>
              <Text type={'h1'}>{t('app.servers.settings.general')}</Text>
              <ContextButton
                style={{flex: 1, marginBottom: 10}}
                backgroundColor={currentTheme.backgroundSecondary}
                onPress={() => {
                  setSection({section: 'overview'});
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name={'info'}
                    color={currentTheme.foregroundPrimary}
                    size={24}
                  />
                </View>
                <Text>{t('app.servers.settings.overview.title')}</Text>
              </ContextButton>
              <ContextButton
                style={{flex: 1, marginBottom: 10}}
                backgroundColor={currentTheme.backgroundSecondary}
                onPress={() => {
                  setSection({section: 'channels'});
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name={'tag'}
                    color={currentTheme.foregroundPrimary}
                    size={24}
                  />
                </View>
                <Text>{t('app.servers.settings.channels.title')}</Text>
              </ContextButton>
              <Text type={'h1'}>{t('app.servers.settings.customisation')}</Text>
              <ContextButton
                style={{flex: 1, marginBottom: 10}}
                backgroundColor={currentTheme.backgroundSecondary}
                onPress={() => {
                  setSection({section: 'roles'});
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name={'flag'}
                    color={currentTheme.foregroundPrimary}
                    size={24}
                  />
                </View>
                <Text>{t('app.servers.settings.roles.title')}</Text>
              </ContextButton>
              <ContextButton
                style={{flex: 1, marginBottom: 10}}
                backgroundColor={currentTheme.backgroundSecondary}
                onPress={() => {
                  setSection({section: 'emoji'});
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name={'emoji-emotions'}
                    color={currentTheme.foregroundPrimary}
                    size={24}
                  />
                </View>
                <Text>{t('app.servers.settings.emoji.title')}</Text>
              </ContextButton>
              <Text type={'h1'}>
                {t('app.servers.settings.user_management')}
              </Text>
              <ContextButton
                style={{flex: 1, marginBottom: 10}}
                backgroundColor={currentTheme.backgroundSecondary}
                onPress={() => {
                  setSection({section: 'members'});
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name={'group'}
                    color={currentTheme.foregroundPrimary}
                    size={24}
                  />
                </View>
                <Text>{t('app.servers.settings.members.title')}</Text>
              </ContextButton>
              <ContextButton
                style={{flex: 1, marginBottom: 10}}
                backgroundColor={currentTheme.backgroundSecondary}
                onPress={() => {
                  setSection({section: 'invites'});
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name={'mail'}
                    color={currentTheme.foregroundPrimary}
                    size={24}
                  />
                </View>
                <Text>{t('app.servers.settings.invites.title')}</Text>
              </ContextButton>
              <ContextButton
                style={{flex: 1, marginBottom: 10}}
                backgroundColor={currentTheme.backgroundSecondary}
                onPress={() => {
                  setSection({section: 'bans'});
                }}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcon
                    name={'hammer'}
                    color={currentTheme.foregroundPrimary}
                    size={24}
                  />
                </View>
                <Text>{t('app.servers.settings.bans.title')}</Text>
              </ContextButton>
              {server.owner === client.user?._id ? (
                <ContextButton
                  style={{flex: 1, marginBottom: 10}}
                  backgroundColor={currentTheme.error}
                  onPress={() => {
                    app.openDeletionConfirmationModal({
                      type: 'Server',
                      object: server,
                    });
                  }}>
                  <View style={styles.iconContainer}>
                    <MaterialIcon
                      name={'delete'}
                      color={currentTheme.foregroundPrimary}
                      size={24}
                    />
                  </View>
                  <Text>{t('app.servers.settings.delete_server')}</Text>
                </ContextButton>
              ) : null}
            </>
          ) : section.section === 'overview' ? (
            <OverviewSettingsSection server={server} />
          ) : section.section === 'channels' ? (
            <ChannelSettingsSection
              server={server}
              section={section}
              setSection={setSection}
            />
          ) : section.section === 'roles' ? (
            <RoleSettingsSection
              server={server}
              section={section}
              setSection={setSection}
            />
          ) : section.section === 'emoji' ? (
            <EmojiSettingsSection server={server} />
          ) : section.section === 'members' ? (
            <MemberSettingsSection server={server} />
          ) : section.section === 'invites' ? (
            <InviteSettingsSection server={server} />
          ) : section.section === 'bans' ? (
            <BanSettingsSection server={server} />
          ) : null}
        </ScrollView>
      </View>
    );
  },
);

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    background: {
      flex: 1,
      backgroundColor: currentTheme.backgroundPrimary,
      padding: 15,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
    },
    serverNameInitials: {
      borderRadius: 5000,
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      height: 80,
      backgroundColor: currentTheme.backgroundSecondary,
      overflow: 'hidden',
    },
  });
};
