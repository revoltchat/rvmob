import {StyleSheet} from 'react-native';

import {currentTheme} from '@rvmob/Theme';
import {Text} from './Text';
import {openUrl} from '@rvmob/lib/utils';

type LinkProps = {
  link: string;
  label: string;
  style?: any;
};

export const Link = ({link, label, style}: LinkProps) => {
  let finalStyle = styles.link;
  if (style) {
    finalStyle = {...finalStyle, ...style};
  }

  return (
    <Text onPress={() => openUrl(link)} style={finalStyle}>
      {label}
    </Text>
  );
};

const styles = StyleSheet.create({
  link: {
    color: currentTheme.accentColor,
    textDecorationLine: 'underline',
  },
});
