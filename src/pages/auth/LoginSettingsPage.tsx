import {useState} from 'react';
import {Platform, TextInput, View} from 'react-native';

import {app} from '../../Generic';
import {commonValues, currentTheme, styles} from '../../Theme';
import {BackButton, Button, Text} from '../../components/common/atoms';

export const LoginSettingsPage = ({callback}: {callback: () => void}) => {
  const [instanceURL, setInstanceURL] = useState(
    (app.settings.get('app.instance') as string) ?? '',
  );
  const [testResponse, setTestResponse] = useState(null as string | null);

  const [saved, setSaved] = useState(false);

  async function testURL(url: string, returnIfSuccessful: boolean) {
    try {
      console.log('[LOGINSETTINGS] Testing URL...');
      const req = await fetch(url);
      console.log('[LOGINSETTINGS] Request succeeded!');
      const data = await req.json();
      if (data.revolt && data.features) {
        console.log('[LOGINSETTINGS] This looks like a Revolt instance!');
        setTestResponse('valid');
        if (returnIfSuccessful) {
          return true;
        }
      } else {
        console.log(
          "[LOGINSETTINGS] This doesn't look like a Revolt instance...",
        );
        setTestResponse('invalid');
      }
    } catch (err: any) {
      if (err.toString().match('Network request failed')) {
        console.log(`[LOGINSETTINGS] Could not fetch ${instanceURL}`);
        setTestResponse('requestFailed');
      } else if (err.toString().match('JSON Parse error')) {
        console.log(
          "[LOGINSETTINGS] Could not parse the response (it's probably HTML)",
        );
        setTestResponse('notJSON');
      } else {
        console.log(err);
        setTestResponse('error');
      }
    }
  }

  return (
    <>
      <BackButton
        callback={() => callback()}
        type={'close'}
        style={{padding: commonValues.sizes.large}}
      />
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
        {saved ? (
          <>
            <Text style={styles.loadingHeader}>Saved!</Text>
            <Text style={{textAlign: 'center', marginHorizontal: 30}}>
              {Platform.OS === 'web'
                ? 'You can now close this menu and log in.'
                : "For now, you'll have to close and reopen the app for your changes to apply. We know this isn't ideal - we'll fix this at a later date."}
            </Text>
          </>
        ) : (
          <>
            <Text type={'h1'}>Instance</Text>
            <TextInput
              placeholderTextColor={currentTheme.foregroundSecondary}
              style={styles.loginInput}
              placeholder={'Instance URL'}
              onChangeText={text => {
                setInstanceURL(text);
              }}
              value={instanceURL}
            />
            {testResponse ? (
              <Text style={{textAlign: 'center', marginHorizontal: 30}}>
                {testResponse === 'valid'
                  ? 'This looks like a Revolt instance!'
                  : testResponse === 'invalid'
                  ? "This doesn't look like a Revolt instance..."
                  : testResponse === 'notJSON'
                  ? "Could not parse response. Make sure you're linking to the API URL!"
                  : testResponse === 'requestFailed'
                  ? 'Could not fetch that URL.'
                  : 'Something went wrong!'}
              </Text>
            ) : null}
            <Button
              onPress={async () => {
                await testURL(instanceURL, false);
              }}>
              <Text>Test URL</Text>
            </Button>
            <Button
              onPress={async () => {
                const isValid = await testURL(instanceURL, true);
                if (isValid) {
                  console.log(`[AUTH] Setting instance URL to ${instanceURL}`);
                  app.settings.set('app.instance', instanceURL);
                  setSaved(true);
                }
              }}>
              <Text>Save</Text>
            </Button>
          </>
        )}
      </View>
    </>
  );
};
