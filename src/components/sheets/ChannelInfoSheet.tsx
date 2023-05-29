import React from 'react';
import {ScrollView, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Channel, User} from 'revolt.js';

import {currentTheme} from '../../Theme';
import {Text} from '../common/atoms';
import {MarkdownView} from '../common/MarkdownView';

export const ChannelInfoSheet = observer(({channel}: {channel: Channel}) => {
  const [groupMembers, setGroupMembers] = React.useState([] as User[]);

  React.useEffect(() => {
    async function fetchMembers() {
      const m =
        channel.channel_type === 'Group' ? await channel.fetchMembers() : [];
      setGroupMembers(m);
    }
    fetchMembers();
  }, [channel]);
  return (
    <ScrollView>
      <View style={{justifyContent: 'center'}}>
        <Text
          type={'header'}
          style={{
            marginBottom: 0,
            fontSize: 24,
          }}>
          {channel.name}
        </Text>
        <Text
          colour={currentTheme.foregroundSecondary}
          style={{
            marginVertical: 4,
          }}>
          {channel.channel_type === 'Group'
            ? `Group (${groupMembers.length} ${
                groupMembers.length === 1 ? 'member' : 'members'
              })`
            : 'Regular channel'}
        </Text>
        {channel.description ? (
          <View
            style={{
              backgroundColor: currentTheme.background,
              padding: 8,
              borderRadius: 8,
            }}>
            <MarkdownView
              style={{
                color: currentTheme.foregroundSecondary,
                fontSize: 16,
                textAlign: 'center',
              }}>
              {channel.description}
            </MarkdownView>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
});
