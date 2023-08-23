import React from 'react';

import spoilerPlugin from '@traptitech/markdown-it-spoiler';
import Markdown, {hasParents, MarkdownIt} from 'react-native-markdown-display';

import {app, openUrl} from '../../Generic';
import {currentTheme} from '../../Theme';
import {Text} from './atoms';
import {renderEmojis} from './messaging/Emoji';

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
              }}>
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
    {
      color: currentTheme.foregroundPrimary,
      marginTop: -3,
      marginBottom: 2,
      fontSize: app.settings.get('ui.messaging.fontSize'),
    },
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
