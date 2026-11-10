import { StyleSheet, View } from 'react-native';

import { Button, Card, Rhythm, Row, Screen, Stack, Text } from '@/components';
import { SignalListRow } from '@/features/home';
import { signalCategories, signalCategoryLabel, type Signal } from '@/features/signals';
import { space } from '@/theme';

type Props = {
  signals: readonly Signal[];
  onOpenSignal: (id: string) => void;
  onAddSignal: () => void;
};

// 05-2 신호 탭 (design/screens/SignalTab.dc.html)
export default function SignalTabScreen({ signals, onOpenSignal, onAddSignal }: Props) {
  const groups = signalCategories
    .map((category) => ({ category, items: signals.filter((s) => s.category === category) }))
    .filter((g) => g.items.length > 0);

  return (
    <Screen gutter="tab" inTabs scroll paddingTop={2} gap={7}>
      <Stack gap={3}>
        <Row justify="space-between" style={styles.header}>
          <Text variant="title1" accessibilityRole="header">
            신호
          </Text>
          <Button label="신호 추가" icon="plus" size="sm" onPress={onAddSignal} />
        </Row>
        <Row gap={4}>
          <Legend beat="S" label="짧게" />
          <Legend beat="L" label="길게" />
        </Row>
      </Stack>

      {groups.map(({ category, items }) => (
        <Card key={category} style={styles.group}>
          <Text variant="label" color="textSecondary" accessibilityRole="header" style={styles.groupTitle}>
            {signalCategoryLabel[category]}
          </Text>
          {items.map((signal) => (
            <SignalListRow key={signal.id} signal={signal} onPress={() => onOpenSignal(signal.id)} />
          ))}
        </Card>
      ))}
    </Screen>
  );
}

function Legend({ beat, label }: { beat: 'S' | 'L'; label: string }) {
  return (
    <Row gap={1}>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Rhythm beats={[beat]} size="sm" />
      </View>
      <Text variant="small" color="textSecondary">
        {label}
      </Text>
    </Row>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 56,
  },
  group: {
    paddingVertical: space[1],
  },
  groupTitle: {
    paddingTop: space[2],
    paddingBottom: space[1],
  },
});
