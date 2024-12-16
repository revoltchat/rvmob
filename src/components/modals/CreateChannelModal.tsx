import {useContext, useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {app} from '@rvmob/Generic';
import {styles} from '@rvmob/Theme';
import {Button, Checkbox, Input, Text} from '@rvmob/components/common/atoms';
import {commonValues, Theme, ThemeContext} from '@rvmob/lib/themes';
import {CreateChannelModalProps} from '@rvmob/lib/types';

export const CreateChannelModal = observer(
  ({object}: {object: CreateChannelModalProps}) => {
    const {currentTheme} = useContext(ThemeContext);
    const localStyles = useMemo(() => generateLocalStyles(currentTheme), [currentTheme]);

    const {t} = useTranslation();

    const [name, setName] = useState('');
    const [type, setType] = useState('Text' as 'Text' | 'Voice');
    const [nsfw, setNSFW] = useState(false);

    return (
      <View
        style={localStyles.container}>
        <Text type={'h1'}>{t('app.modals.create_channel.header')}</Text>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            marginTop: 10,
          }}>
          <Text type={'h2'}>{t('app.modals.create_channel.name_header')}</Text>
          <Input
            value={name}
            placeholder={t('app.modals.create_channel.name_placeholder')}
            onChangeText={v => {
              setName(v);
            }}
          />
          <Text type={'h2'}>{t('app.modals.create_channel.type_header')}</Text>
          <View
            style={localStyles.typeSelector}>
            {(['Text', 'Voice'] as const).map(ct => (
              <Pressable
                key={`channel-type-${ct}`}
                style={localStyles.channelType}
                onPress={() => {
                  setType(ct);
                }}>
                <Text style={{flex: 1}}>{ct}</Text>
                <View style={{...styles.iconContainer, marginRight: 0}}>
                  <MaterialIcon
                    name={`radio-button-${type === ct ? 'on' : 'off'}`}
                    size={28}
                    color={currentTheme.accentColor}
                  />
                </View>
              </Pressable>
            ))}
          </View>
          <View
            style={localStyles.checkboxRow}>
            <Text>{t('app.modals.create_channel.nsfw_label')}</Text>
            <Checkbox
              key={'checkbox-channel-nsfw'}
              value={nsfw}
              callback={() => {
                setNSFW(!nsfw);
              }}
            />
          </View>
          <Button
            onPress={() => {
              app.openCreateChannelModal(null);
              object.server.createChannel({name, type, nsfw}).then(c => {
                object.callback(c._id);
              });
            }}
            style={{marginHorizontal: 0}}>
            <Text>{t('app.actions.create_channel')}</Text>
          </Button>
          <Button
            onPress={() => {
              app.openCreateChannelModal(null);
            }}
            style={{marginHorizontal: 0}}>
            <Text>{t('app.actions.cancel')}</Text>
          </Button>
        </View>
      </View>
    );
  },
);

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    container: {
      width: '80%',
      borderRadius: commonValues.sizes.medium,
      padding: 20,
      backgroundColor: currentTheme.backgroundPrimary,
      justifyContent: 'center',
      alignSelf: 'center',
    },
    typeSelector: {
      marginVertical: commonValues.sizes.small,
      borderRadius: commonValues.sizes.medium,
      minWidth: '100%',
      backgroundColor: currentTheme.backgroundSecondary,
      padding: commonValues.sizes.medium,
    },
    channelType:  {
      height: 40,
      width: '100%',
      alignItems: 'center',
      flexDirection: 'row',
      backgroundColor: currentTheme.backgroundPrimary,
      borderRadius: commonValues.sizes.medium,
      paddingLeft: 10,
      paddingRight: 10,
      marginVertical: commonValues.sizes.small,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: commonValues.sizes.small,
    },
  });
};
