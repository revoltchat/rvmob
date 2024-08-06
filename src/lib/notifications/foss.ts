import type {Client, Message} from 'revolt.js';

export async function createChannel() {
  return 'FOSS_FAKE_CHANNEL';
}

export function setUpNotifeeListener(_client: Client, _setState: any) {
  () => {};
}

export async function sendNotifeeNotification(
  _msg: Message,
  _client: Client,
  _defaultNotif: string,
) {
  () => {};
}
