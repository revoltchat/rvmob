import {useContext, useRef, useState} from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import type BottomSheetCore from '@gorhom/bottom-sheet';
import {useBackHandler} from '@react-native-community/hooks/lib/useBackHandler';

import {setFunction} from '@rvmob/Generic';
import {client} from '@rvmob/lib/client';
import {ContextButton, InputWithButton, Text} from '../common/atoms';
import {BottomSheet} from '../common/BottomSheet';
import {STATUSES} from '@rvmob/lib/consts';
import {ThemeContext} from '@rvmob/lib/themes';

export const StatusSheet = observer(() => {
  const {currentTheme} = useContext(ThemeContext);

  const [isOpen, setIsOpen] = useState(false);
  const sheetRef = useRef<BottomSheetCore>(null);

  useBackHandler(() => {
    if (isOpen) {
      sheetRef.current?.close();
      setIsOpen(false);
      return true;
    }

    return false;
  });

  setFunction('openStatusMenu', async (show: boolean) => {
    show ? sheetRef.current?.expand() : sheetRef.current?.close();
    setIsOpen(show);
  });
  return (
    <BottomSheet sheetRef={sheetRef}>
      <View style={{paddingHorizontal: 16}}>
        <Text key={'custom-status-selector-label'} type={'h1'}>
          Status
        </Text>
        <View style={{marginBottom: 10}}>
          {STATUSES.map(s => (
            <ContextButton
              key={s}
              onPress={() => {
                client.users.edit({
                  status: {...client.user?.status, presence: s},
                });
              }}>
              <View
                style={{
                  backgroundColor: currentTheme[`status${s}`],
                  height: 16,
                  width: 16,
                  borderRadius: 10000,
                  marginRight: 10,
                }}
              />
              <Text style={{fontSize: 15}} key={`${s}-button-label`}>
                {s}
              </Text>
            </ContextButton>
          ))}
        </View>
        <Text key={'custom-status-input-label'} type={'h1'}>
          Status text
        </Text>
        <InputWithButton
          placeholder="Custom status"
          defaultValue={client.user?.status?.text ?? undefined}
          onPress={(v: string) => {
            client.users.edit({
              status: {
                ...client.user?.status,
                text: v ? v : undefined,
              },
            });
          }}
          buttonContents={{type: 'string', content: 'Set text'}}
          backgroundColor={currentTheme.backgroundPrimary}
        />
      </View>
    </BottomSheet>
  );
});
