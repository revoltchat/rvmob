import {useState} from 'react';
import {Pressable, TextInput, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {app} from '@rvmob/Generic';
import {currentTheme, styles} from '@rvmob/Theme';
import {Button, Checkbox, Text} from '@rvmob/components/common/atoms';
import {CreateChannelModalProps} from '@rvmob/lib/types';

export const CreateChannelModal = observer(
  ({object}: {object: CreateChannelModalProps}) => {
    const {t} = useTranslation();

    const [name, setName] = useState('');
    const [type, setType] = useState('Text' as 'Text' | 'Voice');
    const [nsfw, setNSFW] = useState(false);

    return (
      <View
        style={{
          width: '80%',
          borderRadius: 8,
          padding: 20,
          backgroundColor: currentTheme.backgroundPrimary,
          justifyContent: 'center',
          alignSelf: 'center',
        }}>
        <Text type={'h1'}>{t('app.modals.create_channel.header')}</Text>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            marginTop: 10,
          }}>
          <Text type={'h2'}>{t('app.modals.create_channel.name_header')}</Text>
          <TextInput
            style={{...styles.input, marginVertical: 4}}
            value={name}
            placeholder={t('app.modals.create_channel.name_placeholder')}
            onChangeText={v => {
              setName(v);
            }}
          />
          <Text type={'h2'}>{t('app.modals.create_channel.type_header')}</Text>
          <View
            style={{
              marginVertical: 4,
              borderRadius: 8,
              minWidth: '100%',
              backgroundColor: currentTheme.backgroundSecondary,
              padding: 8,
            }}>
            {['Text', 'Voice'].map(ct => (
              <Pressable
                key={`channel-type-${ct}`}
                style={styles.actionTile}
                onPress={() => {
                  // @ts-expect-error it's fine typescript, don't worry. lmk if you need a hug
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
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginVertical: 4,
            }}>
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
