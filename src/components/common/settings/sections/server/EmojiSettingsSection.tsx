import {useContext, useState} from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import type {Server} from 'revolt.js';

import {client} from '@clerotri/lib/client';
import {styles} from '@clerotri/Theme';
import {Text} from '@clerotri/components/common/atoms';
import {SettingsEntry} from '@clerotri/components/common/settings/atoms';
import {Image} from '@clerotri/crossplat/Image';
import {commonValues, ThemeContext} from '@clerotri/lib/themes';
import {showToast} from '@clerotri/lib/utils';

export const EmojiSettingsSection = observer(({server}: {server: Server}) => {
  const {currentTheme} = useContext(ThemeContext);

  const {t} = useTranslation();

  const [emoji, setEmoji] = useState(
    [...server.client.emojis.values()].filter(
      x => x.parent.type === 'Server' && x.parent.id === server._id,
    ),
  );

  client.on('emoji/create', newEmoji => {
    const newEmojiList = emoji.concat([newEmoji]);
    setEmoji(newEmojiList);
  });

  client.on('emoji/delete', deletedEmoji => {
    const newEmojiList = emoji.filter(em => em._id !== deletedEmoji);
    setEmoji(newEmojiList);
  });

  return (
    <>
      <Text type={'h1'}>{t('app.servers.settings.emoji.title')}</Text>
      {emoji.length ? (
        emoji.map(e => (
          <SettingsEntry key={`emoji-settings-entry-${e._id}`}>
            <Image
              style={{
                minHeight: 24,
                minWidth: 24,
                marginStart: commonValues.sizes.small,
                marginEnd: commonValues.sizes.medium,
              }}
              source={{
                uri: `${client.configuration?.features.autumn.url}/emojis/${e._id}`,
              }}
            />
            <View style={{flex: 1, flexDirection: 'column'}}>
              <Text
                key={`emoji-settings-entry-${e._id}-id`}
                style={{fontWeight: 'bold'}}>
                {e.name}
              </Text>
              <Text colour={currentTheme.foregroundSecondary}>{e._id}</Text>
              <Text colour={currentTheme.foregroundSecondary}>
                {t('app.servers.settings.emoji.added_by', {
                  name: e.creator ? e.creator.username : e.creator_id,
                })}
              </Text>
            </View>
            {server.havePermission('ManageCustomisation') ? (
              <Pressable
                style={{
                  width: 30,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={async () => {
                  await e.delete();
                  showToast(
                    t('app.servers.settings.emoji.deleted_toast', {
                      name: e.name,
                    }),
                  );
                }}>
                <View style={styles.iconContainer}>
                  <MaterialIcon
                    name={'delete'}
                    size={20}
                    color={currentTheme.foregroundPrimary}
                  />
                </View>
              </Pressable>
            ) : null}
          </SettingsEntry>
        ))
      ) : (
        <Text>{t('app.servers.settings.emoji.empty')}</Text>
      )}
    </>
  );
});
