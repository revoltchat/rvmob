import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {currentTheme} from '@rvmob/Theme';

type SpecialCIChannel =
  | 'Home'
  | 'Friends'
  | 'Saved Notes'
  | 'Discover'
  | 'Debug';

export const SpecialChannelIcon = ({channel}: {channel: SpecialCIChannel}) => {
  let color = currentTheme.foregroundSecondary;
  switch (channel) {
    case 'Home':
      return <MaterialIcon name="home" size={24} color={color} />;
    case 'Friends':
      return <MaterialIcon name="group" size={24} color={color} />;
    case 'Saved Notes':
      return <MaterialIcon name="sticky-note-2" size={24} color={color} />;
    case 'Discover':
      return <MaterialCommunityIcon name="compass" size={24} color={color} />;
    case 'Debug':
      return <MaterialIcon name="bug-report" size={24} color={color} />;
    default:
      return <></>;
  }
};
