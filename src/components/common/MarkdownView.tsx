import {StyleSheet, View} from 'react-native';

import spoilerPlugin from '@traptitech/markdown-it-spoiler';
import Markdown, {
  hasParents,
  MarkdownIt,
} from '@rexovolt/react-native-markdown-display';

import {app} from '@rvmob/Generic';
import {commonValues, currentTheme} from '@rvmob/Theme';
import {Text} from './atoms';
import {Spoiler, SpoilerContext, SpoilerWrapper} from './markdown/Spoiler';
import {renderEmoji} from './messaging/Emoji';
import {openUrl} from '@rvmob/lib/utils';

const defaultMarkdownIt = MarkdownIt({linkify: true})
  .disable(['image'])
  .use(spoilerPlugin);

const defaultStyles = StyleSheet.create({
  body: {
    fontFamily: 'Open Sans',
    color: currentTheme.foregroundPrimary,
  },
  paragraph: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: -3,
    marginBottom: commonValues.sizes.xs,
    fontSize: app.settings.get('ui.messaging.fontSize') as number,
  },
  heading1: {
    fontWeight: 'bold',
  },
  heading2: {
    fontWeight: 'bold',
  },
  heading3: {
    fontWeight: 'bold',
  },
  heading4: {
    fontWeight: 'bold',
  },
  heading5: {
    fontWeight: 'bold',
  },
  heading6: {
    fontWeight: 'bold',
  },
  link: {
    color: currentTheme.accentColor,
  },
  code_inline: {
    fontFamily: 'JetBrains Mono',
    backgroundColor: 'transparent',
    padding: 0,
    borderWidth: 0,
  },
  code_inline_container: {
    // align it properly (see also https://github.com/facebook/react-native/issues/31955)
    transform: [
      {
        translateY: 6,
      },
    ],
    backgroundColor: currentTheme.backgroundSecondary,
    paddingHorizontal: commonValues.sizes.xs,
    borderRadius: commonValues.sizes.small,
  },
  fence: {
    fontFamily: 'JetBrains Mono',
    backgroundColor: currentTheme.backgroundSecondary,
    borderWidth: 0,
    borderRadius: commonValues.sizes.small,
    marginBottom: commonValues.sizes.xs,
  },
  blockquote: {
    marginBottom: commonValues.sizes.xs,
    paddingVertical: 6,
    borderRadius: commonValues.sizes.small,
    borderColor: currentTheme.foregroundPrimary,
    backgroundColor: currentTheme.blockQuoteBackground,
  },
  table: {
    borderTopWidth: 2,
    borderEndWidth: 2,
    borderColor: currentTheme.foregroundSecondary,
    borderRadius: commonValues.sizes.small,
  },
  thead: {
    fontWeight: 'bold',
  },
  th: {
    borderStartWidth: 1,
    borderColor: currentTheme.foregroundSecondary,
  },
  td: {
    borderStartWidth: 1,
    borderColor: currentTheme.foregroundSecondary,
  },
  tr: {
    borderColor: currentTheme.foregroundSecondary,
  },
});

// the text and code_inline rules are the same as the built-in ones,
// except with spoiler/emoji support
const spoilerRule = {
  spoiler: (node, children) => (
    <SpoilerWrapper key={node.key} content={children} />
  ),
  text: (node, children, parent, styles, inheritedStyles = {}) => {
    if (hasParents(parent, 'spoiler')) {
      return (
        <SpoilerContext.Consumer key={node.key}>
          {isRevealed => (
            <Spoiler
              node={node}
              isRevealed={isRevealed}
              styles={styles.text}
              inheritedStyles={inheritedStyles}
            />
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
            <Spoiler
              node={node}
              isRevealed={isRevealed}
              styles={styles.code_inline}
              inheritedStyles={inheritedStyles}
            />
          )}
        </SpoilerContext.Consumer>
      );
    }

    return (
      <View key={node.key} style={{...styles.code_inline_container}}>
        <Text style={{...inheritedStyles, ...styles.code_inline}}>
          {node.content}
        </Text>
      </View>
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
    ...defaultStyles.body,
    ...newProps.style.body,
  };

  newProps.style.paragraph = {
    ...defaultStyles.paragraph,
    ...newProps.style.paragraph,
  };

  newProps.style.heading1 = {
    ...defaultStyles.heading1,
    ...newProps.style.heading1,
  };

  newProps.style.heading2 = {
    ...defaultStyles.heading2,
    ...newProps.style.heading2,
  };

  newProps.style.heading3 = {
    ...defaultStyles.heading3,
    ...newProps.style.heading3,
  };

  newProps.style.heading4 = {
    ...defaultStyles.heading4,
    ...newProps.style.heading4,
  };

  newProps.style.heading5 = {
    ...defaultStyles.heading5,
    ...newProps.style.heading5,
  };

  newProps.style.heading6 = {
    ...defaultStyles.heading6,
    ...newProps.style.heading6,
  };

  newProps.style.link = {
    ...defaultStyles.link,
    ...newProps.style.link,
  };

  newProps.style.code_inline = {
    ...defaultStyles.code_inline,
    ...newProps.style.code_inline,
  };

  newProps.style.code_inline_container = {
    ...defaultStyles.code_inline_container,
    ...newProps.style.code_inline_container,
  };

  newProps.style.fence = {
    ...defaultStyles.fence,
    ...newProps.style.fence,
  };

  newProps.style.blockquote = {
    ...defaultStyles.blockquote,
    ...newProps.style.blockquote,
  };

  newProps.style.table = {
    ...defaultStyles.table,
    ...newProps.style.table,
  };

  newProps.style.thead = {
    ...defaultStyles.thead,
    ...newProps.style.thead,
  };

  newProps.style.th = {
    ...defaultStyles.th,
    ...newProps.style.th,
  };

  newProps.style.td = {
    ...defaultStyles.td,
    ...newProps.style.td,
  };

  newProps.style.tr = {
    ...defaultStyles.tr,
    ...newProps.style.tr,
  };

  try {
    return <Markdown {...newProps}>{newProps.children}</Markdown>;
  } catch (e) {
    return <Text>Error rendering markdown</Text>;
  }
};
