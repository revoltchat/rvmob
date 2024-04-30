import {Text as NativeText /*, TextProps, TextStyle*/} from 'react-native';

import {currentTheme, styles} from '../../../Theme';

// TODO: fix typing issue (the children prop seemingly isn't being set to any) then stop using any for the Text component itself
// type FullTextProps = TextProps & {
//   style?: TextStyle;
//   font?: 'JetBrains Mono' | 'Inter' | 'Open Sans';
//   colour?: string;
//   type?: 'h1' | 'header' | 'h2' | 'profile';
//   children: any;
// };

export const Text = (props: any) => {
  let newProps = {...props};

  if (!props.style) {
    newProps = Object.assign({style: {}}, newProps);
  }

  if (props.type) {
    switch (props.type) {
      case 'header':
      case 'h1':
        newProps.style = Object.assign({}, styles.headerv2, newProps.style);
        break;
      case 'h2':
        newProps.style = Object.assign({}, styles.h2, newProps.style);
        break;
      case 'profile':
        newProps.style = Object.assign(
          {},
          styles.profileSubheader,
          newProps.style,
        );
        break;
      default:
        break;
    }
  }

  if (props.colour) {
    newProps.style!.color = props.colour;
  }

  newProps.style = Object.assign(
    {
      color: currentTheme.foregroundPrimary,
      flexWrap: 'wrap',
      fontFamily: props.font ?? 'Open Sans',
    },
    newProps.style,
  );
  return <NativeText {...newProps}>{newProps.children}</NativeText>;
};
