import {ToastAndroid} from 'react-native';

import {differenceInMinutes} from 'date-fns';
import {Channel, Message} from 'revolt.js';
import {decodeTime} from 'ulid';

import {client} from '../Generic';
import {currentTheme} from '../Theme';
import {DEFAULT_MESSAGE_LOAD_COUNT} from './consts';

/**
 * Returns the correct colour as a HEX string/theme variable. Supports regular HEX colours, client variables (e.g. `var(--accent)`)
 * and gradient roles (which, for now, will return as the first colour from the gradient - this will change if React Native adds support for gradients).
 * @param c The string to check over
 */
export function getColour(c: string) {
  // first check for css variables...
  const isVariable = c.match('var');
  if (isVariable) {
    switch (c) {
      case 'var(--error)':
        return currentTheme.error;
      case 'var(--accent)':
        return currentTheme.accentColorForeground;
      case 'var(--foreground)':
        return currentTheme.foregroundPrimary;
      case 'var(--background)':
        return currentTheme.backgroundPrimary;
      default:
        break;
    }
  }

  // ...then check for gradients
  const gradientRegex = /(linear|conical|radial)-gradient\s*\(/;
  const degRegex = /[0-9]{0,3}deg,\s*/;
  const bracketRegex = /\)\s*(text)?$/;
  const percentRegex = /[0-9]{0,3}%(,|\))?\s*/;

  const isGradient = c.match(gradientRegex);
  if (isGradient) {
    const filteredC = c
      .replace(gradientRegex, '')
      .replace(bracketRegex, '')
      .replace(degRegex, '')
      .replace(percentRegex, '');

    const filteredAsArray = filteredC.split(',');

    console.log(
      `[UTILS] getColour detected a gradient role: ${c}, filtered: ${filteredC}, to array: ${filteredAsArray}, ${filteredAsArray[0]}`,
    );

    if (c.match('linear')) {
      return filteredAsArray[0];
    }

    return c;
  }

  // at this point, c is probably just a regular HEX code so return it directly
  return c;
}

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
  text = text.replace(/:[0-9A-Z]*:/g, ping => {
    let id = ping.slice(1, -1);
    let emoji = client.emojis.get(id);
    if (emoji) {
      return `%EMOJI - [${emoji.name}](${emoji.imageURL}) - EMOJI%`;
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
  return (
    // a message is grouped with the previous message if all of the following is true:
    msg1.author._id === msg2.author._id && // the author is the same
    !(msg2.reply_ids && msg2.reply_ids.length > 0) && // the message is not a reply
    differenceInMinutes(
      // the time difference is less than 7 minutes and
      decodeTime(msg1._id),
      decodeTime(msg2._id),
    ) < 7 &&
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
  ToastAndroid.show(badgeName, ToastAndroid.SHORT);
}
