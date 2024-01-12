import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {Server} from 'revolt.js';

import {client} from '@rvmob/Generic';
import {currentTheme, styles} from '@rvmob/Theme';
import {Text} from '@rvmob/components/common/atoms';
import {Image} from '@rvmob/crossplat/Image';
import {showToast} from '@rvmob/lib/utils';

export const EmojiSettingsSection = observer(({server}: {server: Server}) => {
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
          <View
            style={styles.settingsEntry}
            key={`emoji-settings-entry-${e._id}`}>
            <Image
              style={{
                minHeight: 24,
                minWidth: 24,
                marginStart: 4,
                marginEnd: 8,
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
          </View>
        ))
      ) : (
        <Text>{t('app.servers.settings.emoji.empty')}</Text>
      )}
    </>
  );
});
