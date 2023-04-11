import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {app, ChannelIcon, client, openUrl} from '../../Generic';
import {Avatar, Username} from '../../Profile';
import {
  SPECIAL_DATES,
  SPECIAL_DATE_OBJECTS,
  SPECIAL_SERVERS,
} from '../../lib/consts';
import {styles} from '../../Theme';
import {ChannelHeader} from '../navigation/ChannelHeader';
import {Button, Text} from '../common/atoms';

export const HomePage = observer(() => {
  // holiday emoji
  const rawDate = new Date();
  const rawMonth = rawDate.getMonth() + 1;
  const date = `${rawDate.getDate()}/${rawMonth}`;
  const month = `month${rawMonth}`;

  let holidayEmoji = SPECIAL_DATES.includes(date) ? (
    <TouchableOpacity
      onPress={() => {
        // @ts-expect-error TODO: figure out types for this
        openUrl(SPECIAL_DATE_OBJECTS[date].link);
      }}>
      <Text
        // @ts-expect-error as above
        key={SPECIAL_DATE_OBJECTS[date].key}
        style={{fontSize: 40}}>
        {
          // @ts-expect-error as above
          SPECIAL_DATE_OBJECTS[date].emoji
        }
      </Text>
    </TouchableOpacity>
  ) : SPECIAL_DATES.includes(month) ? (
    <TouchableOpacity
      onPress={() => {
        // @ts-expect-error as above
        openUrl(SPECIAL_DATE_OBJECTS[month].link);
      }}>
      <Text // @ts-expect-error as above
        key={SPECIAL_DATE_OBJECTS[month].key}
        style={{fontSize: 40}}>
        {
          // @ts-expect-error as above
          SPECIAL_DATE_OBJECTS[month].emoji
        }
      </Text>
    </TouchableOpacity>
  ) : null;

  return (
    <>
      <ChannelHeader>
        <View style={styles.iconContainer}>
          <ChannelIcon channel={{type: 'special', channel: 'Home'}} />
        </View>
        <Text style={styles.channelName}>Home</Text>
      </ChannelHeader>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
            let user = client.users.get(client.user?._id!);
            if (user) {
              app.openProfile(user);
            }
          }}>
          <Avatar size={40} user={client.user} status />
          <View style={{marginLeft: 4}} />
          <Username size={20} user={client.user} />
        </TouchableOpacity>
        <Text key={'app-name'} style={{fontWeight: 'bold', fontSize: 48}}>
          RVMob
        </Text>
        <Text
          key={'no-channel-selected'}
          style={{textAlign: 'center', marginBottom: 10}}>
          Swipe from the left of the screen or press the three lines icon to see
          your servers and messages!
        </Text>
        <Button
          style={{width: '65%'}}
          key={'home-revolt-lounge'}
          onPress={() => app.openInvite(SPECIAL_SERVERS.lounge.invite)}>
          <Text style={styles.header}>
            {client.servers.get(SPECIAL_SERVERS.lounge.id) ? 'Open' : 'Join'}{' '}
            the Revolt Lounge
          </Text>
        </Button>
        <Button
          style={{width: '65%'}}
          key={'home-rvmob-server'}
          onPress={() => app.openInvite(SPECIAL_SERVERS.supportServer.invite)}>
          <Text style={styles.header}>
            {client.servers.get(SPECIAL_SERVERS.supportServer.id)
              ? 'Open'
              : 'Join'}{' '}
            the RVMob server
          </Text>
        </Button>
        <Button
          style={{width: '30%'}}
          key={'home-settings-button'}
          onPress={() => app.openSettings(true)}>
          <Text style={styles.header}>Settings</Text>
        </Button>
        {app.settings.get('ui.home.holidays') ? holidayEmoji : null}
      </View>
    </>
  );
});
