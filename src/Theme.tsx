import {StyleSheet} from 'react-native';

import {commonValues} from '@rvmob/lib/themes';

export var styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingHeader: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 30,
  },
  channelName: {
    flex: 1,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    marginRight: commonValues.sizes.medium,
  },
  messagesView: {
    padding: 10,
    paddingHorizontal: 5,
    flex: 1,
  },
  headerIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  serverName: {
    marginVertical: 10,
    maxWidth: '90%',
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendsListHeader: {
    fontWeight: 'bold',
    margin: 5,
    marginLeft: 10,
    marginTop: 10,
  },
});
