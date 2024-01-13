/**
 * @format
 */

import {AppRegistry} from 'react-native';

import {App} from './App';
import './i18n/i18n';

import {name as appName} from './app.json';

import MaterialIconFont from 'react-native-vector-icons/Fonts/MaterialIcons.ttf';
import MaterialCommunityIconFont from 'react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf';

const iconFontStyles = `@font-face {
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
  style.styleSheet.cssText = iconFontStyles;
} else {
  style.appendChild(document.createTextNode(iconFontStyles));
}

// Inject the stylesheet into the document head
document.head.appendChild(style);

AppRegistry.registerComponent(appName, () => App);

AppRegistry.runApplication(appName, {rootTag: document.getElementById('root')});
