import {createContext, useState} from 'react';

import spoilerPlugin from '@traptitech/markdown-it-spoiler';
import Markdown, {hasParents, MarkdownIt} from 'react-native-markdown-display';

import {app} from '@rvmob/Generic';
import {currentTheme} from '@rvmob/Theme';
import {Text} from './atoms';
import {renderEmoji} from './messaging/Emoji';
import {openUrl} from '@rvmob/lib/utils';

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

const SpoilerContext = createContext(false);
const Spoiler = ({content}) => {
  const [revealed, setRevealed] = useState(false);
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
                /* FIXME: Rendering emoji reveals spoiler markdown
                renderEmoji(node.content)*/
                node.content
              }
            </Text>
          )}
        </SpoilerContext.Consumer>
      );
    }

    return (
      <Text key={node.key} style={{...inheritedStyles, ...styles.text}}>
        {renderEmoji(node.content)}
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

  newProps.style.body = {
    color: currentTheme.foregroundPrimary,
    ...newProps.style.body,
  };

  newProps.style.paragraph = {
    marginTop: -3,
    marginBottom: 2,
    fontSize: app.settings.get('ui.messaging.fontSize'),
    ...newProps.style.paragraph,
  };

  newProps.style.link = {
    color: currentTheme.accentColor,
    ...newProps.style.link,
  };

  newProps.style.code_inline = {
    backgroundColor: currentTheme.backgroundSecondary,
    ...newProps.style.code_inline,
  };

  newProps.style.fence = {
    backgroundColor: currentTheme.backgroundSecondary,
    borderWidth: 0,
    borderRadius: 4,
    marginBottom: 2,
    ...newProps.style.fence,
  };

  newProps.style.code_block = {
    borderColor: currentTheme.foregroundPrimary,
    backgroundColor: currentTheme.backgroundSecondary,
    ...newProps.style.code_block,
  };

  newProps.style.blockquote = {
    marginBottom: 2,
    paddingVertical: 6,
    borderRadius: 4,
    borderColor: currentTheme.foregroundPrimary,
    backgroundColor: currentTheme.blockQuoteBackground,
    ...newProps.style.blockquote,
  };

  try {
    return <Markdown {...newProps}>{newProps.children}</Markdown>;
  } catch (e) {
    return <Text>Error rendering markdown</Text>;
  }
};
