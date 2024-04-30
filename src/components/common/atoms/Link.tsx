import {TouchableOpacity} from 'react-native';

import {openUrl} from '../../../Generic';
import {styles} from '../../../Theme';
import {Text} from './Text';

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
