import {Text as NativeText, type TextProps} from 'react-native';

import {currentTheme, styles} from '@rvmob/Theme';

type FullTextProps = TextProps & {
  font?: 'JetBrains Mono' | 'Inter' | 'Open Sans';
  colour?: string;
  type?: 'h1' | 'header' | 'h2' | 'profile';
};

export const Text = (props: FullTextProps) => {
  let newProps = {...props};

  if (!props.style) {
    newProps = {style: {}, ...newProps};
  }

  if (props.type) {
    switch (props.type) {
      case 'header':
      case 'h1':
        // @ts-expect-error the type error seems to be related to the various ways you can specify style props but it works so shhhh
        newProps.style = {...styles.headerv2, ...newProps.style};
        break;
      case 'h2':
        // @ts-expect-error ditto
        newProps.style = {...styles.h2, ...newProps.style};
        break;
      case 'profile':
        // @ts-expect-error ditto
        newProps.style = {...styles.profileSubheader, ...newProps.style};
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
    color: currentTheme.foregroundPrimary,
    flexWrap: 'wrap',
    fontFamily: props.font ?? 'Open Sans',
    // @ts-expect-error ditto
    ...newProps.style,
  };

  return <NativeText {...newProps}>{newProps.children}</NativeText>;
};
