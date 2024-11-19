import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {User} from 'revolt.js';

import {app} from '../../Generic';
import {MiniProfile} from '../../Profile';
import {commonValues, currentTheme} from '../../Theme';

import {Button} from '../common/atoms';

export const UserList = observer(({users}: {users: User[]}) => {
  return (
    <>
      {users.map(u => (
        <Button
          key={`userlist-button-${u._id}`}
          backgroundColor={currentTheme.backgroundPrimary}
          style={{
            marginHorizontal: 0,
            paddingHorizontal: commonValues.sizes.medium,
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
          onPress={() => app.openProfile(u)}>
          <View
            key={`userlist-content-wrapper-${u._id}`}
            style={{maxWidth: '90%'}}>
            <MiniProfile key={`userlist-content-${u._id}`} user={u} />
          </View>
        </Button>
      ))}
    </>
  );
});
