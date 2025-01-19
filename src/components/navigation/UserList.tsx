import {useContext} from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import type {User} from 'revolt.js';

import {app} from '@clerotri/Generic';
import {Button} from '@clerotri/components/common/atoms';
import {MiniProfile} from '@clerotri/components/common/profile';
import {commonValues, ThemeContext} from '@clerotri/lib/themes';

export const UserList = observer(({users}: {users: User[]}) => {
  const {currentTheme} = useContext(ThemeContext);

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
