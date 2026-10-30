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

import { Button, PageDots, Text } from '@/components';
import { PhoneMessageIllustration, TouchWaveGlyph, TwoWayIllustration } from '@/components/Illustrations';
import { colors, fontFamily, screen } from '@/theme';

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
            <Text style={styles.roleText}>보호자</Text>
            <Text style={styles.roleText}>당사자</Text>
          </View>
        </View>
      ),
    },
    {
      title: '직접 느껴 보세요',
      body: "위 버튼을 누르면 '밥 먹었어?'라는 메시지가 진동으로 전해져요.",
      visual: (
        <View style={styles.tryWrap}>
          <View style={styles.tint}>
            <Pressable
              onPress={onTryVibration}
              accessibilityRole="button"
              accessibilityLabel="진동 체험하기. 누르면 '밥 먹었어?' 메시지를 진동으로 느낄 수 있어요"
              style={({ pressed }) => [styles.tryButton, pressed && styles.tryPressed]}
            >
              <TouchWaveGlyph />
              <Text style={styles.tryLabel}>{'눌러서\n진동 느끼기'}</Text>
            </Pressable>
          </View>
          <View style={styles.pill} accessible accessibilityLabel="밥 먹었어?, 짧게 짧게 길게">
            <Text style={styles.pillName}>밥 먹었어?</Text>
            <View style={styles.pillBeats}>
              <View style={[styles.beat, styles.beatShort]} />
              <View style={[styles.beat, styles.beatShort]} />
              <View style={[styles.beat, styles.beatLong]} />
            </View>
            <Text style={styles.pillDesc}>짧게 · 짧게 · 길게</Text>
          </View>
        </View>
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
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) + 24 }]}>
      <View style={styles.topBar}>
        {!isLast && (
          <Pressable onPress={onFinish} accessibilityRole="button" style={styles.skip}>
            <Text style={styles.skipText}>건너뛰기</Text>
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
            <View style={styles.copy}>
              <Text variant="title1" accessibilityRole="header" style={styles.center}>
                {page.title}
              </Text>
              <Text variant="body" color="textSecondary" style={styles.body}>
                {page.body}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          <PageDots total={pages.length} current={index + 1} />
        </View>
        {isLast ? (
          <Button label="시작하기" variant="dark" onPress={onFinish} style={styles.cta} />
        ) : (
          <Button label="다음" trailingIcon="arrow-right" onPress={() => goTo(index + 1)} style={styles.cta} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgIvory,
  },
  topBar: {
    height: 48,
    paddingHorizontal: screen.gutterRecipient,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  skip: {
    minHeight: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  skipText: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
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
  copy: {
    paddingHorizontal: 8,
  },
  center: {
    textAlign: 'center',
  },
  body: {
    marginTop: 14,
    lineHeight: 26,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: screen.gutterRecipient,
  },
  dots: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  cta: {
    minHeight: 60,
  },

  tint: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.yellow100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  twoWay: {
    gap: 10,
  },
  roles: {
    flexDirection: 'row',
    gap: 70,
  },
  roleText: {
    fontFamily: fontFamily.extraBold,
    fontSize: 14,
    lineHeight: 20,
  },

  tryWrap: {
    alignItems: 'center',
    gap: 20,
  },
  tryButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: colors.ink900,
    backgroundColor: colors.yellow500,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  tryPressed: {
    opacity: 0.85,
  },
  tryLabel: {
    fontFamily: fontFamily.extraBold,
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  pill: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.ink900,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pillName: {
    fontFamily: fontFamily.extraBold,
    fontSize: 14,
    lineHeight: 20,
  },
  pillBeats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  beat: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.ink900,
  },
  beatShort: { width: 8 },
  beatLong: { width: 24 },
  pillDesc: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
