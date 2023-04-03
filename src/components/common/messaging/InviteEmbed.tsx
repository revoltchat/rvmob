import React, {useEffect} from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {API, Message} from 'revolt.js';

import {Button, GeneralAvatar, Text, app, client} from '../../../Generic';
import {currentTheme} from '../../../Theme';

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
          style={{color: currentTheme.foregroundSecondary, marginBottom: 4}}>
          <Text
            style={{
              color: currentTheme.foregroundSecondary,
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
            <Text style={{color: currentTheme.foregroundSecondary}}>
              {invObject?.member_count}{' '}
              {invObject?.member_count === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>
        <Button
          onPress={() => {
            !client.servers.get(invObject.server_id) &&
              app.joinInvite(invObject);
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
