import {ToastAndroid} from 'react-native';

import {differenceInMinutes} from 'date-fns';
import {Channel, Message} from 'revolt.js';
import {decodeTime} from 'ulid';

import {client} from '@rvmob/Generic';
import {DEFAULT_MESSAGE_LOAD_COUNT} from '@rvmob/lib/consts';

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
  return (
    // a message is grouped with the previous message if all of the following is true:
    msg1.author._id === msg2.author._id && // the author is the same
    !(msg1.reply_ids && msg1.reply_ids.length > 0) && // the message is not a reply
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
