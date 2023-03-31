import React from 'react';
import ReactNative from 'react-native';

import {currentTheme, styles} from '../../../Theme';

export const Text = (props: any) => {
  let newProps = {...props};
  if (!props.style) {
    newProps = Object.assign({style: {}}, newProps);
  }
  const font = newProps.useInter ? 'Inter' : 'Open Sans';
  if (props.type) {
    switch (props.type) {
      case 'header':
        newProps.style = Object.assign({}, styles.headerv2, newProps.style);
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
  return <ReactNative.Text {...newProps}>{newProps.children}</ReactNative.Text>;
};
