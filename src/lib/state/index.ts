import {createContext} from 'react';
import {CVChannel} from '../types';

export const ChannelContext = createContext<{
  currentChannel: CVChannel;
  setCurrentChannel: (channel: CVChannel) => void;
}>({currentChannel: null, setCurrentChannel: () => {}});

export const OrderedServersContext = createContext<{
  orderedServers: string[];
  setOrderedServers: (servers: string[]) => void;
}>({orderedServers: [], setOrderedServers: () => {}});

export const SideMenuContext = createContext<{
  sideMenuOpen: boolean;
  setSideMenuOpen: (open: boolean) => void;
}>({sideMenuOpen: false, setSideMenuOpen: () => {}});
