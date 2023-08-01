import React from 'react';

import spoilerPlugin from '@traptitech/markdown-it-spoiler';
import Markdown, {hasParents, MarkdownIt} from 'react-native-markdown-display';
import { SvgUri } from 'react-native-svg';
import FastImage from 'react-native-fast-image'
import {emojiDictionary, RE_UNICODE_EMOJI, RE_DEFAULT_EMOJI, RE_CUSTOM_EMOJI, parseEmoji} from '../../lib/emojis'
import {openUrl, client} from '../../Generic';
import {currentTheme, styles} from '../../Theme';
import {Text} from './atoms';

const defaultMarkdownIt = MarkdownIt({typographer: true, linkify: true}).disable(['image']).use(spoilerPlugin)

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
const SvgEmoji = (props)=>{
    const [fail, setFail] = React.useState(false);
    if(fail) return RE_UNICODE_EMOJI.test(id) ? <span>{id}</span> : <span>{`:${props.id}:`}</span>
    return <SvgUri width={styles.emoji.width} height={styles.emoji.height} uri={parseEmoji(props.id in emojiDictionary ? emojiDictionary[props.id] : props.id)} onError={()=>setFail(true)} />
};
const CustomEmoji = (props)=>{
    const [fail, setFail] = React.useState(false);
    if(fail) return <span>{`:${props.id}:`}</span>
    return <FastImage style={styles.emoji} source={{uri: `${client.configuration.features.autumn.url}/emojis/${props.id}`}} fallback={true} />
}

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
              }}>
              {renderEmojis(node.content)}
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
              }}>
              {renderEmojis(node.content)}
            </Text>
          )}
        </SpoilerContext.Consumer>
      );
    }

    return (
      <Text key={node.key} style={{...inheritedStyles, ...styles.code_inline}}>
       {renderEmojis(node.content)}
      </Text>
    );
  },
};
function renderEmojis(content: string): Array<SvgEmoji|CustomEmoji|Text>{
    const tokens = content.split(RE_CUSTOM_EMOJI).flatMap(s=>s.split(RE_DEFAULT_EMOJI))
    const elements = tokens.flatMap((part, index) => {
        if (index % 2 == 1) {
            /* It works when I duplicate */
            if(RE_CUSTOM_EMOJI.test(`:${part}:`)) return <CustomEmoji key={index} id={part} />
            if(RE_CUSTOM_EMOJI.test(`:${part}:`)) return <CustomEmoji key={index} id={part} />
            if(RE_DEFAULT_EMOJI.test(`:${part}:`)) return <SvgEmoji key={index} id={part} />
            if(RE_DEFAULT_EMOJI.test(`:${part}:`)) return <SvgEmoji key={index} id={part} />
            console.log('[MARKDOWN] No match for', part)
        }else{
            let unicode = part.match(RE_UNICODE_EMOJI)
            const text = part.split(RE_UNICODE_EMOJI)
            if(unicode){
                unicode = unicode.map((u,i)=><SvgEmoji key={`emoji-${i}`} id={u} />)
                for(let i = 0;i < text.length; i++) {
                    if(text[i]) unicode.splice(2*i,0,<Text key={`text-${i}`}>{text[i]}</Text>)
                }
                return unicode
           }
        }
        return <Text key={index}>{part}</Text>;
    });
    return elements
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
    newProps = Object.assign({rules:{...spoilerRule}}, newProps);
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
