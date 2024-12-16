import {useContext} from 'react';
import {View} from 'react-native';
import {Trans, useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import {app} from '@rvmob/Generic';
import {commonValues, ThemeContext} from '@rvmob/lib/themes';
import {DeletableObject} from '@rvmob/lib/types';
import {Button, Text} from '@rvmob/components/common/atoms';

export const ConfirmDeletionModal = observer(
  ({target}: {target: DeletableObject}) => {
    const {currentTheme} = useContext(ThemeContext);

    const {t} = useTranslation();
    const name = target.type === 'Server' ? target.object.name : '';
    return (
      <View
        style={{
          width: '80%',
          borderRadius: commonValues.sizes.medium,
          padding: 20,
          backgroundColor: currentTheme.backgroundPrimary,
          justifyContent: 'center',
          alignSelf: 'center',
        }}>
        <Text type={'h1'}>
          {t(`app.modals.confirm_deletion.header_${target.type.toLowerCase()}`)}
        </Text>
        {target.type === 'Server' ? (
          <Trans t={t} i18nKey={'app.modals.confirm_deletion.body_server'}>
            Are you sure you want to delete{' '}
            <Text style={{fontWeight: 'bold'}}>
              {
                // @ts-expect-error this is an i18next placeholder
                {name}
              }
            </Text>
            ?
          </Trans>
        ) : (
          <Trans
            t={t}
            i18nKey={`app.modals.confirm_deletion.body_${target.type.toLowerCase()}`}>
            Are you sure you want to delete{' '}
            <Text style={{fontWeight: 'bold'}}>
              this {target.type.toLowerCase()}
            </Text>
            ?
          </Trans>
        )}
        <Text style={{fontWeight: 'bold'}}>
          {t('app.modals.confirm_deletion.warning')}
        </Text>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            marginTop: 10,
          }}>
          <Button
            onPress={async () => {
              switch (target.type) {
                case 'Role':
                  app.closeRoleSubsection();
                  target.object.server.deleteRole(target.object.role);
                  app.openDeletionConfirmationModal(null);
                  break;
                case 'Server':
                  app.openServerContextMenu(null);
                  app.openServer(undefined);
                  app.openServerSettings(null);
                  target.object.delete();
                  app.openDeletionConfirmationModal(null);
                  break;
                case 'Message':
                  await target.object.delete();
                  app.openDeletionConfirmationModal(null);
                  break;
                default:
                  break;
              }
            }}
            backgroundColor={currentTheme.error}
            style={{marginHorizontal: 0}}>
            <Text>{t('app.actions.delete')}</Text>
          </Button>
          <Button
            onPress={() => {
              app.openDeletionConfirmationModal(null);
            }}
            style={{marginHorizontal: 0}}>
            <Text>{t('app.actions.cancel')}</Text>
          </Button>
        </View>
      </View>
    );
  },
);
