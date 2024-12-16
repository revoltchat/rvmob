import { useContext } from 'react';
import {StyleSheet} from 'react-native';

import {Text} from './Text';
import { Theme, ThemeContext } from '@rvmob/lib/themes';
import {openUrl} from '@rvmob/lib/utils';

type LinkProps = {
  link: string;
  label: string;
  style?: any;
};

export const Link = ({link, label, style}: LinkProps) => {
  const {currentTheme} = useContext(ThemeContext);
  const styles = generateLocalStyles(currentTheme);

  let finalStyle = styles.link;
  if (style) {
    finalStyle = {...finalStyle, ...style};
  }

  return (
    <Text
      accessibilityRole={'link'}
      onPress={() => openUrl(link)}
      style={finalStyle}>
      {label}
    </Text>
  );
};

const generateLocalStyles = (currentTheme: Theme) => {

return StyleSheet.create({
  link: {
    color: currentTheme.accentColor,
    textDecorationLine: 'underline',
  },
});
};
