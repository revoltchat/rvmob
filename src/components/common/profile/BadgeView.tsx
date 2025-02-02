/* eslint-disable no-bitwise */
import {useContext} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import type {User} from 'revolt.js';

import {Link} from '@clerotri/components/common/atoms/Link';
import {Text} from '@clerotri/components/common/atoms/Text';
import {BADGES, USER_IDS} from '@clerotri/lib/consts';
import {commonValues, ThemeContext} from '@clerotri/lib/themes';
import {openUrl, showToast} from '@clerotri/lib/utils';

export const BadgeView = observer(({user}: {user: User}) => {
  const {currentTheme} = useContext(ThemeContext);

  if (!user.badges) {
    return <></>;
  }

  return (
    <>
      <Text type={'profile'}>
        BADGES {'('}
        <Link
          link={'https://support.revolt.chat/kb/account/badges'}
          label={'learn more'}
          style={{marginVertical: 5, fontWeight: 'bold'}}
        />
        {')'}
      </Text>
      <ScrollView
        style={{
          flexDirection: 'row',
          height: 38,
          marginVertical: commonValues.sizes.xs,
        }}
        contentContainerStyle={{alignItems: 'center'}}
        horizontal={true}>
        <>
          {
            // @ts-expect-error this is fine
            Object.keys(BADGES).map((b: keyof typeof BADGES) => {
              if (user.badges! & BADGES[b]) {
                return (
                  <View
                    style={{
                      height: 32,
                      width: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: commonValues.sizes.medium,
                    }}
                    key={b}>
                    {(() => {
                      switch (b) {
                        case 'Founder':
                          return (
                            <TouchableOpacity
                              onPress={() => showToast('Founder')}>
                              <MaterialIcon
                                name="star"
                                size={28}
                                color={'red'}
                              />
                            </TouchableOpacity>
                          );
                        case 'Developer':
                          return (
                            <TouchableOpacity
                              onPress={() => showToast('Revolt Developer')}>
                              <MaterialIcon
                                name="build"
                                size={28}
                                color={currentTheme.foregroundSecondary}
                              />
                            </TouchableOpacity>
                          );
                        case 'Translator':
                          return (
                            <TouchableOpacity
                              onPress={() => showToast('Translator')}>
                              <MaterialIcon
                                name="translate"
                                size={28}
                                color={'green'}
                              />
                            </TouchableOpacity>
                          );
                        case 'Supporter':
                          return (
                            <TouchableOpacity
                              onPress={() => showToast('Donator')}
                              onLongPress={() =>
                                openUrl('https://insrt.uk/donate')
                              }>
                              <MaterialCommunityIcon
                                name="cash"
                                size={28}
                                color={'#80c95b'}
                              />
                            </TouchableOpacity>
                          );
                        case 'ResponsibleDisclosure':
                          return (
                            <TouchableOpacity
                              onPress={() =>
                                showToast(
                                  'Responisbly disclosed a security issue',
                                )
                              }>
                              <MaterialCommunityIcon
                                name="bug-check"
                                size={28}
                                color={'pink'}
                              />
                            </TouchableOpacity>
                          );
                        case 'EarlyAdopter':
                          return (
                            <TouchableOpacity
                              onPress={() => showToast('Early Adopter')}>
                              <MaterialCommunityIcon
                                name="beta"
                                size={28}
                                color={'cyan'}
                              />
                            </TouchableOpacity>
                          );
                        case 'PlatformModeration':
                          return (
                            <TouchableOpacity
                              onPress={() => showToast('Platform Moderator')}>
                              <MaterialIcon
                                name="gavel"
                                size={28}
                                color={'#e04040'}
                              />
                            </TouchableOpacity>
                          );
                        case 'Paw':
                          return (
                            <TouchableOpacity
                              onPress={() => showToast("Insert's Paw")}>
                              <Text style={{fontSize: 24}}>✌️</Text>
                            </TouchableOpacity>
                          );
                        case 'ReservedRelevantJokeBadge1':
                          return (
                            <TouchableOpacity
                              onPress={() => showToast('amogus')}>
                              <Text style={{fontSize: 24}}>📮</Text>
                            </TouchableOpacity>
                          );
                        case 'ReservedRelevantJokeBadge2':
                          return (
                            <TouchableOpacity
                              onPress={() => showToast("It's Morbin Time")}>
                              <Text style={{fontSize: 24}}>🦇</Text>
                            </TouchableOpacity>
                          );
                        default:
                          return (
                            <TouchableOpacity onPress={() => showToast(b)}>
                              <Text
                                style={{
                                  color: currentTheme.foregroundSecondary,
                                  fontSize: 8,
                                }}>
                                [{b}]
                              </Text>
                            </TouchableOpacity>
                          );
                      }
                    })()}
                  </View>
                );
              }
            })
          }
          {USER_IDS.developers.includes(user._id) ? (
            <TouchableOpacity onPress={() => showToast('Clerotri Developer')}>
              <MaterialCommunityIcon
                name="flower"
                size={28}
                color={currentTheme.accentColor}
              />
            </TouchableOpacity>
          ) : null}
          {user._id === USER_IDS.teamMembers.lea ? (
            <TouchableOpacity onPress={() => showToast("Lea's Paw")}>
              <View
                style={{
                  height: 32,
                  width: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: commonValues.sizes.medium,
                }}
                key={'lea-paw'}>
                <MaterialCommunityIcon
                  name={'paw'}
                  size={28}
                  color={currentTheme.foregroundSecondary}
                />
              </View>
            </TouchableOpacity>
          ) : null}
          {user._id === USER_IDS.teamMembers.insert ? (
            <TouchableOpacity onPress={() => showToast('raccoon 🦝')}>
              <View
                style={{
                  height: 32,
                  width: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: commonValues.sizes.medium,
                }}
                key={'insert-raccoon'}>
                <Text style={{fontSize: 24}}>🦝</Text>
              </View>
            </TouchableOpacity>
          ) : null}
          {user._id === USER_IDS.teamMembers.infi ? (
            <TouchableOpacity onPress={() => showToast('ink-fi')}>
              <View
                style={{
                  height: 32,
                  width: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: commonValues.sizes.medium,
                }}
                key={'infi-octopus'}>
                <Text style={{fontSize: 24}}>🐙</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </>
      </ScrollView>
    </>
  );
});
