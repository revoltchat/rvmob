const commonColours = {
  statusOnline: '#3ABF7E',
  statusIdle: '#F39F00',
  statusBusy: '#F84848',
  statusFocus: '#4799F0',
  statusStreaming: '#977EFF',
  statusOffline: '#A5A5A5',
  statusInvisible: '#A5A5A5',
};

export const commonValues = {
  sizes: {
    xs: 2,
    small: 4,
    medium: 8,
    large: 12,
    xl: 16,
  },
};

export type Theme = {
  // statuses
  statusOnline: string;
  statusIdle: string;
  statusBusy: string;
  statusFocus: string;
  statusStreaming: string;
  statusOffline: string;
  statusInvisible: string;

  // background colours
  background: string;
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // foreground colours
  foregroundPrimary: string;
  foregroundSecondary: string;
  foregroundTertiary: string;

  // colour used for selected buttons (e.g. the currently selected channel button)
  hover: string;

  // colours used for messages mentioning the user
  mentionBorder: string;
  mentionBackground: string;

  // background colour for the channel header
  headerBackground: string;

  // background colour for buttons
  buttonBackground: string;

  // colours used for the message box
  messageBox: string;
  messageBoxInput: string;

  // colour used for block quotes
  blockQuoteBackground: string;

  // background colour for the server channel list's server name when the server has a banner
  serverNameBackground: string;

  // accent colour/the colour used for text over it
  accentColor: string;
  accentColorForeground: string;

  // border colour/width used for certain themes to distinguish areas like the bottom bar
  generalBorderColor: string;
  generalBorderWidth: number;

  // misc colours/values
  contentType: 'light' | 'dark';
  error: string;
};

