/* eslint-disable no-bitwise */
import {useContext, useEffect, useRef, useState} from 'react';
import {Pressable, ScrollView, TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import BottomSheetCore from '@gorhom/bottom-sheet';
import {useBackHandler} from '@react-native-community/hooks';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {User, Server} from 'revolt.js';

import {app, client, setFunction} from '@rvmob/Generic';
import {styles} from '@rvmob/Theme';
import {
  Avatar,
  Button,
  ContextButton,
  CopyIDButton,
  GeneralAvatar,
  Link,
  Text,
  Username,
} from '@rvmob/components/common/atoms';
import {BottomSheet} from '@rvmob/components/common/BottomSheet';
import {MarkdownView} from '@rvmob/components/common/MarkdownView';
import {MiniProfile, RoleView} from '@rvmob/components/common/profile';
import {UserList} from '@rvmob/components/navigation/UserList';
import {BADGES, USER_IDS} from '@rvmob/lib/consts';
import {commonValues, ThemeContext} from '@rvmob/lib/themes';
import {openUrl, parseRevoltNodes, showToast} from '@rvmob/lib/utils';

export const ProfileSheet = observer(() => {
  const {currentTheme} = useContext(ThemeContext);

  const [user, setUser] = useState(null as User | null);
  const [server, setServer] = useState(null as Server | null);

  const sheetRef = useRef<BottomSheetCore>(null);

  useBackHandler(() => {
    if (user) {
      sheetRef.current?.close();
      return true;
    }

    return false;
  });

  setFunction('openProfile', async (u: User | null, s: Server | null) => {
    if (u !== user) {
      setProfile({});
      setMutual({users: [], servers: []});
      setUser(u);
    }
    setServer(s);
    u ? sheetRef.current?.expand() : sheetRef.current?.close();
  });

  const [section, setSection] = useState('Profile');
  const [profile, setProfile] = useState(
    {} as {content?: string | null | undefined},
  );
  const [mutual, setMutual] = useState(
    {} as {users: User[]; servers: Server[]},
  );
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    async function getInfo() {
      if (!user) {
        return;
      }
      const p = await user.fetchProfile();
      const rawMutuals =
        user.relationship !== 'User'
          ? await user.fetchMutual()
          : {users: [] as string[], servers: [] as string[]};

      const fetchedMutualUsers: User[] = [];
      for (const u of rawMutuals.users) {
        fetchedMutualUsers.push(await client.users.fetch(u));
      }

      const fetchedMutualServers: Server[] = [];
      for (const s of rawMutuals.servers) {
        fetchedMutualServers.push(await client.servers.fetch(s));
      }

      const m = {servers: fetchedMutualServers, users: fetchedMutualUsers};

      setProfile(p);
      setMutual(m);
    }
    getInfo();
  }, [user]);

  return (
    <BottomSheet sheetRef={sheetRef}>
      <View style={{paddingHorizontal: 16}}>
        {!user ? (
          <></>
        ) : showMenu ? (
          <>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
              }}
              onPress={() => {
                setShowMenu(false);
              }}>
              <MaterialIcon
                name="arrow-back"
                size={20}
                color={currentTheme.foregroundSecondary}
              />
              <Text
                style={{
                  color: currentTheme.foregroundSecondary,
                  fontSize: 16,
                  marginLeft: 5,
                }}>
                Return to Profile
              </Text>
            </Pressable>
            {app.settings.get('ui.showDeveloperFeatures') ? (
              <CopyIDButton id={user._id} />
            ) : null}
            {user.relationship !== 'User' ? (
              <ContextButton
                onPress={() => {
                  app.openReportMenu({object: user, type: 'User'});
                  setShowMenu(false);
                  app.openProfile(null);
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name="flag"
                    size={20}
                    color={currentTheme.error}
                  />
                </View>
                <Text colour={currentTheme.error}>Report User</Text>
              </ContextButton>
            ) : null}
          </>
        ) : (
          <>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Avatar
                size={80}
                user={user}
                server={server ?? undefined}
                backgroundColor={currentTheme.backgroundSecondary}
                status
                pressable
              />
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity onPress={() => setShowMenu(true)}>
                  <MaterialIcon
                    name="more-vert"
                    size={30}
                    color={currentTheme.foregroundPrimary}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: '80%',
                marginBottom: commonValues.sizes.large,
              }}>
              <View>
                <Username user={user} server={server ?? undefined} size={24} />
                {!server ? (
                  <Username
                    user={user}
                    server={server ?? undefined}
                    size={16}
                    color={currentTheme.foregroundSecondary}
                    skipDisplayName
                  />
                ) : null}
                {server ? (
                  <View
                    style={{
                      flexDirection: 'row',
                    }}>
                    {client.members.getKey({
                      server: server?._id,
                      user: user._id,
                    })?.avatar?._id !== user.avatar?._id &&
                    client.members.getKey({
                      server: server?._id,
                      user: user._id,
                    })?.avatar?._id !== undefined ? (
                      <View style={{alignSelf: 'center', marginEnd: 4}}>
                        <Avatar size={24} user={user} />
                      </View>
                    ) : null}
                    <View style={{flexDirection: 'column'}}>
                      <Username user={user} size={16} noBadge />
                      <Username
                        user={user}
                        size={16}
                        color={currentTheme.foregroundSecondary}
                        noBadge
                        skipDisplayName
                      />
                    </View>
                  </View>
                ) : null}
                {user.status?.text ? <Text>{user.status?.text}</Text> : <></>}
              </View>
            </View>
            {user.flags ? (
              user.flags & 1 ? (
                <Text style={{color: '#ff3333'}}>User is suspended</Text>
              ) : user.flags & 2 ? (
                <Text style={{color: '#ff3333'}}>
                  User deleted their account
                </Text>
              ) : user.flags & 4 ? (
                <Text style={{color: '#ff3333'}}>User is banned</Text>
              ) : null
            ) : null}
            {user.relationship !== 'User' ? (
              <>
                <View style={{flexDirection: 'row'}}>
                  <View
                    style={{
                      margin: 3,
                      flex: 1,
                    }}>
                    {!user.bot ? (
                      user.relationship === 'Friend' ? (
                        <Button
                          backgroundColor={currentTheme.backgroundPrimary}
                          style={{marginHorizontal: 0}}
                          onPress={async () => {
                            const c = await user.openDM();
                            try {
                              console.log(
                                `[PROFILE] Switching to DM: ${c}, ${c._id}`,
                              );
                              app.openDirectMessage(c);
                            } catch (e) {
                              console.log(
                                `[PROFILE] Error switching to DM: ${c._id}, ${e}`,
                              );
                            }
                          }}>
                          <View
                            style={{
                              alignItems: 'center',
                              flexDirection: 'column',
                            }}>
                            <View>
                              <MaterialIcon
                                name="message"
                                size={25}
                                color={currentTheme.foregroundPrimary}
                              />
                            </View>
                            <Text>Message</Text>
                          </View>
                        </Button>
                      ) : user.relationship === 'Incoming' ? (
                        <>
                          <Button
                            backgroundColor={currentTheme.backgroundPrimary}
                            onPress={() => {
                              user.addFriend();
                            }}>
                            <View
                              style={{
                                alignItems: 'center',
                                flexDirection: 'column',
                              }}>
                              <View>
                                <MaterialCommunityIcon
                                  name="account-plus"
                                  size={25}
                                  color={currentTheme.foregroundPrimary}
                                />
                              </View>
                              <Text>Accept Friend Request</Text>
                            </View>
                          </Button>
                          <Button
                            backgroundColor={currentTheme.backgroundPrimary}
                            onPress={() => {
                              user.removeFriend();
                            }}>
                            <View
                              style={{
                                alignItems: 'center',
                                flexDirection: 'column',
                              }}>
                              <View>
                                <MaterialCommunityIcon
                                  name="account-remove"
                                  size={25}
                                  color={currentTheme.foregroundPrimary}
                                />
                              </View>
                              <Text>Reject Friend Request</Text>
                            </View>
                          </Button>
                        </>
                      ) : user.relationship === 'Outgoing' ? (
                        <Button
                          backgroundColor={currentTheme.backgroundPrimary}
                          style={{marginHorizontal: 0}}
                          onPress={() => {
                            user.removeFriend();
                          }}>
                          <View
                            style={{
                              alignItems: 'center',
                              flexDirection: 'column',
                            }}>
                            <View>
                              <MaterialCommunityIcon
                                name="account-cancel"
                                size={25}
                                color={currentTheme.foregroundPrimary}
                              />
                            </View>
                            <Text>Cancel Friend Request</Text>
                          </View>
                        </Button>
                      ) : user.relationship !== 'Blocked' &&
                        user.relationship !== 'BlockedOther' ? (
                        <Button
                          backgroundColor={currentTheme.backgroundPrimary}
                          style={{marginHorizontal: 0}}
                          onPress={() => {
                            user.addFriend();
                          }}>
                          <View
                            style={{
                              alignItems: 'center',
                              flexDirection: 'column',
                            }}>
                            <View>
                              <MaterialCommunityIcon
                                name="account-plus"
                                size={25}
                                color={currentTheme.foregroundPrimary}
                              />
                            </View>
                            <Text>Send Friend Request</Text>
                          </View>
                        </Button>
                      ) : null
                    ) : (
                      <></>
                    )}
                  </View>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Button
                    backgroundColor={currentTheme.backgroundPrimary}
                    style={{
                      padding: commonValues.sizes.medium,
                      margin: 3,
                      flex: 1,
                    }}
                    onPress={() => setSection('Profile')}>
                    <Text>Profile</Text>
                  </Button>
                  <Button
                    backgroundColor={currentTheme.backgroundPrimary}
                    style={{
                      padding: commonValues.sizes.medium,
                      margin: 3,
                      flex: 1,
                    }}
                    onPress={() => setSection('Mutual Friends')}>
                    <Text>Mutual Friends</Text>
                  </Button>
                </View>
                <View style={{flexDirection: 'row'}}>
                  <Button
                    backgroundColor={currentTheme.backgroundPrimary}
                    style={{
                      padding: commonValues.sizes.medium,
                      margin: 3,
                      flex: 1,
                    }}
                    onPress={() => setSection('Mutual Servers')}>
                    <Text>Mutual Servers</Text>
                  </Button>
                </View>
              </>
            ) : null}
            {section === 'Profile' ? (
              <ScrollView>
                {user.bot ? (
                  <>
                    <Text type={'profile'}>BOT OWNER</Text>
                    {user.bot.owner && client.users.get(user.bot.owner) ? (
                      <Button
                        style={{
                          marginHorizontal: 0,
                          justifyContent: 'flex-start',
                          alignItems: 'flex-start',
                          backgroundColor: currentTheme.backgroundPrimary,
                        }}
                        onPress={async () => {
                          app.openProfile(client.users.get(user.bot!.owner));
                        }}>
                        <View style={{maxWidth: '90%'}}>
                          <MiniProfile
                            user={client.users.get(user.bot.owner)}
                          />
                        </View>
                      </Button>
                    ) : (
                      <Text style={{color: currentTheme.foregroundSecondary}}>
                        Unloaded user
                      </Text>
                    )}
                  </>
                ) : null}
                {server && <RoleView user={user} server={server} />}
                {user.badges ? (
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
                        {Object.keys(BADGES).map(b => {
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
                                          onPress={() =>
                                            showToast('Revolt Developer')
                                          }>
                                          <MaterialIcon
                                            name="build"
                                            size={28}
                                            color={
                                              currentTheme.foregroundSecondary
                                            }
                                          />
                                        </TouchableOpacity>
                                      );
                                    case 'Translator':
                                      return (
                                        <TouchableOpacity
                                          onPress={() =>
                                            showToast('Translator')
                                          }>
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
                                          onPress={() =>
                                            showToast('Early Adopter')
                                          }>
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
                                          onPress={() =>
                                            showToast('Platform Moderator')
                                          }>
                                          <MaterialIcon
                                            name="gavel"
                                            size={28}
                                            color={'red'}
                                          />
                                        </TouchableOpacity>
                                      );
                                    case 'Paw':
                                      return (
                                        <TouchableOpacity
                                          onPress={() =>
                                            showToast("Insert's Paw")
                                          }>
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
                                          onPress={() =>
                                            showToast("It's Morbin Time")
                                          }>
                                          <Text style={{fontSize: 24}}>🦇</Text>
                                        </TouchableOpacity>
                                      );
                                    default:
                                      return (
                                        <TouchableOpacity
                                          onPress={() => showToast(b)}>
                                          <Text
                                            style={{
                                              color:
                                                currentTheme.foregroundSecondary,
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
                        })}
                        {USER_IDS.developers.includes(user._id) ? (
                          <TouchableOpacity
                            onPress={() => showToast('RVMob Developer')}>
                            <View
                              style={{
                                borderRadius: 3,
                                backgroundColor: currentTheme.accentColor,
                                height: 21,
                                padding: 4,
                              }}>
                              <Text
                                style={{
                                  color: currentTheme.accentColorForeground,
                                  fontWeight: 'bold',
                                  fontSize: 16,
                                  marginTop: -5,
                                  marginLeft: -1,
                                }}>
                                RV
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ) : null}
                        {user._id === USER_IDS.teamMembers.lea ? (
                          <TouchableOpacity
                            onPress={() => showToast("Lea's Paw")}>
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
                          <TouchableOpacity
                            onPress={() => showToast('raccoon 🦝')}>
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
                ) : null}
                <Text type={'profile'}>BIO</Text>
                {profile.content ? (
                  <MarkdownView>
                    {parseRevoltNodes(profile.content)}
                  </MarkdownView>
                ) : null}
                <View style={{marginTop: 10}} />
              </ScrollView>
            ) : section === 'Mutual Servers' ? (
              <ScrollView>
                <Text type={'profile'}>MUTUAL SERVERS</Text>
                {mutual.servers?.map(srv => {
                  return (
                    <ContextButton
                      key={srv!._id}
                      onPress={() => {
                        app.openServer(srv);
                        app.openProfile(null);
                        app.openLeftMenu(true);
                      }}>
                      <GeneralAvatar attachment={srv!.icon} size={32} />
                      <Text style={{fontWeight: 'bold', marginLeft: 6}}>
                        {srv!.name}
                      </Text>
                    </ContextButton>
                  );
                })}
                <View style={{marginTop: 10}} />
              </ScrollView>
            ) : section === 'Mutual Friends' ? (
              <ScrollView>
                <Text type={'profile'}>MUTUAL FRIENDS</Text>
                <UserList users={mutual.users} />
                <View style={{marginTop: 10}} />
              </ScrollView>
            ) : null}
          </>
        )}
      </View>
    </BottomSheet>
  );
});
