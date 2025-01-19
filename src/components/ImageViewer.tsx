import {useContext} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';

import {gestureHandlerRootHOC} from 'react-native-gesture-handler';
import ImageViewerCore from 'react-native-reanimated-image-viewer';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {client} from '@clerotri/lib/client';
import {Text} from '@clerotri/components/common/atoms';
import {GapView} from '@clerotri/components/layout';
import {commonValues, Theme, ThemeContext} from '@clerotri/lib/themes';
import {getReadableFileSize, openUrl} from '@clerotri/lib/utils';

export const ImageViewer = gestureHandlerRootHOC(
  ({state, setState}: {state: any; setState: any}) => {
    const {currentTheme} = useContext(ThemeContext);
    const localStyles = generateLocalStyles(currentTheme);

    const imageUrl = state.i?.metadata
      ? client.generateFileURL(state.i)!
      : state.i;

    return (
      <View style={localStyles.container}>
        <View style={localStyles.topBar}>
          <Pressable
            onPress={() =>
              openUrl(
                state.i?.metadata ? client.generateFileURL(state.i) : state.i,
              )
            }>
            <MaterialCommunityIcon
              name="web"
              size={32}
              color={currentTheme.foregroundSecondary}
            />
          </Pressable>
          <GapView size={5} type={'horizontal'} />
          <Pressable onPress={() => setState()}>
            <MaterialCommunityIcon
              name="close-circle"
              size={32}
              color={currentTheme.foregroundSecondary}
            />
          </Pressable>
        </View>
        <View style={localStyles.image}>
          <ImageViewerCore
            imageUrl={imageUrl}
            width={state.i.metadata?.width ?? undefined}
            height={state.i.metadata?.height ?? undefined}
            onRequestClose={() => setState()}
          />
        </View>
        <View style={localStyles.fileInfo}>
          <Text style={{fontWeight: 'bold'}}>
            {state.i.filename ?? 'Unknown filename'}
          </Text>
          <Text>
            {state.i.size ? getReadableFileSize(state.i.size) : 'Unknown size'}
          </Text>
        </View>
      </View>
    );
  },
  // if the user can see the root view something might be broken, so make it red
  {backgroundColor: 'red'},
);

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
    },
    topBar: {
      height: '7%',
      backgroundColor: currentTheme.background,
      paddingHorizontal: commonValues.sizes.large,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      zIndex: 10,
    },
    image: {
      height: '86%',
    },
    fileInfo: {
      height: '7%',
      backgroundColor: currentTheme.background,
      paddingHorizontal: commonValues.sizes.large,
      justifyContent: 'center',
      zIndex: 10,
    },
  });
};