export const themes: Record<string, Theme> = {
  Light: {
    ...commonColours,
    background: '#F6F6F6',
    backgroundPrimary: '#FFFFFF',
    backgroundSecondary: '#F1F1F1',
    backgroundTertiary: '#4D4D4D',
    foregroundPrimary: '#000000',
    foregroundSecondary: '#6E6E6E',
    foregroundTertiary: '#4D4D4D',
    hover: '#0000002B',
    mentionBorder: '#E3D049',
    mentionBackground: '#EBEBB5',
    headerBackground: '#F1F1F1',
    buttonBackground: '#F1F1F1',
    messageBox: '#F1F1F1',
    messageBoxInput: '#FFFFFF',
    blockQuoteBackground: '#11111166',
    serverNameBackground: '#FFFFFF80',
    accentColor: '#219E87',
    accentColorForeground: '#000000',
    generalBorderColor: '#00000022',
    generalBorderWidth: 0,
    contentType: 'dark',
    error: '#ED4245',
  },
  Dark: {
    ...commonColours,
    background: '#191919',
    backgroundPrimary: '#242424',
    backgroundSecondary: '#1E1E1E',
    backgroundTertiary: '#4D4D4D',
    foregroundPrimary: '#F6F6F6',
    foregroundSecondary: '#C8C8C8',
    foregroundTertiary: '#848484',
    hover: '#0000001A',
    mentionBorder: '#BEAF41',
    mentionBackground: '#383827',
    headerBackground: '#303030',
    buttonBackground: '#2D2D2D',
    messageBox: '#303030',
    messageBoxInput: '#242424',
    blockQuoteBackground: '#11111166',
    serverNameBackground: '#24242480',
    accentColor: '#1AD4B2',
    accentColorForeground: '#000000',
    generalBorderColor: '#ffffff22',
    generalBorderWidth: 0,
    contentType: 'light',
    error: '#ED4245',
  },
  Solarized: {
    ...commonColours,
    background: '#032730',
    backgroundPrimary: '#002b36',
    backgroundSecondary: '#073642',
    backgroundTertiary: '#0a4352',
    foregroundPrimary: '#93a1a1',
    foregroundSecondary: '#839496',
    foregroundTertiary: '#657b83',
    hover: '#0000001A',
    mentionBorder: '#b58900',
    mentionBackground: '#b5890040',
    headerBackground: '#0a4352',
    buttonBackground: '#0a4352',
    messageBox: '#0a4352',
    messageBoxInput: '#002b36',
    generalBorderColor: '#ffffff22',
    generalBorderWidth: 0,
    blockQuoteBackground: '#11111166',
    serverNameBackground: '#002b36aa',
    accentColor: '#1ad4b2',
    accentColorForeground: '#000000',
    contentType: 'light',
    error: '#dc322f',
  },
  // "Vibrant Pink": {
  //     backgroundPrimary: '#f9bae9',
  //     backgroundSecondary: '#e99cd6',
  //     blockQuoteBackground: '#11111166',
  //     textPrimary: '#000000',
  //     textSecondary: '#555555',
  //     accentColor: '#1ad4b2',
  //     accentColorForeground: '#000000',
  //     contentType: 'dark',
  //     generalBorderWidth: 0,
  // },
  AMOLED: {
    ...commonColours,
    background: '#000000',
    backgroundPrimary: '#000000',
    backgroundSecondary: '#000000',
    backgroundTertiary: '#000000',
    foregroundPrimary: '#F6F6F6',
    foregroundSecondary: '#C8C8C8',
    foregroundTertiary: '#848484',
    hover: '#0000001A',
    mentionBorder: '#BEAF41',
    mentionBackground: '#383827',
    headerBackground: '#000000',
    buttonBackground: '#111111',
    messageBox: '#000000',
    messageBoxInput: '#111111',
    blockQuoteBackground: '#111111',
    serverNameBackground: '#00000080',
    accentColor: '#1ad4b2',
    accentColorForeground: '#000000',
    generalBorderColor: '#ffffff22',
    generalBorderWidth: 1,
    contentType: 'light',
    error: '#ED4245',
  },
  'Rosé Pine': {
    ...commonColours,
    background: '#191724',
    backgroundPrimary: '#1f1d2e',
    backgroundSecondary: '#26233a',
    backgroundTertiary: '#1f1d2e',
    foregroundPrimary: '#e0def4',
    foregroundSecondary: '#908caa',
    foregroundTertiary: '#6e6a86',
    hover: '#0000001A',
    mentionBorder: '#BEAF41',
    mentionBackground: '#383827',
    headerBackground: '#26233a',
    buttonBackground: '#26233a',
    messageBox: '#26233a',
    messageBoxInput: '#1f1d2e',
    blockQuoteBackground: '#11111166',
    serverNameBackground: '#1f1d2e80',
    accentColor: '#c4a7e7',
    accentColorForeground: '#191724',
    generalBorderColor: '#ffffff22',
    generalBorderWidth: 0,
    contentType: 'light',
    error: '#eb6f92',
  },
  'Rosé Pine Moon': {
    ...commonColours,
    background: '#232136',
    backgroundPrimary: '#2a273f',
    backgroundSecondary: '#393552',
    backgroundTertiary: '#2a273f',
    foregroundPrimary: '#e0def4',
    foregroundSecondary: '#908caa',
    foregroundTertiary: '#6e6a86',
    hover: '#0000001A',
    mentionBorder: '#BEAF41',
    mentionBackground: '#383827',
    headerBackground: '#393552',
    buttonBackground: '#393552',
    messageBox: '#393552',
    messageBoxInput: '#2a273f',
    blockQuoteBackground: '#11111166',
    serverNameBackground: '#2a273f80',
    accentColor: '#c4a7e7',
    accentColorForeground: '#232136',
    generalBorderColor: '#ffffff22',
    generalBorderWidth: 0,
    contentType: 'light',
    error: '#eb6f92',
  },
  'Rosé Pine Dawn': {
    ...commonColours,
    background: '#faf4ed',
    backgroundPrimary: '#fffaf3',
    backgroundSecondary: '#f2e9e1',
    backgroundTertiary: '#fffaf3',
    foregroundPrimary: '#575279',
    foregroundSecondary: '#797593',
    foregroundTertiary: '#9893a5',
    hover: '#0000001A',
    mentionBorder: '#BEAF41',
    mentionBackground: '#383827',
    headerBackground: '#f2e9e1',
    buttonBackground: '#f2e9e1',
    messageBox: '#f2e9e1',
    messageBoxInput: '#fffaf3',
    blockQuoteBackground: '#11111166',
    serverNameBackground: '#fffaf3aa',
    accentColor: '#907aa9',
    accentColorForeground: '#faf4ed',
    generalBorderColor: '#ffffff22',
    generalBorderWidth: 0,
    contentType: 'dark',
    error: '#b4637a',
  },
};
