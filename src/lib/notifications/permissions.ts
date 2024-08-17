import {PermissionsAndroid} from 'react-native';

export function checkNotificationPerms() {
  PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    {
      title: 'Allow RVMob Notifications',
      message:
        'RVMob needs permission to send you message notifications. You can turn them off at any time.',
      buttonNeutral: 'Maybe later',
      buttonNegative: 'Nuh uh',
      buttonPositive: 'Sure',
    },
  ).then(result => {
    console.log(`[SETTINGS] Permission request result: ${result}`);
  });
}
