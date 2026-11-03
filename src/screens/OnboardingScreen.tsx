import { useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, PageDots, Rhythm, Row, Stack, Text } from '@/components';
import { PhoneMessageIllustration, TouchWaveGlyph, TwoWayIllustration } from '@/components/Illustrations';
import { colors, radius, screen, space, touch } from '@/theme';

// 02 온보딩 (design/screens/Onboarding1~3.dc.html)
// 이동: '다음' 또는 좌우 스와이프. 마지막 장 '시작하기' → 로그인. 1·2장 '건너뛰기' → 로그인.

type OnboardingScreenProps = {
  /** 건너뛰기 · 시작하기 */
  onFinish: () => void;
  /** 3장 진동 체험 버튼. 체험은 선택 사항 */
  onTryVibration?: () => void;
};

type Page = {
  title: string;
  body: string;
  visual: ReactNode;
};

export default function OnboardingScreen({ onFinish, onTryVibration }: OnboardingScreenProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [index, setIndex] = useState(0);

  const pages: Page[] = [
    {
      title: '진동으로 전하는 메시지',
      body: '보호자가 보낸 글이 스마트폰 진동으로 바뀌어 전달돼요. 소리와 화면 없이도 마음을 주고받을 수 있어요.',
      visual: (
        <View style={styles.tint} accessible accessibilityRole="image" accessibilityLabel="진동하며 메시지를 받는 스마트폰">
          <PhoneMessageIllustration />
        </View>
      ),
    },
    {
      title: '글은 진동으로,\n답은 터치로',
      body: '보호자가 쓴 글은 진동으로 도착해요. 당사자는 화면을 탭해 답하거나 먼저 메시지를 보낼 수 있어요.',
      visual: (
        <View
          style={[styles.tint, styles.twoWay]}
          accessible
          accessibilityRole="image"
          accessibilityLabel="보호자의 글이 당사자에게 진동으로 가고, 당사자의 탭 응답이 보호자에게 돌아오는 모습"
        >
          <TwoWayIllustration />
          <View style={styles.roles}>
            <Text variant="caption" weight="extraBold">
              보호자
            </Text>
            <Text variant="caption" weight="extraBold">
              당사자
            </Text>
          </View>
        </View>
      ),
    },
    {
      title: '직접 느껴 보세요',
      body: "위 버튼을 누르면 '밥 먹었어?'라는 메시지가 진동으로 전해져요.",
      visual: (
        <Stack align="center" gap={5}>
          <View style={styles.tint}>
            <Pressable
              onPress={onTryVibration}
              accessibilityRole="button"
              accessibilityLabel="진동 체험하기. 누르면 '밥 먹었어?' 메시지를 진동으로 느낄 수 있어요"
              style={({ pressed }) => [styles.tryButton, pressed && styles.tryPressed]}
            >
              <TouchWaveGlyph />
              <Text variant="heading" style={styles.center}>
                {'눌러서\n진동 느끼기'}
              </Text>
            </Pressable>
          </View>
          <Row gap={3} paddingX={4} style={styles.pill} accessible accessibilityLabel="밥 먹었어?, 짧게 짧게 길게">
            <Text variant="caption" weight="extraBold">
              밥 먹었어?
            </Text>
            <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <Rhythm beats={['S', 'S', 'L']} />
            </View>
            <Text variant="caption" weight="medium" color="textSecondary">
              짧게 · 짧게 · 길게
            </Text>
          </Row>
        </Stack>
      ),
    },
  ];

  const isLast = index === pages.length - 1;

  const goTo = (next: number) => {
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setIndex(next);
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, space[4]) + space[6] }]}>
      <View style={styles.topBar}>
        {!isLast && (
          <Pressable onPress={onFinish} accessibilityRole="button" style={styles.skip}>
            <Text variant="label" weight="medium" color="textSecondary">
              건너뛰기
            </Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        style={styles.pager}
      >
        {pages.map((page, i) => (
          <View
            key={i}
            style={[styles.page, { width }]}
            importantForAccessibility={i === index ? 'auto' : 'no-hide-descendants'}
            accessibilityElementsHidden={i !== index}
          >
            <View style={styles.visual}>{page.visual}</View>
            <Stack gap={3} paddingX={2}>
              <Text variant="title1" accessibilityRole="header" style={styles.center}>
                {page.title}
              </Text>
              <Text variant="body" color="textSecondary" style={styles.center}>
                {page.body}
              </Text>
            </Stack>
          </View>
        ))}
      </ScrollView>

      <Stack gap={6} style={styles.footer}>
        <Row justify="center">
          <PageDots total={pages.length} current={index + 1} />
        </Row>
        {isLast ? (
          <Button label="시작하기" variant="dark" onPress={onFinish} />
        ) : (
          <Button label="다음" trailingIcon="arrow-right" onPress={() => goTo(index + 1)} />
        )}
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgIvory,
  },
  topBar: {
    height: touch.guardianMin,
    paddingHorizontal: screen.gutterRecipient,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  skip: {
    minHeight: touch.guardianMin,
    paddingHorizontal: space[3],
    justifyContent: 'center',
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingHorizontal: screen.gutterRecipient,
  },
  visual: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: screen.gutterRecipient,
    paddingTop: space[10],
  },

  // 일러스트 배경 원 (일러스트 고유 크기)
  tint: {
    width: 280,
    height: 280,
    borderRadius: radius.full,
    backgroundColor: colors.yellow100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  twoWay: {
    gap: space[3],
  },
  // 두 휴대폰 그림 아래에 이름을 맞춘다 (TwoWayIllustration 고유 간격)
  roles: {
    flexDirection: 'row',
    gap: 70,
  },

  tryButton: {
    width: 200,
    height: 200,
    borderRadius: radius.full,
    borderWidth: 4,
    borderColor: colors.ink900,
    backgroundColor: colors.yellow500,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  },
  tryPressed: {
    opacity: 0.85,
  },
  pill: {
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.ink900,
  },
});
