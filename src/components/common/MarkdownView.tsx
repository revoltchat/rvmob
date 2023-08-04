import React from 'react';

import spoilerPlugin from '@traptitech/markdown-it-spoiler';
import Markdown, {hasParents, MarkdownIt} from 'react-native-markdown-display';
import {SvgUri} from 'react-native-svg';
import FastImage from 'react-native-fast-image';
import {
  RE_UNICODE_EMOJI,
  RE_DEFAULT_EMOJI,
  RE_CUSTOM_EMOJI,
} from '../../lib/emojis';
import {unicodeEmojiURL, RevoltEmojiDictionary} from 'revkit'
import {openUrl, client, app} from '../../Generic';
import {currentTheme, styles} from '../../Theme';
import {Text} from './atoms';

const defaultMarkdownIt = MarkdownIt({typographer: true, linkify: true})
  .disable(['image'])
  .use(spoilerPlugin);

const spoilerStyle = {
  hiddenSpoiler: {
    backgroundColor: '#000',
    color: 'transparent',
  },
  revealedSpoiler: {
    backgroundColor: currentTheme.backgroundSecondary,
    color: currentTheme.foregroundPrimary,
  },
};

const SpoilerContext = React.createContext();
const Spoiler = ({content}) => {
  const [revealed, setRevealed] = React.useState(false);
  return (
    <SpoilerContext.Provider value={revealed}>
      <Text onPress={() => setRevealed(!revealed)}>{content}</Text>
    </SpoilerContext.Provider>
  );
};
const SvgEmoji = ({id, pack}) => {
  const [fail, setFail] = React.useState(false);
  if (fail) return <Text>{`:${id}:`}</Text>;
  if (Object.hasOwn(RevoltEmojiDictionary, id)) id = RevoltEmojiDictionary[id];
  return (
    <SvgUri
      width={styles.emoji.width}
      height={styles.emoji.height}
      style={styles.emoji}
      uri={unicodeEmojiURL(id, pack)}
      onError={() => setFail(true)}
    />
  );
};
const CustomEmoji = ({id}) => {
  const [fail, setFail] = React.useState(false);
  if (fail) return <Text>{`:${id}:`}</Text>;
  return (
    <FastImage
      style={styles.emoji}
      source={{uri: `${client.configuration.features.autumn.url}/emojis/${id}`}}
      onError={()=>setFail(true)}
    />
  );
};

// the text and code_inline rules are the same as the built-in ones,
// except with spoiler support
const spoilerRule = {
  spoiler: (node, children) => <Spoiler key={node.key} content={children} />,
  text: (node, children, parent, styles, inheritedStyles = {}) => {
    if (hasParents(parent, 'spoiler')) {
      return (
        <SpoilerContext.Consumer key={node.key}>
          {isRevealed => (
            <Text
              style={{
                ...inheritedStyles,
                ...styles.text,
                ...(isRevealed
                  ? spoilerStyle.revealedSpoiler
                  : spoilerStyle.hiddenSpoiler),
              }}
            >
              {
                /* FIXME: Rendering emojis reveals spoiler markdown
                renderEmojis(node.content)*/
                node.content
              }
            </Text>
          )}
        </SpoilerContext.Consumer>
      );
    }

    return (
      <Text key={node.key} style={{...inheritedStyles, ...styles.text}}>
        {renderEmojis(node.content)}
      </Text>
    );
  },
  code_inline: (node, children, parent, styles, inheritedStyles = {}) => {
    if (hasParents(parent, 'spoiler')) {
      return (
        <SpoilerContext.Consumer key={node.key}>
          {isRevealed => (
            <Text
              style={{
                ...inheritedStyles,
                ...styles.code_inline,
                ...(isRevealed
                  ? spoilerStyle.revealedSpoiler
                  : spoilerStyle.hiddenSpoiler),
              }}
            >
              {node.content}
            </Text>
          )}
        </SpoilerContext.Consumer>
      );
    }

    return (
      <Text key={node.key} style={{...inheritedStyles, ...styles.code_inline}}>
        {node.content}
      </Text>
    );
  },
};

