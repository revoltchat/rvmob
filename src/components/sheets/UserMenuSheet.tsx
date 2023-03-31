import React from 'react';
import {ScrollView, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import Clipboard from '@react-native-clipboard/clipboard';
import AntIcon from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {User} from 'revolt.js';

import {ContextButton, app} from '../../Generic';
import {currentTheme, styles} from '../../Theme';
import {Text} from '../common/atoms';

export const UserMenuSheet = observer(
  ({state, user}: {state: any; user: User}) => {
    return (
      <>
        <ScrollView style={{flex: 1, padding: 3}}>
          <ContextButton onPress={() => state(false)}>
            <View style={styles.iconContainer}>
              <AntIcon
                name="closecircle"
                size={16}
                color={currentTheme.foregroundPrimary}
              />
            </View>
            <Text>Close</Text>
          </ContextButton>
          {app.settings.get('ui.showDeveloperFeatures') ? (
            <ContextButton
              onPress={() => {
                Clipboard.setString(user._id);
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name="content-copy"
                  size={20}
                  color={currentTheme.foregroundPrimary}
                />
              </View>
              <Text>
                Copy ID{' '}
                <Text colour={currentTheme.foregroundSecondary}>
                  ({user._id})
                </Text>
              </Text>
            </ContextButton>
          ) : null}
          {user.relationship !== 'User' ? (
            <ContextButton
              onPress={() => {
                app.openReportMenu(user, 'User');
                state(false);
              }}>
              <View style={styles.iconContainer}>
                <MaterialIcon
                  name="flag"
                  size={20}
                  color={currentTheme.error}
                />
              </View>
              <Text colour={currentTheme.error}>Report User</Text>
            </ContextButton>
          ) : null}
          <View style={{marginTop: 7}} />
        </ScrollView>
      </>
    );
  },
);
