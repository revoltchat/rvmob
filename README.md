# RVMob

<div style="flex-direction: row;">
  <a href="https://translate.revolt.chat/engage/rvmorb/">
    <img src="https://translate.revolt.chat/widgets/rvmorb/-/app/svg-badge.svg" alt="Translation status on Weblate" />
  </a>
  <a href="https://lea.pet/@rvmob">
    <img src="https://img.shields.io/badge/fedi-@rvmob@lea.pet-teal" alt="Fediverse badge from shields.io"/>
  </a>
</div>

**RVMob** is a mobile Revolt client made in React Native.

**Please note that RVMob is currently in beta.** It is exclusive to Android and contains several bugs/incomplete features - use at your own discretion.

For development updates and other news, join [RVMob's support server][support-server].

## Installing

If you want to install RVMob, simply go to [the releases tab](https://github.com/revoltchat/rvmob/releases) and download the latest version. We plan on publishing RVMob to app stores in the future.

Debug builds are also produced for every commit. These are unoptimised - they're much larger and noticeably slower than the release builds, but you can try out new features early.

### Info about split builds

Also note that, from v0.7.0, RVMob's APKs are **split by architecture**. This helps to reduce file and app sizes - however, you'll need to make sure that you **download the APK that matches your device's architecture**, or **it won't install!**

If you're using an app store, this should be handled for you. If not, however, you'll need to check your device's architecture. I'd recommend using [Treble Info](https://gitlab.com/TrebleInfo/TrebleInfo/-/blob/dev/README.md) for this. Install and open the app - **don't worry about what it says on the home page!** - then open the Details tab and check the CPU architecture entry.

Depending on what it says:

- if it says `ARM64`, you'll want the APK with **`arm64-v8a`** in its file name;
- if it says `ARM32`, you'll want the APK with **`armeabi-v7a`** in its file name;
- if it says `x86_64`, you'll want the APK with **`x86_64`** in its file name;
- and if it says `x86`, you'll want the APK with **`x86` but without `64`** in its file name.

If it says `Unknown`, please ask for help in [our support server][support-server].

## Building

If you want to build RVMob, you'll need:

- [Node](https://nodejs.org/en/) (v18+),
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
yarn start
```

CLI commands:

| Command        | Description                               |
| -------------- | ----------------------------------------- |
| `yarn start`   | Starts Metro (the dev server).            |
| `yarn test`    | Tests to see if everything is working.    |
| `yarn android` | Runs the Android app.                     |
| `yarn ios`     | Runs the iOS app (broken/requires a Mac). |
| `yarn lint`    | Checks the code syntax using ESLint.      |

For more information, see a list of `react-native`'s commands [here](https://github.com/react-native-community/cli/blob/master/docs/commands.md). You can access them by running `yarn react-native`.

## Troubleshooting

If you encounter bugs, first check if you're able to [open Revolt in your browser](https://app.revolt.chat); also, check if you have any firewall settings that may block the Revolt API.

If you're still experiencing issues, and there aren't any open issues for the bug(s) you're facing, please [open an issue](https://github.com/revoltchat/rvmob/issues).

## License

RVMob is licensed under the [GNU Affero General Public License v3.0](https://github.com/revoltchat/rvmob/blob/master/LICENSE).

[support-server]: https://rvlt.gg/rvmob
