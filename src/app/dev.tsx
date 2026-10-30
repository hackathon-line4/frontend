import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, ListRow, Screen, ScreenTitle, Text } from '@/components';

// 개발용 화면 목록. 서버 연결 전에는 이어지지 않는 화면(요청 수신, 승인 완료 등)을 여기서 바로 연다.
const sections: { title: string; items: [label: string, href: Href][] }[] = [
  {
    title: '01–02 시작',
    items: [
      ['01 스플래시', '/'],
      ['02 온보딩', '/onboarding'],
    ],
  },
  {
    title: '03 로그인 · 회원가입',
    items: [
      ['03-1 로그인', '/auth/login'],
      ['03-2 회원가입', '/auth/signup'],
      ['03-3 역할 선택', '/auth/role'],
    ],
  },
  {
    title: '04 계정 연결 · 보호자',
    items: [
      ['04-G1 연결 시작', '/link/guardian'],
      ['04-G2 연결 코드', '/link/guardian/code'],
      ['04-G3 연결 요청 확인', '/link/guardian/request'],
      ['04-G4 연결 완료', '/link/guardian/done'],
    ],
  },
  {
    title: '04 계정 연결 · 당사자',
    items: [
      ['04-R1 코드 입력', '/link/recipient'],
      ['04-R2 QR 인식', '/link/recipient/scan'],
      ['04-R3 연결 대상 확인', '/link/recipient/confirm'],
      ['04-R4 연결 완료', '/link/recipient/done'],
    ],
  },
  {
    title: '기타',
    items: [['디자인 시스템', '/design-system']],
  },
];

export default function DevRoute() {
  return (
    <Screen scroll>
      <ScreenTitle title="화면 목록" description="개발 확인용" size={24} style={styles.title} />
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text variant="label" color="textSecondary">
            {section.title}
          </Text>
          <Card style={styles.card}>
            {section.items.map(([label, href], i) => (
              <ListRow key={label} title={label} divider={i > 0} onPress={() => router.push(href)} />
            ))}
          </Card>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 16,
  },
  section: {
    marginTop: 24,
    gap: 8,
  },
  card: {
    paddingVertical: 4,
  },
});
