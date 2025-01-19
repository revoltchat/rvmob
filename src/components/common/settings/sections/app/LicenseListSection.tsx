import {useContext, useEffect, useState} from 'react';
import {Platform, Pressable, SectionList, View} from 'react-native';
import {useTranslation} from 'react-i18next';

import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {styles} from '@clerotri/Theme';
import {Link, Text} from '@clerotri/components/common/atoms';
import {openUrl} from '@clerotri/lib/utils';
import {commonValues, ThemeContext} from '@clerotri/lib/themes';

import licenseList from '../../../../../../assets/data/licenses.json';

type Package = {
  name: string;
  version: string;
  url?: string;
  vendorName?: string;
  vendorUrl?: string;
};

interface SectionListLicenses {
  title: string;
  data: Package[];
}

const PackageEntry = ({packageInfo}: {packageInfo: Package}) => {
  const {currentTheme} = useContext(ThemeContext);

  return (
    <View
      key={`license-list-license-${packageInfo.name}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: commonValues.sizes.medium,
        borderRadius: commonValues.sizes.small,
        padding: commonValues.sizes.medium,
        backgroundColor: currentTheme.backgroundSecondary,
      }}>
      <View style={{flex: 1}}>
        <Text>
          <Text style={{fontWeight: 'bold'}}>{packageInfo.name}</Text>
          <Text colour={currentTheme.foregroundSecondary}>
            {' '}
            v{packageInfo.version}
          </Text>
        </Text>
        {packageInfo.vendorName ? (
          <Text colour={currentTheme.foregroundSecondary}>
            by{' '}
            {packageInfo.vendorUrl ? (
              <Link
                link={packageInfo.vendorUrl}
                label={packageInfo.vendorName}
              />
            ) : (
              packageInfo.vendorName
            )}
          </Text>
        ) : null}
      </View>
      {packageInfo.url ? (
        <Pressable
          onPress={() =>
            // @ts-expect-error there's a null check literally right above this???
            openUrl(packageInfo.url)
          }>
          <MaterialCommunityIcon
            name={'open-in-new'}
            color={currentTheme.foregroundPrimary}
            size={28}
          />
        </Pressable>
      ) : (
        <View />
      )}
    </View>
  );
};

export const LicenseListSection = () => {
  const {currentTheme} = useContext(ThemeContext);

  const {t} = useTranslation();

  const [data, setData] = useState<SectionListLicenses[] | null>(null);

  const renderItem = ({item}: {item: Package}) => {
    return <PackageEntry packageInfo={item} />;
  };

  const renderHeader = ({section: {title}}: {section: {title: string}}) => {
    return (
      <View style={{backgroundColor: currentTheme.backgroundPrimary}}>
        <Text type={'h2'}>{title}</Text>
      </View>
    );
  };

  const keyExtractor = (item: Package) => {
    return `license-list-entry-${item.name}-${item.version}`;
  };

  useEffect(() => {
    async function prepareData() {
      const newData: SectionListLicenses[] = [];

      licenseList.forEach(license => {
        newData.push({title: license.license, data: license.packages});
      });

      setData(newData);
    }

    prepareData();
  }, []);

  return (
    <View style={{flex: 1}}>
      {data ? (
        <SectionList
          key={'messageview-scrollview'}
          keyExtractor={keyExtractor}
          sections={data}
          style={{flex: 1}}
          contentContainerStyle={{
            paddingBottom:
              Platform.OS === 'web' ? 0 : commonValues.sizes.medium,
          }}
          renderSectionHeader={renderHeader}
          renderItem={renderItem}
          stickySectionHeadersEnabled
        />
      ) : (
        <View style={styles.loadingScreen}>
          <Text type={'h1'}>{t('app.settings_menu.licenses.loading')}</Text>
        </View>
      )}
    </View>
  );
};
