import {useContext} from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Server, User} from 'revolt.js';

import {client} from '@rvmob/Generic';
import {Text} from '@rvmob/components/common/atoms/Text';
import {commonValues, ThemeContext} from '@rvmob/lib/themes';
import {getColour} from '@rvmob/lib/utils';

type RoleViewProps = {
  server: Server;
  user: User;
};

export const RoleView = observer(({server, user}: RoleViewProps) => {
  const {currentTheme} = useContext(ThemeContext);

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
                  ? getColour(r.colour, currentTheme)
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
