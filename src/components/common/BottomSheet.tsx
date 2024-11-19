import {useMemo} from 'react';
import {StyleSheet} from 'react-native';

import BottomSheetCore, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {observer} from 'mobx-react-lite';

import {commonValues, currentTheme} from '../../Theme';

export const BottomSheet = observer(
  ({sheetRef, children}: {sheetRef: any; children: any}) => {
    const snapPoints = useMemo(() => ['50%', '70%', '90%'], []);

    return (
      <BottomSheetCore
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={BottomSheetBackdrop}
        style={{margin: 'auto', maxWidth: 800}}
        backgroundStyle={{
          backgroundColor: currentTheme.backgroundSecondary,
        }}
        handleIndicatorStyle={localStyles.handleIndicator}>
        <BottomSheetScrollView>{children}</BottomSheetScrollView>
      </BottomSheetCore>
    );
  },
);

const localStyles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: currentTheme.backgroundSecondary,
  },
  handleIndicator: {
    backgroundColor: currentTheme.foregroundPrimary,
    width: '25%',
    padding: 3,
    marginVertical: commonValues.sizes.medium,
  },
});
