import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {app, Button, ChannelIcon, client, openUrl} from '../../Generic';
import {ChannelHeader} from '../../../App';
import {Avatar, Username} from '../../Profile';
import {styles} from '../../Theme';
import {Text} from '../common/atoms';

export const HomePage = observer(() => {
  // holiday emoji
  const rawDate = new Date();
  const month = rawDate.getMonth() + 1;
  const date = `${rawDate.getDate()}/${month}`;
  const specialDates = [
    '1/1',
    '14/2',
    '31/3',
    '1/4',
    '31/10',
    '20/11',
    '31/12',
  ]; // NYD, Valentine's Day, TDOV, April Fool's, Halloween, TDOR and NYE
  const specialDateObjects = {
    '1/1': {
      name: "New Year's Day",
      key: 'app-home-holiday-nyd',
      emoji: '🎉',
      link: "https://en.wikipedia.org/wiki/New_Year's_Eve",
    },
    '14/2': {
      name: "Valentine's Day",
      key: 'app-home-holiday-valentines',
      emoji: '💖',
      link: "https://en.wikipedia.org/wiki/Valentine's_Day",
    },
    '31/3': {
      name: 'International Trans Day of Visibility',
      key: 'app-home-holiday-tdov',
      emoji: '🏳️‍⚧️',
      link: 'https://en.wikipedia.org/wiki/TDOV',
    },
    '1/4': {
      name: "April Fools' Day",
      key: 'app-home-holiday-april-fools',
      emoji: '🤡',
      link: 'https://en.wikipedia.org/wiki/April_Fools%27_Day',
    },
    '31/10': {
      name: 'Halloween',
      key: 'app-home-holiday-halloween',
      emoji: '🎃',
      link: 'https://en.wikipedia.org/wiki/Halloween',
    },
    '20/11': {
      name: 'Trans Day of Remembrance',
      key: 'app-home-holiday-tdor',
      emoji: '🕯️',
      link: 'https://en.wikipedia.org/wiki/TDoR',
    },
    '31/12': {
      name: "New Year's Eve",
      key: 'app-home-holiday-nye',
      emoji: '⏰',
      link: "https://en.wikipedia.org/wiki/New_Year's_Eve",
    },
    month6: {
      name: 'Pride Month',
      key: 'app-home-holiday-pride',
      emoji: '🏳️‍🌈🏳️‍⚧️',
      link: 'https://en.wikipedia.org/wiki/Pride_Month',
    },
    month12: {
      name: 'Holiday Season',
      key: 'app-home-holiday-dechols',
      emoji: '🎄❄️',
      link: 'https://en.wikipedia.org/wiki/Christmas_and_holiday_season',
    },
  };

  let holidayEmoji = specialDates.includes(date) ? (
    <TouchableOpacity
      onPress={() => {
        // @ts-expect-error TODO: figure out types for this
        openUrl(specialDateObjects[date].link);
      }}>
      <Text
        // @ts-expect-error as above
        key={specialDateObjects[date].key}
        style={{fontSize: 40}}>
        {
          // @ts-expect-error as above
          specialDateObjects[date].emoji
        }
      </Text>
    </TouchableOpacity>
  ) : month === 6 || month === 12 ? (
    <TouchableOpacity
      onPress={() => {
        openUrl(specialDateObjects[`month${month}`].link);
      }}>
      <Text
        key={specialDateObjects[`month${month}`].key}
        style={{fontSize: 40}}>
        {specialDateObjects[`month${month}`].emoji}
      </Text>
    </TouchableOpacity>
  ) : null;

  console.log(date);
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
          key="no-channel-selected"
          style={{textAlign: 'center', marginBottom: 10}}>
          Swipe from the left of the screen or press the three lines icon to see
          your servers and messages!
        </Text>
        <Button
          style={{width: '65%'}}
          key="home-revolt-lounge"
          onPress={() => app.openInvite('Testers')}>
          <Text style={styles.header}>
            {client.servers.get('01F7ZSBSFHQ8TA81725KQCSDDP') ? 'Open' : 'Join'}{' '}
            the Revolt Lounge
          </Text>
        </Button>
        <Button
          style={{width: '65%'}}
          key="home-rvmob-server"
          onPress={() => app.openInvite('ZFGGw6ry')}>
          <Text style={styles.header}>
            {client.servers.get('01FKES1VJN27SVV4QJX82ZS3ME') ? 'Open' : 'Join'}{' '}
            the RVMob server
          </Text>
        </Button>
        <Button
          style={{width: '30%'}}
          key="home-settings-button"
          onPress={() => app.openSettings(true)}>
          <Text style={styles.header}>Settings</Text>
        </Button>
        {app.settings.get('ui.home.holidays') ? holidayEmoji : null}
      </View>
    </>
  );
});
