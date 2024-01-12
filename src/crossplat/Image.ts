import {Image as CoreImage, Platform} from 'react-native';
// import FastImage from 'react-native-fast-image';

// FIXME: this needs to use fastimage on other platforms
export const Image = Platform.OS !== 'web' ? CoreImage : CoreImage;
