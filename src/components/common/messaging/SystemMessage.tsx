import {useContext} from 'react';
import {StyleSheet, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import type {Message as RevoltMessage} from 'revolt.js';

import {Text, Username} from '@clerotri/components/common/atoms';
import {app} from '@clerotri/Generic';
import {client} from '@clerotri/lib/client';
import {ThemeContext} from '@clerotri/lib/themes';

const SYSTEM_MESSAGE_ICONS = {
  text: {
    name: 'info',
    iconSet: 'main',
  },
  user_joined: {
    name: 'format-horizontal-align-right',
    iconSet: 'community',
  },
  user_left: {
    name: 'format-horizontal-align-left',
    iconSet: 'community',
  },
  user_added: {
    name: 'person-add',
    iconSet: 'main',
  },
  user_remove: {
    name: 'person-remove',
    iconSet: 'main',
  },
  user_kicked: {
    name: 'person-remove',
    iconSet: 'main',
  },
  user_banned: {
    name: 'hammer',
    iconSet: 'community',
  },
  channel_renamed: {
    name: 'edit',
    iconSet: 'main',
  },
  channel_description_changed: {
    name: 'edit-note',
    iconSet: 'main',
  },
  channel_icon_changed: {
    name: 'image-edit',
    iconSet: 'community',
  },
  channel_ownership_changed: {
    name: 'account-key',
    iconSet: 'community',
  },
  message_pinned: {
    name: 'pin',
    iconSet: 'community',
  },
  message_unpinned: {
    name: 'pin-off',
    iconSet: 'community',
  },
} as const;

const SystemMessageIcon = observer(
  ({icon}: {icon: {iconSet: 'main' | 'community'; name: string}}) => {
    const {currentTheme} = useContext(ThemeContext);

    const IconComponent =
      icon.iconSet === 'community' ? MaterialCommunityIcon : MaterialIcon;
    return (
      <IconComponent
        name={icon.name}
        color={currentTheme.foregroundSecondary}
        size={(app.settings.get('ui.messaging.fontSize') as number) ?? 14}
        style={{alignSelf: 'center', paddingEnd: 4}}
      />
    );
  },
);

export const SystemMessage = observer(
  ({message, isReply}: {message: RevoltMessage; isReply?: boolean}) => {
    if (!message.system) {
      return <></>;
    }

    let userID = '';

    if (message.system.type !== 'text') {
      switch (message.system.type) {
        case 'channel_ownership_changed':
          userID = message.system.from;
          break;
        case 'channel_description_changed':
        case 'channel_icon_changed':
        case 'channel_renamed':
        case 'message_pinned':
        case 'message_unpinned':
          userID = message.system.by;
          break;
        default:
          userID = message.system.id;
          break;
      }
    }

    return (
      <View
        key={message._id}
        style={{
          ...localStyles.containerCommon,
          ...(!isReply && localStyles.containerPadding),
        }}>
        <SystemMessageIcon icon={SYSTEM_MESSAGE_ICONS[message.system.type]} />
        {message.system.type === 'text' ? (
          <>
            <Text>
              <Text style={{fontWeight: 'bold'}}>System message: </Text>
              {message.system.content}
            </Text>
          </>
        ) : (
          <>
            <Username
              user={client.users.get(userID)}
              server={message.channel?.server}
            />
            {message.system.type === 'user_joined' ? (
              <Text> joined</Text>
            ) : message.system.type === 'user_left' ? (
              <Text> left</Text>
            ) : message.system.type === 'user_banned' ? (
              <Text> was banned</Text>
            ) : message.system.type === 'user_kicked' ? (
              <Text> was kicked</Text>
            ) : message.system.type === 'user_added' ? (
              <Text> was added to the group</Text>
            ) : message.system.type === 'user_remove' ? (
              <Text> was removed from the group</Text>
            ) : message.system.type === 'channel_renamed' ? (
              <Text>
                {' '}
                renamed the channel to{' '}
                <Text style={{fontWeight: 'bold'}}>{message.system.name}</Text>
              </Text>
            ) : message.system.type === 'channel_description_changed' ? (
              <Text> changed the channel description</Text>
            ) : message.system.type === 'channel_icon_changed' ? (
              <Text> changed the channel icon</Text>
            ) : message.system.type === 'channel_ownership_changed' ? (
              <>
                <Text> gave ownership of the group to </Text>
                <Username
                  user={client.users.get(message.system.to)}
                  server={message.channel?.server}
                />
              </>
            ) : message.system.type === 'message_pinned' ? (
              <Text> pinned a message</Text>
            ) : message.system.type === 'message_unpinned' ? (
              <Text> unpinned a message</Text>
            ) : null}
          </>
        )}
      </View>
    );
  },
);

const localStyles = StyleSheet.create({
  containerCommon: {
    flex: 1,
    flexDirection: 'row',
  },
  containerPadding: {
    paddingInlineStart: 10,
    paddingBlockStart: app.settings.get(
      'ui.messaging.messageSpacing',
    ) as number,
  },
});
