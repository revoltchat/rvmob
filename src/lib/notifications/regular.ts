import notifee, {EventType} from '@rexovolt/notifee';

import type {Client, Message} from 'revolt.js';

export async function createChannel() {
  const channel = (await notifee.getChannel('rvmob'))
    ? 'rvmob'
    : await notifee.createChannel({
        id: 'rvmob',
        name: 'RVMob',
      });
  return channel;
}

export function setUpNotifeeListener(client: Client, setState: any) {
  notifee.onBackgroundEvent(async ({type, detail}) => {
    const {notification /*, pressAction */} = detail;
    if (type === EventType.PRESS) {
      console.log(
        `[NOTIFEE] User pressed on ${notification?.data?.channel}/${notification?.data?.messageID}`,
      );
      const notifChannel = client.channels.get(
        notification?.data?.channel as string,
      );
      setState({
        currentChannel: notifChannel ?? null,
      });
      await notifee.cancelNotification(notification!.id!);
    }
  });
}

export async function sendNotifeeNotification(
  msg: Message,
  client: Client,
  defaultNotif: string,
) {
  let notifs = (await notifee.getDisplayedNotifications()).filter(
    n => n.id === msg.channel?._id,
  );
  const title = `${
    msg.channel?.server?.name
      ? `#${msg.channel.name} (${msg.channel.server.name})`
      : msg.channel?.channel_type === 'Group'
      ? `${msg.channel.name}`
      : `@${msg.channel?.recipient?.username}`
  }`;

  try {
    notifee.displayNotification({
      title: title,
      data: {
        channel: msg.channel?._id ?? 'UNKNOWN',
        messageID: msg._id,
      },
      body:
        `<b>${msg.author?.username}</b>: ` +
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
        color: '#1AD4B2',
        smallIcon: 'ic_launcher_monochrome',
        largeIcon:
          msg.channel?.server?.generateIconURL() ||
          msg.author?.generateAvatarURL(),
        pressAction: {
          id: 'default',
          launchActivity: 'site.endl.taiku.rvmob.MainActivity',
        },
        channelId: defaultNotif,
      },
      id: msg.channel?._id,
    });
  } catch (notifErr) {
    console.log(`[NOTIFEE] Error sending notification: ${notifErr}`);
  }
}
