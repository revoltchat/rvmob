import {useContext, useMemo} from 'react';
import {Platform, Pressable, View} from 'react-native';

import {getBundleId} from 'react-native-device-info';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {dependencies} from '../../../../../../package.json';
import {app} from '@rvmob/Generic';
import {CONTRIBUTORS_LIST, FEDI_PROFILE, GITHUB_REPO} from '@rvmob/lib/consts';
import {ThemeContext} from '@rvmob/lib/themes';
import {openUrl} from '@rvmob/lib/utils';
import {ContextButton, Link, Text} from '@rvmob/components/common/atoms';

import ReleaseIcon from '../../../../../../assets/images/icon_release.svg';
import DebugIcon from '../../../../../../assets/images/icon_debug.svg';

const AppIcon = getBundleId().match('debug') ? DebugIcon : ReleaseIcon;

export const AppInfoSection = () => {
  const {currentTheme} = useContext(ThemeContext);
  const reactNativeVersion = useMemo(
    () =>
      Platform.OS === 'web'
        ? dependencies['react-native'].replace('^', '')
        : `${Platform.constants.reactNativeVersion.major}.${
            Platform.constants.reactNativeVersion.minor
          }.${Platform.constants.reactNativeVersion.patch}${
            Platform.constants.reactNativeVersion.prerelease
              ? `-${Platform.constants.reactNativeVersion.prerelease}`
              : ''
          }`,
    [],
  );

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View style={{alignItems: 'center'}}>
        <AppIcon height={250} width={250} />
      </View>
      <View style={{alignItems: 'center', marginVertical: 16}}>
        <Text type={'h1'}>RVMob</Text>
        <Text colour={currentTheme.foregroundSecondary}>v{app.version}</Text>
        <Text>
          Powered by{' '}
          <Link link={'https://reactnative.dev'} label={'React Native'} /> v
          {reactNativeVersion}
          {' and '}
          <Link
            link={'https://github.com/rexogamer/revolt.js'}
            label={'revolt.js'}
          />{' '}
          v{dependencies['revolt.js'].replace('npm:@rexovolt/revolt.js@^', '')}
        </Text>
        <Text>
          Made by{' '}
          <Link link={'https://github.com/TaiAurori'} label={'TaiAurori'} />,{' '}
          <Link link={'https://github.com/Rexogamer'} label={'Rexogamer'} /> and{' '}
          <Link link={CONTRIBUTORS_LIST} label={'other contributors'} />
        </Text>
        <Text>
          Licensed under the{' '}
          <Link
            link={`${GITHUB_REPO}/blob/main/LICENSE`}
            label={'GNU GPL v3.0'}
          />
        </Text>
      </View>
      <View style={{flexDirection: 'row', marginBottom: 16}}>
        <Pressable onPress={() => openUrl(GITHUB_REPO)} style={{marginEnd: 16}}>
          <MaterialCommunityIcon
            name={'github'}
            color={currentTheme.foregroundPrimary}
            size={60}
          />
        </Pressable>
        <Pressable
          onPress={() => openUrl(FEDI_PROFILE)}
          style={{marginStart: 16}}>
          <MaterialCommunityIcon
            name={'mastodon'}
            color={currentTheme.foregroundPrimary}
            size={60}
          />
        </Pressable>
      </View>
      <ContextButton
        backgroundColor={currentTheme.error}
        style={{
          justifyContent: 'center',
        }}
        onPress={() => {
          app.settings.clear();
        }}>
        <Text>Reset Settings</Text>
      </ContextButton>
    </View>
  );
};
