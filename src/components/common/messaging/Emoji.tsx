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

export function renderEmojis(content: string) {
  const tokens = content.split(RE_CUSTOM_EMOJI);

  // get the emoji pack; default to system
  const rawEmojiPack = app.settings.get('ui.messaging.emojiPack');
  const emojiPack = (rawEmojiPack?.toString().toLowerCase() || 'system') as
    | EmojiPacks
    | 'system';

  const elements = tokens.flatMap((part, index) => {
    if (index % 2 === 1) {
      return <CustomEmoji key={index} id={part} />;
    }
    const subparts = part.split(RE_DEFAULT_EMOJI);
    console.log(subparts);
    let renderedSubparts;
    if (emojiPack !== 'system') {
      renderedSubparts = subparts
        .map((id, i) =>
          i % 2 === 1 ? (
            <SvgEmoji key={`${id}-${i}`} id={id} pack={emojiPack} />
          ) : (
            id
          ),
        )
        .filter(t => t)
        .flatMap(s => {
          if (typeof s !== 'string') {
            return s;
          }
          let emojis = s.match(RE_UNICODE_EMOJI);
          if (emojis) {
            let text = s.split(RE_UNICODE_EMOJI);
            emojis = emojis.map((u, i) => (
              <SvgEmoji
                key={`unicode-emoji-${i}-${Math.random()}`}
                id={u}
                pack={emojiPack}
              />
            ));
            for (let i = 0; i < text.length; i++) {
              emojis.splice(2 * i, 0, text[i]);
            }
            return emojis;
          }
          return s;
        });
    } else {
      renderedSubparts = subparts.map((id, i) =>
        i % 2 === 1 ? RevoltEmojiDictionary[id] ?? `:${id}:` : id,
      );
    }
    return renderedSubparts;
  });
  return elements.length > 1 ? elements : elements[0];
}
