import {useContext} from 'react';
import {Text as NativeText, StyleSheet, type TextProps} from 'react-native';

import {commonValues, Theme, ThemeContext} from '@rvmob/lib/themes';

type FullTextProps = TextProps & {
  font?: 'JetBrains Mono' | 'Inter' | 'Open Sans';
  colour?: string;
  type?: 'h1' | 'h2' | 'profile';
};

export const Text = (props: FullTextProps) => {
  const {currentTheme} = useContext(ThemeContext);
  const localStyles = generateLocalStyles(currentTheme);

  let newProps = {...props};

  if (!newProps.style) {
    newProps.style = {};
  }

  if (props.type) {
    switch (props.type) {
      case 'h1':
        // @ts-expect-error the type error seems to be related to the various ways you can specify style props but it works so shhhh
        newProps.style = {...localStyles.h1, ...newProps.style};
        break;
      case 'h2':
        // @ts-expect-error ditto
        newProps.style = {...localStyles.h2, ...newProps.style};
        break;
      case 'profile':
        // @ts-expect-error ditto
        newProps.style = {...localStyles.profileSubheader, ...newProps.style};
        break;
      default:
        break;
    }
  }

  if (props.colour) {
    // @ts-expect-error ditto
    newProps.style!.color = props.colour;
  }

  newProps.style = {
    ...localStyles.base,
    ...(props.font && {
      fontFamily: props.font,
    }),
    // @ts-expect-error ditto
    ...newProps.style,
  };

  return <NativeText {...newProps}>{newProps.children}</NativeText>;
};

const generateLocalStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    base: {
      color: currentTheme.foregroundPrimary,
      flexWrap: 'wrap',
      fontFamily: 'Open Sans',
    },
    h1: {
      fontWeight: 'bold',
      fontSize: 18,
      marginBottom: commonValues.sizes.small,
    },
    h2: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: commonValues.sizes.small,
    },
    profileSubheader: {
      fontWeight: 'bold',
      color: currentTheme.foregroundSecondary,
      marginVertical: 5,
    },
  });
};
