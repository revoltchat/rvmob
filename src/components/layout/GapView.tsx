import React from 'react';
import {View} from 'react-native';

export const GapView = ({
  size,
  type,
}: {
  size: number;
  type?: 'vertical' | 'horizontal';
}) => {
  const marginType = type ?? 'vertical';
  const margin =
    marginType === 'horizontal'
      ? {marginHoriztonal: size}
      : {marginVertical: size};
  return <View style={margin} />;
};
