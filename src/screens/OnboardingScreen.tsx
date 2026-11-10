import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
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
import { tactilePulses } from '@/features/signals';
import { beatLabel, colors, describeRhythm, pulsesToBeats, radius, screen, space, touch } from '@/theme';

/** 3장 진동 체험 그림·글: 실제로 울리는 '나 여기 있어' 진동 배열에서 만든다 (짧게 짧게) */
const demoBeats = pulsesToBeats(tactilePulses.here);

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
          <PhoneMessageIllustration size={168} />
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
          <TwoWayIllustration width={190} />
          <View style={styles.roles}>
            <Text variant="caption" weight="bold">
              보호자
            </Text>
            <Text variant="caption" weight="bold">
              당사자
            </Text>
          </View>
        </View>
      ),
    },
    {
      title: '직접 느껴 보세요',
      body: "위 버튼을 누르면 '나 여기 있어'라는 메시지가 진동으로 전해져요.",
      visual: (
        <Stack align="center" gap={5}>
          <View style={styles.tint}>
            <TryVibrationButton active={index === 2} onPress={onTryVibration} />
          </View>
          <Row
            gap={3}
            paddingX={4}
            style={styles.pill}
            accessible
            accessibilityLabel={`나 여기 있어, ${describeRhythm(demoBeats)}`}
          >
            <Text variant="caption" weight="bold">
              나 여기 있어
            </Text>
            <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <Rhythm beats={demoBeats} />
            </View>
            <Text variant="caption" weight="medium" color="textSecondary">
              {demoBeats.map((b) => beatLabel[b]).join(' · ')}
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

/**
 * 3장 '눌러서 진동 느끼기'. 눌러 보고 싶게 통통 튀고, 바깥으로 물결이 퍼진다.
 * 이 장이 보일 때만 움직이고, 시스템 '애니메이션 줄이기'가 켜져 있으면 멈춰 있는다.
 */
function TryVibrationButton({ active, onPress }: { active: boolean; onPress?: () => void }) {
  const [bounce] = useState(() => new Animated.Value(1));
  const [press] = useState(() => new Animated.Value(1));
  const [ripple] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!active) return;
    let loop: Animated.CompositeAnimation | undefined;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce || cancelled) return;
      const up = (to: number, ms: number) =>
        Animated.timing(bounce, { toValue: to, duration: ms, easing: Easing.out(Easing.quad), useNativeDriver: true });
      loop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            // 통 · 통 (두 번 튀고 가라앉기)
            Animated.sequence([up(1.08, 160), up(0.97, 140), up(1.04, 140), up(1, 160)]),
            Animated.sequence([
              Animated.timing(ripple, { toValue: 0, duration: 0, useNativeDriver: true }),
              Animated.timing(ripple, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            ]),
          ]),
          Animated.delay(900),
        ]),
      );
      loop.start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
      bounce.setValue(1);
      ripple.setValue(0);
    };
  }, [active, bounce, ripple]);

  const pressTo = (to: number) => Animated.spring(press, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 10 }).start();

  return (
    <View style={styles.tryWrap}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.tryRipple,
          {
            opacity: ripple.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
            transform: [{ scale: ripple.interpolate({ inputRange: [0, 1], outputRange: [1, 1.38] }) }],
          },
        ]}
      />
      <Animated.View style={{ transform: [{ scale: Animated.multiply(bounce, press) }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={() => pressTo(0.92)}
          onPressOut={() => pressTo(1)}
          accessibilityRole="button"
          accessibilityLabel="진동 체험하기. 누르면 '나 여기 있어' 메시지를 진동으로 느낄 수 있어요"
          style={styles.tryButton}
        >
          <TouchWaveGlyph size={44} />
          <Text variant="bodyStrong" style={styles.center}>
            {'눌러서\n진동 느끼기'}
          </Text>
        </Pressable>
      </Animated.View>
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
    paddingHorizontal: screen.gutter,
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
    paddingHorizontal: screen.gutter,
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
    paddingHorizontal: screen.gutter,
    paddingTop: space[6],
  },

  // 일러스트 배경 원 (일러스트 고유 크기)
  tint: {
    width: 232,
    height: 232,
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
    gap: 58,
  },

  tryButton: {
    width: 164,
    height: 164,
    borderRadius: radius.full,
    borderWidth: 2.5,
    borderColor: colors.ink900,
    backgroundColor: colors.yellow500,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  },
  tryWrap: {
    width: 164,
    height: 164,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tryRipple: {
    position: 'absolute',
    width: 164,
    height: 164,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.yellow500,
  },
  pill: {
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.ink900,
  },
});
