import {useContext, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import BottomSheetCore from '@gorhom/bottom-sheet';
import {useBackHandler} from '@react-native-community/hooks';

import type {Channel, Message as RevoltMessage} from 'revolt.js';

import {setFunction} from '@rvmob/Generic';
import {Text} from '@rvmob/components/common/atoms';
import {BottomSheet} from '@rvmob/components/common/BottomSheet';
import {Message} from '@rvmob/components/common/messaging';
import {commonValues, ThemeContext} from '@rvmob/lib/themes';

export const PinnedMessagesSheet = observer(() => {
  const {currentTheme} = useContext(ThemeContext);

  const [channel, setChannel] = useState(null as Channel | null);
  const [pinnedMessages, setPinnedMessages] = useState([] as RevoltMessage[]);

  const sheetRef = useRef<BottomSheetCore>(null);

  useBackHandler(() => {
    if (channel) {
      sheetRef.current?.close();
      setChannel(null);
      return true;
    }

    return false;
  });

  setFunction('openPinnedMessagesMenu', async (c: Channel | null) => {
    setChannel(c);
    c ? sheetRef.current?.expand() : sheetRef.current?.close();
  });

  useEffect(() => {
    async function fetchMessages() {
      if (!channel) {
        return;
      }
      const m = await channel.search({pinned: true});
      setPinnedMessages(m);
    }
    fetchMessages();
  }, [channel]);

  return (
    <BottomSheet sheetRef={sheetRef}>
      <View style={{paddingHorizontal: commonValues.sizes.xl}}>
        {!channel ? (
          <></>
        ) : (
          <>
            <View style={{justifyContent: 'center'}}>
              <Text type={'h1'}>Pinned messages</Text>
              <Text
                colour={currentTheme.foregroundSecondary}
                style={{
                  marginVertical: commonValues.sizes.small,
                }}>
                {`${pinnedMessages.length} ${
                  pinnedMessages.length === 1
                    ? 'pinned message'
                    : 'pinned messages'
                }`}
              </Text>
              {pinnedMessages.length > 0 &&
                pinnedMessages.map(message => {
                  return (
                    <View
                      style={{
                        backgroundColor: currentTheme.backgroundPrimary,
                        padding: commonValues.sizes.medium,
                        borderRadius: commonValues.sizes.medium,
                        marginBlockEnd: commonValues.sizes.xl,
                      }}>
                      <Message
                        key={message._id}
                        message={message}
                        grouped={false}
                        noTopMargin={true}
                      />
                    </View>
                  );
                })}
            </View>
          </>
        )}
      </View>
    </BottomSheet>
  );
});
