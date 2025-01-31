import {useContext, useEffect, useState} from 'react';
import {
  FlatList,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {observer} from 'mobx-react-lite';

import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {API, Channel, Server} from 'revolt.js';

import {app} from '@clerotri/Generic';
import {client} from '@clerotri/lib/client';
import {ChannelButton, Text} from '../common/atoms';
import {ChannelContext, SideMenuContext} from '@clerotri/lib/state';
import {commonValues, ThemeContext} from '@clerotri/lib/themes';

type UserChannelListChannel =
  | Channel
  | 'Home'
  | 'Friends'
  | 'Saved Notes'
  | 'Debug';

type ChannelListProps = {
  currentServer: Server | null;
};

type ServerChannelListProps = ChannelListProps & {
  currentServer: Server;
};

const ServerChannelListCategory = observer(
  ({category}: {category: API.Category}) => {
    const {currentChannel, setCurrentChannel} = useContext(ChannelContext);

    const [isVisible, setIsVisible] = useState(true);

    return (
      <View key={category.id} style={{marginVertical: 8}}>
        <TouchableOpacity
          key={`${category.id}-title`}
          onPress={() => {
            setIsVisible(!isVisible);
          }}>
          <Text
            style={{
              marginLeft: commonValues.sizes.large,
              marginBottom: commonValues.sizes.xs,
              fontWeight: 'bold',
            }}>
            {category.title?.toUpperCase()}
          </Text>
        </TouchableOpacity>
        {isVisible &&
          category.channels.map((cid: string) => {
            let c = client.channels.get(cid);
            if (c) {
              return (
                <ChannelButton
                  key={c._id}
                  channel={c}
                  onPress={() => {
                    setCurrentChannel(c);
                  }}
                  selected={
                    typeof currentChannel !== 'string' &&
                    currentChannel?._id === c._id
                  }
                />
              );
            }
          })}
      </View>
    );
  },
);

const ServerChannelList = observer((props: ServerChannelListProps) => {
  const {currentTheme} = useContext(ThemeContext);

  const {currentChannel, setCurrentChannel} = useContext(ChannelContext);
  const {setSideMenuOpen} = useContext(SideMenuContext);

  const [processedChannels, setProcessedChannels] = useState([] as string[]);
  const [res, setRes] = useState([] as React.JSX.Element[] | undefined);

  useEffect(() => {
    let categories = props.currentServer.categories?.map(c => {
      const element = (
        <ServerChannelListCategory key={`wrapper-${c.id}`} category={c} />
      );
      for (const cnl of c.channels) {
        if (!processedChannels.includes(cnl)) {
          let newProcessedChannels = processedChannels;
          newProcessedChannels.push(cnl);
          setProcessedChannels(newProcessedChannels);
        }
      }
      return element;
    });
    setRes(categories);
  }, [props, processedChannels]);

  return (
    <>
      {props.currentServer.banner ? (
        <ImageBackground
          source={{uri: props.currentServer.generateBannerURL()}}
          style={{
            width: '100%',
            height: 110,
            justifyContent: 'flex-end',
            marginBottom: commonValues.sizes.medium,
          }}>
          <TouchableOpacity
            onPress={() => app.openServerContextMenu(props.currentServer)}
            style={{
              width: '100%',
              paddingHorizontal: 12,
              backgroundColor: currentTheme.serverNameBackground,
            }}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={localStyles.serverName} numberOfLines={1}>
                {props.currentServer.name}
              </Text>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <MaterialCommunityIcon
                  name={'dots-horizontal'}
                  size={30}
                  color={currentTheme.foregroundPrimary}
                />
              </View>
            </View>
          </TouchableOpacity>
        </ImageBackground>
      ) : (
        <TouchableOpacity
          onPress={() => app.openServerContextMenu(props.currentServer)}
          style={{width: '100%', paddingHorizontal: 10}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={localStyles.serverName} numberOfLines={1}>
              {props.currentServer.name}
            </Text>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <MaterialCommunityIcon
                name={'dots-horizontal'}
                size={30}
                color={currentTheme.foregroundPrimary}
              />
            </View>
          </View>
        </TouchableOpacity>
      )}

      {props.currentServer.channels.map(c => {
        if (c) {
          if (!processedChannels.includes(c._id)) {
            return (
              <ChannelButton
                key={c._id}
                channel={c}
                onPress={() => {
                  setCurrentChannel(c);
                  setSideMenuOpen(false);
                }}
                selected={
                  typeof currentChannel !== 'string' &&
                  currentChannel?._id === c._id
                }
              />
            );
          }
        }
      })}
      {res}
    </>
  );
});

const UserChannelList = observer(() => {
  const {currentChannel, setCurrentChannel} = useContext(ChannelContext);
  const {setSideMenuOpen} = useContext(SideMenuContext);

  const renderItem = ({item}: {item: UserChannelListChannel}) => {
    return typeof item === 'string' ? (
      item === 'Home' ? (
        <ChannelButton
          onPress={() => {
            setCurrentChannel(null);
            setSideMenuOpen(false);
          }}
          key={'home'}
          channel={'Home'}
          selected={currentChannel === null}
        />
      ) : item === 'Friends' ? (
        <ChannelButton
          onPress={() => {
            setCurrentChannel('friends');
            setSideMenuOpen(false);
          }}
          key={'friends'}
          channel={'Friends'}
          selected={currentChannel === 'friends'}
        />
      ) : item === 'Saved Notes' ? (
        <ChannelButton
          onPress={async () => {
            const channel = await client.user?.openDM();
            setCurrentChannel(channel ?? null);
            setSideMenuOpen(false);
          }}
          key={'notes'}
          channel={'Saved Notes'}
          selected={
            typeof currentChannel !== 'string' &&
            currentChannel?.channel_type === 'SavedMessages'
          }
        />
      ) : __DEV__ ? (
        <ChannelButton
          onPress={() => {
            setCurrentChannel('debug');
            setSideMenuOpen(false);
          }}
          key={'debugChannel'}
          channel={'Debug'}
          selected={currentChannel === 'debug'}
        />
      ) : null
    ) : (
      <ChannelButton
        onPress={() => {
          setCurrentChannel(item);
          setSideMenuOpen(false);
        }}
        onLongPress={() => {
          app.openProfile(item.recipient);
        }}
        delayLongPress={750}
        channel={item}
        selected={
          typeof currentChannel !== 'string' && currentChannel?._id === item._id
        }
      />
    );
  };

  const keyExtractor = (item: UserChannelListChannel) => {
    return `connversation-${typeof item === 'string' ? item : item._id}`;
  };

  const conversations = [...client.channels.values()]
    .filter(
      c => c.channel_type === 'DirectMessage' || c.channel_type === 'Group',
    )
    .sort((c1, c2) => c2.updatedAt - c1.updatedAt);

  const channels = [
    'Home',
    'Friends',
    'Saved Notes',
    'Debug',
    ...conversations,
  ] as const;

  return (
    <>
      <Text style={localStyles.userChannelListHeader}>Direct Messages</Text>
      <FlatList
        key={'user-channel-list-conversations'}
        keyExtractor={keyExtractor}
        data={channels}
        contentContainerStyle={{
          paddingBottom: Platform.OS === 'web' ? 0 : commonValues.sizes.medium,
        }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </>
  );
});

export const ChannelList = observer((props: ChannelListProps) => {
  return props.currentServer ? (
    <ScrollView
      key={'channel-list'}
      style={localStyles.channelList}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}>
      <ServerChannelList currentServer={props.currentServer} />
    </ScrollView>
  ) : (
    <View key={'channel-list'} style={localStyles.channelList}>
      <UserChannelList />
    </View>
  );
});

const localStyles = StyleSheet.create({
  channelList: {
    flexGrow: 1000,
    flex: 1000,
  },
  userChannelListHeader: {
    marginLeft: commonValues.sizes.large,
    margin: commonValues.sizes.xl,
    fontSize: 18,
    fontWeight: 'bold',
  },
  serverName: {
    marginVertical: 10,
    maxWidth: '90%',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
