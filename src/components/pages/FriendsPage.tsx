import React, {useEffect, useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {User} from 'revolt.js';

import {client, ChannelIcon, app, selectedRemark} from '../../Generic';
import {MiniProfile} from '../../Profile';
import {styles} from '../../Theme';
import {ChannelHeader} from '../navigation/ChannelHeader';
import {Button, Text} from '../common/atoms';

type DisplayStates = {
  onlineFriends: boolean;
  offlineFriends: boolean;
  incoming: boolean;
  outgoing: boolean;
  blocked: boolean;
};

export const FriendsPage = observer(() => {
  const [loading, setLoading] = useState(true);
  const [displayState, setDisplayState] = useState({
    onlineFriends: true,
    offlineFriends: true,
    outgoing: true,
    incoming: true,
    blocked: true,
  } as DisplayStates);

  const [onlineFriends, setOnlineFriends] = React.useState(
    [] as React.JSX.Element[],
  );
  const [offlineFriends, setOfflineFriends] = React.useState(
    [] as React.JSX.Element[],
  );
  const [incoming, setIncoming] = React.useState([] as React.JSX.Element[]);
  const [outgoing, setOutgoing] = React.useState([] as React.JSX.Element[]);
  const [blocked, setBlocked] = React.useState([] as React.JSX.Element[]);

  // FIXME: this could do with another lookover
  // TODO: react to relationship updates

  // sort the user list, then filter for friends/blocked users/outgoing/incoming friend requests and render the buttons
  useEffect(() => {
    const _onlineFriends = [] as React.JSX.Element[];
    const _offlineFriends = [] as React.JSX.Element[];
    const _incoming = [] as React.JSX.Element[];
    const _outgoing = [] as React.JSX.Element[];
    const _blocked = [] as React.JSX.Element[];

    const sortedUsers = [...client.users.values()].sort((f1, f2) =>
      f1.username.localeCompare(f2.username),
    );

    async function finalSort(users: User[]) {
      for (const u of users) {
        console.log('switch');
        switch (u.relationship) {
          case 'Friend':
            (u.online ? _onlineFriends : _offlineFriends).push(
              <Button
                style={{justifyContent: 'flex-start'}}
                key={u._id}
                onPress={() => app.openProfile(u)}>
                <View style={{maxWidth: '90%'}}>
                  <MiniProfile user={u} scale={1.15} />
                </View>
              </Button>,
            );
            break;
          case 'Incoming':
            _incoming.push(
              <Button
                style={{justifyContent: 'flex-start'}}
                key={u._id}
                onPress={() => app.openProfile(u)}>
                <View style={{maxWidth: '90%'}}>
                  <MiniProfile user={u} scale={1.15} />
                </View>
              </Button>,
            );
            break;
          case 'Outgoing':
            _outgoing.push(
              <Button
                style={{justifyContent: 'flex-start'}}
                key={u._id}
                onPress={() => app.openProfile(u)}>
                <View style={{maxWidth: '90%'}}>
                  <MiniProfile user={u} scale={1.15} />
                </View>
              </Button>,
            );
            break;
          case 'Blocked':
            _blocked.push(
              <Button
                style={{justifyContent: 'flex-start'}}
                key={u._id}
                onPress={() => app.openProfile(u)}>
                <View style={{maxWidth: '90%'}}>
                  <MiniProfile user={u} scale={1.15} />
                </View>
              </Button>,
            );
            break;
          default:
            break;
        }
      }
    }

    finalSort(sortedUsers).then(() => {
      setOnlineFriends(_onlineFriends);
      setOfflineFriends(_offlineFriends);
      setIncoming(_incoming);
      setOutgoing(_outgoing);
      setBlocked(_blocked);
      setLoading(false);
    });
  }, []);

  return (
    <View style={styles.flex}>
      <ChannelHeader>
        <View style={styles.iconContainer}>
          <ChannelIcon channel={{type: 'special', channel: 'Friends'}} />
        </View>
        <Text style={styles.channelName}>Friends</Text>
      </ChannelHeader>
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.loadingHeader}>Loading...</Text>
          <Text style={styles.remark}>{selectedRemark || null}</Text>
        </View>
      ) : (
        <ScrollView style={{flex: 1}}>
          {/* incoming requests */}
          <TouchableOpacity
            onPress={() =>
              setDisplayState({
                ...displayState,
                incoming: !displayState.incoming,
              })
            }>
            <Text style={styles.friendsListHeader}>
              INCOMING REQUESTS - {incoming.length}
            </Text>
          </TouchableOpacity>
          {displayState.incoming && (
            <View>
              {incoming.length > 0 ? (
                incoming
              ) : (
                <Text style={{marginHorizontal: 10}}>No incoming requests</Text>
              )}
            </View>
          )}

          {/* outgoing requests */}
          <TouchableOpacity
            onPress={() =>
              setDisplayState({
                ...displayState,
                outgoing: !displayState.outgoing,
              })
            }>
            <Text style={styles.friendsListHeader}>
              OUTGOING REQUESTS - {outgoing.length}
            </Text>
          </TouchableOpacity>
          {displayState.outgoing && (
            <View>
              {outgoing.length > 0 ? (
                outgoing
              ) : (
                <Text style={{marginHorizontal: 10}}>No outgoing requests</Text>
              )}
            </View>
          )}

          {/* online friends */}
          <TouchableOpacity
            onPress={() => {
              console.log('online');
              setDisplayState({
                ...displayState,
                onlineFriends: !displayState.onlineFriends,
              });
            }}>
            <Text style={styles.friendsListHeader}>
              ONLINE FRIENDS - {onlineFriends.length}
            </Text>
          </TouchableOpacity>
          {displayState.onlineFriends && (
            <View>
              {onlineFriends.length > 0 ? (
                onlineFriends
              ) : (
                <Text style={{marginHorizontal: 10}}>No online friends</Text>
              )}
            </View>
          )}

          {/* offline friends */}
          <TouchableOpacity
            onPress={() =>
              setDisplayState({
                ...displayState,
                offlineFriends: !displayState.offlineFriends,
              })
            }>
            <Text style={styles.friendsListHeader}>
              OFFLINE FRIENDS - {offlineFriends.length}
            </Text>
          </TouchableOpacity>
          {displayState.offlineFriends && (
            <View>
              {offlineFriends.length > 0 ? (
                offlineFriends
              ) : (
                <Text style={{marginHorizontal: 10}}>No offline friends</Text>
              )}
            </View>
          )}

          {/* blocked users */}
          <TouchableOpacity
            onPress={() =>
              setDisplayState({
                ...displayState,
                blocked: !displayState.blocked,
              })
            }>
            <Text style={styles.friendsListHeader}>
              BLOCKED - {blocked.length}
            </Text>
          </TouchableOpacity>
          {displayState.blocked && (
            <View>
              {blocked.length > 0 ? (
                blocked
              ) : (
                <Text style={{marginHorizontal: 10}}>No blocked users</Text>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
});
