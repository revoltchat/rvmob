import {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import type {User} from 'revolt.js';

import {app} from '@clerotri/Generic';
import {client} from '@clerotri/lib/client';
import {styles} from '@clerotri/Theme';
import {MiniProfile} from '@clerotri/components/common/profile';
import {ChannelHeader} from '@clerotri/components/navigation/ChannelHeader';
import {SpecialChannelIcon} from '@clerotri/components/navigation/SpecialChannelIcon';
import {Button, Text} from '@clerotri/components/common/atoms';

type DisplayStates = {
  onlineFriends: boolean;
  offlineFriends: boolean;
  incoming: boolean;
  outgoing: boolean;
  blocked: boolean;
};

type RelationshipGroups = {
  onlineFriends: React.JSX.Element[]; // online friends
  offlineFriends: React.JSX.Element[]; // offline friends
  incoming: React.JSX.Element[]; // incoming friend requests
  outgoing: React.JSX.Element[]; // outgoing friend requests
  blocked: React.JSX.Element[]; // users blocked by the current user
};

function sortUsers(unsortedUsers: User[]) {
  console.log('sus');

  const users = unsortedUsers.sort((user1, user2) =>
    user1.username.localeCompare(user2.username),
  );
  return users;
}

/*
 * Sorts the users into each category and returns an array of buttons
 */
function finalSort(users: User[]) {
  const onlineButtons = [] as React.JSX.Element[];
  const offlineButtons = [] as React.JSX.Element[];
  const incomingButtons = [] as React.JSX.Element[];
  const outgoingButtons = [] as React.JSX.Element[];
  const blockedButtons = [] as React.JSX.Element[];

  for (const user of users) {
    const button = (
      <Button
        style={{justifyContent: 'flex-start'}}
        key={user._id}
        onPress={() => app.openProfile(user)}>
        <View style={{maxWidth: '90%'}}>
          <MiniProfile user={user} scale={1.15} />
        </View>
      </Button>
    );

    switch (user.relationship) {
      case 'Friend':
        (user.online ? onlineButtons : offlineButtons).push(button);
        break;
      case 'Incoming':
        incomingButtons.push(button);
        break;
      case 'Outgoing':
        outgoingButtons.push(button);
        break;
      case 'Blocked':
        blockedButtons.push(button);
        break;
      default:
        break;
    }
  }
  return {
    onlineButtons,
    offlineButtons,
    incomingButtons,
    outgoingButtons,
    blockedButtons,
  };
}

// TODO: refresh when relationships update
export const FriendsPage = observer(() => {
  const [displayState, setDisplayState] = useState({
    onlineFriends: true,
    offlineFriends: true,
    outgoing: true,
    incoming: true,
    blocked: true,
  } as DisplayStates);

  // sort the user list...
  const sortedUsers = useMemo(() => sortUsers([...client.users.values()]), []);

  // ...then filter for friends/blocked users/outgoing/incoming friend requests and render the buttons
  const groups: RelationshipGroups = useMemo(() => {
    const sortedGroups = finalSort(sortedUsers);

    return {
      onlineFriends: sortedGroups.onlineButtons,
      offlineFriends: sortedGroups.offlineButtons,
      incoming: sortedGroups.incomingButtons,
      outgoing: sortedGroups.outgoingButtons,
      blocked: sortedGroups.blockedButtons,
    };
  }, [sortedUsers]);

  return (
    <View style={styles.flex}>
      <ChannelHeader
        icon={<SpecialChannelIcon channel={'Friends'} />}
        name={'Friends'}
      />
      <ScrollView style={{flex: 1}}>
        {/* incoming requests */}
        <TouchableOpacity
          onPress={() =>
            setDisplayState({
              ...displayState,
              incoming: !displayState.incoming,
            })
          }>
          <Text style={localStyles.friendsListHeader}>
            INCOMING REQUESTS - {groups.incoming.length}
          </Text>
        </TouchableOpacity>
        {displayState.incoming && (
          <View>
            {groups.incoming.length > 0 ? (
              groups.incoming
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
          <Text style={localStyles.friendsListHeader}>
            OUTGOING REQUESTS - {groups.outgoing.length}
          </Text>
        </TouchableOpacity>
        {displayState.outgoing && (
          <View>
            {groups.outgoing.length > 0 ? (
              groups.outgoing
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
          <Text style={localStyles.friendsListHeader}>
            ONLINE FRIENDS - {groups.onlineFriends.length}
          </Text>
        </TouchableOpacity>
        {displayState.onlineFriends && (
          <View>
            {groups.onlineFriends.length > 0 ? (
              groups.onlineFriends
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
          <Text style={localStyles.friendsListHeader}>
            OFFLINE FRIENDS - {groups.offlineFriends.length}
          </Text>
        </TouchableOpacity>
        {displayState.offlineFriends && (
          <View>
            {groups.offlineFriends.length > 0 ? (
              groups.offlineFriends
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
          <Text style={localStyles.friendsListHeader}>
            BLOCKED - {groups.blocked.length}
          </Text>
        </TouchableOpacity>
        {displayState.blocked && (
          <View>
            {groups.blocked.length > 0 ? (
              groups.blocked
            ) : (
              <Text style={{marginHorizontal: 10}}>No blocked users</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
});

const localStyles = StyleSheet.create({
  friendsListHeader: {
    fontWeight: 'bold',
    margin: 5,
    marginLeft: 10,
    marginTop: 10,
  },
});
