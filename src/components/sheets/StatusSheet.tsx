import React, {useRef} from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import BottomSheetCore from '@gorhom/bottom-sheet';
import {useBackHandler} from '@react-native-community/hooks';

import {client, setFunction} from '../../Generic';
import {STATUSES} from '../../lib/consts';
import {currentTheme} from '../../Theme';
import {ContextButton, InputWithButton, Text} from '../common/atoms';
import {BottomSheet} from '../common/BottomSheet';

export const StatusSheet = observer(() => {
  const [isOpen, setIsOpen] = React.useState(false);
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
        <Text key={'custom-status-selector-label'} type={'header'}>
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
                  // @ts-expect-error every status has a colour (TODO: find a solution?)
                  backgroundColor: currentTheme['status' + s],
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
        <Text key={'custom-status-input-label'} type={'header'}>
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
          buttonContents={{type: "string", content: "Set text"}}
          backgroundColor={currentTheme.backgroundPrimary}
        />
      </View>
    </BottomSheet>
  );
});
