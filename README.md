# RVMob

**RVMob** is a mobile Revolt client made in React Native. 

**Please note that RVMob is currently in beta.** It is exclusive to Android and contains several bugs/incomplete features - use at your own discretion.

For development updates and other news, join [RVMob's support server](https://rvlt.gg/YW312HPF).

## Installing

If you want to install RVMob, simply go to [the releases tab](https://github.com/revoltchat/rvmob/releases) and download the latest version. We plan on publishing RVMob to an app store in the future.

## Building

If you want to build RVMob, you'll need:
- [Node](https://nodejs.org/en/) (18+),
- [Yarn Classic](https://classic.yarnpkg.com),
- JDK 17 ([Microsoft's build](https://learn.microsoft.com/en-gb/java/openjdk/download) works well),
- the latest Android SDK (preferably via [Android Studio](https://developer.android.com/studio)'s SDK Manager), and 
- [npx](https://www.npmjs.com/package/npx).

Then run the following:

```sh
yarn install
npx rn-nodeify -e
npx react-native-asset
yarn android # for the android app
```

CLI commands:

| Command          | Description                               |
| ---------------- | ----------------------------------------- |
| `yarn start`     | Starts Metro (the dev server).            |
| `yarn test`      | Tests to see if everything is working.    |
| `yarn android`   | Runs the Android app.                     |
| `yarn ios`       | Runs the iOS app (broken/requires a Mac). |
| `yarn lint`      | Checks the code syntax using ESLint.      |

For more information, see a list of `react-native`'s commands [here](https://github.com/react-native-community/cli/blob/master/docs/commands.md). You can access them by running `yarn react-native`.

## Troubleshooting

If you encounter bugs, first check if you're able to [open Revolt in your browser](https://app.revolt.chat); also, check if you have any firewall settings that may block the Revolt API.

If you're still experiencing issues, and there aren't any open issues for the bug(s) you're facing, please [open an issue](https://github.com/revoltchat/rvmob/issues).

## License

RVMob is licensed under the [GNU Affero General Public License v3.0](https://github.com/revoltchat/rvmob/blob/master/LICENSE).