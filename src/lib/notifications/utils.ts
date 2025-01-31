import type {API} from 'revolt.js';

import {app} from '@clerotri/Generic';
import {client} from '@clerotri/lib/client';
import {sendNotifeeNotification} from '@clerotri/lib/notifications/notifee';
import {sleep} from '@clerotri/lib/utils';

export async function handleMessageNotification(
  msg: API.Message,
  channelNotifications: any,
  serverNotifications: any,
  setState: (message: API.Message | null) => void,
  notifeeChannel: string,
) {
  console.log(`[APP] Handling message ${msg._id}`);

  const pushNotifsEnabled = app.settings.get('app.notifications.enabled');
  const inAppNotifsEnabled = app.settings.get('app.notifications.enabledInApp');

  if (!pushNotifsEnabled && !inAppNotifsEnabled) {
    return;
  }

  const channel = client.channels.get(msg.channel);

  let channelNotif =
    channelNotifications && channel
      ? channelNotifications[channel?._id]
      : undefined;
  let serverNotif =
    serverNotifications && channel?.server
      ? serverNotifications[channel?.server?._id]
      : undefined;

  const isMuted =
    (channelNotif && channelNotif === 'none') ||
    channelNotif === 'muted' ||
    (serverNotif && serverNotif === 'none') ||
    serverNotif === 'muted';

  const alwaysNotif =
    channelNotif === 'all' || (!isMuted && serverNotif === 'all');

  const mentionsUser =
    (msg.mentions?.includes(client.user?._id!) &&
      (app.settings.get('app.notifications.notifyOnSelfPing') ||
        msg.author !== client.user?._id)) ||
    channel?.channel_type === 'DirectMessage';

  const shouldNotif =
    (alwaysNotif &&
      (app.settings.get('app.notifications.notifyOnSelfPing') ||
        msg.author !== client.user?._id)) ||
    (!isMuted && mentionsUser);

  console.log(
    `[NOTIFICATIONS] Should notify for ${msg._id}: ${shouldNotif} (channel/server muted? ${isMuted}, notifications for all messages enabled? ${alwaysNotif}, message mentions the user? ${mentionsUser})`,
  );

  if (shouldNotif) {
    console.log(`[NOTIFICATIONS] Pushing notification for message ${msg._id}`);

    const currentChannel = app.getCurrentChannel();

    if (inAppNotifsEnabled && currentChannel !== channel) {
      setState(msg);
      await sleep(5000);
      setState(null);
    }

    if (pushNotifsEnabled) {
      await sendNotifeeNotification(msg, client, notifeeChannel);
    }
  }
}
