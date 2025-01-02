import {useContext, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import {useBackHandler} from '@react-native-community/hooks';
import {Drawer} from 'react-native-drawer-layout';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Server} from 'revolt.js';

import {app, setFunction} from './Generic';
import {client} from './lib/client';
import {Avatar, Button} from './components/common/atoms';
import {ChannelList} from './components/navigation/ChannelList';
import {ServerList} from './components/navigation/ServerList';
import {ChannelView} from './components/views/ChannelView';
import {DEFAULT_API_URL} from './lib/consts';
import {storage} from '@rvmob/lib/storage';
import {commonValues, Theme, ThemeContext} from '@rvmob/lib/themes';

const SideMenu = ({
  currentChannel,
  onChannelClick,
  orderedServers,
}: {
  currentChannel: any;
  onChannelClick: Function;
  orderedServers: string[];
}) => {
  const {currentTheme} = useContext(ThemeContext);
  const localStyles = generateLocalStyles(currentTheme);

  const [currentServer, setCurrentServerInner] = useState(
    null as Server | null,
  );
  function setCurrentServer(s: Server | null) {
    setCurrentServerInner(s);
    storage.set('lastServer', s?._id || 'DirectMessage');
  }
  setFunction('getCurrentServer', () => {
    return currentServer?._id ?? undefined;
  });
  setFunction('openServer', (s: Server | null) => {
    setCurrentServer(s);
  });
  return (
    <>
      <View style={localStyles.sideView}>
        <ScrollView key={'server-list'} style={localStyles.serverList}>
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
          <View style={localStyles.separator} />
          <ServerList
            onServerPress={(s: Server) => setCurrentServer(s)}
            onServerLongPress={(s: Server) => app.openServerContextMenu(s)}
            ordered={orderedServers}
            showDiscover={app.settings.get('app.instance') === DEFAULT_API_URL}
          />
        </ScrollView>
        <ChannelList
          onChannelClick={(channel: any) =>
            onChannelClick(channel, currentServer)
          }
          currentChannel={currentChannel}
          currentServer={currentServer}
        />
      </View>
      <View style={localStyles.bottomBar}>
        <Button
          key={'bottom-nav-friends'}
          onPress={() => onChannelClick('friends', currentServer)}
          backgroundColor={currentTheme.background}
          style={{paddingVertical: 10}}>
          <MaterialIcon
            name="group"
            size={20}
            color={currentTheme.foregroundPrimary}
          />
        </Button>
        <Button
          key={'bottom-nav-settings'}
          onPress={() => app.openSettings(true)}
          backgroundColor={currentTheme.background}
          style={{paddingVertical: 10}}>
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

export const SideMenuHandler = ({
  coreObject,
  currentChannel,
  setChannel,
}: {
  coreObject: any;
  currentChannel: any;
  setChannel: any;
}) => {
  const {currentTheme} = useContext(ThemeContext);
  const localStyles = generateLocalStyles(currentTheme);

  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  setFunction('openLeftMenu', async (o: boolean) => {
    console.log(`[APP] Setting left menu open state to ${o}`);
    setSideMenuOpen(o);
  });

  const {height, width} = useWindowDimensions();

  useBackHandler(() => {
    if (height > width && !sideMenuOpen) {
      setSideMenuOpen(true);
      return true;
    }

    return false;
  });

  return (
    <>
      <StatusBar
        animated={true}
        backgroundColor={
          sideMenuOpen
            ? currentTheme.backgroundSecondary
            : currentTheme.headerBackground
        }
        barStyle={`${currentTheme.contentType}-content`}
      />
      {height < width ? (
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View
            style={{
              width: '20%',
              flexDirection: 'column',
            }}>
            <SideMenu
              onChannelClick={setChannel}
              currentChannel={currentChannel}
              orderedServers={coreObject.state.orderedServers}
            />
          </View>
          <ChannelView channel={currentChannel} />
        </View>
      ) : (
        <Drawer
          swipeEdgeWidth={width * 2}
          swipeMinVelocity={250}
          drawerType={'slide'}
          open={sideMenuOpen}
          onOpen={() => setSideMenuOpen(true)}
          onClose={() => setSideMenuOpen(false)}
          renderDrawerContent={() => (
            <SideMenu
              onChannelClick={setChannel}
              currentChannel={currentChannel}
              orderedServers={coreObject.state.orderedServers}
            />
          )}
          style={localStyles.drawer}
          drawerStyle={{
            backgroundColor: currentTheme.backgroundPrimary,
            width: width - 50,
          }}>
          <ChannelView channel={currentChannel} />
        </Drawer>
      )}
    </>
  );
};

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    drawer: {
      flex: 1,
      backgroundColor: currentTheme.backgroundPrimary,
    },
    sideView: {
      flex: 1,
      backgroundColor: currentTheme.backgroundSecondary,
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    serverList: {
      width: 60,
      flexShrink: 1,
      backgroundColor: currentTheme.background,
      paddingVertical: commonValues.sizes.small,
    },
    separator: {
      margin: 6,
      height: 2,
      width: '80%',
      backgroundColor: currentTheme.backgroundPrimary,
    },
    bottomBar: {
      height: 50,
      width: '100%',
      backgroundColor: currentTheme.background,
      borderTopWidth: currentTheme.generalBorderWidth,
      borderColor: currentTheme.generalBorderColor,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
    },
  });
};
