import {Message, Server, User} from 'revolt.js';

type StringSetting = {
  default: string;
  type: 'string' | 'number';
  value?: string;
};

type BoolSetting = {
  default: boolean;
  type: 'boolean';
  value?: boolean;
};

export type Setting = (StringSetting | BoolSetting) & {
  key: string;
  name: string;
  category: string;
  experimental?: boolean;
  developer?: boolean;
  options?: string[];
  onChange?: any;
  onInitialize?: any;
  remark?: string;
};

export type SettingsSection = string | null;

export type ReplyingMessage = {
  mentions: boolean;
  message: Message;
};

interface TypedMessage {
  type: 'Message';
  object: Message;
}

interface TypedServer {
  type: 'Server';
  object: Server;
}

interface TypedUser {
  type: 'User';
  object: User;
}

export type ReportedObject = TypedMessage | TypedServer | TypedUser;

export type DeletableObject = TypedMessage | TypedServer;
