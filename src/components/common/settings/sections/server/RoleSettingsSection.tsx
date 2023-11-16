import React from 'react';
import {Pressable, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Server} from 'revolt.js';

import {SettingsSection} from '../../../../../lib/types';
import {currentTheme, styles} from '../../../../../Theme';
import {GapView} from '../../../../layout';
import {Text} from '../../../atoms';

export const RoleSettingsSection = observer(
  ({server, callback}: {server: Server; callback: Function}) => {
    const [subsection, setSubsection] = React.useState(null as SettingsSection);

    return (
      <>
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}
          onPress={() => {
            subsection ? setSubsection(null) : callback();
          }}>
          <MaterialIcon
            name="arrow-back"
            size={24}
            color={currentTheme.foregroundSecondary}
          />
          <Text
            style={{
              color: currentTheme.foregroundSecondary,
              fontSize: 20,
              marginLeft: 5,
            }}>
            Back
          </Text>
        </Pressable>
        {subsection ? (
          <>
            <Text
              type={'h1'}
              colour={
                server.roles![subsection].colour ??
                currentTheme.foregroundPrimary
              }>
              {server.roles![subsection].name}
            </Text>
            <Text colour={currentTheme.foregroundSecondary}>{subsection}</Text>
            <GapView size={2} />
            <Text type={'h2'}>Rank</Text>
            {/* <TextInput
                    style={{
                      fontFamily: 'Open Sans',
                      minWidth: '100%',
                      borderRadius: 8,
                      backgroundColor: currentTheme.backgroundSecondary,
                      padding: 6,
                      paddingLeft: 10,
                      paddingRight: 10,
                      color: currentTheme.foregroundPrimary,
                    }}
                    value={rankValue as string}
                    keyboardType={'decimal-pad'}
                    onChangeText={v => {
                      setRankValue(v);
                    }}
                  /> */}
            <Text>{server.roles![subsection].rank}</Text>
            <GapView size={2} />
            <Text type={'h2'}>Permissions</Text>
            <Text>{server.roles![subsection].permissions.a}</Text>
            <GapView size={2} />
            <Text type={'h2'}>Colour</Text>
            <Text>{server.roles![subsection].colour}</Text>
          </>
        ) : (
          <>
            <Text type={'h1'}>Roles</Text>
            {server.orderedRoles.map(r => (
              <View
                style={styles.settingsEntry}
                key={`role-settings-entry-${r.id}`}>
                <View style={{flex: 1, flexDirection: 'column'}}>
                  <Text
                    key={`role-settings-entry-${r.id}-name`}
                    colour={r.colour ?? currentTheme.foregroundPrimary}
                    style={{fontWeight: 'bold'}}>
                    {r.name}
                  </Text>
                  <Text colour={currentTheme.foregroundSecondary}>{r.id}</Text>
                </View>
                <Pressable
                  style={{
                    width: 30,
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    setSubsection(r.id);
                  }}>
                  <View style={styles.iconContainer}>
                    <MaterialIcon
                      name={'arrow-forward'}
                      size={20}
                      color={currentTheme.foregroundPrimary}
                    />
                  </View>
                </Pressable>
              </View>
            ))}
          </>
        )}
      </>
    );
  },
);