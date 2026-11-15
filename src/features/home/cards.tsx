import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Card, Icon, Row, Stack, StatusChip, Text } from '@/components';
import { MapThumbnail } from '@/components/Illustrations';
import { colors, fontFamily, radius, space } from '@/theme';

import { ChevronLink } from './components';
import { isOverdue, minutesAgoLabel } from './format';
import type { RecipientLocation, RecipientStatus } from './types';
import { TileMap } from '@/features/location/TileMap';

/* ---------- RecipientStatusCard ---------- */

type RecipientStatusCardProps = {
  status: RecipientStatus;
  /** 주의 상태에서 눌렀을 때 (응답 없음 상세) */
  onPressNoReply?: () => void;
};

// 홈 05-1 당사자 상태. 응답 대기 시간을 넘기면 주의 색 + 경고 아이콘 + '응답 없음 · N분째'
export function RecipientStatusCard({ status, onPressNoReply }: RecipientStatusCardProps) {
  const overdue = status.state ? status.state === 'NO_RESPONSE' : isOverdue(status.pendingMinutes, status.waitMinutes);
  const help = status.state === 'HELP_REQUESTED';

  return (
    <Card style={overdue && styles.caution}>
      <Stack gap={3}>
        <Row gap={3}>
          <Avatar name={status.name} size="md" />
          <Text variant="heading" style={styles.flex}>
            {status.name}
          </Text>
          {status.connected ? <StatusChip status="connected" /> : <Text variant="caption">기기 연결 미확인</Text>}
        </Row>

        {overdue || help ? (
          <Pressable
            onPress={onPressNoReply}
            accessibilityRole="button"
            accessibilityLabel={help ? '도움 요청 확인하기' : `응답 없음 · ${status.pendingMinutes ?? 0}분째`}
            accessibilityLiveRegion="polite"
            style={({ pressed }) => [styles.line, styles.cautionLine, pressed && styles.pressed]}
          >
            <Icon name="warning" size={18} color={colors.warningFg} strokeWidth={2.4} />
            <Text variant="label" style={[styles.flex, { color: colors.warningFg }]}>
              {help ? '도움 요청이 왔어요' : `응답 없음 · ${status.pendingMinutes ?? 0}분째`}
            </Text>
            <Icon name="chevron-right" size={18} color={colors.warningFg} strokeWidth={2.4} />
          </Pressable>
        ) : status.state === 'WAITING' ? <Text accessibilityLiveRegion="polite">{`'${status.signalName ?? '신호'}' 응답 대기 중 · ${status.pendingMinutes ?? 0}분째`}</Text> : (
          status.lastReply && (
            <View style={styles.line}>
              <Icon name="reply" size={18} strokeWidth={2.2} />
              <Text variant="caption" style={styles.flex}>
                마지막 응답 <Text variant="caption" style={styles.bold}>{`'${status.lastReply.label}'`}</Text>
                {` · ${minutesAgoLabel(status.lastReply.minutesAgo)}`}
              </Text>
            </View>
          )
        )}
      </Stack>
    </Card>
  );
}

/* ---------- LocationPreviewCard ---------- */

type LocationPreviewCardProps = {
  location: RecipientLocation;
  onPressDetail: () => void;
};

// 홈 05-1 위치 미리보기. 공유가 꺼져 있으면 썸네일 대신 꺼진 핀 + '위치 공유 꺼짐'
export function LocationPreviewCard({ location, onPressDetail }: LocationPreviewCardProps) {
  return (
    <Card>
      <Row gap={4}>
        {location.sharing ? (
          <View style={styles.thumb} accessible accessibilityRole="image" accessibilityLabel="위치 미리보기 지도">
            {location.point ? (
              <TileMap latitude={location.point.latitude} longitude={location.point.longitude} zoom={15} pinSize={18} attribution={false} style={styles.tileThumb} />
            ) : (
              <MapThumbnail size={96} />
            )}
          </View>
        ) : (
          <View style={[styles.thumb, styles.thumbOff]}>
            <Icon name="pin-off" size={32} color={colors.textSecondary} />
          </View>
        )}
        <Stack gap={1} flex>
          <Text variant="heading" accessibilityRole="header">
            위치
          </Text>
          {location.sharing ? (
            <>
              <Text variant="caption" color="textSecondary">
                {`마지막 업데이트 ${location.updatedAt} · ${minutesAgoLabel(location.minutesAgo)}`}
              </Text>
              <Text variant="caption" style={styles.medium}>
                {location.addressSummary}
              </Text>
            </>
          ) : (
            <Text variant="caption" color="textSecondary">
              위치 공유 꺼짐
            </Text>
          )}
          <ChevronLink label="자세히 보기" strong onPress={onPressDetail} />
        </Stack>
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bold: { fontFamily: fontFamily.bold },
  medium: { fontFamily: fontFamily.medium },
  pressed: { opacity: 0.8 },

  caution: {
    backgroundColor: colors.warningBg,
    borderWidth: 1.5,
    borderColor: colors.warningBorder,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingVertical: 10,
    paddingHorizontal: space[3],
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceSunken,
  },
  cautionLine: {
    minHeight: 48,
    backgroundColor: colors.surface,
  },

  tileThumb: { width: 96, height: 96 },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  thumbOff: {
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
