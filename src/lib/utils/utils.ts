import {Linking, Platform, ToastAndroid} from 'react-native';

import {differenceInMinutes, isSameDay} from 'date-fns';
import {Channel, Message} from 'revolt.js';
import {decodeTime} from 'ulid';

import {app} from '@rvmob/Generic';
import { client } from '@rvmob/lib/client';
import {
  DEFAULT_MESSAGE_LOAD_COUNT,
  DISCOVER_URL,
  RE_BOT_INVITE,
  RE_INVITE,
  WIKI_URL,
} from '@rvmob/lib/consts';
import {EmojiPacks} from '@rvmob/lib/types';

/**
 * Sleep for the specified amount of milliseconds before continuing.
 * @param ms The amount of time to sleep for in milliseconds
 */
export const sleep = (ms: number | undefined) =>
  new Promise((r: any) => setTimeout(r, ms));

/**
 * Parses the given string for pings, channel links and custom emoji
 * @param text The text to parse
 * @returns The parsed text
 */
export function parseRevoltNodes(text: string) {
  text = text.replace(/<@[0-9A-Z]*>/g, ping => {
    let id = ping.slice(2, -1);
    let user = client.users.get(id);
    if (user) {
      return `[@${user.username}](/@${user._id})`;
    }
    return ping;
  });
  text = text.replace(/<#[0-9A-Z]*>/g, ping => {
    let id = ping.slice(2, -1);
    let channel = client.channels.get(id);
    if (channel) {
      return `[#${channel.name
        ?.split(']')
        .join('\\]')
        .split('[')
        .join('\\[')
        .split('*')
        .join('\\*')
        .split('`')
        .join('\\`')}](/server/${channel.server?._id}/channel/${channel._id})`;
    }
    return ping;
  });
  return text;
}

export function getReadableFileSize(size: number | null) {
  return size !== null
    ? size / 1000000 >= 0.01
      ? `${(size / 1000000).toFixed(2)} MB`
      : size / 10000 >= 0.01
      ? `${(size / 1000).toFixed(2)} KB`
      : `${size} bytes`
    : 'Unknown';
}

export function calculateGrouped(msg1: Message, msg2: Message) {
  // if the author is somehow null don't group the message
  if (!msg1.author || !msg2.author) {
    return false;
  }

  const time1 = decodeTime(msg1._id);
  const time2 = decodeTime(msg2._id);

  return (
    // a message is grouped with the previous message if all of the following statements are true:
    msg1.author._id === msg2.author._id && // the author is the same
    !(msg1.reply_ids && msg1.reply_ids.length > 0) && // the message is not a reply
    differenceInMinutes(time1, time2) < 7 && // the time difference is less than 7 minutes
    isSameDay(time1, time2) && // the messages were sent on the same day and
    (msg2.masquerade // the masquerade is the same
      ? msg2.masquerade.avatar === msg1.masquerade?.avatar &&
        msg2.masquerade.name === msg1.masquerade?.name
      : true)
  );
}

type FetchInput = {
  id?: string;
  type?: 'before' | 'after';
};

export async function fetchMessages(
  channel: Channel,
  input: FetchInput,
  existingMessages: Message[],
  sliceMessages?: false,
) {
  const type = input.type ?? 'before';
  let params = {
    // input.before ? DEFAULT_MESSAGE_LOAD_COUNT / 2 :
    limit: DEFAULT_MESSAGE_LOAD_COUNT,
  } as {limit: number; before?: string; after?: string};
  params[type] = input.id;
  // if (type == "after") {
  //     params.sort = "Oldest"
  // }
  const res = await channel.fetchMessagesWithUsers(params);
  console.log(
    `[FETCHMESSAGES] Finished fetching ${res.messages.length} message(s) for ${channel._id}`,
  );

  let oldMessages = existingMessages;
  if (sliceMessages) {
    if (input.type === 'before') {
      oldMessages = oldMessages.slice(0, DEFAULT_MESSAGE_LOAD_COUNT / 2 - 1);
    } else if (input.type === 'after') {
      oldMessages = oldMessages.slice(
        DEFAULT_MESSAGE_LOAD_COUNT / 2 - 1,
        DEFAULT_MESSAGE_LOAD_COUNT - 1,
      );
    }
  }
  let messages = res.messages.reverse();
  let result =
    input.type === 'before'
      ? messages.concat(oldMessages)
      : input.type === 'after'
      ? oldMessages.concat(messages)
      : messages;
  console.log(
    `[FETCHEDMESSAGES] Finished preparing fetched messages for ${channel._id}`,
  );

  return result;
}

export function showToast(badgeName: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(badgeName, ToastAndroid.SHORT);
  } else {
    console.warn(
      `[UTILS] attempted to show toast outside android (${badgeName}) - implement this !!!`,
    );
  }
}

export const openUrl = (url: string) => {
  console.log(`[FUNCTIONS] Handling URL: ${url}`);
  if (url.startsWith('/@')) {
    console.log(`[FUNCTIONS] Opening user profile from URL: ${url}`);
    let id = url.slice(2);
    let user = client.users.get(id);
    if (user) {
      app.openProfile(user);
    }
    return;
  }
  let match = url.match(RE_INVITE);
  let isDiscover = url.match(DISCOVER_URL);
  let isWiki = url.match(WIKI_URL);
  if (match && !isWiki && !isDiscover) {
    console.log(`[FUNCTIONS] Opening server invite from URL: ${url}`);
    app.openInvite(match[0].split('/').pop());
    return;
  }
  let botmatch = url.match(RE_BOT_INVITE);
  if (botmatch) {
    console.log(`[FUNCTIONS] Opening bot invite from URL: ${url}`);
    app.openBotInvite(botmatch[0].split('/').pop());
    return;
  }
  if (url.startsWith('/bot/')) {
    console.log(`[FUNCTIONS] Opening bot invite from URL: ${url}`);
    const id = url.split('/');
    app.openBotInvite(id[2]);
    return;
  }

  Linking.openURL(url);
};

// <from src=https://github.com/Revolt-Unofficial-Clients/revkit/blob/0af5ab5fea68eba89661685be4fe8a60ca72f90a/core/src/utils/Emojis.ts>
function emojiToCodePoint(rune: string) {
  rune =
    rune.indexOf(String.fromCharCode(0x200d)) < 0
      ? rune.replace(/\uFE0F/g, '')
      : rune;
  const pairs = [];
  let low = 0;
  let i = 0;
  while (i < rune.length) {
    const charCode = rune.charCodeAt(i++);
    if (low) {
      // eslint-disable-next-line no-bitwise
      pairs.push(0x10000 + ((low - 0xd800) << 10) + (charCode - 0xdc00));
      low = 0;
    } else if (charCode >= 0xd800 && charCode <= 0xdbff) {
      low = charCode;
    } else {
      pairs.push(charCode);
    }
  }
  return pairs.map(val => val.toString(16)).join('-');
}

export function unicodeEmojiURL(emoji: string, pack: EmojiPacks = 'mutant') {
  const REVISION = 3;
  return `https://static.revolt.chat/emoji/${pack}/${emojiToCodePoint(
    emoji,
  )}.svg?rev=${REVISION}`;
}
// </from>
