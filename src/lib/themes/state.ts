import {createContext} from 'react';
import {Theme, themes} from './data';

export const ThemeContext = createContext<{
  currentTheme: Theme;
  setCurrentTheme: Function;
}>({currentTheme: themes.Dark, setCurrentTheme: () => {}});
