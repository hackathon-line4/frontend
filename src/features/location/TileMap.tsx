import { useState } from 'react';
import { Image, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components';
import { colors } from '@/theme';

// 좌표 하나를 지도 위 핀으로 보여 준다. 지도 SDK · API 키 없이 OpenStreetMap 지도 조각(256px)을 직접 깐다.
// 끌기 · 확대는 없다. 위치 주변만 보여 주고, 자세히 볼 때는 '지도 앱에서 보기'로 연다.
// OpenStreetMap 이용 규칙: 출처 표기, 앱을 알리는 User-Agent.

const TILE = 256;
const TILE_URL = 'https://tile.openstreetmap.org';
const HEADERS = { 'User-Agent': 'Sonullim/1.0 (hackathon demo app)' };

type Props = {
  latitude: number;
  longitude: number;
  /** 정확도 원 (미터) */
  accuracyM?: number | null;
  /** 15 = 동네, 17 = 골목 */
  zoom?: number;
  /** 핀 크기. 썸네일에서는 작게 */
  pinSize?: number;
  /** 출처 표기. 아주 작은 썸네일에서는 화면 다른 곳에 표기한다 */
  attribution?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** 좌표 → 지도 조각 좌표 (소수점까지) */
function toTile(latitude: number, longitude: number, zoom: number) {
  const n = 2 ** zoom;
  const lat = (latitude * Math.PI) / 180;
  return {
    x: ((longitude + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * n,
  };
}

/** 이 확대 단계에서 지도 1px이 몇 미터인지 */
function metersPerPixel(latitude: number, zoom: number) {
  return (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom;
}

export function TileMap({ latitude, longitude, accuracyM, zoom = 16, pinSize = 28, attribution = true, style }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.width || height !== size.height) setSize({ width, height });
  };

  const center = toTile(latitude, longitude, zoom);
  const left = center.x * TILE - size.width / 2;
  const top = center.y * TILE - size.height / 2;
  const max = 2 ** zoom;
  const tiles: { x: number; y: number }[] = [];
  if (size.width > 0) {
    for (let x = Math.floor(left / TILE); x <= Math.floor((left + size.width) / TILE); x++) {
      for (let y = Math.floor(top / TILE); y <= Math.floor((top + size.height) / TILE); y++) {
        if (y >= 0 && y < max) tiles.push({ x, y });
      }
    }
  }
  const radius = accuracyM ? Math.min(accuracyM / metersPerPixel(latitude, zoom), Math.max(size.width, size.height)) : 0;

  return (
    <View style={[styles.root, style]} onLayout={onLayout}>
      {tiles.map(({ x, y }) => (
        <Image
          key={`${x}:${y}`}
          source={{ uri: `${TILE_URL}/${zoom}/${((x % max) + max) % max}/${y}.png`, headers: HEADERS }}
          style={[styles.tile, { left: x * TILE - left, top: y * TILE - top }]}
          fadeDuration={0}
        />
      ))}
      {radius > pinSize / 2 && (
        <View
          pointerEvents="none"
          style={[styles.accuracy, { width: radius * 2, height: radius * 2, borderRadius: radius, left: size.width / 2 - radius, top: size.height / 2 - radius }]}
        />
      )}
      {size.width > 0 && (
        <View
          pointerEvents="none"
          style={[styles.pin, { width: pinSize, height: pinSize, borderRadius: pinSize / 2, left: size.width / 2 - pinSize / 2, top: size.height / 2 - pinSize / 2 }]}
        >
          <View style={[styles.pinDot, { width: pinSize / 3, height: pinSize / 3, borderRadius: pinSize / 6 }]} />
        </View>
      )}
      {attribution && (
        <View style={styles.attribution} pointerEvents="none">
          <Text variant="small" color="textSecondary">© OpenStreetMap</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    backgroundColor: colors.line,
  },
  tile: {
    position: 'absolute',
    width: TILE,
    height: TILE,
  },
  accuracy: {
    position: 'absolute',
    backgroundColor: 'rgba(245, 200, 76, 0.22)',
    borderWidth: 1.5,
    borderColor: colors.yellow500,
  },
  pin: {
    position: 'absolute',
    backgroundColor: colors.yellow500,
    borderWidth: 3,
    borderColor: colors.ink900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    backgroundColor: colors.ink900,
  },
  attribution: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});
