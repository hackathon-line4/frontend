import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomSheet,
  Button,
  Card,
  Row,
  Spacer,
  Stack,
  Text,
} from "@/components";
import { MapPlaceholder } from "@/components/Illustrations";
import {
  IconCircle,
  minutesAgoLabel,
  type RecipientLocation,
} from "@/features/home";
import { TileMap } from "@/features/location/TileMap";
import { colors, screen, space } from "@/theme";

type Props = {
  recipientName: string;
  location: RecipientLocation;
  /** 받은 위치가 있는지. 없으면 '아직 받은 위치가 없어요' (기본값: 미리보기용 true) */
  hasPoint?: boolean;
  /** 위치를 요청하고 답을 기다리는 중 */
  refreshing?: boolean;
  /** 요청 실패 · 답 없음 안내 */
  notice?: string | null;
  /** 당사자 휴대폰에 현재 위치 1회 요청 */
  onRefresh: () => void;
  /** 휴대폰의 지도 앱으로 열기 */
  onOpenMap?: () => void;
};

// 05-3 위치 탭 (design/screens/LocationTab.dc.html)
// 지도 SDK 없이: 배경은 그림, 실제 위치는 '지도 앱에서 보기'로 휴대폰의 지도 앱에서 연다.
// 이동 경로·과거 위치는 저장·표시하지 않는다.
export default function LocationTabScreen({
  recipientName,
  location,
  hasPoint = true,
  refreshing = false,
  notice,
  onRefresh,
  onOpenMap,
}: Props) {
  const insets = useSafeAreaInsets();
  const { sharing } = location;
  const accuracy =
    location.accuracyMeters > 0 ? String(location.accuracyMeters) : "[N]";
  // 아래 시트에 가리지 않게 지도는 시트 위까지만 그린다 (핀이 보이는 부분의 가운데)
  const [mapBottom, setMapBottom] = useState(0);

  return (
    <View style={styles.root}>
      <View
        style={StyleSheet.absoluteFill}
        accessible
        accessibilityRole="image"
        accessibilityLabel={
          sharing
            ? `지도. ${recipientName}의 현재 위치 핀 하나`
            : "지도. 위치 공유 꺼짐"
        }
      >
        {sharing && location.point ? (
          <TileMap
            latitude={location.point.latitude}
            longitude={location.point.longitude}
            accuracyM={location.accuracyMeters}
            zoom={16}
            pinSize={32}
            style={[StyleSheet.absoluteFill, { bottom: mapBottom }]}
          />
        ) : (
          <MapPlaceholder pin={sharing && hasPoint} />
        )}
      </View>

      <View style={[styles.top, { paddingTop: insets.top + space[1] }]}>
        <Card style={styles.statusCard}>
          <Row
            gap={3}
            align="flex-start"
            accessible
            accessibilityLiveRegion="polite"
          >
            <IconCircle
              icon={sharing ? "tab-location" : "pin-off"}
              tone={sharing ? "success" : "muted"}
            />
            <Stack flex>
              <Text variant="label">
                {sharing
                  ? `${recipientName}이 위치를 공유하고 있어요`
                  : "위치 공유 꺼짐"}
              </Text>
              <Text variant="small" color="textSecondary">
                {`${recipientName}은 언제든 자기 휴대폰에서 공유를 끌 수 있어요. 이동 경로는 저장하거나 보여 주지 않아요.`}
              </Text>
            </Stack>
          </Row>
        </Card>
      </View>

      <Spacer />

      {sharing && (
        <View onLayout={(e) => setMapBottom(e.nativeEvent.layout.height)}>
          <BottomSheet style={styles.sheet}>
            <Stack gap={3}>
              <Row justify="space-between" align="baseline" gap={2}>
                <Text variant="heading" accessibilityRole="header">
                  {`${recipientName}의 위치`}
                </Text>
                {hasPoint && (
                  <Text variant="caption" color="textSecondary">
                    {`${location.updatedAt} 업데이트 · ${minutesAgoLabel(location.minutesAgo)}`}
                  </Text>
                )}
              </Row>
              {hasPoint ? (
                <>
                  <Text variant="body">{location.address}</Text>
                  <Text variant="small" color="textSecondary">
                    {`정확도 약 ${accuracy}m · 휴대폰이 마지막으로 알려 준 위치예요`}
                  </Text>
                </>
              ) : (
                <Text variant="body" color="textSecondary">
                  {`아직 받은 위치가 없어요. 위치 새로고침을 누르면 ${recipientName}의 휴대폰에 지금 위치를 한 번 물어봐요.`}
                </Text>
              )}
              {notice ? (
                <Text
                  variant="small"
                  color="textSecondary"
                  accessibilityLiveRegion="polite"
                >
                  {notice}
                </Text>
              ) : null}
              <Row gap={2}>
                {onOpenMap && (
                  <Stack flex>
                    <Button
                      label="지도 앱에서 보기"
                      icon="tab-location"
                      size="sm"
                      onPress={onOpenMap}
                    />
                  </Stack>
                )}
                <Stack flex>
                  <Button
                    label={refreshing ? "위치 받는 중…" : "위치 새로고침"}
                    icon="retry"
                    variant="secondary"
                    size="sm"
                    disabled={refreshing}
                    onPress={onRefresh}
                  />
                </Stack>
              </Row>
            </Stack>
          </BottomSheet>
        </View>
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
