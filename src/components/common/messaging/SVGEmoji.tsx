import {useState} from 'react';
import {StyleSheet} from 'react-native';

import {SvgUri} from 'react-native-svg';

import {Text} from '../atoms';
import {RevoltEmojiDictionary} from '@clerotri/lib/consts';
import {EmojiPacks} from '@clerotri/lib/types';
import {unicodeEmojiURL} from '@clerotri/lib/utils';


export const SVGEmoji = ({id, pack}: {id: string; pack: EmojiPacks}) => {
    const [error, setError] = useState(false);
    if (error) {
      return <Text>{`:${id}:`}</Text>;
    }
    if (Object.hasOwn(RevoltEmojiDictionary, id)) {
      id = RevoltEmojiDictionary[id];
    }
    return (
      <SvgUri
        width={localStyles.emoji.width}
        height={localStyles.emoji.height}
        style={localStyles.emoji}
        uri={unicodeEmojiURL(id, pack)}
        onError={() => setError(true)}
        fallback={<Text>{`:${id}:`}</Text>}
      />
    );
  };


  const localStyles = StyleSheet.create({
    emoji: {
      objectFit: 'contain',
      height: 14,
      width: 14,
      marginRight: 5,
      marginLeft: 1,
      // display: 'block',
      position: 'absolute',
    },
  });
