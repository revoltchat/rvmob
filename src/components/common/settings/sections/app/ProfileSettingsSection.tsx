import {useContext} from 'react';
import {Pressable, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import Clipboard from '@react-native-clipboard/clipboard';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {app, client} from '@rvmob/Generic';
import {styles} from '@rvmob/Theme';
import {Text} from '@rvmob/components/common/atoms';
import {SettingsEntry} from '@rvmob/components/common/settings/atoms';
import {ThemeContext} from '@rvmob/lib/themes';

export const ProfileSettingsSection = observer(() => {
  const {currentTheme} = useContext(ThemeContext);

  return (
    <>
      <SettingsEntry key={'display-name-settings'}>
        <View style={{flex: 1, flexDirection: 'column'}}>
          <Text key={'display-name-label'} style={{fontWeight: 'bold'}}>
            Display name
          </Text>
          <Text
            key={'display-name'}
            colour={
              client.user?.display_name
                ? currentTheme.foregroundPrimary
                : currentTheme.foregroundSecondary
            }>
            {client.user?.display_name ?? 'No display name set'}
          </Text>
        </View>
        <Pressable
          style={{
            width: 30,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
            Clipboard.setString(
              client.user?.display_name ?? 'No display name set',
            );
          }}>
          <View style={styles.iconContainer}>
            <MaterialIcon
              name="content-copy"
              size={20}
              color={currentTheme.foregroundPrimary}
            />
          </View>
        </Pressable>
        <Pressable
          style={{
            width: 30,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
            app.openTextEditModal({
              initialString: client.user?.display_name ?? '',
              id: 'display_name',
              callback: newName => {
                client.api.patch('/users/@me', {display_name: newName});
              },
            });
          }}>
          <View style={styles.iconContainer}>
            <MaterialIcon
              name="edit"
              size={20}
              color={currentTheme.foregroundPrimary}
            />
          </View>
        </Pressable>
      </SettingsEntry>
    </>
  );
});
