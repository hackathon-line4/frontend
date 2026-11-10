import { StyleSheet } from 'react-native';

import { InfoBox, Stack, Text } from '@/components';
import { fontFamily } from '@/theme';

// 08 신호 기록 · 표시 기준 안내 ('기기 전달'·'터치 응답'의 뜻)
export function RecordLegend() {
  return (
    <InfoBox>
      <Stack gap={1} accessibilityLabel="표시 기준">
        <Text variant="caption" color="textSecondary">
          <Text variant="caption" style={styles.strong}>
            기기 전달
          </Text>
          은 당사자 휴대폰의 앱이 신호를 받았다고 알려 온 경우에만 표시돼요.
        </Text>
        <Text variant="caption" color="textSecondary">
          <Text variant="caption" style={styles.strong}>
            터치 응답
          </Text>
          은 당사자가 화면을 터치한 기록이에요. 신호의 뜻을 알아들었다는 뜻은 아니에요.
        </Text>
      </Stack>
    </InfoBox>
  );
}

const styles = StyleSheet.create({
  strong: { fontFamily: fontFamily.bold },
});
