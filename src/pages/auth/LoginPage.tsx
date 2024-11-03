import {useState} from 'react';
import {TextInput, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {useBackHandler} from '@react-native-community/hooks';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {app, client} from '@rvmob/Generic';
import {currentTheme, styles} from '@rvmob/Theme';
import {BackButton, Button, Link, Text} from '@rvmob/components/common/atoms';
import {loginRegular, loginWithToken} from '@rvmob/lib/auth';
import {OFFICIAL_INSTANCE_SIGNUP_URL} from '@rvmob/lib/consts';
import {openUrl} from '@rvmob/lib/utils';

export const LoginPage = ({state}: {state: any}) => {
  const {t} = useTranslation();

  const [loginType, setLoginType] = useState<'email' | 'token' | ''>('');

  useBackHandler(() => {
    if (loginType !== '') {
      setLoginType('');
      return true;
    }

    return false;
  });

  return (
    <>
      <View
        style={{
          marginTop: 12,
          marginStart: 8,
          marginEnd: 4,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        {loginType !== '' ? (
          <BackButton
            callback={() => {
              setLoginType('');
            }}
          />
        ) : (
          <View />
        )}
        <TouchableOpacity
          onPress={() => state.setState({status: 'loginSettings'})}>
          <MaterialIcon
            name="more-vert"
            size={30}
            color={currentTheme.foregroundPrimary}
          />
        </TouchableOpacity>
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
        {state.state.askForTFACode || loginType === 'email' ? (
          <>
            <TextInput
              placeholderTextColor={currentTheme.foregroundSecondary}
              style={styles.loginInput}
              placeholder={t('app.login.forms.email_placeholder')}
              keyboardType={'email-address'}
              autoComplete={'email'}
              onChangeText={(text: string) => {
                state.setState({emailInput: text});
              }}
              value={state.state.emailInput}
            />
            <TextInput
              placeholderTextColor={currentTheme.foregroundSecondary}
              style={styles.loginInput}
              secureTextEntry={true}
              autoComplete={'password'}
              placeholder={t('app.login.forms.password_placeholder')}
              onChangeText={text => {
                state.setState({passwordInput: text});
              }}
              value={state.state.passwordInput}
            />
            {state.state.askForTFACode === true ? (
              <>
                <TextInput
                  placeholderTextColor={currentTheme.foregroundSecondary}
                  style={styles.loginInput}
                  placeholder={t('app.login.forms.mfa_placeholder')}
                  onChangeText={text => {
                    state.setState({tfaInput: text});
                  }}
                  value={state.state.tfaInput}
                />
              </>
            ) : null}
            <Button onPress={async () => await loginRegular(state)}>
              <Text font={'Inter'}>Log in</Text>
            </Button>
            {state.state.logInError ? (
              <Text>
                {state.state.logInError.message ||
                  state.state.logInError.toString()}
              </Text>
            ) : null}
          </>
        ) : loginType === 'token' ? (
          <>
            <TextInput
              placeholderTextColor={currentTheme.foregroundSecondary}
              style={styles.loginInput}
              placeholder={t('app.login.forms.session_token_placeholder')}
              onChangeText={text => {
                state.setState({tokenInput: text});
              }}
              value={state.state.tokenInput}
            />
            <Link
              link={'https://infi.sh/posts/revolt-tokens?utm_source=rvmob'}
              label={t('app.login.token_info_label')}
              style={{fontFamily: 'Inter', fontWeight: 'bold'}}
            />
            <Button onPress={async () => await loginWithToken(state)}>
              <Text font={'Inter'}>Log in</Text>
            </Button>
            {state.state.logInError ? (
              <Text>
                {state.state.logInError.message ?? state.state.logInError}
              </Text>
            ) : null}
          </>
        ) : (
          <>
            <Text
              font={'Inter'}
              style={{
                marginVertical: 8,
                fontSize: 18,
                fontWeight: 'bold',
              }}>
              {t('app.login.subheader')}
            </Text>
            <Button
              onPress={() => {
                setLoginType('email');
              }}
              style={{alignItems: 'center', width: '80%'}}>
              <Text font={'Inter'} style={{fontSize: 16, fontWeight: 'bold'}}>
                {t('app.login.options.login_regular')}
              </Text>
            </Button>
            <Button
              onPress={() => {
                setLoginType('token');
              }}
              style={{alignItems: 'center', width: '80%'}}>
              <Text font={'Inter'} style={{fontSize: 16, fontWeight: 'bold'}}>
                {t('app.login.options.login_session_token')}
              </Text>
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
                <Text font={'Inter'} style={{fontSize: 16, fontWeight: 'bold'}}>
                  {t('app.login.options.signup')}
                </Text>
                <Text font={'Inter'}>{t('app.login.options.signup_body')}</Text>
              </View>
            </Button>
            <Text font={'Inter'} colour={currentTheme.foregroundSecondary}>
              {t('app.login.instance_notice', {
                url: app.settings.get('app.instance'),
              })}
            </Text>
          </>
        )}
      </View>
    </>
  );
};
