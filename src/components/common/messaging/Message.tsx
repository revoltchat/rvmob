import React from 'react';
import {Dimensions, Pressable, TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import FastImage from 'react-native-fast-image';

import {formatRelative} from 'date-fns';
import {enGB, enUS} from 'date-fns/locale';
import {Message as RevoltMessage} from 'revolt.js';
import {decodeTime} from 'ulid';

import {
  InviteEmbed,
  MessageEmbed,
  MessageReactions,
  PlatformModerationMessage,
  ReplyMessage,
} from './';
import {app, client, openUrl} from '../../../Generic';
import {Avatar} from '../../../Profile';
import {currentTheme, styles} from '../../../Theme';
import {Text, Username} from '../atoms';
import {MarkdownView} from '../MarkdownView';
import {RE_INVITE, USER_IDS} from '../../../lib/consts';
import {getReadableFileSize, parseRevoltNodes} from '../../../lib/utils';
const Image = FastImage;

type MessageProps = {
  message: RevoltMessage;
  grouped: boolean;
  queued: boolean;
  onUserPress?: any;
  onUsernamePress?: any;
  onLongPress?: any;
};

type ReactionPile = {
  emoji: string;
  reactors: string[];
};

export const Message = observer((props: MessageProps) => {
  const locale = app.settings.get('ui.messaging.use24H') ? enGB : enUS;
  const mentionsUser = props.message.mention_ids?.includes(client.user?._id!);

  // check for invite links, then take the code from each
  const rawInvites = Array.from(
    props.message.content?.matchAll(RE_INVITE) ?? [],
  );
  let invites: string[] = [];
  for (const i of rawInvites) {
    invites.push(i[1]);
  }

  // then do the same with reactions
  const rawReactions = Array.from(props.message.reactions ?? []);
  let reactions: ReactionPile[] = [];
  for (const r of rawReactions) {
    reactions.push({emoji: r[0], reactors: Array.from(r[1])});
  }

  let [error, setError] = React.useState(null as any);
  if (error) {
    return (
      <View key={props.message._id}>
        <Text colour={'#ff4444'}>
          Failed to render message:{'\n'}
          {error?.message}
        </Text>
      </View>
    );
  }
  try {
    if (!props.message.content && props.message.system) {
      return (
        <View key={props.message._id} style={styles.messsageInner}>
          <View
            style={{
              marginTop: app.settings.get(
                'ui.messaging.messageSpacing',
              ) as number,
            }}
          />
          <View style={{flexDirection: 'row'}}>
            {props.message.system.type === 'text' ? (
              <Text>
                <Text style={{fontWeight: 'bold'}}>System message: </Text>
                {props.message.system.content}
              </Text>
            ) : (
              <>
                <Username
                  user={client.users.get(
                    props.message.system.type === 'channel_ownership_changed'
                      ? props.message.system.from
                      : props.message.system.id ?? props.message.system.by,
                  )}
                  server={props.message.channel?.server}
                />
                {props.message.system.type === 'user_joined' ? (
                  <Text> joined</Text>
                ) : props.message.system.type === 'user_left' ? (
                  <Text> left</Text>
                ) : props.message.system.type === 'user_banned' ? (
                  <Text> was banned</Text>
                ) : props.message.system.type === 'user_kicked' ? (
                  <Text> was kicked</Text>
                ) : props.message.system.type === 'user_added' ? (
                  <Text> was added to the group.</Text>
                ) : props.message.system.type === 'user_remove' ? (
                  <Text> was removed from the group.</Text>
                ) : props.message.system.type === 'channel_renamed' ? (
                  <Text>
                    {' '}
                    renamed the channel to{' '}
                    <Text style={{fontWeight: 'bold'}}>
                      {props.message.system.name}
                    </Text>
                    .
                  </Text>
                ) : props.message.system.type ===
                  'channel_description_changed' ? (
                  <Text> changed the channel description.</Text>
                ) : props.message.system.type === 'channel_icon_changed' ? (
                  <Text> changed the channel icon.</Text>
                ) : props.message.system.type ===
                  'channel_ownership_changed' ? (
                  <>
                    <Text> gave ownership of the group to </Text>
                    <Username
                      user={client.users.get(props.message.system.to)}
                      server={props.message.channel?.server}
                    />
                  </>
                ) : null}
              </>
            )}
          </View>
        </View>
      );
    }
    // if (props.queued) {
    //   return (
    //     <Pressable
    //       key={`message-${props.message._id}-outer-pressable`}
    //       style={{opacity: 0.6}}
    //       delayLongPress={750}
    //       onLongPress={props.onLongPress}>
    //       <View
    //         style={{
    //           marginTop: app.settings.get(
    //             'ui.messaging.messageSpacing',
    //           ) as number,
    //         }}
    //       />
    //       {props.message.reply_ids !== null ? (
    //         <View
    //           key={`message-${props.message._id}-replies`}
    //           style={styles.repliedMessagePreviews}>
    //           {props.message.reply_ids.map(id => (
    //             <ReplyMessage
    //               key={`message-${props.message._id}-reply-${id}`}
    //               message={client.messages.get(id)}
    //             />
    //           ))}
    //         </View>
    //       ) : null}
    //       <View style={props.grouped ? styles.messageGrouped : styles.message}>
    //         {!props.grouped ? (
    //           <Avatar
    //             key={`message-${props.message._id}-avatar-nongrouped`}
    //             user={client.user}
    //             masquerade={props.message.masquerade?.avatar}
    //             server={props.message.channel?.server}
    //             size={35}
    //             {...(app.settings.get('ui.messaging.statusInChatAvatars')
    //               ? {status: true}
    //               : {})}
    //           />
    //         ) : null}
    //         <View style={styles.messageInner}>
    //           {!props.grouped ? (
    //             <View style={{flexDirection: 'row'}}>
    //               <Username
    //                 user={client.user}
    //                 server={props.message.channel?.server}
    //                 masquerade={props.message.masquerade?.name}
    //               />
    //               <Text style={styles.timestamp}>
    //                 {' '}
    //                 {formatRelative(
    //                   decodeTime(props.message.nonce!),
    //                   new Date(),
    //                   {locale: locale},
    //                 )}
    //               </Text>
    //             </View>
    //           ) : null}
    //           <MarkdownView>{props.message.content}</MarkdownView>
    //         </View>
    //       </View>
    //     </Pressable>
    //   );
    // }
    if (props.message.channel?.recipient?._id === USER_IDS.platformModeration) {
      return (
        <TouchableOpacity
          key={props.message._id}
          activeOpacity={0.8}
          delayLongPress={750}
          onLongPress={props.onLongPress}>
          <View
            style={{
              marginTop: app.settings.get(
                'ui.messaging.messageSpacing',
              ) as number,
            }}
          />
          <PlatformModerationMessage message={props.message} />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        key={props.message._id}
        activeOpacity={0.8}
        delayLongPress={750}
        onLongPress={
          props.message.author?.relationship === 'Blocked'
            ? null
            : props.onLongPress
        }>
        <View
          style={{
            marginTop: props.grouped
              ? 0
              : (app.settings.get('ui.messaging.messageSpacing') as number),
          }}
        />
        {props.message.author?.relationship === 'Blocked' ? (
          <>
            <View
              key={`message-${props.message._id}-blocked-divider-top`}
              style={{
                marginBottom: 4,
                height: 1,
                backgroundColor: currentTheme.foregroundTertiary,
              }}
            />
            <View
              key={`message-${props.message._id}-blocked`}
              style={{
                backgroundColor: currentTheme.background,
                borderRadius: 4,
                padding: 6,
              }}>
              <Text style={{marginLeft: 40}}>Blocked message</Text>
            </View>
            <View
              key={`message-${props.message._id}-blocked-divider-bottom`}
              style={{
                marginTop: 4,
                height: 1,
                backgroundColor: currentTheme.foregroundTertiary,
              }}
            />
          </>
        ) : (
          <>
            {props.message.reply_ids !== null ? (
              <View style={styles.repliedMessagePreviews}>
                {props.message.reply_ids.map(id => (
                  <ReplyMessage
                    key={id}
                    message={client.messages.get(id)}
                    mention={props.message?.mention_ids?.includes(
                      props.message?.author_id,
                    )}
                    showSymbol={true}
                  />
                ))}
              </View>
            ) : null}
            <View
              style={{
                ...(props.grouped ? styles.messageGrouped : styles.message),
                ...(mentionsUser
                  ? {
                      borderColor: currentTheme.mentionBorder,
                      backgroundColor: currentTheme.mentionBackground,
                    }
                  : null),
              }}>
              {props.message.author && !props.grouped ? (
                <Pressable
                  key={`message-${props.message._id}-avatar`}
                  onPress={() => props.onUserPress()}>
                  <Avatar
                    user={props.message.author}
                    masquerade={props.message.generateMasqAvatarURL()}
                    server={props.message.channel?.server}
                    size={35}
                    {...(app.settings.get('ui.messaging.statusInChatAvatars')
                      ? {status: true}
                      : {})}
                  />
                </Pressable>
              ) : null}
              <View
                key={`message-${props.message._id}-inner`}
                style={styles.messageInner}>
                {props.grouped && props.message.edited ? (
                  <Text
                    key={`message-${props.message._id}-edited`}
                    colour={currentTheme.foregroundTertiary}
                    style={{
                      fontSize: 11,
                      position: 'relative',
                      right: 47,
                      marginBottom: -16,
                    }}>
                    {' '}
                    (edited)
                  </Text>
                ) : null}
                {props.message.author && !props.grouped ? (
                  <View
                    key={`message-${props.message._id}-info-row`}
                    style={{flexDirection: 'row'}}>
                    <Pressable
                      key={`message-${props.message._id}-username-pressable`}
                      onPress={props.onUsernamePress}>
                      <Username
                        key={`message-${props.message._id}-username`}
                        user={props.message.author}
                        server={props.message.channel?.server}
                        masquerade={props.message.masquerade?.name}
                      />
                    </Pressable>
                    <Text
                      key={`message-${props.message._id}-timestamp`}
                      style={styles.timestamp}>
                      {' '}
                      {formatRelative(
                        decodeTime(props.message._id),
                        new Date(),
                        {
                          locale: locale,
                        },
                      )}
                    </Text>
                    {props.message.edited && (
                      <Text
                        key={`message-${props.message._id}-edited`}
                        colour={currentTheme.foregroundTertiary}
                        style={{
                          fontSize: 12,
                          position: 'relative',
                          top: 2,
                          left: 2,
                        }}>
                        {' '}
                        (edited)
                      </Text>
                    )}
                  </View>
                ) : null}
                {props.message.content ? (
                  <MarkdownView
                    key={`message-${props.message._id}-rendered-content`}>
                    {parseRevoltNodes(props.message.content)}
                  </MarkdownView>
                ) : null}
                {props.message.attachments?.map(a => {
                  if (a.metadata?.type === 'Image') {
                    let width = a.metadata.width;
                    let height = a.metadata.height;
                    if (width > Dimensions.get('screen').width - 75) {
                      let sizeFactor =
                        (Dimensions.get('screen').width - 75) / width;
                      width = width * sizeFactor;
                      height = height * sizeFactor;
                    }
                    return (
                      <Pressable
                        key={`message-${props.message._id}-image-${a._id}`}
                        onPress={() => app.openImage(a)}>
                        <Image
                          source={{uri: client.generateFileURL(a)}}
                          resizeMode={FastImage.resizeMode.contain}
                          style={{
                            width: width,
                            height: height,
                            marginBottom: 4,
                            borderRadius: 3,
                          }}
                        />
                      </Pressable>
                    );
                  } else {
                    return (
                      <Pressable
                        key={`message-${props.message._id}-attachment-${a._id}`}
                        onPress={() => openUrl(client.generateFileURL(a)!)}>
                        <View
                          style={{
                            padding: 12,
                            borderRadius: 4,
                            backgroundColor: currentTheme.backgroundSecondary,
                            marginBottom: 15,
                          }}>
                          <Text style={{fontWeight: 'bold'}}>{a.filename}</Text>
                          <Text>{getReadableFileSize(a.size)}</Text>
                        </View>
                      </Pressable>
                    );
                  }
                })}
                {invites?.map(i => {
                  return (
                    <InviteEmbed
                      key={`message-${props.message._id}-invite-${i}`}
                      message={props.message}
                      invite={i}
                    />
                  );
                })}
                {props.message.embeds?.map(e => {
                  return (
                    <MessageEmbed
                      key={`message-${
                        props.message._id
                      }-embed-${Math.random()}`}
                      embed={e}
                    />
                  );
                })}
                {app.settings.get('ui.messaging.showReactions') ? (
                  <MessageReactions msg={props.message} reactions={reactions} />
                ) : null}
              </View>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  } catch (e) {
    setError(e);
    console.error(e);
  }
  return null;
});
