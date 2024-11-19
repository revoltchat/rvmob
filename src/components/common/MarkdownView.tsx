import {createContext, useState} from 'react';
import {Platform} from 'react-native';

import spoilerPlugin from '@traptitech/markdown-it-spoiler';
import Markdown, {hasParents, MarkdownIt} from 'react-native-markdown-display';

import {app} from '@rvmob/Generic';
import {commonValues, currentTheme} from '@rvmob/Theme';
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

// const webCodeStyles = {
//   padding: 0,
//   paddingInline: '2px',
//   border: 'none',
// };

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
    fontFamily: 'Open Sans',
    color: currentTheme.foregroundPrimary,
    ...newProps.style.body,
  };

  newProps.style.paragraph = {
    marginTop: -3,
    marginBottom: commonValues.sizes.xs,
    fontSize: app.settings.get('ui.messaging.fontSize'),
    ...newProps.style.paragraph,
  };

  newProps.style.heading1 = {
    fontWeight: 'bold',
    ...newProps.style.heading1,
  };

  newProps.style.heading2 = {
    fontWeight: 'bold',
    ...newProps.style.heading2,
  };

  newProps.style.heading3 = {
    fontWeight: 'bold',
    ...newProps.style.heading3,
  };

  newProps.style.heading4 = {
    fontWeight: 'bold',
    ...newProps.style.heading4,
  };

  newProps.style.heading5 = {
    fontWeight: 'bold',
    ...newProps.style.heading5,
  };

  newProps.style.heading6 = {
    fontWeight: 'bold',
    ...newProps.style.heading6,
  };

  newProps.style.link = {
    color: currentTheme.accentColor,
    ...newProps.style.link,
  };

  newProps.style.code_inline = {
    fontFamily: 'JetBrains Mono',
    backgroundColor: currentTheme.backgroundSecondary,
    ...(Platform.OS === 'web' && {
      padding: 0,
      paddingInline: '2px',
      border: 'none',
    }),
    ...newProps.style.code_inline,
  };

  newProps.style.fence = {
    fontFamily: 'JetBrains Mono',
    backgroundColor: currentTheme.backgroundSecondary,
    borderWidth: 0,
    borderRadius: commonValues.sizes.small,
    marginBottom: commonValues.sizes.xs,
    ...newProps.style.fence,
  };

  newProps.style.blockquote = {
    marginBottom: commonValues.sizes.xs,
    paddingVertical: 6,
    borderRadius: commonValues.sizes.small,
    borderColor: currentTheme.foregroundPrimary,
    backgroundColor: currentTheme.blockQuoteBackground,
    ...newProps.style.blockquote,
  };

  newProps.style.table = {
    borderTopWidth: 2,
    borderEndWidth: 2,
    borderColor: currentTheme.foregroundSecondary,
    borderRadius: commonValues.sizes.small,
    ...newProps.style.table,
  };

  newProps.style.thead = {
    fontWeight: 'bold',
    ...newProps.style.thead,
  };

  newProps.style.th = {
    borderStartWidth: 1,
    borderColor: currentTheme.foregroundSecondary,
    ...newProps.style.th,
  };

  newProps.style.td = {
    borderStartWidth: 1,
    borderColor: currentTheme.foregroundSecondary,
    ...newProps.style.td,
  };

  newProps.style.tr = {
    borderColor: currentTheme.foregroundSecondary,
    ...newProps.style.tr,
  };

  try {
    return <Markdown {...newProps}>{newProps.children}</Markdown>;
  } catch (e) {
    return <Text>Error rendering markdown</Text>;
  }
};
