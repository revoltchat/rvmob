import {useContext} from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Server, User} from 'revolt.js';

import {app, client} from '@rvmob/Generic';
import {Text} from './Text';
import {USER_IDS} from '@rvmob/lib/consts';
import {ThemeContext} from '@rvmob/lib/themes';
import {getColour} from '@rvmob/lib/utils';

type UsernameCoreProps = {
  user: User;
  size: number;
  name: string;
  colour: string;
  skipDisplayName?: boolean;
};

type UsernameBadgeProps = {
  user: User;
  size?: number;
  masquerade?: string | null;
};

type UsernameProps = {
  server?: Server;
  user?: User | null;
  noBadge?: boolean;
  size?: number;
  masquerade?: string | null;
  color?: string;
  skipDisplayName?: boolean;
};

const UsernameCore = observer(
  ({user, size, name, colour, skipDisplayName}: UsernameCoreProps) => {
    return (
      <Text
        colour={colour}
        style={{
          fontWeight: 'bold',
          fontSize: size,
        }}>
        {skipDisplayName ? '@' : null}
        {name}
        {skipDisplayName ? `#${user!.discriminator}` : null}
      </Text>
    );
  },
);

const UsernameBadge = observer(
  ({user, size, masquerade}: UsernameBadgeProps) => {
    const {currentTheme} = useContext(ThemeContext);

    const badgeSize = (size || 14) * 0.6;

    const bridgedMessage =
      user._id === USER_IDS.automod && masquerade !== undefined;

    const badgeStyle = {
      color: currentTheme.accentColorForeground,
      backgroundColor: currentTheme.accentColor,
      marginInlineStart: badgeSize * 0.4,
      paddingHorizontal: badgeSize * 0.4,
      alignSelf: 'center' as const,
      borderRadius: 2,
      fontSize: badgeSize,
      top: badgeSize * 0.1,
    };

    return (
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
    );
  },
);

export const Username = observer(
  ({
    server,
    user,
    noBadge,
    size,
    masquerade,
    color,
    skipDisplayName,
  }: UsernameProps) => {
    const {currentTheme} = useContext(ThemeContext);

    if (!user || typeof user !== 'object') {
      return (
        <Text style={size ? {fontSize: size} : {}}>{'<Unknown User>'}</Text>
      );
    }

    const memberObject = server
      ? client.members.getKey({
          server: server?._id,
          user: user._id,
        })
      : undefined;

    let roleColour = color
      ? getColour(color, currentTheme)
      : currentTheme.foregroundPrimary;

    const name =
      server && memberObject?.nickname
        ? memberObject?.nickname
        : !skipDisplayName
        ? user.display_name ?? user.username
        : user.username;

    if (server && memberObject?.roles && memberObject?.roles?.length > 0) {
      let srv = client.servers.get(memberObject._id.server);
      if (srv?.roles) {
        roleColour = getColour(
          memberObject.roleColour ?? currentTheme.foregroundPrimary,
          currentTheme,
        );
      }
    }

    const usernameSize =
      size || (app.settings.get('ui.messaging.fontSize') as number) || 14;

    return (
      <View style={{flexDirection: 'row'}}>
        <UsernameCore
          user={user}
          size={usernameSize}
          colour={roleColour}
          name={masquerade ?? name}
          skipDisplayName={skipDisplayName}
        />
        {!noBadge ? (
          <UsernameBadge user={user} size={size} masquerade={masquerade} />
        ) : null}
      </View>
    );
  },
);
