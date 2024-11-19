import {observer} from 'mobx-react-lite';
import {client} from './Generic';
import {commonValues, currentTheme} from './Theme';
import {View} from 'react-native';
import {Server, User, Channel} from 'revolt.js';
import {Avatar} from '@rvmob/components/common/atoms/Avatar';
import {Text} from '@rvmob/components/common/atoms/Text';
import {Username} from '@rvmob/components/common/atoms/Username';
import {getColour} from './lib/utils';

type MiniProfileProps = {
  user?: User;
  scale?: number;
  channel?: Channel;
  server?: Server;
  color?: string;
};

export const MiniProfile = observer(
  ({user, scale, channel, server, color}: MiniProfileProps) => {
    if (user) {
      return (
        <View style={{flexDirection: 'row'}} key={`mini-profile-${user._id}`}>
          <Avatar
            key={`mini-profile-${user._id}-avatar`}
            user={user}
            server={server}
            size={35 * (scale || 1)}
            status
          />
          <View
            key={`mini-profile-${user._id}-text-wrapper`}
            style={{marginLeft: 10 * (scale || 1)}}>
            <Username
              user={user}
              server={server}
              color={color || currentTheme.foregroundPrimary}
              size={14 * (scale || 1)}
            />
            <Text
              colour={color || currentTheme.foregroundPrimary}
              style={{
                marginTop: -3 * (scale || 1),
                fontSize: 14 * (scale || 1),
              }}>
              {user.online
                ? user.status?.text || user.status?.presence || 'Online'
                : 'Offline'}
            </Text>
          </View>
        </View>
      );
    }

    if (channel) {
      return (
        <View style={{flexDirection: 'row'}}>
          <Avatar channel={channel} size={35 * (scale || 1)} />
          <View style={{marginLeft: 10 * (scale || 1)}}>
            <Text
              colour={color || currentTheme.foregroundPrimary}
              style={{
                fontSize: 14 * (scale || 1),
                fontWeight: 'bold',
              }}>
              {channel.name}
            </Text>
            <Text
              colour={color || currentTheme.foregroundPrimary}
              style={{
                marginTop: -3 * (scale || 1),
                fontSize: 14 * (scale || 1),
              }}>
              {channel?.recipient_ids?.length} members
            </Text>
          </View>
        </View>
      );
    }

    return <></>;
  },
);

type RoleViewProps = {
  server: Server;
  user: User;
};

export const RoleView = observer(({server, user}: RoleViewProps) => {
  let memberObject = client.members.getKey({
    server: server?._id,
    user: user?._id,
  });

  let roles = memberObject?.roles?.map(r => server.roles![r]) || null;
  return memberObject && roles ? (
    <>
      <Text type={'profile'}>ROLES</Text>
      <View
        key={`roleview-${server._id}-container`}
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          rowGap: commonValues.sizes.small,
        }}>
        {roles.map((r, i, a) => (
          <View
            key={`roleview-${server._id}-${r.name}-${i}`}
            style={{
              flexDirection: 'row',
              padding: 6,
              paddingStart: commonValues.sizes.medium,
              paddingEnd: commonValues.sizes.medium,
              marginStart: i === 0 ? 0 : commonValues.sizes.small,
              marginEnd: i === a.length - 1 ? 0 : commonValues.sizes.small,
              backgroundColor: currentTheme.backgroundPrimary,
              borderRadius: commonValues.sizes.medium,
            }}>
            <View
              key={`roleview-${server._id}-${r.name}-colour`}
              style={{
                borderRadius: 10000,
                backgroundColor: r.colour
                  ? getColour(r.colour)
                  : currentTheme.foregroundSecondary,
                height: 16,
                width: 16,
                margin: commonValues.sizes.xs,
                marginRight: 6,
              }}
            />
            <Text>{r.name}</Text>
          </View>
        ))}
      </View>
    </>
  ) : null;
});
