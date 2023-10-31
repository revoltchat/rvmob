import {useState, useRef, useEffect} from 'react';
import {Dimensions, Pressable} from 'react-native';
import {observer} from 'mobx-react-lite';

import {Attachment} from 'revolt.js';
import VideoPlayer from 'react-native-video-controls';

import {app, client} from '../../../Generic';

export const VideoEmbed = observer(
  ({attachment: a}: {attachment: Attachment}) => {
    const [expand, setExpand] = useState(false);
    const video = useRef(null);
    let width = a.metadata.width,
      height = a.metadata.height;
    if (width > Dimensions.get('screen').width - 75) {
      const sizeFactor = (Dimensions.get('screen').width - 75) / width;
      width = width * sizeFactor;
      height = height * sizeFactor;
    }
    const uri = client.generateFileURL(a);
    useEffect(() => {
      expand &&
        video.current &&
        video.current.setState({isFullscreen: false, paused: true}),
        setExpand(false);
    }, [expand]);
    return (
      <Pressable>
        <VideoPlayer
          ref={ref => (video.current = ref)}
          source={{uri}}
          tapAnywhereToPause
          disableBack
          onEnterFullscreen={() => {
            app.openVideo(uri, video.current);
            setExpand(false);
          }}
          onLoad={() => {
            video.current && video.current.setState({paused: true});
          }}
          style={{
            width: width,
            height: height,
            marginBottom: 4,
            borderRadius: 3,
          }}
        />
      </Pressable>
    );
  },
);
