import {useContext, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {useBackHandler} from '@react-native-community/hooks';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {app} from '@rvmob/Generic';
import { client } from '@rvmob/lib/client';
import {
  BackButton,
  Button,
  Input,
  Link,
  Text,
} from '@rvmob/components/common/atoms';
import {loginRegular, loginWithToken} from '@rvmob/lib/auth';
import {OFFICIAL_INSTANCE_SIGNUP_URL} from '@rvmob/lib/consts';
import {commonValues, ThemeContext} from '@rvmob/lib/themes';
import {openUrl} from '@rvmob/lib/utils';

function LoginTypeSelector({
  setLoginType,
}: {
  setLoginType: (type: 'email' | 'token') => void;
}) {
  const {currentTheme} = useContext(ThemeContext);

  const {t} = useTranslation();

  return (
    <>
      <Text
        font={'Inter'}
        style={{
          marginVertical: commonValues.sizes.medium,
          fontSize: 18,
          fontWeight: 'bold',
        }}>
        {t('app.login.subheader')}
      </Text>
      <Button
        onPress={() => {
          setLoginType('email');
        }}
        style={{alignItems: 'flex-start', width: '80%'}}>
        <View style={{alignItems: 'center'}}>
          <Text
            font={'Inter'}
            style={{textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>
            {t('app.login.options.login_regular')}
          </Text>
          <Text font={'Inter'} style={{textAlign: 'center'}}>
            {t('app.login.options.login_regular_body')}
          </Text>
        </View>
      </Button>
      <Button
        onPress={() => {
          setLoginType('token');
        }}
        style={{width: '80%'}}>
        <View style={{alignItems: 'center'}}>
          <Text
            font={'Inter'}
            style={{textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>
            {t('app.login.options.login_session_token')}
          </Text>
          <Text font={'Inter'} style={{textAlign: 'center'}}>
            {t('app.login.options.login_session_token_body')}
          </Text>
        </View>
      </Button>
      <Button
        onPress={() => {
          openUrl(
            client.configuration
              ? `${client.configuration.app}/login/create`
              : OFFICIAL_INSTANCE_SIGNUP_URL,
          );
        }}
        style={{width: '80%'}}>
        <View style={{alignItems: 'center'}}>
          <Text
            font={'Inter'}
            style={{textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>
            {t('app.login.options.signup')}
          </Text>
          <Text font={'Inter'} style={{textAlign: 'center'}}>
            {t('app.login.options.signup_body')}
          </Text>
        </View>
      </Button>
      <Text font={'Inter'} colour={currentTheme.foregroundSecondary}>
        {t('app.login.instance_notice', {
          url: app.settings.get('app.instance'),
        })}
      </Text>
    </>
  );
}

export const LoginPage = ({
  openLoginSettings,
  markAsLoggedIn,
}: {
  openLoginSettings: () => void;
  markAsLoggedIn: () => void;
}) => {
  const {currentTheme} = useContext(ThemeContext);

  const {t} = useTranslation();

  const [localStatus, setLocalStatus] = useState<
    'awaitingInput' | 'checkingCredentials'
  >('awaitingInput');
  const [loginType, setLoginType] = useState<'email' | 'token' | ''>('');

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [tfaInput, setTFAInput] = useState('');

  const [askForTFACode, setAskForTFACode] = useState(false);
  const [tfaTicket, setTFATicket] = useState('');

  const [tokenInput, setTokenInput] = useState('');

  const [loginError, setLoginError] = useState<any>(null);

  function backFromTFA() {
    setAskForTFACode(false);
    setTFAInput('');
    setTFATicket('');
  }

  function backFromRegularInputs() {
    setLoginType('');
    setEmailInput('');
    setPasswordInput('');
    setTokenInput('');
  }

  function setStatus(
    newStatus:
      | 'awaitingInput'
      | 'awaitingLogin'
      | 'checkingCredentials'
      | 'tryingLogin'
      | 'loggedIn',
  ) {
    // sent back to the login page (e.g. if a TFA code is needed)
    if (newStatus === 'awaitingInput' || newStatus === 'awaitingLogin') {
      setLocalStatus('awaitingInput');
      if (newStatus === 'awaitingLogin') {
        app.setLoggedOutScreen('loginPage');
      }
    }
    // connecting/loading
    else if (newStatus === 'tryingLogin') {
      app.setLoggedOutScreen('loadingPage');
    }
    // loaded; render main app
    else if (newStatus === 'loggedIn') {
      markAsLoggedIn();
    }
    // attempting to log in with new credentials
    else {
      setLocalStatus('checkingCredentials');
    }
  }

  useBackHandler(() => {
    if (loginType !== '') {
      askForTFACode ? backFromTFA() : backFromRegularInputs();
      return true;
    }

    return false;
  });

  return (
    <>
      <View
        style={{
          marginTop: commonValues.sizes.large,
          marginStart: commonValues.sizes.medium,
          marginEnd: commonValues.sizes.small,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        {loginType !== '' ? (
          <BackButton
            callback={() => {
              askForTFACode ? backFromTFA() : backFromRegularInputs();
            }}
          />
        ) : (
          <View />
        )}
        {loginType === '' ? (
          <TouchableOpacity onPress={() => openLoginSettings()}>
            <MaterialIcon
              name="more-vert"
              size={30}
              color={currentTheme.foregroundPrimary}
            />
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}>
        <Text
          style={{
            fontFamily: 'Inter',
            fontWeight: 'bold',
            fontSize: 48,
          }}>
          RVMob
        </Text>
        {askForTFACode || loginType === 'email' ? (
          <>
            {!askForTFACode ? (
              <>
                <Input
                  isLoginInput
                  placeholderTextColor={currentTheme.foregroundSecondary}
                  placeholder={t('app.login.forms.email_placeholder')}
                  keyboardType={'email-address'}
                  autoComplete={'email'}
                  onChangeText={(text: string) => {
                    setEmailInput(text);
                  }}
                  value={emailInput}
                  editable={localStatus === 'awaitingInput' && !askForTFACode}
                />
                <Input
                  isLoginInput
                  placeholderTextColor={currentTheme.foregroundSecondary}
                  secureTextEntry={true}
                  autoComplete={'password'}
                  placeholder={t('app.login.forms.password_placeholder')}
                  onChangeText={text => {
                    setPasswordInput(text);
                  }}
                  value={passwordInput}
                  editable={localStatus === 'awaitingInput' && !askForTFACode}
                />
              </>
            ) : (
              <>
                <Input
                  isLoginInput
                  placeholderTextColor={currentTheme.foregroundSecondary}
                  placeholder={t('app.login.forms.mfa_placeholder')}
                  onChangeText={text => {
                    setTFAInput(text);
                  }}
                  value={tfaInput}
                />
              </>
            )}
            {localStatus === 'awaitingInput' ? (
              <Button
                onPress={async () =>
                  await loginRegular(
                    {
                      email: emailInput,
                      password: passwordInput,
                      tfaCode: tfaInput,
                      tfaTicket: tfaTicket,
                    },
                    setStatus,
                    setTFATicket,
                    setAskForTFACode,
                    setLoginError,
                  )
                }>
                <Text font={'Inter'}>Log in</Text>
              </Button>
            ) : (
              <></>
            )}
            {loginError ? (
              <Text>{loginError.message || loginError.toString()}</Text>
            ) : null}
          </>
        ) : loginType === 'token' ? (
          <>
            <Input
              isLoginInput
              placeholderTextColor={currentTheme.foregroundSecondary}
              placeholder={t('app.login.forms.session_token_placeholder')}
              onChangeText={text => {
                setTokenInput(text);
              }}
              value={tokenInput}
            />
            <Link
              link={
                'https://web.archive.org/web/20231204052541/https://infi.sh/posts/revolt-tokens'
              }
              label={t('app.login.token_info_label')}
              style={{fontFamily: 'Inter', fontWeight: 'bold'}}
            />
            <Button
              onPress={async () =>
                await loginWithToken(tokenInput, setStatus, setLoginError)
              }>
              <Text font={'Inter'}>Log in</Text>
            </Button>
            {loginError ? (
              <Text>{loginError.message ?? loginError}</Text>
            ) : null}
          </>
        ) : (
          <LoginTypeSelector setLoginType={setLoginType} />
        )}
      </View>
    </>
  );
};
