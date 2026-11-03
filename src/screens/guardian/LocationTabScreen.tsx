import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet, Button, Card, Row, Spacer, Stack, Text } from '@/components';
import { MapPlaceholder } from '@/components/Illustrations';
import { IconCircle, minutesAgoLabel, type RecipientLocation } from '@/features/home';
import { colors, screen, space } from '@/theme';

type Props = {
  recipientName: string;
  location: RecipientLocation;
  /** 당사자 휴대폰에 현재 위치 1회 요청 */
  onRefresh: () => void;
};

// 05-3 위치 탭 (design/screens/LocationTab.dc.html)
// 지도 전체 + 핀 1개 + 정확도 원. 이동 경로·과거 위치는 저장·표시하지 않는다.
// 지도가 화면 끝까지 채워져야 해서 Screen 대신 직접 배치한다.
export default function LocationTabScreen({ recipientName, location, onRefresh }: Props) {
  const insets = useSafeAreaInsets();
  const { sharing } = location;
  const accuracy = location.accuracyMeters > 0 ? String(location.accuracyMeters) : '[N]';

  return (
    <View style={styles.root}>
      {/* TODO: 실제 지도 SDK + 당사자 동의 화면 · 위치 정책 확정 후 연결 */}
      <View
        style={StyleSheet.absoluteFill}
        accessible
        accessibilityRole="image"
        accessibilityLabel={sharing ? `지도. ${recipientName}의 현재 위치 핀 하나` : '지도. 위치 공유 꺼짐'}
      >
        <MapPlaceholder pin={sharing} />
      </View>

      <View style={[styles.top, { paddingTop: insets.top + space[1] }]}>
        <Card style={styles.statusCard}>
          <Row gap={3} align="flex-start" accessible accessibilityLiveRegion="polite">
            <IconCircle icon={sharing ? 'tab-location' : 'pin-off'} tone={sharing ? 'success' : 'muted'} />
            <Stack flex>
              <Text variant="label">{sharing ? `${recipientName}이 위치를 공유하고 있어요` : '위치 공유 꺼짐'}</Text>
              <Text variant="small" color="textSecondary">
                {`${recipientName}은 언제든 자기 휴대폰에서 공유를 끌 수 있어요. 이동 경로는 저장하거나 보여 주지 않아요.`}
              </Text>
            </Stack>
          </Row>
        </Card>
      </View>

      <Spacer />

      {sharing && (
        <BottomSheet style={styles.sheet}>
          <Stack gap={3}>
            <Row justify="space-between" align="baseline" gap={2}>
              <Text variant="heading" accessibilityRole="header">
                {`${recipientName}의 위치`}
              </Text>
              <Text variant="caption" color="textSecondary">
                {`${location.updatedAt} 업데이트 · ${minutesAgoLabel(location.minutesAgo)}`}
              </Text>
            </Row>
            <Text variant="body">
              {location.address}
            </Text>
            <Text variant="small" color="textSecondary">
              {`정확도 약 ${accuracy}m · 휴대폰이 마지막으로 알려 준 위치예요`}
            </Text>
            <Button label="위치 새로고침" icon="retry" variant="secondary" size="sm" onPress={onRefresh} />
          </Stack>
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.line,
  },
  top: {
    paddingHorizontal: screen.gutterTab,
  },
  statusCard: {
    paddingVertical: space[3],
  },
  sheet: {
    paddingBottom: space[5],
  },
});
