import {useState, useEffect, useRef} from 'react';
import {View, Pressable} from 'react-native';
import {observer} from 'mobx-react-lite';

import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  RepeatMode,
  Event,
  useProgress,
  usePlaybackState,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import Slider from '@react-native-community/slider';

import duration from 'dayjs/plugin/duration';
import dayjs from 'dayjs';
import {Attachment} from 'revolt.js';

import {styles, currentTheme} from '../../../Theme';
import {client} from '../../../Generic';
import {Text} from '../atoms';
import {getReadableFileSize} from '../../../lib/utils';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

(async function setupPlayer() {
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior:
        AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.Stop,
      Capability.SeekTo,
      Capability.JumpForward,
      Capability.JumpBackward,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.Stop,
      Capability.JumpForward,
      Capability.JumpBackward,
    ],
    progressUpdateEventInterval: 1,
  });
})();

async function setTrack(a: Attachment) {
  TrackPlayer.reset();
  await TrackPlayer.add([
    {
      id: a._id,
      url: client.generateFileURL(a),
      artist: 'RVMob',
      title: a.filename,
    },
  ]);
}
dayjs.extend(duration);
const _e = [Event.PlaybackTrackChanged, Event.PlaybackProgressUpdated];
export const AudioPlayer = observer(
  ({attachment: a}: {attachment: Attachment}) => {
    const [ready, setReady] = useState(false);
    const [mute, setMute] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const durationRef = useRef(0);

    useTrackPlayerEvents(_e, ev => {
      if (!ready) return;
      async function updatePlayer() {
        const selected = await TrackPlayer.getTrack(0);
        console.log('[AUDIOPLAYER] Now playing:', selected.id);
        selected.id == a._id ? setPlaying(true) : setReady(false);
      }
      if (ev.type == Event.PlaybackProgressUpdated) {
        durationRef.current = ev.duration;
        setPosition(ev.position);
      }
      ev.type == Event.PlaybackTrackChanged && updatePlayer();
    });
    useEffect(() => {
      async function setup() {
        setTrack(a);
      }
      ready ? setup() : setPlaying(false);
    }, [ready]);
    useEffect(() => {
      if (!ready) return;
      playing ? TrackPlayer.play() : TrackPlayer.pause();
    }, [playing]);
    useEffect(() => {
      ready && TrackPlayer.setVolume(mute ? 0 : 1);
    }, [mute]);
    return (
      <View
        style={{
          backgroundColor: currentTheme.headerPrimary,
          paddingVertical: 4,
          paddingHorizontal: 4,
        }}>
        <Text>{a.filename ?? 'unknown'}</Text>
        <Text style={styles.timestamp}>{getReadableFileSize(a.size)}</Text>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            height: 48,
            paddingHorizontal: 4,
            marginTop: 4,
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: currentTheme.backgroundSecondary,
          }}>
          <Pressable
            onPress={() => {
              ready ? setPlaying(p => !p) : setReady(true);
            }}>
            <MaterialCommunityIcon
              name={playing ? 'pause' : 'play'}
              size={24}
              color={currentTheme.foregroundSecondary}
            />
          </Pressable>
          <Slider
            style={{width: '56%', height: 24}}
            minimumValue={0}
            maximumValue={durationRef.current}
            onSlidingComplete={p => ready && TrackPlayer.seekTo(p)}
            onValueChange={p => setPosition(p)}
            value={position}
          />
          <Text>{`${
            position ? dayjs.duration(position, 's').format('mm:ss') : '--'
          }/${
            durationRef.current
              ? dayjs.duration(durationRef.current, 's').format('mm:ss')
              : '--'
          }`}</Text>
          <Pressable
            onPress={() => {
              setMute(m => !m);
            }}>
            <MaterialCommunityIcon
              name={mute ? 'volume-off' : 'volume-high'}
              size={24}
              color={currentTheme.foregroundSecondary}
            />
          </Pressable>
        </View>
      </View>
    );
  },
);
