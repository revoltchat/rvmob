import {useMemo, useRef, useState} from 'react';
import {ScrollView, TextInput, View} from 'react-native';
import {observer} from 'mobx-react-lite';

import BottomSheetCore from '@gorhom/bottom-sheet';
import {useBackHandler} from '@react-native-community/hooks';

import {Message} from 'revolt.js';

import {app, client, setFunction} from '../../Generic';
import {USER_IDS} from '../../lib/consts';
import type {ReportedObject} from '../../lib/types';
import {commonValues, currentTheme} from '../../Theme';
import {Avatar, Button, Text, Username} from '../common/atoms';
import {MarkdownView} from '../common/MarkdownView';
import {BottomSheet} from '../common/BottomSheet';

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
  borderRadius: commonValues.sizes.medium,
  backgroundColor: currentTheme.headerSecondary,
  margin: commonValues.sizes.small,
  padding: 6,
  paddingHorizontal: commonValues.sizes.large,
  color: currentTheme.foregroundPrimary,
};

function SuccessScreen({reportedObject}: {reportedObject: ReportedObject}) {
  return (
    <>
      <Text style={{marginBottom: 10}}>
        Your report has been sent to the Revolt team for review - thank you for
        helping us keep Revolt safe.
      </Text>
      <Text type={'h1'}>Next steps</Text>
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
            <Button style={{backgroundColor: currentTheme.backgroundTertiary}}>
              <Text style={{color: currentTheme.foregroundTertiary}}>
                {reportedObject.type === 'Message'
                  ? 'Author blocked'
                  : 'User blocked'}
              </Text>
            </Button>
          ) : (
            <Button
              backgroundColor={currentTheme.error}
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
            You can also leave this server. Other members will not be notified.
          </Text>
          <Button
            backgroundColor={currentTheme.error}
            onPress={() => {
              reportedObject.object.delete(true);
            }}>
            <Text>Leave server</Text>
          </Button>
        </>
      )}
      <Button
        onPress={() => {
          app.openReportMenu(null);
        }}>
        <Text>Done</Text>
      </Button>
    </>
  );
}

function ReasonsSelector({
  reportedObject,
  reasons,
  setReason,
}: {
  reportedObject: ReportedObject;
  reasons: Reason[];
  setReason: Function;
}) {
  return (
    <>
      <Text>
        Why are you reporting this {reportedObject.type.toLowerCase()}? You can
        add more context after selecting a reason.
      </Text>
      {reportedObject.type === 'Message' &&
      reportedObject.object.channel?.server ? (
        <Text style={{fontWeight: 'bold', marginVertical: 8}}>
          This report will be sent to Revolt's moderation team, not this
          server's moderators.
        </Text>
      ) : null}
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

export const ReportSheet = observer(() => {
  const [obj, setObj] = useState(null as ReportedObject | null);

  const sheetRef = useRef<BottomSheetCore>(null);

  useBackHandler(() => {
    if (obj) {
      sheetRef.current?.close();
      return true;
    }

    return false;
  });

  setFunction('openReportMenu', async (o: ReportedObject | null) => {
    setObj(o);
    o ? sheetRef.current?.expand() : sheetRef.current?.close();
  });

  const [additionalContext, setAdditionalContext] = useState('');
  const [reason, setReason] = useState({} as Reason);
  const [status, setStatus] = useState({} as Status);

  const messageReasons = useMemo(
    () =>
      [
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
      ] as Reason[],
    [],
  );
  const serverReasons = useMemo(
    () =>
      [
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
      ] as Reason[],
    [],
  );
  const userReasons = useMemo(
    () =>
      [
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
      ] as Reason[],
    [],
  );

  let output = <></>;

  if (obj) {
    switch (obj.type) {
      case 'Message':
        let msg = obj.object as Message;
        const isLikelyBridged =
          msg.author?._id === USER_IDS.automod && msg.masquerade !== null;
        console.log(isLikelyBridged, msg.author?._id, msg.masquerade?.name);
        output = (
          <>
            <Text type={'h1'}>Report message</Text>
            <ScrollView style={{marginBottom: commonValues.sizes.small, maxHeight: '40%'}}>
              <View style={{flexDirection: 'row'}}>
                <Avatar
                  user={msg.author}
                  server={msg.channel?.server}
                  size={25}
                />
                <View
                  style={{
                    flexDirection: 'column',
                    marginLeft: commonValues.sizes.small,
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
                  <Text style={{fontWeight: 'bold'}}>NOTE:</Text> This message
                  may have been sent from another platform. If so, we recommend
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
                  placeholder={`Add more context (${
                    reason.reason === 'NoneSpecified'
                      ? 'recommended'
                      : 'optional'
                  })`}
                />
                <Button
                  onPress={async () =>
                    setStatus(
                      await sendReport(obj, reason.reason, additionalContext),
                    )
                  }>
                  <Text>Report message</Text>
                </Button>
              </>
            )}
            {!reason.reason && (
              <ReasonsSelector
                reasons={messageReasons}
                reportedObject={obj}
                setReason={setReason}
              />
            )}
            {status.status === 'success' && (
              <SuccessScreen reportedObject={obj} />
            )}
          </>
        );
        break;
      case 'User':
        output = (
          <>
            <Text type={'h1'}>Report user</Text>
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
                      await sendReport(obj, reason.reason, additionalContext),
                    )
                  }>
                  <Text>Report user</Text>
                </Button>
              </>
            )}
            {!reason.reason && (
              <ReasonsSelector
                reasons={userReasons}
                reportedObject={obj}
                setReason={setReason}
              />
            )}
            {status.status === 'success' && (
              <SuccessScreen reportedObject={obj} />
            )}
          </>
        );
        break;
      case 'Server':
        output = (
          <>
            <Text type={'h1'}>Report server</Text>
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
                      await sendReport(obj, reason.reason, additionalContext),
                    )
                  }>
                  <Text>Report server</Text>
                </Button>
              </>
            )}
            {!reason.reason && (
              <ReasonsSelector
                reasons={serverReasons}
                reportedObject={obj}
                setReason={setReason}
              />
            )}
            {status.status === 'success' && (
              <SuccessScreen reportedObject={obj} />
            )}
          </>
        );
        break;
    }
  }
  return (
    <BottomSheet sheetRef={sheetRef}>
      <View style={{paddingHorizontal: 16}}>{output}</View>
    </BottomSheet>
  );
});
