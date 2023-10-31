import React, {useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {client, ChannelIcon, app} from '../../Generic';
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
  const sectionHeaderStyles = {
    fontWeight: 'bold',
    margin: 5,
    marginLeft: 10,
    marginTop: 10,
  };

  const [displayState, setDisplayState] = useState({
    onlineFriends: true,
    offlineFriends: true,
    outgoing: true,
    incoming: true,
    blocked: true,
  } as DisplayStates);

  // FIXME: this needs a lot of cleaning up
  // TODO: react to relationship updates

  // sort the user list, then filter for friends/blocked users/outgoing/incoming friend requests and render the buttons
  const sortedUsers = [...client.users.values()].sort((f1, f2) =>
    f1.username.localeCompare(f2.username),
  );

  const onlineFriends = [] as React.JSX.Element[];
  const offlineFriends = [] as React.JSX.Element[];
  const incoming = [] as React.JSX.Element[];
  const outgoing = [] as React.JSX.Element[];
  const blocked = [] as React.JSX.Element[];

  for (const u of sortedUsers) {
    switch (u.relationship) {
      case 'Friend':
        (u.online ? onlineFriends : offlineFriends).push(
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
        incoming.push(
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
        outgoing.push(
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
        blocked.push(
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

  return (
    <View style={styles.flex}>
      <ChannelHeader>
        <View style={styles.iconContainer}>
          <ChannelIcon channel={{type: 'special', channel: 'Friends'}} />
        </View>
        <Text style={styles.channelName}>Friends</Text>
      </ChannelHeader>
      <ScrollView style={{flex: 1}}>
        {/* incoming requests */}
        <TouchableOpacity
          onPress={() =>
            setDisplayState({
              ...displayState,
              incoming: !displayState.incoming,
            })
          }>
          <Text style={sectionHeaderStyles}>
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
          <Text style={sectionHeaderStyles}>
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
          onPress={() =>
            setDisplayState({
              ...displayState,
              onlineFriends: !displayState.onlineFriends,
            })
          }>
          <Text style={sectionHeaderStyles}>
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
          <Text style={sectionHeaderStyles}>
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
          <Text style={sectionHeaderStyles}>BLOCKED - {blocked.length}</Text>
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
    </View>
  );
});
