import React from 'react';
import {ScrollView, TextInput, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Message, User, Server} from 'revolt.js';

import {client} from '../../Generic';
import {USER_IDS} from '../../lib/consts';
import {Avatar} from '../../Profile';
import {currentTheme} from '../../Theme';
import {Button, ContextButton, Text, Username} from '../common/atoms';
import {MarkdownView} from '../common/MarkdownView';

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

type ReportedObject = ReportedMessage | ReportedServer | ReportedUser;

type Reason = {
  label: string;
  reason: string;
};

type Status = {
  status: string;
  message?: string;
};

async function sendReport(
  reportObj: ReportedObject,
  reportReason: string,
  context?: string,
) {
  try {
    const body = {
      content: {
        type: reportObj.type,
        id: reportObj.object._id,
        report_reason: reportReason,
      },
      additional_context: context,
    };
    console.log(body);
    // @ts-expect-error typing mismatch that in practice won't arise
    await client.api.post('/safety/report', body);
    return {status: 'success'};
  } catch (e) {
    console.log(
      `[REPORT] Error reporting ${reportObj.type} ${reportObj.object._id}: ${e}`,
    );
    return {status: 'error', message: e as string};
  }
}

// TODO: move this to the styles file?
const inputStyles = {
  fontFamily: 'Open Sans',
  borderRadius: 8,
  backgroundColor: currentTheme.headerSecondary,
  margin: 4,
  padding: 6,
  paddingLeft: 12,
  paddingRight: 12,
  color: currentTheme.foregroundPrimary,
};

