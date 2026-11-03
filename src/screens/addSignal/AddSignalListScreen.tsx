import { useMemo, useState } from 'react';

import { Button, Card, Screen, SegmentedTabs, Stack, Text } from '@/components';
import {
  AddSignalHeader,
  SearchField,
  SignalOptionRow,
  StepIntro,
  type BasicSignalEntry,
} from '@/features/addSignal';
import { signalCategories, signalCategoryLabel, type SignalCategory } from '@/features/signals';

type Props = {
  /** 현장 촉신호 어휘 */
  entries: readonly BasicSignalEntry[];
  /** 이미 추가한 신호 id: '이미 추가됨'으로 선택 불가 */
  addedIds: readonly string[];
  initialSelectedId?: string;
  onBack: () => void;
  onClose: () => void;
  onContinue: (entry: BasicSignalEntry) => void;
};

const categoryOptions = signalCategories.map((value) => ({ value, label: signalCategoryLabel[value] }));

// 10-2 신호 추가 1 · 촉신호 목록 (design/screens/Add1List.dc.html)
export default function AddSignalListScreen({
  entries,
  addedIds,
  initialSelectedId,
  onBack,
  onClose,
  onContinue,
}: Props) {
  const initial = entries.find((e) => e.id === initialSelectedId);
  const [selectedId, setSelectedId] = useState<string | undefined>(initial?.id);
  const [category, setCategory] = useState<SignalCategory>(initial?.category ?? 'daily');
  const [query, setQuery] = useState('');

  const trimmed = query.trim();
  // 검색어가 있으면 모든 카테고리에서 찾는다
  const visible = useMemo(
    () => entries.filter((e) => (trimmed ? e.name.includes(trimmed) : e.category === category)),
    [entries, trimmed, category],
  );
  const selected = entries.find((e) => e.id === selectedId);

  return (
    <Screen
      scroll
      gap={3}
      header={<AddSignalHeader onBack={onBack} onClose={onClose} />}
      footer={
        <Button
          label={selected ? `'${selected.name}'로 계속` : '다음'}
          disabled={!selected}
          onPress={() => selected && onContinue(selected)}
        />
      }
    >
      <StepIntro step={1} title="촉신호 목록에서 고르기" />
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="신호 이름으로 찾기"
        accessibilityLabel="신호 검색"
      />
      {!trimmed && <SegmentedTabs options={categoryOptions} value={category} onChange={setCategory} />}
      <Card style={{ paddingVertical: 0 }}>
        <Stack
          accessibilityRole="radiogroup"
          accessibilityLabel={trimmed ? '검색 결과' : `${signalCategoryLabel[category]} 신호`}
        >
          {visible.length === 0 ? (
            <Stack paddingY={6} align="center">
              <Text variant="caption" color="textSecondary">
                찾는 신호가 없어요
              </Text>
            </Stack>
          ) : (
            visible.map((entry, i) => (
              <SignalOptionRow
                key={entry.id}
                name={entry.name}
                meaning={entry.meaning}
                beats={entry.beats}
                selected={entry.id === selectedId}
                added={addedIds.includes(entry.id)}
                divider={i > 0}
                onPress={() => setSelectedId(entry.id)}
              />
            ))
          )}
        </Stack>
      </Card>
    </Screen>
  );
}