/* Can this function be more efficient? */
function renderEmojis(content: string): Array<SvgEmoji | CustomEmoji | Text> {
  const tokens = content.split(RE_CUSTOM_EMOJI);
  const emojiPack = app.settings.get('ui.messaging.emojiPack')
  const elements = tokens.flatMap((part, index) => {
    if (index % 2 == 1) return <CustomEmoji key={index} id={part} />;
    let subparts = part.split(RE_DEFAULT_EMOJI)
    if(emojiPack != 'system'){
        subparts = subparts.map((id, i) =>
        i % 2 == 1 ? <SvgEmoji key={`default-emoji-${i}`} id={id} pack={emojiPack} /> : id,
        ).filter(t => t).flatMap(s => {
              if (typeof s != 'string') return s;
              let emojis = s.match(RE_UNICODE_EMOJI);
              if (emojis) {
                let text = s.split(RE_UNICODE_EMOJI);
                emojis = emojis.map((u, i) => (
                  <SvgEmoji key={`unicode-emoji-${i}`} id={u} pack={emojiPack} />
                ));
                for (let i = 0; i < text.length; i++) {
                  if (text[i])
                    emojis.splice(2 * i, 0, text[i]);
                }
                return emojis;
              }
              return s;
            });
    }else{
        subparts = subparts.map((id, i)=> i%2==1 ? (RevoltEmojiDictionary[id]??`:${id}:`) : id)
    }
    return subparts;
  });
  return elements.length > 1 ? elements : elements[0];
}

export const MarkdownView = (props: any) => {
  let newProps = {...props};
  if (!newProps.onLinkPress) {
    newProps = Object.assign({onLinkPress: openUrl}, newProps);
  }
  if (!newProps.markdownit) {
    newProps = Object.assign({markdownit: defaultMarkdownIt}, newProps);
  }
  if (!newProps.rules) {
    newProps = Object.assign({rules: spoilerRule}, newProps);
  }
  if (!newProps.style) {
    newProps = Object.assign({style: {}}, newProps);
  }
  if (!newProps.style.body) {
    newProps.style = Object.assign({body: {}}, newProps.style);
  }
  newProps.style.body = Object.assign(
    {color: currentTheme.foregroundPrimary},
    newProps.style.body,
  );
  if (!newProps.style.paragraph) {
    newProps.style = Object.assign({paragraph: {}}, newProps.style);
  }
  newProps.style.paragraph = Object.assign(
    {color: currentTheme.foregroundPrimary, marginTop: -3, marginBottom: 2},
    newProps.style.paragraph,
  );
  if (!newProps.style.link) {
    newProps.style = Object.assign({link: {}}, newProps.style);
  }
  newProps.style.link = Object.assign(
    {color: currentTheme.accentColor},
    newProps.style.link,
  );
  if (!newProps.style.code_inline) {
    newProps.style = Object.assign({code_inline: {}}, newProps.style);
  }
  newProps.style.code_inline = Object.assign(
    {
      color: currentTheme.foregroundPrimary,
      backgroundColor: currentTheme.backgroundSecondary,
    },
    newProps.style.code_inline,
  );
  if (!newProps.style.fence) {
    newProps.style = Object.assign({fence: {}}, newProps.style);
  }
  newProps.style.fence = Object.assign(
    {
      color: currentTheme.foregroundPrimary,
      backgroundColor: currentTheme.backgroundSecondary,
      borderWidth: 0,
    },
    newProps.style.fence,
  );
  if (!newProps.style.code_block) {
    newProps.style = Object.assign({code_block: {}}, newProps.style);
  }
  newProps.style.code_block = Object.assign(
    {
      borderColor: currentTheme.foregroundPrimary,
      color: currentTheme.foregroundPrimary,
      backgroundColor: currentTheme.backgroundSecondary,
    },
    newProps.style.code_block,
  );
  if (!newProps.style.blockquote) {
    newProps.style = Object.assign({blockquote: {}}, newProps.style);
  }
  newProps.style.blockquote = Object.assign(
    {
      marginBottom: 2,
      paddingVertical: 6,
      borderRadius: 4,
      borderColor: currentTheme.foregroundPrimary,
      color: currentTheme.foregroundPrimary,
      backgroundColor: currentTheme.blockQuoteBackground,
    },
    newProps.style.block_quote,
  );
  try {
    return <Markdown {...newProps}>{newProps.children}</Markdown>;
  } catch (e) {
    return <Text>Error rendering markdown</Text>;
  }
};
