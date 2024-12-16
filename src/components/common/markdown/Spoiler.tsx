import {createContext, useContext, useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';

import {Text} from '@rvmob/components/common/atoms';
import {commonValues, Theme, ThemeContext} from '@rvmob/lib/themes';

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    commonStyles: {
      flexDirection: 'row',
      // align it properly (see also https://github.com/facebook/react-native/issues/31955)
      transform: [
        {
          translateY: 6,
        },
      ],

      paddingHorizontal: commonValues.sizes.xs,
      borderRadius: commonValues.sizes.small,
    },
    hiddenSpoiler: {
      backgroundColor: currentTheme.background,
    },
    revealedSpoiler: {
      backgroundColor: currentTheme.backgroundSecondary,
    },
    commonTextStyles: {
      backgroundColor: 'transparent',
    },
    hiddenSpoilerText: {
      color: 'transparent',
    },
    revealedSpoilerText: {
      color: currentTheme.foregroundPrimary,
    },
  });
};

export const SpoilerContext = createContext(false);

export const SpoilerWrapper = ({content}: {content: any}) => {
  const {currentTheme} = useContext(ThemeContext);
  const spoilerStyles = generateLocalStyles(currentTheme);

  const [revealed, setRevealed] = useState(false);

  return (
    <SpoilerContext.Provider value={revealed}>
      <Pressable
        style={{
          ...spoilerStyles.commonStyles,
          ...(revealed
            ? spoilerStyles.revealedSpoiler
            : spoilerStyles.hiddenSpoiler),
        }}
        onPress={() => setRevealed(!revealed)}>
        {content}
      </Pressable>
    </SpoilerContext.Provider>
  );
};

export const Spoiler = ({
  node,
  isRevealed,
  styles,
  inheritedStyles,
}: {
  node: any;
  isRevealed: boolean;
  styles: any;
  inheritedStyles: any;
}) => {
  const {currentTheme} = useContext(ThemeContext);
  const spoilerStyles = generateLocalStyles(currentTheme);

  return (
    <Text
      accessibilityLabel={isRevealed ? node.content : 'Hidden spoiler'}
      style={{
        ...inheritedStyles,
        ...styles,
        ...spoilerStyles.commonTextStyles,
        ...(isRevealed
          ? spoilerStyles.revealedSpoilerText
          : spoilerStyles.hiddenSpoilerText),
      }}>
      {
        /* FIXME: Rendering emoji reveals spoiler markdown
                  renderEmoji(node.content)*/
        node.content
      }
    </Text>
  );
};
