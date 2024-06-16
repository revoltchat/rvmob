/**
 * @format
 */

import {AppRegistry} from 'react-native';

import {App} from './App';
import './i18n/i18n';

import {name as appName} from './app.json';

import Inter from './assets/fonts/Inter/Inter.ttf';
import InterBold from './assets/fonts/Inter/Inter_bold.ttf';
import JetBrainsMono from './assets/fonts/JetBrains Mono/JetBrains Mono.ttf';
import JetBrainsMonoBold from './assets/fonts/JetBrains Mono/JetBrains Mono_bold.ttf';
import OpenSans from './assets/fonts/Open Sans/Open Sans.ttf';
import OpenSansBold from './assets/fonts/Open Sans/Open Sans_bold.ttf';

import MaterialIconFont from 'react-native-vector-icons/Fonts/MaterialIcons.ttf';
import MaterialCommunityIconFont from 'react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf';

const fontStyles = `
@font-face {
    src: url(${Inter});
    font-family: 'Inter';
}

@font-face {
    src: url(${InterBold});
    font-family: 'Inter';
    font-weight: bold;
}

@font-face {
    src: url(${JetBrainsMono});
    font-family: 'JetBrains Mono';
}

@font-face {
    src: url(${JetBrainsMonoBold});
    font-family: 'JetBrains Mono';
    font-weight: bold;
}

@font-face {
    src: url(${OpenSans});
    font-family: 'Open Sans';
    font-weight: normal;
}

@font-face {
    src: url(${OpenSansBold});
    font-family: 'Open Sans';
    font-weight: bold;
}

@font-face {
    src: url(${MaterialCommunityIconFont});
    font-family: MaterialCommunityIcons;
}

@font-face {
    src: url(${MaterialIconFont});
    font-family: MaterialIcons;
}`;

// Create a stylesheet
const style = document.createElement('style');
style.type = 'text/css';

// Append the iconFontStyles to the stylesheet
if (style.styleSheet) {
  style.styleSheet.cssText = fontStyles;
} else {
  style.appendChild(document.createTextNode(fontStyles));
}

// Inject the stylesheet into the document head
document.head.appendChild(style);

AppRegistry.registerComponent(appName, () => App);

AppRegistry.runApplication(appName, {rootTag: document.getElementById('root')});
