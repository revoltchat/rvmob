import {useEffect, useState} from 'react';
import {Platform, ScrollView, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import {DOMParser} from '@xmldom/xmldom';

import {app, client} from '@rvmob/Generic';
import {currentTheme, styles} from '@rvmob/Theme';
import {Button, Text} from '@rvmob/components/common/atoms';
import {ChannelHeader} from '@rvmob/components/navigation/ChannelHeader';
import {SpecialChannelIcon} from '@rvmob/components/navigation/SpecialChannelIcon';

const parser = new DOMParser({
  errorHandler: (level, message) => {
    if (level === 'error') {
      throw new Error(message);
    }
  },
});

const renderServers = (servers: any) => {
  return servers.map((server: any) => {
    console.log(server);
    return (
      <View
        key={`discover-entry-${server._id}`}
        style={{
          marginBottom: 8,
          borderRadius: 8,
          padding: 8,
          backgroundColor: currentTheme.backgroundSecondary,
        }}>
        <Text type={'h1'}>{server.name}</Text>
        <Text colour={currentTheme.foregroundSecondary}>{server._id}</Text>
        <Button
          onPress={async () => {
            !client.servers.get(server._id) &&
              (await client.joinInvite(server._id));
            app.openServer(client.servers.get(server._id));
            app.openLeftMenu(true);
          }}>
          <Text>
            {client.servers.get(server._id) ? 'Go to Server' : 'Join Server'}
          </Text>
        </Button>
      </View>
    );
  });
};

export const DiscoverPage = () => {
  const {t} = useTranslation();

  const [tab, setTab] = useState<'servers' | 'bots'>('servers');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const rawData = await fetch(`https://rvlt.gg/discover/${tab}`);
      const unparsedText = await rawData.text();

      // code based on https://codeberg.org/Doru/Discoverolt/src/branch/pages/index.html

      const rawJSON = parser
        .parseFromString(unparsedText, 'text/html')
        // @ts-expect-error hmm
        .getElementById('__NEXT_DATA__')?.childNodes[0].data;
      const json = JSON.parse(rawJSON).props.pageProps;
      setData(json);
    }

    fetchData();
  }, [tab]);

  return (
    <View style={{flex: 1}}>
      <ChannelHeader>
        <View style={styles.iconContainer}>
          <SpecialChannelIcon channel={'Discover'} />
        </View>
        <Text style={styles.channelName}>
          {t(`app.discover.header_${tab}`)}
        </Text>
      </ChannelHeader>
      <View style={{flexDirection: 'row', margin: 8}}>
        <Button
          style={{flex: 1}}
          onPress={() => {
            if (tab !== 'servers') {
              setData(null);
              setTab('servers');
            }
          }}>
          <Text>{t('app.discover.tabs.servers')}</Text>
        </Button>
        <Button
          style={{flex: 1}}
          onPress={() => {
            if (tab !== 'bots') {
              setData(null);
              setTab('bots');
            }
          }}>
          <Text>{t('app.discover.tabs.bots')}</Text>
        </Button>
      </View>
      {data ? (
        <>
          <ScrollView
            style={{flex: 1, padding: 8}}
            contentContainerStyle={{
              paddingBottom: Platform.OS === 'web' ? 0 : 8,
            }}>
            {tab === 'servers' ? (
              <>
                <Text type={'h2'}>
                  {t('app.discover.count_servers', {
                    count: data.servers.length,
                  })}
                </Text>
                {renderServers(data.servers)}
              </>
            ) : (
              <></>
            )}
          </ScrollView>
        </>
      ) : (
        <Text>{t(`app.discover.fetching_${tab}`)}</Text>
      )}
    </View>
  );
};
