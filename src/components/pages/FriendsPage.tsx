import React, {useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Button, client, ChannelIcon, app} from '../../Generic';
import {MiniProfile} from '../../Profile';
import {styles} from '../../Theme';
import {ChannelHeader} from '../navigation/ChannelHeader';
import {Text} from '../common/atoms';

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

  // sort the user list, then filter for friends/blocked users/outgoing/incoming friend requests and render the buttons
  const sortedUsers = [...client.users.values()].sort((f1, f2) =>
    f1.username.localeCompare(f2.username),
  );

  const onlineFriends = [] as JSX.Element[];
  const offlineFriends = [] as JSX.Element[];
  const incoming = [] as JSX.Element[];
  const outgoing = [] as JSX.Element[];
  const blocked = [] as JSX.Element[];

  for (const u of sortedUsers) {
    switch (u.relationship) {
      case 'Friend':
        (u.online ? onlineFriends : offlineFriends).push(
          <Button
            style={{justifyContent: 'flex-start'}}
            key={u._id}
            onPress={() => app.openProfile(u)}>
            <MiniProfile user={u} scale={1.15} />
          </Button>,
        );
        break;
      case 'Incoming':
        incoming.push(
          <Button
            style={{justifyContent: 'flex-start'}}
            key={u._id}
            onPress={() => app.openProfile(u)}>
            <MiniProfile user={u} scale={1.15} />
          </Button>,
        );
        break;
      case 'Outgoing':
        outgoing.push(
          <Button
            style={{justifyContent: 'flex-start'}}
            key={u._id}
            onPress={() => app.openProfile(u)}>
            <MiniProfile user={u} scale={1.15} />
          </Button>,
        );
        break;
      case 'Blocked':
        blocked.push(
          <Button
            style={{justifyContent: 'flex-start'}}
            key={u._id}
            onPress={() => app.openProfile(u)}>
            <MiniProfile user={u} scale={1.15} />
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
        {displayState.incoming && <View>{incoming}</View>}

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
        {displayState.outgoing && <View>{outgoing}</View>}

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
        {displayState.onlineFriends && <View>{onlineFriends}</View>}

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
        {displayState.offlineFriends && <View>{offlineFriends}</View>}

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
        {displayState.blocked && <View>{blocked}</View>}
      </ScrollView>
    </View>
  );
});
