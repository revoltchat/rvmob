import {Platform, Pressable, View} from 'react-native';

import {getBundleId} from 'react-native-device-info';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import AppInfo from '../../../../../../package.json';
import {app} from '@rvmob/Generic';
import {CONTRIBUTORS_LIST, FEDI_PROFILE, GITHUB_REPO} from '@rvmob/lib/consts';
import {openUrl} from '@rvmob/lib/utils';
import {currentTheme} from '@rvmob/Theme';
import {ContextButton, Link, Text} from '@rvmob/components/common/atoms';

import ReleaseIcon from '../../../../../../assets/images/icon_release.svg';
import DebugIcon from '../../../../../../assets/images/icon_debug.svg';

const AppIcon = getBundleId().match('debug') ? DebugIcon : ReleaseIcon;

export const AppInfoSection = () => {
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
        <Text type={'h1'}>RVMob v{app.version}</Text>
        <View
          style={{
            justifyContent: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
          <Text>Powered by </Text>
          <Link link={'https://reactnative.dev'} label={'React Native'} />
          <Text>
            {' v'}
            {Platform.OS === 'web'
              ? AppInfo.dependencies['react-native'].replace('^', '')
              : `${Platform.constants.reactNativeVersion.major}.${
                  Platform.constants.reactNativeVersion.minor
                }.${Platform.constants.reactNativeVersion.patch}${
                  Platform.constants.reactNativeVersion.prerelease
                    ? `-${Platform.constants.reactNativeVersion.prerelease}`
                    : ''
                }`}
            {' and '}
          </Text>
          <Link
            link={'https://github.com/rexogamer/revolt.js'}
            label={'revolt.js'}
          />
          <Text>
            {' '}
            v
            {AppInfo.dependencies['revolt.js'].replace(
              'npm:@rexovolt/revolt.js@^',
              '',
            )}
          </Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <Text>Made by </Text>
          <Link link={'https://github.com/TaiAurori'} label={'TaiAurori'} />
          <Text>, </Text>
          <Link link={'https://github.com/Rexogamer'} label={'Rexogamer'} />
          <Text> and </Text>
          <Link link={CONTRIBUTORS_LIST} label={'other contributors'} />
        </View>
        <View style={{flexDirection: 'row'}}>
          <Text>Licensed under the </Text>
          <Link
            link={`${GITHUB_REPO}/blob/main/LICENSE`}
            label={'GNU GPL v3.0'}
          />
        </View>
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
