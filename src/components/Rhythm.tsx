import { View } from 'react-native';

import { colors, describeRhythm, rhythmSize, type Beat, type RhythmSize } from '@/theme';

type RhythmProps = {
  beats: readonly Beat[];
  size?: RhythmSize;
  color?: string;
  /** 재생 중인 박자 번호 (0부터). 지난 박자는 진하게, 남은 박자는 회색 */
  playingIndex?: number;
};

export function Rhythm({ beats, size = 'sm', color = colors.ink900, playingIndex }: RhythmProps) {
  const s = rhythmSize[size];
  const playing = playingIndex !== undefined;
  const label = describeRhythm(beats) + (playing ? `, ${playingIndex + 1}번째 재생 중` : '');

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={{ flexDirection: 'row', alignItems: 'center', gap: s.gap }}
    >
      {beats.map((beat, i) => (
        <View
          key={i}
          style={{
            width: s[beat],
            height: s.height,
            borderRadius: s.height / 2,
            backgroundColor: playing && i > playingIndex ? colors.borderInput : color,
          }}
        />
      ))}
    </View>
  );
}
