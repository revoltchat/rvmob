import {useContext, useEffect, useRef, useState} from 'react';
import {Pressable, ScrollView, TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import type BottomSheetCore from '@gorhom/bottom-sheet';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import type {User, Server} from 'revolt.js';

import {app, setFunction} from '@clerotri/Generic';
import {client} from '@clerotri/lib/client';
import {styles} from '@clerotri/Theme';
import {
  Avatar,
  Button,
  ContextButton,
  CopyIDButton,
  GeneralAvatar,
  Text,
  Username,
} from '@clerotri/components/common/atoms';
import {BottomSheet} from '@clerotri/components/common/BottomSheet';
import {MarkdownView} from '@clerotri/components/common/MarkdownView';
import {
  BadgeView,
  MiniProfile,
  RoleView,
} from '@clerotri/components/common/profile';
import {UserList} from '@clerotri/components/navigation/UserList';
import {commonValues, ThemeContext} from '@clerotri/lib/themes';
import {useBackHandler} from '@clerotri/lib/ui';
import {parseRevoltNodes} from '@clerotri/lib/utils';

export const ProfileSheet = observer(() => {
  const {currentTheme} = useContext(ThemeContext);

  const [user, setUser] = useState(null as User | null);
  const [server, setServer] = useState(null as Server | null);

  const sheetRef = useRef<BottomSheetCore>(null);

  const [section, setSection] = useState('Profile');
  const [profile, setProfile] = useState(
    {} as {content?: string | null | undefined},
  );
  const [mutual, setMutual] = useState(
    {} as {users: User[]; servers: Server[]},
  );
  const [showMenu, setShowMenu] = useState(false);

  useBackHandler(() => {
    if (showMenu) {
      setShowMenu(false);
      return true;
    }

    if (section !== 'Profile') {
      setSection('Profile');
      return true;
    }

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
      setSection('Profile');
      setShowMenu(false);
      setUser(u);
    }
    setServer(s);
    u ? sheetRef.current?.expand() : sheetRef.current?.close();
  });

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
              /* eslint-disable no-bitwise */
              user.flags & 1 ? (
                <Text colour={currentTheme.error}>User is suspended</Text>
              ) : user.flags & 2 ? (
                <Text colour={currentTheme.error}>
                  User deleted their account
                </Text>
              ) : user.flags & 4 ? (
                <Text colour={currentTheme.error}>User is banned</Text>
              ) : null
            ) : /* eslint-enable no-bitwise */
            null}
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
                {user.badges && <BadgeView user={user} />}
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
