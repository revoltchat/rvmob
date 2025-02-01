import {Platform} from 'react-native';
import {useBackHandler as useBackHandlerCore} from '@react-native-community/hooks/lib/useBackHandler';

const useBackHandler =
  Platform.OS === 'web' ? (_handler: () => boolean) => {} : useBackHandlerCore;

export {useBackHandler};
