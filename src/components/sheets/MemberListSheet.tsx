import React from 'react';
import {ScrollView, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Channel, Member, Server, User} from 'revolt.js';

import {Text} from '../common/atoms';
import {UserList} from '../navigation/UserList';

interface ServerMemberList {
  context: Server;
  users: User[]; // Member[];
}

interface ChannelMemberList {
  context: Channel;
  users: User[];
}

export const MemberListSheet = observer(
  ({context, users}: ServerMemberList | ChannelMemberList) => {
    return (
      <ScrollView>
        <Text type={'header'}>{context.name ?? context._id} members</Text>
        <UserList users={users} />
        <View style={{marginTop: 10}} />
      </ScrollView>
    );
  },
);
