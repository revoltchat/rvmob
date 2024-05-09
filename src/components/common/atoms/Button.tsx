import {TouchableOpacity} from 'react-native';

import {styles} from '@rvmob/Theme';

type ButtonProps = {
  children?: any;
  backgroundColor?: string;
  onPress?: any;
  onLongPress?: any;
  delayLongPress?: number;
  style?: any;
};

export function Button({
  children,
  backgroundColor,
  onPress,
  onLongPress,
  delayLongPress,
  style,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      style={[styles.button, backgroundColor ? {backgroundColor} : {}, style]}
      {...props}>
      {children}
    </TouchableOpacity>
  );
}