export const ReportModal = observer((props: ReportedObject) => {
  const [additionalContext, setAdditionalContext] = React.useState('');
  const [reason, setReason] = React.useState({} as Reason);
  const [status, setStatus] = React.useState({} as Status);
  const type = props.type;
  const object = props.object;
  const messageReasons = [
    {label: 'This message breaks one or more laws', reason: 'Illegal'},
    {label: 'This message promotes harm', reason: 'PromotesHarm'},
    {
      label: 'This message is spam or abuse of the platform',
      reason: 'SpamAbuse',
    },
    {
      label: 'This message contains malware or dangerous links',
      reason: 'Malware',
    },
    {
      label: 'This message is harassing me or someone else',
      reason: 'Harassment',
    },
    {label: 'Something else not listed here', reason: 'NoneSpecified'},
  ] as Reason[];
  const serverReasons = [
    {label: 'This server breaks one or more laws', reason: 'Illegal'},
    {label: 'This server promotes harm', reason: 'PromotesHarm'},
    {
      label: 'This server is spamming or abusing the platform',
      reason: 'SpamAbuse',
    },
    {
      label: 'This server contains malware or dangerous links',
      reason: 'Malware',
    },
    {
      label: 'This server is harassing me or someone else',
      reason: 'Harassment',
    },
    {label: 'Something else not listed here', reason: 'NoneSpecified'},
  ] as Reason[];
  const userReasons = [
    {
      label: "This user's profile is inappropriate for a general audience",
      reason: 'InappropriateProfile',
    },
    {
      label: 'This user is spamming or abusing the platform',
      reason: 'SpamAbuse',
    },
    {
      label: 'This user is impersonating me or someone else',
      reason: 'Impersonation',
    },
    {
      label: 'This user is evading a ban',
      reason: 'BanEvasion',
    },
    {
      label: 'This user is too young to be using Revolt',
      reason: 'Underage',
    },
    {label: 'Something else not listed here', reason: 'NoneSpecified'},
  ] as Reason[];

  function ReasonsSelector({reasons}: {reasons: Reason[]}) {
    return (
      <>
        <Text>
          Why are you reporting this {type.toLowerCase()}? You can add more
          context after selecting a reason.
        </Text>
        {reasons.map(r => {
          return (
            <Button
              key={`reason_${r.reason}`}
              style={{
                backgroundColor: currentTheme.backgroundPrimary,
                justifyContent: 'flex-start',
              }}
              onPress={() => {
                setReason(r);
              }}>
              <Text style={{fontWeight: 'bold'}}>{r.label}</Text>
            </Button>
          );
        })}
      </>
    );
  }

  function SuccessScreen({reportedObject}: {reportedObject: ReportedObject}) {
    return (
      <>
        <Text style={{marginBottom: 10}}>
          Your report has been sent to the Revolt team for review - thank you
          for helping us keep Revolt safe.
        </Text>
        <Text type={'header'}>Next steps</Text>
        {reportedObject.type === 'Message' || reportedObject.type === 'User' ? (
          <>
            <Text>
              You can also block{' '}
              {reportedObject.type === 'Message'
                ? 'the author of this message'
                : 'this user'}
              .
            </Text>
            {(reportedObject.type === 'Message'
              ? reportedObject.object.author!
              : reportedObject.object
            ).relationship === 'Blocked' ? (
              <Button
                style={{backgroundColor: currentTheme.backgroundTertiary}}>
                <Text style={{color: currentTheme.foregroundTertiary}}>
                  {reportedObject.type === 'Message'
                    ? 'Author blocked'
                    : 'User blocked'}
                </Text>
              </Button>
            ) : (
              <Button
                onPress={() => {
                  (reportedObject.type === 'Message'
                    ? reportedObject.object.author!
                    : reportedObject.object
                  ).blockUser();
                }}>
                <Text>
                  {reportedObject.type === 'Message'
                    ? 'Block author'
                    : 'Block user'}
                </Text>
              </Button>
            )}
          </>
        ) : (
          <>
            <Text>
              You can also leave this server. Other members will not be
              notified.
            </Text>
            <Button
              onPress={() => {
                reportedObject.object.delete(true);
              }}>
              <Text>Leave server</Text>
            </Button>
          </>
        )}
        <Text>If not, tap above the sheet to close it.</Text>
      </>
    );
  }

  let output = <></>;
  switch (type) {
    case 'Message':
      let msg = object as Message;
      const isLikelyBridged =
        msg.author?._id === USER_IDS.automod && msg.masquerade !== null;
      console.log(isLikelyBridged, msg.author?._id, msg.masquerade?.name);
      output = (
        <>
          <Text type={'header'}>Report message</Text>
          <ScrollView style={{marginBottom: 4, maxHeight: '40%'}}>
            <View style={{flexDirection: 'row'}}>
              <Avatar
                user={msg.author}
                server={msg.channel?.server}
                size={25}
              />
              <View
                style={{
                  flexDirection: 'column',
                  marginLeft: 4,
                  width: '90%',
                }}>
                <Username
                  user={msg.author!}
                  server={msg.channel?.server}
                  size={14}
                />
                {msg.content ? (
                  <MarkdownView>{msg.content}</MarkdownView>
                ) : msg.attachments ? (
                  <Text style={{color: currentTheme.foregroundSecondary}}>
                    Sent an attachment
                  </Text>
                ) : msg.embeds ? (
                  <Text style={{color: currentTheme.foregroundSecondary}}>
                    Sent an embed
                  </Text>
                ) : (
                  <Text style={{color: currentTheme.foregroundSecondary}}>
                    No content
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>
          {isLikelyBridged && (
            <>
              <Text style={{marginVertical: 4}}>
                <Text style={{fontWeight: 'bold'}}>NOTE:</Text> This message may
                have been sent from another platform. If so, we recommend
                reporting it there as well.
              </Text>
            </>
          )}
          {reason.reason && !status.status && (
            <>
              <Text>You can add more context to your report here.</Text>
              <TextInput
                style={inputStyles}
                value={additionalContext}
                onChangeText={(c: string) => {
                  setAdditionalContext(c);
                }}
                placeholder={'Add more context (optional)'}
              />
              <Button
                onPress={async () =>
                  setStatus(
                    await sendReport(
                      {type: type, object: msg},
                      reason.reason,
                      additionalContext,
                    ),
                  )
                }>
                <Text>Report message</Text>
              </Button>
            </>
          )}
          {!reason.reason && <ReasonsSelector reasons={messageReasons} />}
          {status.status === 'success' && (
            <SuccessScreen reportedObject={props} />
          )}
        </>
      );
      break;
    case 'User':
      let user = object as User;
      output = (
        <>
          <Text type={'header'}>Report user</Text>
          {reason.reason && !status.status && (
            <>
              <Text>You can add more context to your report here.</Text>
              <TextInput
                style={inputStyles}
                value={additionalContext}
                onChangeText={(c: string) => {
                  setAdditionalContext(c);
                }}
                placeholder={'Add more context (optional)'}
              />
              <Button
                onPress={async () =>
                  setStatus(
                    await sendReport(
                      {type: type, object: user},
                      reason.reason,
                      additionalContext,
                    ),
                  )
                }>
                <Text>Report user</Text>
              </Button>
            </>
          )}
          {!reason.reason && <ReasonsSelector reasons={userReasons} />}
          {status.status === 'success' && (
            <SuccessScreen reportedObject={props} />
          )}
        </>
      );
      break;
    case 'Server':
      let server = object as Server;
      output = (
        <>
          <Text type={'header'}>Report server</Text>
          {reason.reason && !status.status && (
            <>
              <Text>You can add more context to your report here.</Text>
              <TextInput
                style={inputStyles}
                value={additionalContext}
                onChangeText={(c: string) => {
                  setAdditionalContext(c);
                }}
                placeholder={'Add more context (optional)'}
              />
              <Button
                onPress={async () =>
                  setStatus(
                    await sendReport(
                      {type: type, object: server},
                      reason.reason,
                      additionalContext,
                    ),
                  )
                }>
                <Text>Report server</Text>
              </Button>
            </>
          )}
          {!reason.reason && <ReasonsSelector reasons={serverReasons} />}
          {status.status === 'success' && (
            <SuccessScreen reportedObject={props} />
          )}
        </>
      );
      break;
  }
  return <View>{output}</View>;
});
