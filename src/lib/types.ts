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
  category: string;
  experimental?: boolean;
  developer?: boolean;
  options?: string[];
  onChange?: any;
  onInitialize?: any;
  remark?: boolean;
};

export type SettingsSection = {
  section: string;
  subsection?: string;
} | null;

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

export type TextEditingModalProps = {
  initialString: string;
  id: string;
  callback: (s: string) => void;
};

export type CreateChannelModalProps = {
  server: Server;
  category?: string;
  callback: (c: string) => void;
};

export type Language = {
  name: string;
  englishName: string;
  emoji: string;
};
