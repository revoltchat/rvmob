import React from 'react';
import {View} from 'react-native';
import {observer} from 'mobx-react-lite';

import {app} from '../../Generic';
import {DeletableObject} from '../../lib/types';
import {currentTheme} from '../../Theme';
import {Button, Text} from '../common/atoms';

export const ConfirmDeletionModal = observer(
  ({target}: {target: DeletableObject}) => {
    return (
      <View
        style={{
          width: '80%',
          borderRadius: 8,
          padding: 20,
          backgroundColor: currentTheme.backgroundPrimary,
          justifyContent: 'center',
          alignSelf: 'center',
        }}>
        <Text type={'h1'}>Delete {target.type}?</Text>
        <Text>
          Are you sure you want to delete{' '}
          <Text style={{fontWeight: 'bold'}}>
            {target.type === 'Server' ? target.object.name : 'this message'}
          </Text>
          ?
        </Text>
        <Text style={{fontWeight: 'bold'}}>This cannot be undone.</Text>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            marginTop: 10,
          }}>
          <Button
            onPress={async () => {
              switch (target.type) {
                case 'Server':
                  app.openServerContextMenu(null);
                  app.openServer(undefined);
                  app.openServerSettings(null);
                  target.object.delete();
                  app.openDeletionConfirmationModal(null);
                  break;
                case 'Message':
                  await target.object.delete();
                  break;
                default:
                  break;
              }
            }}
            backgroundColor={currentTheme.error}
            style={{marginHorizontal: 0}}>
            <Text>Delete</Text>
          </Button>
          <Button
            onPress={() => {
              app.openDeletionConfirmationModal(null);
            }}
            style={{marginHorizontal: 0}}>
            <Text>Cancel</Text>
          </Button>
        </View>
      </View>
    );
  },
);
