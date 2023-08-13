import React from 'react';

import FastImage from 'react-native-fast-image';
import {SvgUri} from 'react-native-svg';

import {EmojiPacks, RevoltEmojiDictionary, unicodeEmojiURL} from 'revkit';

import {client, app} from '../../../Generic';
import {styles} from '../../../Theme';
import {Text} from '../atoms';
import {
  RE_CUSTOM_EMOJI,
  RE_DEFAULT_EMOJI,
  RE_UNICODE_EMOJI,
} from '../../../lib/consts';

export const SvgEmoji = ({id, pack}: {id: string; pack: EmojiPacks}) => {
  const [fail, setFail] = React.useState(false);
  if (fail) {
    return <Text>{`:${id}:`}</Text>;
  }
  if (Object.hasOwn(RevoltEmojiDictionary, id)) {
    id = RevoltEmojiDictionary[id];
  }
  return (
    <SvgUri
      width={styles.emoji.width}
      height={styles.emoji.height}
      style={styles.emoji}
      uri={unicodeEmojiURL(id, pack)}
      onError={() => setFail(true)}
      fallback={<Text>{`:${id}:`}</Text>}
    />
  );
};
export const CustomEmoji = ({id}: {id: string}) => {
  const [fail, setFail] = React.useState(false);
  if (fail) {
    return <Text>{`:${id}:`}</Text>;
  }
  return (
    <FastImage
      style={styles.emoji}
      source={{
        uri: `${client.configuration?.features.autumn.url}/emojis/${id}`,
      }}
      onError={() => setFail(true)}
    />
  );
};
export function emojiPlugin(md) {
  function tokenize(state, silent) {
    let pos = state.pos,
      marker = state.src.charCodeAt(pos);
    if (marker != 0x3a) return false;
    let start = pos,
      max = state.posMax;
    pos++;
    while (pos < max && state.src.charCodeAt(pos) == 0x3a) {
      pos++;
    }
    marker = state.src.slice(start, pos);
    let openerLength = marker.length,
      matchEnd = pos,
      matchStart;
    while ((matchStart = state.src.indexOf(':', matchEnd)) != -1) {
      matchEnd = matchStart + 1;
      let closerLength = matchEnd - matchStart;
      let token;
      if (openerLength == closerLength) {
        if (!silent) {
          const id = state.src.slice(pos, matchStart).replace(/^ (.+) $/, '$1');
          if (/[A-Z0-9]{26}/.test(id)) {
            token = state.push('cemoji', '', 0);
          } else {
            token = state.push('uemoji', '', 0);
          }
          token.markup = marker;
          token.content = id;
        }
        state.pos = matchEnd;
        return true;
      }
    }
    if (!silent) state.pending += marker;
    state.pos += openerLength;
    return true;
  }
  md.inline.ruler.after('emphasis', 'emoji', tokenize);
}
