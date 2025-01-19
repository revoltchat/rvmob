import {useContext, useEffect, useState} from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import type {API, Message} from 'revolt.js';

import {app} from '@clerotri/Generic';
import {client} from '@clerotri/lib/client';
import {Button, GeneralAvatar, Text} from '../atoms';
import {commonValues, ThemeContext} from '@clerotri/lib/themes';

const InviteBackground = observer(({children}: {children: any}) => {
  const {currentTheme} = useContext(ThemeContext);

  return (
    <View
      style={{
        backgroundColor: currentTheme.backgroundSecondary,
        padding: commonValues.sizes.medium,
        borderRadius: commonValues.sizes.medium,
        marginVertical: commonValues.sizes.small,
      }}>
      {children}
    </View>
  );
});

export const InviteEmbed = observer(
  ({message, invite}: {message: Message; invite: string}) => {
    const {currentTheme} = useContext(ThemeContext);

    const [invObject, setInvObject] = useState({} as API.InviteResponse);
    const [error, setError] = useState('');

    useEffect(() => {
      async function getInv() {
        try {
          const i = await client.fetchInvite(invite);
          setInvObject(i);
        } catch (e) {
          const stringE = `${e}`;
          const errorType = stringE.match('404')
            ? 'notFound'
            : stringE.match('429')
            ? 'rateLimited'
            : 'otherError';
          if (errorType === 'otherError') {
            console.warn(
              `[INVITEEMBED] Unrecognised error fetching invite: ${e}`,
            );
          } else {
            console.log(`[INVITEEMBED] Error fetching invite: ${e}`);
          }
          setError(errorType);
        }
      }
      getInv();
    }, [invite]);

    return error ? (
      <InviteBackground>
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
          sent you an invite, but...
        </Text>
        <Text style={{fontWeight: 'bold', fontSize: 18}}>
          {error === 'notFound'
            ? "This invite doesn't exist"
            : error === 'rateLimited'
            ? 'Too many requests'
            : 'An error occurred'}
        </Text>
        <Text>
          {error === 'notFound'
            ? `The invite may have expired or been deleted. Ask ${message.author?.username} for a new one.`
            : error === 'rateLimited'
            ? "You've fetched too many invites in a short period of time. Wait a few minutes and try again."
            : 'Something went wrong. Please try again later.'}
        </Text>
      </InviteBackground>
    ) : invObject.type === 'Server' ? (
      <InviteBackground>
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
              marginLeft: commonValues.sizes.medium,
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
      </InviteBackground>
    ) : (
      <Text>Invite: {invite}</Text>
    );
  },
);
