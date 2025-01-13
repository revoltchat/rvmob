import {useContext} from 'react';
import {StyleSheet, View} from 'react-native';

import spoilerPlugin from '@traptitech/markdown-it-spoiler';
import Markdown, {
  hasParents,
  MarkdownIt,
} from '@rexovolt/react-native-markdown-display';

import {app} from '@rvmob/Generic';
import {Text} from './atoms';
import {Spoiler, SpoilerContext, SpoilerWrapper} from './markdown/Spoiler';
import {renderEmoji} from './messaging/Emoji';
import {openUrl} from '@rvmob/lib/utils';
import {commonValues, Theme, ThemeContext} from '@rvmob/lib/themes';

const defaultMarkdownIt = MarkdownIt({linkify: true})
  .disable(['image'])
  .use(spoilerPlugin);

const generateDefaultStyles = (currentTheme: Theme) => {
  return StyleSheet.create({
    body: {
      fontFamily: 'Open Sans',
      color: currentTheme.foregroundPrimary,
    },
    paragraph: {
      flexWrap: 'wrap',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      marginTop: -3,
      marginBottom: commonValues.sizes.xs,
      fontSize: app.settings.get('ui.messaging.fontSize') as number,
      backgroundColor: 'transparent',
    },
    hardbreak: {
      width: '100%',
      height: 1,
    },
    heading1: {
      flexDirection: 'row',
      fontSize: 32,
      fontWeight: 'bold',
      backgroundColor: 'transparent',
    },
    heading2: {
      flexDirection: 'row',
      fontSize: 24,
      fontWeight: 'bold',
      backgroundColor: 'transparent',
    },
    heading3: {
      flexDirection: 'row',
      fontSize: 18,
      fontWeight: 'bold',
      backgroundColor: 'transparent',
    },
    heading4: {
      flexDirection: 'row',
      fontSize: 16,
      fontWeight: 'bold',
      backgroundColor: 'transparent',
    },
    heading5: {
      flexDirection: 'row',
      fontSize: 13,
      fontWeight: 'bold',
      backgroundColor: 'transparent',
    },
    heading6: {
      flexDirection: 'row',
      fontSize: 11,
      fontWeight: 'bold',
      backgroundColor: 'transparent',
    },
    strong: {
      fontWeight: 'bold',
    },
    em: {
      fontStyle: 'italic',
    },
    s: {
      textDecorationLine: 'line-through',
    },
    link: {
      color: currentTheme.accentColor,
      textDecorationLine: 'underline',
    },
    code_inline: {
      fontFamily: 'JetBrains Mono',
      backgroundColor: 'transparent',
      padding: 0,
      borderWidth: 0,
      marginTop: 0,
      marginBottom: 0,
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
      padding: 10,
    },
    blockquote: {
      marginLeft: 0,
      marginBottom: commonValues.sizes.xs,
      borderLeftWidth: 4,
      borderColor: currentTheme.foregroundPrimary,
      borderRadius: commonValues.sizes.small,
      backgroundColor: currentTheme.blockQuoteBackground,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    spoiler: {
      marginTop: 0,
      marginBottom: 0,
    },
    list_item: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      backgroundColor: 'transparent',
    },
    bullet_list_icon: {
      marginHorizontal: 10,
    },
    bullet_list_content: {
      flex: 1,
    },
    ordered_list_icon: {
      marginHorizontal: 10,
    },
    ordered_list_content: {
      flex: 1,
    },
    table: {
      borderWidth: 1,
      borderTopWidth: 2,
      borderEndWidth: 2,
      borderColor: currentTheme.foregroundSecondary,
      borderRadius: commonValues.sizes.small,
    },
    thead: {
      fontWeight: 'bold',
    },
    th: {
      flex: 1,
      padding: 5,
      borderStartWidth: 1,
      borderColor: currentTheme.foregroundSecondary,
    },
    td: {
      flex: 1,
      padding: 5,
      borderStartWidth: 1,
      borderColor: currentTheme.foregroundSecondary,
    },
    tr: {
      borderBottomWidth: 1,
      flexDirection: 'row',
      borderColor: currentTheme.foregroundSecondary,
    },
    hr: {
      backgroundColor: currentTheme.foregroundSecondary,
      height: 1,
    },
  });
};

const shouldRenderTextAsSpoilerText = (parents: any) => {
  if (!hasParents(parents, 'spoiler')) {
    return false;
  }

  // ignore spoilers in links per revite/(mostly) the fact they're borked
  if (hasParents(parents, 'link')) {
    return false;
  }

  let shouldRender = true;
  // check if the spoiler container contains links; if so, mark this as not a spoiler to prevent invisible text
  parents.forEach((parentNode: any) => {
    // skip if we already know if there's a link sibling
    if (shouldRender) {
      if (parentNode.attributes?.class === 'spoiler') {
        const hasLinkSibling =
          parentNode.children.findIndex(
            (childNode: any) => childNode.type === 'link',
          ) !== -1;
        if (hasLinkSibling) {
          shouldRender = false;
        }
      }
    }
  });

  return shouldRender;
};

// the text and code_inline rules are the same as the built-in ones,
// except with spoiler/emoji support
const spoilerRule = {
  spoiler: (node, children, parent) => {
    // ignore spoilers in/containing links per revite/(mostly) the fact they're borked
    const containsLink =
      children.findIndex(el => el.props.accessibilityRole === 'link') !== -1;
    if (!hasParents(parent, 'link') && !containsLink) {
      return <SpoilerWrapper key={node.key} content={children} />;
    }
    return children;
  },
  text: (node, children, parent, styles, inheritedStyles = {}) => {
    const isSpoiler = shouldRenderTextAsSpoilerText(parent);
    if (isSpoiler) {
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
    const isSpoiler = shouldRenderTextAsSpoilerText(parent);
    if (isSpoiler) {
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

    const isInList = hasParents(parent, 'list_item');
    return (
      <View key={node.key} style={{...styles.code_inline_container, ...(isInList && {transform: []})}}>
        <Text style={{...inheritedStyles, ...styles.code_inline}}>
          {node.content}
        </Text>
      </View>
    );
  },
};

export const MarkdownView = (props: any) => {
  const {currentTheme} = useContext(ThemeContext);
  const defaultStyles = generateDefaultStyles(currentTheme);

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

  newProps.style = {
    ...defaultStyles,
    ...newProps.style,
  };

  try {
    return <Markdown {...newProps}>{newProps.children}</Markdown>;
  } catch (e) {
    return <Text>Error rendering markdown</Text>;
  }
};
