import React, {useEffect} from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {API, Message} from 'revolt.js';

import {GeneralAvatar, app, client} from '../../../Generic';
import {currentTheme} from '../../../Theme';
import {Button, Text} from '../atoms';

export const InviteEmbed = observer(
  ({message, invite}: {message: Message; invite: string}) => {
    const [invObject, setInvObject] = React.useState({} as API.InviteResponse);
    const [error, setError] = React.useState('');

    useEffect(() => {
      async function getInv() {
        try {
          const i = await client.fetchInvite(invite);
          setInvObject(i);
        } catch (e) {
          console.log(`error: ${e}`);
          setError(
            (e as string).match('404')
              ? 'notFound'
              : (e as string).match('429')
              ? 'rateLimited'
              : 'otherError',
          );
        }
      }
      getInv();
    }, [invite]);

    return invObject.type === 'Server' ? (
      <View
        style={{
          backgroundColor: currentTheme.backgroundSecondary,
          padding: 8,
          borderRadius: 8,
          marginVertical: 2,
        }}>
        <Text
          colour={currentTheme.foregroundSecondary}
          style={{marginBottom: 4}}>
          <Text
            colour={currentTheme.foregroundSecondary}
            style={{
              fontWeight: 'bold',
            }}>
            {message.author?.username}
          </Text>{' '}
          invited you to a server
        </Text>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <GeneralAvatar
            attachment={invObject.server_icon?._id}
            size={60}
            directory={'/icons/'}
          />
          <View
            style={{
              width: '60%',
              marginLeft: 8,
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
            <Text style={{fontWeight: 'bold', fontSize: 18}}>
              {invObject.server_name}
            </Text>
            <Text colour={currentTheme.foregroundSecondary}>
              {invObject?.member_count}{' '}
              {invObject?.member_count === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>
        <Button
          onPress={async () => {
            !client.servers.get(invObject.server_id) &&
              (await app.joinInvite(invObject));
            app.openServer(client.servers.get(invObject.server_id));
            app.openLeftMenu(true);
          }}>
          <Text style={{fontWeight: 'bold'}}>
            {!client.servers.get(invObject.server_id)
              ? 'Join Server'
              : 'Go to Server'}
          </Text>
        </Button>
      </View>
    ) : (
      <Text>Invite: {invite}</Text>
    );
  },
);
