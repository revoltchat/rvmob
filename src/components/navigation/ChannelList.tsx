import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import FastImage from 'react-native-fast-image';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {Channel, Server} from 'revolt.js';

import {app, client} from '../../Generic';
import {currentTheme, styles} from '../../Theme';
import {ChannelButton, Text} from '../common/atoms';
const Image = FastImage;

type ChannelListProps = {
  onChannelClick: any;
  currentChannel: Channel;
  currentServer: Server;
};

// thanks a lot, revolt.js 🙄
type Category = {
  id: string;
  title: string;
  channels: string[];
};

const ServerChannelListCategory = observer(
  ({category, props}: {category: Category; props: ChannelListProps}) => {
    const [isVisible, setIsVisible] = React.useState(true);
    return (
      <View key={category.id} style={{marginVertical: 8}}>
        <TouchableOpacity
          key={`${category.id}-title`}
          onPress={() => {
            setIsVisible(!isVisible);
          }}>
          <Text
            style={{
              marginLeft: 12,
              marginBottom: 2,
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
                    props.onChannelClick(c);
                  }}
                  selected={props.currentChannel?._id === c._id}
                />
              );
            }
          })}
      </View>
    );
  },
);

const ServerChannelList = observer((props: ChannelListProps) => {
  const [processedChannels, setProcessedChannels] = React.useState(
    [] as string[],
  );
  const [res, setRes] = React.useState([] as React.JSX.Element[] | undefined);

  React.useEffect(() => {
    let categories = props.currentServer.categories?.map(c => {
      const element = (
        <ServerChannelListCategory
          key={`wrapper-${c.id}`}
          category={c}
          props={props}
        />
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
        <Image
          source={{uri: props.currentServer.generateBannerURL()}}
          style={{width: '100%', height: 110, justifyContent: 'flex-end'}}>
          <TouchableOpacity
            onPress={() => app.openServerContextMenu(props.currentServer)}
            style={{width: '100%', paddingHorizontal: 12}}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={styles.serverName} numberOfLines={1}>
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
        </Image>
      ) : (
        <TouchableOpacity
          onPress={() => app.openServerContextMenu(props.currentServer)}
          style={{width: '100%', paddingHorizontal: 10}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.serverName} numberOfLines={1}>
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
                  props.onChannelClick(c);
                }}
                selected={props.currentChannel?._id === c._id}
              />
            );
          }
        }
      })}
      {res}
    </>
  );
});

export const ChannelList = observer((props: ChannelListProps) => {
  return (
    <>
      {!props.currentServer ? (
        <>
          <Text
            style={{
              marginLeft: 12,
              margin: 14,
              fontSize: 16,
              fontWeight: 'bold',
            }}>
            Direct Messages
          </Text>

          <ChannelButton
            onPress={async () => {
              props.onChannelClick(null);
            }}
            key={'home'}
            channel={'Home'}
            selected={props.currentChannel === null}
          />

          <ChannelButton
            onPress={() => {
              props.onChannelClick('friends');
            }}
            key={'friends'}
            channel={'Friends'}
            selected={props.currentChannel === 'friends'}
          />

          <ChannelButton
            onPress={async () => {
              props.onChannelClick(await client.user?.openDM());
            }}
            key={'notes'}
            channel={'Saved Notes'}
            selected={props.currentChannel?.channel_type === 'SavedMessages'}
          />

          {__DEV__ ? (
            <ChannelButton
              onPress={async () => {
                await client.user?.openDM();
                props.onChannelClick('debug');
              }}
              key={'debugChannel'}
              channel={'Debug'}
              selected={props.currentChannel === 'debug'}
            />
          ) : null}

          {[...client.channels.values()]
            .filter(
              c =>
                c.channel_type === 'DirectMessage' ||
                c.channel_type === 'Group',
            )
            .sort((c1, c2) => c2.updatedAt - c1.updatedAt)
            .map(dm => (
              <ChannelButton
                onPress={() => {
                  props.onChannelClick(dm);
                }}
                onLongPress={() => {
                  app.openProfile(dm.recipient);
                }}
                delayLongPress={750}
                key={dm._id}
                channel={dm}
                selected={props.currentChannel?._id === dm._id}
              />
            ))}
        </>
      ) : null}
      {props.currentServer ? (
        <ServerChannelList
          onChannelClick={props.onChannelClick}
          currentChannel={props.currentChannel}
          currentServer={props.currentServer}
        />
      ) : null}
    </>
  );
});
