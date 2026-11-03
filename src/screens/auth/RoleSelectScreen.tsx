import { StyleSheet, View } from 'react-native';

import { ChoiceCard, Note, Screen, ScreenTitle } from '@/components';
import { GuardianRoleGlyph, RecipientRoleGlyph } from '@/components/Illustrations';
import type { Role } from '@/features/session';

// 03-3 역할 선택 (design/screens/RoleSelect.dc.html). 역할은 나중에 설정에서 변경 가능.
export default function RoleSelectScreen({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <Screen
      scroll
      contentStyle={styles.content}
      footer={<Note align="center">역할은 나중에 설정에서 바꿀 수 있어요.</Note>}
    >
      <ScreenTitle title="어떻게 사용하시나요?" description="나에게 맞는 역할을 골라 주세요." />
      <View style={styles.cards}>
        <ChoiceCard
          title="보호자로 시작하기"
          description="가족이나 활동지원사로서 메시지를 글로 쓰고, 전달 방식과 진동 세기를 설정해요."
          visual={<GuardianRoleGlyph />}
          onPress={() => onSelect('guardian')}
        />
        <ChoiceCard
          title="당사자로 시작하기"
          description="진동으로 메시지를 받고, 화면을 탭해서 답하거나 먼저 보낼 수 있어요."
          visual={<RecipientRoleGlyph />}
          onPress={() => onSelect('recipient')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 48,
  },
  cards: {
    marginTop: 32,
    gap: 16,
  },
});
