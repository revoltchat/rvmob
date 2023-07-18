import React from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Server, User} from 'revolt.js';

import {client} from '../../../Generic';
import {currentTheme, styles} from '../../../Theme';
import {Text} from './Text';
import {USER_IDS} from '../../../lib/consts';
import {getColour, getHighestRole} from '../../../lib/utils';

type UsernameProps = {
  server?: Server;
  user?: User;
  noBadge?: boolean;
  size?: number;
  masquerade?: string | null;
  color?: string;
};

export const Username = observer(
  ({server, user, noBadge, size, masquerade, color}: UsernameProps) => {
    if (typeof user !== 'object') {
      return (
        <Text style={size ? {fontSize: size} : {}}>{'<Unknown User>'}</Text>
      );
    }
    let memberObject = server
      ? client.members.getKey({
          server: server?._id,
          user: user?._id,
        })
      : undefined;
    let roleColor = color ? getColour(color) : styles.textDefault.color;
    let name =
      server && memberObject?.nickname
        ? memberObject?.nickname
        : user?.username;
    if (server && memberObject?.roles && memberObject?.roles?.length > 0) {
      let srv = client.servers.get(memberObject._id.server);
      if (srv?.roles) {
        roleColor = getColour(
          memberObject.roleColour ?? currentTheme.foregroundPrimary,
        );
      }
    }
    let badgeSize = (size || 14) * 0.6;
    let bridgedMessage =
      user?._id === USER_IDS.automod && masquerade !== undefined;
    let badgeStyle = {
      color: currentTheme.accentColorForeground,
      backgroundColor: currentTheme.accentColor,
      marginLeft: badgeSize * 0.3,
      paddingLeft: badgeSize * 0.4,
      paddingRight: badgeSize * 0.4,
      borderRadius: 3,
      fontSize: badgeSize,
      height: badgeSize + badgeSize * 0.45,
      top: badgeSize * 0.5,
    };
    return (
      <View style={{flexDirection: 'row'}}>
        <Text
          colour={roleColor}
          style={{fontWeight: 'bold', fontSize: size || 14}}>
          {masquerade ?? name}
        </Text>
        {!noBadge ? (
          <>
            {bridgedMessage ? (
              <Text style={badgeStyle}>BRIDGE</Text>
            ) : (
              <>
                {user?.bot ? <Text style={badgeStyle}>BOT</Text> : null}
                {masquerade ? <Text style={badgeStyle}>MASQ.</Text> : null}
                {user?._id === USER_IDS.platformModeration ? (
                  <Text style={badgeStyle}>SYSTEM</Text>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </View>
    );
  },
);
