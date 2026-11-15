import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, Stack, Text, type IconName } from '@/components';
import { colors, radius, space } from '@/theme';

type Props = {
  visible: boolean;
  icon?: IconName;
  title: string;
  message?: string;
  confirmLabel: string;
  /** 되돌릴 수 없는 동작(삭제 등)이면 확인 버튼을 긴급 색으로 */
  destructive?: boolean;
  busy?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// 앱 디자인의 확인 창 (OS 기본 Alert 대신). 보호자 앱 공용.
export function ConfirmDialog({ visible, icon = 'warning', title, message, confirmLabel, destructive, busy, error, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={busy ? undefined : onCancel} accessibilityRole="button" accessibilityLabel="취소" />
        <Card variant="emphasis" style={styles.card}>
          <Stack gap={4} align="center">
            <View style={[styles.iconCircle, destructive && styles.iconDanger]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <Icon name={icon} size={28} strokeWidth={2.4} color={destructive ? colors.surface : undefined} />
            </View>
            <Stack gap={2} align="center" accessible accessibilityRole="alert" accessibilityLabel={message ? `${title}. ${message}` : title}>
              <Text variant="heading" style={styles.center}>{title}</Text>
              {message && <Text color="textSecondary" style={styles.center}>{message}</Text>}
            </Stack>
            {error && <Text accessibilityRole="alert" color="dangerFg" style={styles.center}>{error}</Text>}
            <Stack gap={2} style={styles.actions}>
              <Button label={confirmLabel} variant={destructive ? 'emergency' : 'primary'} disabled={busy} onPress={onConfirm} />
              <Button label="취소" variant="text" underline={false} disabled={busy} onPress={onCancel} />
            </Stack>
          </Stack>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: space[6], backgroundColor: 'rgba(28, 28, 28, 0.45)' },
  card: { paddingVertical: space[6], paddingHorizontal: space[5] },
  iconCircle: { width: 60, height: 60, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.yellow100 },
  iconDanger: { backgroundColor: colors.emergency },
  center: { textAlign: 'center' },
  actions: { alignSelf: 'stretch' },
});
