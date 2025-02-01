import {useState} from 'react';
import {StyleSheet} from 'react-native';

import { SVGEmoji } from './SVGEmoji';
import {Image} from '@clerotri/crossplat/Image';
import {app} from '@clerotri/Generic';
import {client} from '@clerotri/lib/client';
import {Text} from '../atoms';
import {
  RE_CUSTOM_EMOJI,
  RE_DEFAULT_EMOJI,
  RE_UNICODE_EMOJI,
  RevoltEmojiDictionary,
} from '@clerotri/lib/consts';
import {EmojiPacks} from '@clerotri/lib/types';

const CustomEmoji = ({id}: {id: string}) => {
  const [error, setError] = useState(false);
  if (error) {
    return <Text>{`:${id}:`}</Text>;
  }
  return (
    <Image
      style={localStyles.emoji}
      source={{
        uri: `${client.configuration?.features.autumn.url}/emojis/${id}`,
      }}
      onError={() => setError(true)}
    />
  );
};

export function renderEmoji(content: string) {
  const tokens = content.split(RE_CUSTOM_EMOJI);

  // get the emoji pack; default to system
  const rawEmojiPack = app.settings.get('ui.messaging.emojiPack');
  const emojiPack = (rawEmojiPack?.toString().toLowerCase() || 'system') as
    | EmojiPacks
    | 'system';

  const elements = tokens.map((part, index) => {
    if (index % 2 === 1) {
      return <CustomEmoji key={index} id={part} />;
    }

    const subparts = part.split(RE_DEFAULT_EMOJI);
    let renderedSubparts;
    if (emojiPack !== 'system') {
      renderedSubparts = subparts
        .map((id, i) =>
          i % 2 === 1 ? (
            <SVGEmoji key={`${id}-${i}`} id={id} pack={emojiPack} />
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
              <SVGEmoji
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
        i % 2 === 1 ? (RevoltEmojiDictionary[id] ?? `:${id}:`) : id,
      );
    }
    return renderedSubparts;
  });
  return elements.length > 1 ? elements : elements[0];
}

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
