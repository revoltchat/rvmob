import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import {app, client, openUrl} from '@rvmob/Generic';
import {Avatar} from '@rvmob/Profile';
import {
  SPECIAL_DATES,
  SPECIAL_DATE_OBJECTS,
  SPECIAL_SERVERS,
} from '@rvmob/lib/consts';
import {styles} from '@rvmob/Theme';
import {Button, Text, Username} from '@rvmob/components/common/atoms';
import {ChannelIcon} from '@rvmob/components/navigation/ChannelIcon';
import {ChannelHeader} from '@rvmob/components/navigation/ChannelHeader';

export const HomePage = observer(() => {
  const {t} = useTranslation();

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
          {t('app.home.description')}
        </Text>
        <Button
          style={{width: '65%'}}
          key={'home-revolt-lounge'}
          onPress={() => app.openInvite(SPECIAL_SERVERS.lounge.invite)}>
          <Text style={styles.buttonText}>
            {client.servers.get(SPECIAL_SERVERS.lounge.id)
              ? t('app.home.open_lounge')
              : t('app.home.join_lounge')}
          </Text>
        </Button>
        <Button
          style={{width: '65%'}}
          key={'home-rvmob-server'}
          onPress={() => app.openInvite(SPECIAL_SERVERS.supportServer.invite)}>
          <Text style={styles.buttonText}>
            {client.servers.get(SPECIAL_SERVERS.supportServer.id)
              ? t('app.home.open_rvmob')
              : t('app.home.join_rvmob')}
          </Text>
        </Button>
        <Button
          style={{width: '65%'}}
          key={'home-settings-button'}
          onPress={() => app.openSettings(true)}>
          <Text style={styles.buttonText}>{t('app.home.open_settings')}</Text>
        </Button>
        {app.settings.get('ui.home.holidays') ? holidayEmoji : null}
      </View>
    </>
  );
});
