import {useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Server} from 'revolt.js';

import {app, setFunction, client} from './Generic';
import {styles, currentTheme} from './Theme';
import {Avatar, Button} from './components/common/atoms';
import {ChannelList} from './components/navigation/ChannelList';
import {ServerList} from './components/navigation/ServerList';
import {DEFAULT_API_URL} from './lib/consts';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SideMenu = ({
  currentChannel,
  onChannelClick,
  orderedServers,
}: {
  currentChannel: any;
  onChannelClick: Function;
  orderedServers: string[];
}) => {
  const [currentServer, setCurrentServerInner] = useState(
    null as Server | null,
  );
  function setCurrentServer(s: Server | null) {
    setCurrentServerInner(s);
    AsyncStorage.setItem('lastServer', s?._id || 'DirectMessage');
  }
  setFunction('getCurrentServer', () => {
    return currentServer?._id ?? undefined;
  });
  setFunction('openServer', (s: Server | null) => {
    setCurrentServer(s);
  });
  return (
    <>
      <View style={styles.leftView}>
        <ScrollView key={'server-list'} style={styles.serverList}>
          <Pressable
            onPress={() => {
              currentServer ? setCurrentServer(null) : app.openStatusMenu(true);
            }}
            onLongPress={() => {
              app.openProfile(client.user);
            }}
            delayLongPress={750}
            key={client.user?._id}
            style={{margin: 4}}>
            <Avatar
              key={`${client.user?._id}-avatar`}
              user={client.user}
              size={48}
              backgroundColor={currentTheme.backgroundSecondary}
              status
            />
          </Pressable>
          <View
            style={{
              margin: 6,
              height: 2,
              width: '80%',
              backgroundColor: currentTheme.backgroundPrimary,
            }}
          />
          <ServerList
            onServerPress={(s: Server) => setCurrentServer(s)}
            onServerLongPress={(s: Server) => app.openServerContextMenu(s)}
            ordered={orderedServers}
            showDiscover={app.settings.get('app.instance') === DEFAULT_API_URL}
          />
        </ScrollView>
        <ScrollView
          key={'channel-list'}
          style={styles.channelList}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <ChannelList
            onChannelClick={(channel: any) =>
              onChannelClick(channel, currentServer)
            }
            currentChannel={currentChannel}
            currentServer={currentServer}
          />
        </ScrollView>
      </View>
      <View
        style={{
          height: 50,
          width: '100%',
          backgroundColor: currentTheme.background,
          borderTopWidth: currentTheme.generalBorderWidth,
          borderColor: currentTheme.generalBorderColor,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}>
        <Button
          key={'bottom-nav-friends'}
          onPress={() => onChannelClick('friends', currentServer)}
          backgroundColor={currentTheme.background}>
          <MaterialIcon
            name="group"
            size={20}
            color={currentTheme.foregroundPrimary}
          />
        </Button>
        <Button
          key={'bottom-nav-settings'}
          onPress={() => app.openSettings(true)}
          backgroundColor={currentTheme.background}>
          <MaterialIcon
            name="settings"
            size={20}
            color={currentTheme.foregroundPrimary}
          />
        </Button>
      </View>
    </>
  );
};
