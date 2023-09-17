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

export type ReplyingMessage = {
  mentions: boolean;
  message: Message;
};

interface ReportedMessage {
  type: 'Message';
  object: Message;
}

interface ReportedServer {
  type: 'Server';
  object: Server;
}

interface ReportedUser {
  type: 'User';
  object: User;
}

export type ReportedObject = ReportedMessage | ReportedServer | ReportedUser;
