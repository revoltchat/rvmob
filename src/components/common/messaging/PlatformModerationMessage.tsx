import {useContext} from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import type {Message} from 'revolt.js';

import {Text} from '@clerotri/components/common/atoms';
import {MarkdownView} from '@clerotri/components/common/MarkdownView';
import {commonValues, ThemeContext} from '@clerotri/lib/themes';

type Response = {
  response: string;
  match: string;
};

export const PlatformModerationMessage = observer(
  ({message}: {message: Message}) => {
    const {currentTheme} = useContext(ThemeContext);

    const REPORT_ID_REGEX = /[A-Z0-9]{6}/;
    const REPORT_TARGET_REGEX = /(@)?[^,]*/;
    const REPORT_REASON_REGEX = /[^,]*/;

    const reportResponses = [
      {response: 'invalid', match: 'marked as invalid.'},
      {
        response: 'falseReport',
        match: 'False reports may lead to additional action',
      },
      {
        response: 'insufficientEvidence',
        match: 'you have additional information to support your report',
      },
      {response: 'duplicate', match: 'as a duplicate.'},
      {response: 'actionTaken', match: 'appropriate action has been taken.'},
    ] as Response[];

    const isReport = message.content?.match('Your report');
    const isStrike = message.content?.match('received an account strike');

    let filteredContent;

    try {
      filteredContent = message.content
        ?.replace('Your report (', '')
        .replace('Report (', '');
    } catch (error) {
      console.log(
        `[PLATFORMMODERATIONMESSAGE] Something went wrong filtering message ${message._id}: ${error}`,
      );
    }

    let response = 'UNKNOWN';
    let responseText: string;
    let responseType: 'POSITIVE' | 'MIXED' | 'NEGATIVE' | 'UNKNOWN';

    for (const r of reportResponses) {
      if (filteredContent?.match(r.match)) {
        response = r.response;
      }
    }

    switch (response) {
      case 'invalid':
        responseText = 'Invalid report';
        responseType = 'NEGATIVE';
        break;
      case 'falseReport':
        responseText = 'False report';
        responseType = 'NEGATIVE';
        break;
      case 'insufficientEvidence':
        responseText = 'Insufficient report';
        responseType = 'MIXED';
        break;
      case 'duplicate':
        responseText = 'Duplicate report';
        responseType = 'NEGATIVE';
        break;
      case 'actionTaken':
        responseText = 'Action taken';
        responseType = 'POSITIVE';
        break;
      default:
        responseText = 'Unknown response';
        responseType = 'UNKNOWN';
    }

    const rawReportID = isReport
      ? filteredContent?.match(REPORT_ID_REGEX)
      : undefined;

    try {
      filteredContent = filteredContent
        ?.replace(REPORT_ID_REGEX, '')
        .replace(', ', '');
    } catch (error) {
      console.log(
        `[PLATFORMMODERATIONMESSAGE] Something went wrong 2-filtering message ${message._id}: ${error}`,
      );
    }

    const rawReportTarget = isReport
      ? filteredContent?.match(REPORT_TARGET_REGEX)
      : undefined;

    try {
      filteredContent = filteredContent
        ?.replace(REPORT_TARGET_REGEX, '')
        .replace(', ', '');
    } catch (error) {
      console.log(
        `[PLATFORMMODERATIONMESSAGE] Something went wrong 3-filtering message ${message._id}: ${error}`,
      );
    }

    const rawReportReason =
      isReport && filteredContent
        ? filteredContent.match(REPORT_REASON_REGEX)
        : undefined;

    console.log(filteredContent);

    try {
      filteredContent = filteredContent
        ?.replace(REPORT_REASON_REGEX, '')
        .replace(', ', '');
      // .replace(/".*"/, '');
    } catch (error) {
      console.log(
        `[PLATFORMMODERATIONMESSAGE] Something went wrong 4-filtering message ${message._id}: ${error}`,
      );
    }

    console.log(filteredContent);

    let reportID: string;

    let reportTarget: string;

    let reportReason: string;

    try {
      reportID = rawReportID ? rawReportID[0] : 'UNKNOWN';
    } catch (error) {
      console.log(
        `[PLATFORMMODERATIONMESSAGE] Something went wrong getting report ID from message ${message._id}: ${error}`,
      );
      reportID = 'UNKNOWN';
    }

    try {
      reportTarget = rawReportTarget ? rawReportTarget[0] : 'UNKNOWN';
    } catch (error) {
      console.log(
        `[PLATFORMMODERATIONMESSAGE] Something went wrong getting report target from message ${message._id}: ${error}`,
      );
      reportTarget = 'UNKNOWN';
    }

    try {
      reportReason = rawReportReason
        ? rawReportReason[0] ?? 'UNKNOWN'
        : 'UNKNOWN';
    } catch (error) {
      console.log(
        `[PLATFORMMODERATIONMESSAGE] Something went wrong getting report reason from message ${message._id}: ${error}`,
      );
      reportReason = 'UNKNOWN';
    }

    return (
      <View
        style={{
          backgroundColor: currentTheme.backgroundSecondary,
          padding: commonValues.sizes.medium,
          borderRadius: commonValues.sizes.medium,
          marginVertical: commonValues.sizes.xs,
        }}>
        <Text type={'h1'}>
          {isReport ? 'Report update' : isStrike ? 'Strike' : 'Alert'}
        </Text>
        {isReport ? (
          <>
            <Text colour={currentTheme.foregroundSecondary}>
              {reportID !== 'UNKNOWN'
                ? `Report ${reportID}`
                : 'Unknown report ID'}
              {' | '}
              {reportTarget !== 'UNKNOWN'
                ? `${reportTarget}`
                : 'Unknown subject'}
              {' | '}
              {reportReason !== 'UNKNOWN'
                ? `${reportReason}`
                : 'Unknown reason'}
            </Text>
            <Text type={'h2'}>Response</Text>
            <View style={{flexDirection: 'row'}}>
              <View style={{marginEnd: 4}}>
                <MaterialIcon
                  color={
                    responseType === 'POSITIVE'
                      ? currentTheme.statusOnline
                      : responseType === 'MIXED'
                      ? currentTheme.statusIdle
                      : responseType === 'NEGATIVE'
                      ? currentTheme.statusBusy
                      : currentTheme.statusInvisible
                  }
                  name={
                    responseType === 'POSITIVE'
                      ? 'check'
                      : responseType === 'MIXED'
                      ? 'warning'
                      : responseType === 'NEGATIVE'
                      ? 'not-interested'
                      : 'question-mark'
                  }
                  size={16}
                />
              </View>
              <Text>{responseText}</Text>
            </View>
          </>
        ) : (
          <MarkdownView>{message.content}</MarkdownView>
        )}
      </View>
    );
  },
);
