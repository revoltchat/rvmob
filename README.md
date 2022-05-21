# DVMob

This is a fork of [RVMob](https://github.com/revoltchat/rvmob), a mobile Revolt client made in React Native. This is re-built for Divolt support, a self-hosted instance of Revolt.

RVMob is currently in beta stage and unoptimized. Use at your own discomfort.

## Building

If you want to install, simply go to [releases](https://github.com/ggtylerr/dvmob/releases) and download the latest version. Please note that any release made by GitHub Actions is automated, and may include bugs.

To manually build, you'll need [Node.JS](https://nodejs.org/en/) and [npx.](https://www.npmjs.com/package/npx) Then run the following:

```sh
npm i --legacy-peer-deps
npx rn-nodeify -e -i
npm run start
```

CLI Commands:

| Command             | Description                            |
| ------------------- | -------------------------------------- |
| `npm run start`     | Starts the application.                |
| `npm run test`      | Tests to see if everything is working. |
| `npm run android`   | Runs an Android version.               |
| `npm run ios`       | Runs an iOS version. (requires Mac)    |
| `npm run windows`   | Runs a Windows version.                |
| `npm run lint`      | Checks the code syntax using ESLint.   |

For more, [see the commands for react-native's CLI.](https://github.com/react-native-community/cli/blob/master/docs/commands.md) You can access them by doing `npx react-native`

## Troubleshooting

If you encounter bugs, first check if you're able to [go to Divolt on your browser.](https://divolt.xyz) Also check if you have any firewall settings that may block the connection on the app.

If you still have problems, and it's not listed in the Known Bugs, please [report an issue.](https://github.com/ggtylerr/dvmob/issues)

## Known Bugs

None at the moment, although the app is largely untested.

## License

DVMob and RVMob are licensed under the [GNU Affero General Public License v3.0](https://github.com/ggtylerr/dvmob/blob/master/LICENSE).