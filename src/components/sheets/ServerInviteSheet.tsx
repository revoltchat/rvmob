import {useContext} from 'react';
import {Pressable, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {API} from 'revolt.js';

import {app} from '@rvmob/Generic';
import {client} from '@rvmob/lib/client';
import {Button, GeneralAvatar, Text} from '@rvmob/components/common/atoms';
import {Image} from '@rvmob/crossplat/Image';
import {commonValues, ThemeContext} from '@rvmob/lib/themes';

export const ServerInviteSheet = observer(
  ({
    setState,
    server,
    inviteCode,
  }: {
    setState: Function;
    server: API.InviteResponse;
    inviteCode: string;
  }) => {
    const {currentTheme} = useContext(ThemeContext);

    return (
      <View style={{flex: 1, backgroundColor: currentTheme.backgroundPrimary}}>
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            margin: 15,
          }}
          onPress={() => {
            setState();
          }}>
          <MaterialCommunityIcon
            name="close-circle"
            size={24}
            color={currentTheme.foregroundSecondary}
          />
          <Text
            colour={currentTheme.foregroundSecondary}
            style={{
              fontSize: 20,
              marginLeft: 5,
            }}>
            Close
          </Text>
        </Pressable>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          {server?.type === 'Server' ? (
            <>
              {server.server_banner ? (
                <Image
                  source={
                    server.server_banner
                      ? {
                          uri: client.generateFileURL(server.server_banner),
                        }
                      : {}
                  }
                  style={{width: '100%', height: '100%'}}
                />
              ) : null}
              <View
                style={{
                  height: '100%',
                  width: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    padding: 10,
                    borderRadius: commonValues.sizes.medium,
                    maxWidth: '80%',
                    backgroundColor: currentTheme.backgroundPrimary + 'dd',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View style={{alignItems: 'center', flexDirection: 'row'}}>
                    <GeneralAvatar
                      attachment={server.server_icon?._id}
                      size={60}
                      directory={'/icons/'}
                    />
                    <View style={{marginLeft: 10}} />
                    <View style={{flexDirection: 'row'}}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 26,
                          flexWrap: 'wrap',
                        }}>
                        {server?.server_name}
                      </Text>
                    </View>
                  </View>
                  <Text
                    colour={currentTheme.foregroundSecondary}
                    style={{
                      marginVertical: commonValues.sizes.small,
                    }}>
                    {server?.member_count}{' '}
                    {server?.member_count === 1 ? 'member' : 'members'}
                  </Text>
                  <Button
                    onPress={async () => {
                      !client.servers.get(server?.server_id) &&
                        (await client.joinInvite(inviteCode));
                      app.openServer(client.servers.get(server?.server_id));
                      app.openLeftMenu(true);
                      setState();
                    }}>
                    <Text>
                      {client.servers.get(server?.server_id)
                        ? 'Go to Server'
                        : 'Join Server'}
                    </Text>
                  </Button>
                </View>
              </View>
            </>
          ) : (
            <Text>{server?.toString()}</Text>
          )}
        </View>
      </View>
    );
  },
);
