# RVMob's changelog

## v0.7.0

*This version has not been released yet.*

### What's new

- RVMob now uses React Native 0.73.
- fill out other features closer to completion

### Experimental/WIP features

### Bug fixes

### Known issues

## v0.6.0

*This version was released on 14/07/2023.*

### Important info for users of 0.5.0 or earlier

If you're one of the people using 0.5.0 or older versions of RVMob, you'll need to **clear your app data** before upgrading. To do this:

- Open the Settings app
- Go to the Apps section and search for RVMob
- Select the option labelled "Storage and cache" or similar
- Select "Clear storage" and optionally "Clear cache"

(These steps may vary depending on your device's manufacturer/your version of Android.)

This is a **one time operation** - in future, any major changes to the settings system will include migrators for existing users. You'll also have to log back in after doing this.

### What's new

- RVMob now uses React Native 0.72 (including Hermes, which provides various improvements)/Typescript.
- You can now log in using your email/password!
  - There's also partial 2FA support; you can log in using one-time codes.
- Profiles have been largely redesigned, making them less cramped and better suited for future features.
  - As part of this work, status settings have been moved to their own menu.
- RVMob now supports [Revolt's reports system][revolt_reports_post]. This allows you to flag up messages, servers and users that violate Revolt's [Terms of Service][revolt_tos] or the [Acceptable Use Policy][revolt_aup], helping to keep the platform safe.
  - To report a message, long tap it and select "Report Message".
  - To report a server, tap its name above the channel list and select "Report Server".
  - To report a user, open their profile, tap the three dots next to their profile picture and select "Report User".
- The settings system has been fully reworked, making it more maintainable and easier to work with.
  - Alongside this, the settings menu has received various visual improvements.
  - Settings are now split into categories, making the menu feel less cluttered.
  - In addition, you can now copy useful debug information (including your device model, your current settings and your version of Android) - if you're reporting a bug, please include this info.
- The right menu (which was largely unused) has been removed - instead, the member list and channel description are now available via dedicated buttons at the top of the channel view.
- The home screen now shows an emoji/link for certain holidays/special dates.
- In line with the web app:
  - DMs are now sorted by when the last message was sent.
  - Servers are now sorted in the order you reorder them to.
  - Users in the friends list are now sorted by username, and individual sections can now be collapsed.
  - You can now collapse categories in the server channel list.
- Server invites now embed below the message.
- You can now leave servers via the server info sheet.
- Messages from blocked users are now hidden.
- A variety of design improvements have been made across the app - in particular, various elements have bigger margins, making the app feel less crowded.
- The server invite screen and info sheet now show how many members the server has.
- Various code improvements have also been made, making the code much easier to navigate and maintain.
- The navigation bar now uses the colour of the message box.

#### Experimental/WIP features

- Custom emojis in messages will now be detected and replaced with a link - proper rendering will hopefully be added in a future update.
- Embeds specified by bots will now be partially rendered - better styling and support for fields like custom colours will be added in a future update.
- Notifications should work while the app is open in the background, and basic support for in-app notifications has been added.
- Reactions can now optionally be shown under messages! You can also add to existing reactions if you have the React permission - further functionality (i.e. adding new reactions/seeing who's reacted) will be added in a future update.

### Screenshots

#### New profiles

![](./screenshots/changelogs/0.6.0/new_profiles.png)

#### Status menu

![](./screenshots/changelogs/0.6.0/status_menu.png)

#### Reporting menu

![](./screenshots/changelogs/0.6.0/reporting_menu.png)

#### Updated server info sheet

![](./screenshots/changelogs/0.6.0/server_info_sheet.png)

#### Server invite embeds

![](./screenshots/changelogs/0.6.0/invite_embeds.png)

#### Revamped settings menu

![](./screenshots/changelogs/0.6.0/new_settings_menu.png)
![](./screenshots/changelogs/0.6.0/new_settings_menu_section.png)

### Known issues

- When opening the app for the first time, it might get stuck on the "Logging in..." screen. If this happens, close and re-open the app via the app switcher. This seems to only happen on the first boot and is inconsistent - I'm still trying to figure out why this occurs.
- The app is a bit laggy in places - in particular, the friends list can take a bit to load.
- The app may freeze up when trying to fetch the member count in larger servers - due to this, this feature has been turned off for the Revolt Lounge, which during testing was particularly bad in this regard.
- Most gradient roles will appear as plain black text (excluding basic linear gradients, which will show as the first colour in the gradient). This is partially a React Native limitation; however, a better mitigation for this will be added in a future update.
- The image viewer may incorrectly crop certain images, rendering parts of them invisible. You can open them in the browser to view the full image.
- The Send Friend Request button on profiles might not work - I'm still trying to figure out why.

### What's next

- Recovery code support for 2FA
- Full support for reactions
- Server/channel settings
- New message view (code wise)
- Even more code improvements

[revolt_tos]: https://revolt.chat/terms
[revolt_aup]: https://revolt.chat/aup
[revolt_reports_post]: https://revolt.chat/posts/improving-user-safety?utm_source=rvmob_changelog_0.6.0
