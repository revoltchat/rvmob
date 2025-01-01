import { Client } from 'revolt.js';

import { app } from '@rvmob/Generic';
import { DEFAULT_API_URL } from '@rvmob/lib/consts';

function getAPIURL() {
  console.log(`[APP] Initialised settings (${new Date().getTime()})`);
  let url: string = '';
  console.log('[AUTH] Getting API URL...');
  const instance = app.settings.get('app.instance') as string |
    null |
    undefined;
  if (!instance) {
    console.log(
      '[AUTH] Unable to fetch app.instance; setting apiURL to default'
    );
    url = DEFAULT_API_URL;
  } else {
    console.log(`[AUTH] Fetched app.instance; setting apiURL to ${instance}`);
    url = instance;
  }
  return url;
}

const apiURL = getAPIURL();
console.log(`[AUTH] Creating client... (instance: ${apiURL})`);

export let client = new Client({
  unreads: true,
  apiURL: apiURL,
});
