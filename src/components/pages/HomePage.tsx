import {TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import {app} from '@rvmob/Generic';
import { client } from '@rvmob/lib/client';
import {
  SPECIAL_DATES,
  SPECIAL_DATE_OBJECTS,
  SPECIAL_SERVERS,
} from '@rvmob/lib/consts';
import {openUrl} from '@rvmob/lib/utils';
import {styles} from '@rvmob/Theme';
import {Avatar, Button, Text, Username} from '@rvmob/components/common/atoms';
import {ChannelHeader} from '@rvmob/components/navigation/ChannelHeader';
import {SpecialChannelIcon} from '@rvmob/components/navigation/SpecialChannelIcon';

export const HomePage = observer(() => {
  const {t} = useTranslation();

  // holiday emoji
  const rawDate = new Date();
  const rawMonth = rawDate.getMonth() + 1;
  const date = `${rawDate.getDate()}/${rawMonth}`;
  const month = `month${rawMonth}`;

  // @ts-expect-error hmmmm
  let holidayEmoji = SPECIAL_DATES.includes(date) ? (
    <TouchableOpacity
      onPress={() => {
        openUrl(SPECIAL_DATE_OBJECTS[date].link);
      }}>
      <Text key={SPECIAL_DATE_OBJECTS[date].key} style={{fontSize: 40}}>
        {SPECIAL_DATE_OBJECTS[date].emoji}
      </Text>
    </TouchableOpacity>
  ) : // @ts-expect-error hmmmm
  SPECIAL_DATES.includes(month) ? (
    <TouchableOpacity
      onPress={() => {
        openUrl(SPECIAL_DATE_OBJECTS[month].link);
      }}>
      <Text key={SPECIAL_DATE_OBJECTS[month].key} style={{fontSize: 40}}>
        {SPECIAL_DATE_OBJECTS[month].emoji}
      </Text>
    </TouchableOpacity>
  ) : null;

  return (
    <>
      <ChannelHeader
        icon={<SpecialChannelIcon channel={'Home'} />}
        name={'Home'}
      />
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
