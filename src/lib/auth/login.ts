import AsyncStorage from '@react-native-async-storage/async-storage';

import {decodeTime} from 'ulid';

import {client} from '@rvmob/Generic';

export async function loginRegular(state: any) {
  state.setState({status: 'tryingLogin'});
  try {
    console.log('[AUTH] Attempting login with email and password...');
    let session = await client.api.post('/auth/session/login', {
      email: state.state.emailInput,
      password: state.state.passwordInput,
      friendly_name: 'RVMob',
    });

    // check if account is disabled; if not, prompt for MFA verificaiton if necessary
    if (session.result === 'Disabled') {
      console.log(
        '[AUTH] Account is disabled; need to add a proper handler for state',
      );
    } else if (session.result === 'MFA') {
      if (state.state.tfaTicket === '') {
        console.log(
          `[AUTH] MFA required; prompting for code... (ticket: ${session.ticket})`,
        );
        return state.setState({
          status: 'awaitingLogin',
          askForTFACode: true,
          tfaTicket: session.ticket,
        });
      } else {
        try {
          console.log(
            `[AUTH] Attempting to log in with MFA (code: ${state.state.tfaInput})`,
          );
          const isRecovery = state.state.tfaInput.length > 7;
          console.log(`[AUTH] Using recovery code: ${isRecovery}`);
          session = await client.api.post('/auth/session/login', {
            mfa_response: isRecovery
              ? {recovery_code: state.state.tfaInput}
              : {totp_code: state.state.tfaInput},
            mfa_ticket: state.state.tfaTicket,
            friendly_name: 'RVMob',
          });
          console.log(`[AUTH] Result: ${session.result}`);
          if (session.result !== 'Success') {
            throw Error;
          }
          const token = session.token;
          console.log('[AUTH] Logging in with a new token...');
          await client.useExistingSession({
            token: token,
          });
          await AsyncStorage.setItem('token', token);
          console.log('[AUTH] Successfuly logged in and saved the token!');
          state.setState({
            status: 'loggedIn',
            tokenInput: '',
            passwordInput: '',
            emailInput: '',
            tfaInput: '',
            logInError: null,
            tfaTicket: '',
            askForTFACode: false,
          });
        } catch (err) {
          state.setState({logInError: err});
        }
      }
    } else {
      const token = session.token;
      console.log('[AUTH] Logging in with a new token...');
      await client.useExistingSession({token: token});
      await AsyncStorage.setItem('token', token);
      console.log('[AUTH] Successfuly logged in and saved the token!');
      state.setState({
        status: 'loggedIn',
        tokenInput: '',
        passwordInput: '',
        emailInput: '',
        tfaInput: '',
        logInError: null,
        tfaTicket: '',
        askForTFACode: false,
      });
    }
  } catch (e) {
    console.error(e);
    state.setState({
      logInError: e,
      status: 'awaitingLogin',
    });
  }
}

export async function loginWithToken(state: any) {
  state.setState({status: 'tryingLogin'});
  try {
    // check if this is *actually* the user's ID before doing anything
    console.log(decodeTime(state.state.tokenInput));
    state.setState({
      logInError: 'That is a user ID, not a token.',
      status: 'awaitingLogin',
    });
  } catch (e) {
    try {
      await client.useExistingSession({
        token: state.state.tokenInput,
      });
      console.log(`[AUTH] Setting saved token to ${state.state.tokenInput}`);
      AsyncStorage.setItem('token', state.state.tokenInput);
      state.setState({
        status: 'loggedIn',
        tokenInput: '',
        passwordInput: '',
        emailInput: '',
        logInError: null,
      });
    } catch (tokenErr) {
      console.error(tokenErr);
      state.setState({
        logInError: tokenErr,
        status: 'awaitingLogin',
      });
    }
  }
}

export async function loginWithSavedToken(state: any) {
  AsyncStorage.getItem('token', async (err, res) => {
    if (!err) {
      if (typeof res !== 'string') {
        console.log(
          `[AUTH] Saved token was not a string: ${typeof res}, ${res}`,
        );
        state.setState({status: 'awaitingLogin'});
        return;
      }
      try {
        await client.useExistingSession({token: res});
      } catch (e: any) {
        console.log(e);
        !(
          e.message?.startsWith('Read error') || e.message === 'Network Error'
        ) && client.user
          ? state.setState({logInError: e, status: 'awaitingLogin'})
          : state.state.status === 'loggedIn'
          ? state.setState({logInError: e})
          : state.setState({logInError: e, status: 'awaitingLogin'});
      }
    } else {
      console.log(err);
      state.setState({status: 'awaitingLogin'});
    }
  });
}
