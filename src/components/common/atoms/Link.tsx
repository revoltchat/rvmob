import {TouchableOpacity} from 'react-native';

import {styles} from '@rvmob/Theme';
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
    <TouchableOpacity onPress={() => openUrl(link)}>
      <Text style={finalStyle}>{label}</Text>
    </TouchableOpacity>
  );
};
