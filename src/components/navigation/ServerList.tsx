import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import FastImage from 'react-native-fast-image';

import {client} from '../../Generic';
import {currentTheme, styles} from '../../Theme';
import {Text} from '../common/atoms';
import {DEFAULT_MAX_SIDE} from '../../lib/consts';

const Image = FastImage;

export const ServerList = observer(
  ({
    onServerPress,
    onServerLongPress,
    filter,
    ordered,
    showUnread = true,
    showDiscover = true,
  }: {
    onServerPress: any;
    onServerLongPress: any;
    ordered?: string[];
    filter?: any;
    showUnread?: boolean;
    showDiscover?: boolean;
  }) => {
    let servers = [...client.servers.values()];
    if (filter) {
      servers = servers.filter(filter);
    }
    if (ordered) {
      servers.sort((server1, server2) => {
        return ordered.indexOf(server1._id) - ordered.indexOf(server2._id);
      });
    }
    return (
      <View key={'server-list-container'}>
        {servers.map(s => {
          let iconURL = s.generateIconURL();
          let pings = s.getMentions().length;
          let initials = '';
          for (const word of s.name.split(' ')) {
            initials += word.charAt(0);
          }
          return (
            <View key={`${s._id}-indicator-container`}>
              {showUnread && s.getMentions().length > 0 ? (
                <View
                  key={`${s._id}-mentions-indicator`}
                  style={{
                    borderRadius: 10000,
                    backgroundColor: currentTheme.error,
                    height: 20,
                    width: 20,
                    marginBottom: -20,
                    left: 34,
                    zIndex: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    key={`${s._id}-mentions-indicator-count`}
                    style={{color: '#FFFFFF', marginRight: 1, marginBottom: 2}}>
                    {pings > 9 ? '9+' : pings}
                  </Text>
                </View>
              ) : showUnread && s.isUnread() ? (
                <View
                  key={`${s._id}-unreads-indicator`}
                  style={{
                    borderRadius: 10000,
                    borderWidth: 3,
                    borderColor: currentTheme.background,
                    backgroundColor: currentTheme.foregroundPrimary,
                    height: 20,
                    width: 20,
                    marginBottom: -20,
                    left: 34,
                    zIndex: 2,
                  }}
                />
              ) : null}
              <TouchableOpacity
                onPress={() => {
                  onServerPress(s);
                }}
                onLongPress={() => {
                  onServerLongPress(s);
                }}
                key={s._id}
                style={styles.serverButton}>
                {iconURL ? (
                  <Image
                    key={`${s._id}-icon`}
                    source={{uri: iconURL + '?max_side=' + DEFAULT_MAX_SIDE}}
                    style={styles.serverIcon}
                  />
                ) : (
                  <Text
                    key={`${s._id}-initials`}
                    style={styles.serverButtonInitials}>
                    {initials}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
        {/* {showDiscover ? (
            <>
              <View
                style={{
                  margin: 6,
                  height: 2,
                  width: '80%',
                  backgroundColor: currentTheme.backgroundPrimary,
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  openUrl('https://rvlt.gg/discover');
                }}
                key={'serverlist-discover'}
                style={styles.serverButton}>
                <View style={{alignItems: 'center'}}>
                  <MaterialCommunityIcon
                    name={'compass'}
                    size={25}
                    color={currentTheme.foregroundPrimary}
                  />
                </View>
              </TouchableOpacity>
            </>
          ) : null} */}
      </View>
    );
  },
);
