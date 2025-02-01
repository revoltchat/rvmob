import {useContext, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import type BottomSheetCore from '@gorhom/bottom-sheet';

import type {Channel, User} from 'revolt.js';

import {setFunction} from '@clerotri/Generic';
import {Text} from '@clerotri/components/common/atoms';
import {BottomSheet} from '@clerotri/components/common/BottomSheet';
import {MarkdownView} from '@clerotri/components/common/MarkdownView';
import {commonValues, ThemeContext} from '@clerotri/lib/themes';
import {useBackHandler} from '@clerotri/lib/ui';

export const ChannelInfoSheet = observer(() => {
  const {currentTheme} = useContext(ThemeContext);

  const [channel, setChannel] = useState(null as Channel | null);
  const [groupMembers, setGroupMembers] = useState([] as User[]);

  const sheetRef = useRef<BottomSheetCore>(null);

  useBackHandler(() => {
    if (channel) {
      sheetRef.current?.close();
      return true;
    }

    return false;
  });

  setFunction('openChannelContextMenu', (c: Channel | null) => {
    setChannel(c);
    c ? sheetRef.current?.expand() : sheetRef.current?.close();
  });

  useEffect(() => {
    async function fetchMembers() {
      if (!channel) {
        return;
      }
      const m =
        channel.channel_type === 'Group' ? await channel.fetchMembers() : [];
      setGroupMembers(m);
    }
    fetchMembers();
  }, [channel]);
  return (
    <BottomSheet sheetRef={sheetRef}>
      <View style={{paddingHorizontal: commonValues.sizes.xl}}>
        {!channel ? (
          <></>
        ) : (
          <>
            <View style={{justifyContent: 'center'}}>
              <Text type={'h1'}>{channel.name}</Text>
              <Text
                colour={currentTheme.foregroundSecondary}
                style={{
                  marginVertical: commonValues.sizes.small,
                }}>
                {channel.channel_type === 'Group'
                  ? `Group (${groupMembers.length} ${
                      groupMembers.length === 1 ? 'member' : 'members'
                    })`
                  : 'Regular channel'}
              </Text>
              {channel.description ? (
                <View
                  style={{
                    backgroundColor: currentTheme.background,
                    padding: commonValues.sizes.medium,
                    borderRadius: commonValues.sizes.medium,
                  }}>
                  <MarkdownView
                    style={{
                      color: currentTheme.foregroundSecondary,
                      fontSize: 16,
                      textAlign: 'center',
                    }}>
                    {channel.description}
                  </MarkdownView>
                </View>
              ) : null}
            </View>
          </>
        )}
      </View>
    </BottomSheet>
  );
});
