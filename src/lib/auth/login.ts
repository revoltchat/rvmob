import {Platform} from 'react-native';

import type {API} from 'revolt.js';

import {app} from '@clerotri/Generic';
import {client} from '@clerotri/lib/client';
import {storage} from '@clerotri/lib/storage';

import {decodeTime} from 'ulid';

async function connectAndSave(
  session: API.ResponseLogin,
  setStatus: (arg0: 'awaitingLogin' | 'tryingLogin' | 'loggedIn') => void,
  setLoginError: (arg0: any) => void,
) {
  try {
    // this won't happen, but I'm not sure how to tell TypeScript in the param types that session.result will always be Success in the param types and expect-error seems messy here
    if (session.result !== 'Success') {
      throw Error;
    }
    setStatus('tryingLogin');
    const token = session.token;
    console.log('[AUTH] Logging in with a new token...');
    await client.useExistingSession({token: token});
    storage.set('token', token);
    storage.set('sessionID', session._id);
    console.log('[AUTH] Successfuly logged in and saved the token/session ID!');
    setStatus('loggedIn');
  } catch (err) {
    setStatus('awaitingLogin');
    setLoginError(err);
  }
}

export async function loginRegular(
  credentials: {
    email: string;
    password: string;
    tfaCode: string;
    tfaTicket: string;
  },
  setStatus: (
    arg0:
      | 'awaitingInput'
      | 'awaitingLogin'
      | 'checkingCredentials'
      | 'tryingLogin'
      | 'loggedIn',
  ) => void,
  setTicket: (arg0: string) => void,
  setTFAStatus: (arg0: boolean) => void,
  setLoginError: (arg0: any) => void,
) {
  const friendlyName = `Clerotri for ${Platform.OS.charAt(
    0,
  ).toUpperCase()}${Platform.OS.slice(1)}`;

  setStatus('checkingCredentials');

  try {
    console.log('[AUTH] Attempting login with email and password...');
    let session = await client.api.post('/auth/session/login', {
      email: credentials.email,
      password: credentials.password,
      friendly_name: friendlyName,
    });

    // check if account is disabled; if not, prompt for MFA verificaiton if necessary
    if (session.result === 'Disabled') {
      console.log(
        '[AUTH] Account is disabled; need to add a proper handler for state',
      );
      setLoginError('Your account has been disabled');
      return setStatus('awaitingInput');
    } else if (session.result === 'MFA') {
      if (credentials.tfaTicket === '') {
        console.log(
          `[AUTH] MFA required; prompting for code... (ticket: ${session.ticket})`,
        );
        setTicket(session.ticket);
        setTFAStatus(true);
        return setStatus('awaitingInput');
      } else {
        try {
          console.log(
            `[AUTH] Attempting to log in with MFA (code: ${credentials.tfaCode}, ${credentials.tfaTicket})`,
          );
          const isRecovery = credentials.tfaCode.length > 7;
          console.log(`[AUTH] Using recovery code: ${isRecovery}`);
          session = await client.api.post('/auth/session/login', {
            mfa_response: isRecovery
              ? {recovery_code: credentials.tfaCode}
              : {totp_code: credentials.tfaCode},
            mfa_ticket: credentials.tfaTicket,
            friendly_name: friendlyName,
          });
          console.log(`[AUTH] Result: ${session.result}`);
          if (session.result !== 'Success') {
            throw Error;
          }
          await connectAndSave(session, setStatus, setLoginError);
        } catch (err) {
          setLoginError(err);
        }
      }
    } else {
      await connectAndSave(session, setStatus, setLoginError);
    }
  } catch (e) {
    console.error(e);
    setLoginError(e);
    setStatus('awaitingLogin');
  }
}

export async function loginWithToken(
  token: string,
  setStatus: (
    arg0: 'awaitingLogin' | 'checkingCredentials' | 'tryingLogin' | 'loggedIn',
  ) => void,
  setLoginError: (arg0: any) => void,
) {
  setStatus('checkingCredentials');
  try {
    // check if this is *actually* the user's ID before doing anything
    console.log(decodeTime(token));
    setLoginError('That is a user ID, not a token.');
    setStatus('awaitingLogin');
  } catch (e) {
    try {
      await client.useExistingSession({
        token,
      });
      console.log(`[AUTH] Setting saved token to ${token}`);
      storage.set('token', token);
      setStatus('loggedIn');
    } catch (tokenErr) {
      console.error(tokenErr);
      setLoginError(tokenErr);
      setStatus('awaitingLogin');
    }
  }
}

export async function loginWithSavedToken(status: any) {
  try {
    const res = storage.getString('token');
    if (typeof res !== 'string') {
      console.log(`[AUTH] Saved token was not a string: ${typeof res}, ${res}`);
      app.setLoggedOutScreen('loginPage');
      return;
    }
    try {
      await client.useExistingSession({token: res});
    } catch (e: any) {
      console.log(e);
      !(e.message?.startsWith('Read error') || e.message === 'Network Error') &&
      client.user
        ? app.setLoggedOutScreen('loginPage')
        : status === 'loggedIn'
          ? null
          : app.setLoggedOutScreen('loginPage');
    }
  } catch (err) {
    console.log(err);
    app.setLoggedOutScreen('loginPage');
  }
}
