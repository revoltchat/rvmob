import React from 'react';
import {Text as NativeText} from 'react-native';

import {currentTheme, styles} from '../../../Theme';

export const Text = (props: any) => {
  let newProps = {...props};
  if (!props.style) {
    newProps = Object.assign({style: {}}, newProps);
  }
  const font = props.useInter ? 'Inter' : 'Open Sans';
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
    newProps.style.color = props.colour;
  }
  newProps.style = Object.assign(
    {
      color: currentTheme.foregroundPrimary,
      flexWrap: 'wrap',
      fontFamily: font,
    },
    newProps.style,
  );
  return <NativeText {...newProps}>{newProps.children}</NativeText>;
};
