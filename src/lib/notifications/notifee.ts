import notifee, {EventType} from '@notifee/react-native';

import type {API, Client} from 'revolt.js';

import {app} from '@clerotri/Generic';

export async function createChannel() {
  const channel = (await notifee.getChannel('clerotri'))
    ? 'clerotri'
    : await notifee.createChannel({
        id: 'clerotri',
        name: 'Clerotri',
      });

  return channel;
}

export function setUpNotifeeListener(client: Client) {
  notifee.onBackgroundEvent(async ({type, detail}) => {
    const {notification /*, pressAction */} = detail;
    if (type === EventType.PRESS) {
      console.log(
        `[NOTIFEE] User pressed on ${notification?.data?.channel}/${notification?.data?.messageID}`,
      );
      const notifChannel = client.channels.get(
        notification?.data?.channel as string,
      );
      app.openChannel(notifChannel ?? null);
      await notifee.cancelNotification(notification!.id!);
    }
  });
}

export async function sendNotifeeNotification(
  msg: API.Message,
  client: Client,
  defaultNotif: string,
) {
  const channel = client.channels.get(msg.channel);
  const author = client.users.get(msg.author);

  let notifs = (await notifee.getDisplayedNotifications()).filter(
    n => n.id === msg.channel,
  );
  const title = `${
    channel?.server?.name
      ? `#${channel.name} (${channel.server.name})`
      : channel?.channel_type === 'Group'
        ? `${channel.name}`
        : `@${channel?.recipient?.username}`
  }`;

  try {
    notifee.displayNotification({
      title: title,
      data: {
        channel: channel?._id ?? 'UNKNOWN',
        messageID: msg._id,
      },
      body:
        `<b>${author?.username}</b>: ` +
        msg.content
          ?.replaceAll(
            '<@' + client.user?._id + '>',
            '@' + client.user?.username,
          )
          .replaceAll('\\', '\\\\')
          .replaceAll('<', '\\<')
          .replaceAll('>', '\\>') +
        '<br>' +
        (msg.embeds
          ? msg.embeds.map(_e => '[Embed]').join('<br>') + '<br>'
          : '') +
        (msg.attachments
          ? msg.attachments.map(a => a.metadata.type).join('<br>') + '<br>'
          : '') +
        (notifs.length > 0 && notifs[0]?.notification.body
          ? notifs[0].notification.body.split('<br>')?.length > 1
            ? ' <i><br>(and ' +
              (Number.parseInt(
                notifs[0]?.notification.body?.split('<br>')[1].split(' ')[1] ??
                  '',
                10,
              ) +
                1) +
              ' more messages)</i>'
            : ' <i><br>(and 1 more message)</i>'
          : ''),
      android: {
        color: '#0ad3c1',
        smallIcon: 'ic_launcher_monochrome',
        largeIcon:
          channel?.server?.generateIconURL() || author?.generateAvatarURL(),
        pressAction: {
          id: 'default',
          launchActivity: 'app.upryzing.clerotri.MainActivity',
        },
        channelId: defaultNotif,
      },
      id: channel?._id,
    });
  } catch (notifErr) {
    console.log(`[NOTIFEE] Error sending notification: ${notifErr}`);
  }
}
