import {useContext, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {app} from '@clerotri/Generic';
import {Text} from '@clerotri/components/common/atoms';
import {PlatformModerationMessage} from '@clerotri/components/common/messaging/PlatformModerationMessage';
import {RegularMessage} from '@clerotri/components/common/messaging/RegularMessage';
import {SystemMessage} from '@clerotri/components/common/messaging/SystemMessage';
import {USER_IDS} from '@clerotri/lib/consts';
import { ThemeContext } from '@clerotri/lib/themes';
import {MessageProps} from '@clerotri/lib/types';

export const Message = observer((props: MessageProps) => {
  const {currentTheme} = useContext(ThemeContext);

  let [error, setError] = useState(null as any);
  if (error) {
    return (
      <View key={props.message._id}>
        <Text colour={currentTheme.error}>
          Failed to render message:{'\n'}
          {error?.message}
        </Text>
      </View>
    );
  }
  try {
    if (!props.message.content && props.message.system) {
      return (
        <TouchableOpacity
          key={props.message._id}
          activeOpacity={0.8}
          delayLongPress={750}
          onLongPress={props.onLongPress}>
          <SystemMessage message={props.message} />
        </TouchableOpacity>
      );
    }
    if (props.message.channel?.recipient?._id === USER_IDS.platformModeration) {
      return (
        <TouchableOpacity
          key={props.message._id}
          activeOpacity={0.8}
          delayLongPress={750}
          onLongPress={props.onLongPress}>
          <View
            style={{
              marginTop: app.settings.get(
                'ui.messaging.messageSpacing',
              ) as number,
            }}
          />
          <PlatformModerationMessage message={props.message} />
        </TouchableOpacity>
      );
    }
    return <RegularMessage {...props} />;
  } catch (e) {
    setError(e);
    console.error(e);
  }
  return null;
});
