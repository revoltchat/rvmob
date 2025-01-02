import {View} from 'react-native';

import {Image} from '@rvmob/crossplat/Image';
import {client} from '@rvmob/lib/client';
import {DEFAULT_MAX_SIDE} from '@rvmob/lib/consts';

export const GeneralAvatar = ({
  attachment,
  size,
  directory,
}: {
  attachment: any;
  size: number;
  directory?: string;
}) => {
  const uri = directory
    ? client.configuration?.features.autumn.url + directory + attachment
    : client.generateFileURL(attachment) + '?max_side=' + DEFAULT_MAX_SIDE;
  return (
    <View>
      {
        <Image
          source={{
            uri: uri,
          }}
          style={{width: size || 35, height: size || 35, borderRadius: 10000}}
        />
      }
    </View>
  );
};
