import { Screen, ScreenTitle } from '@/components';

// 아직 구현하지 않은 화면 자리
export default function PlaceholderScreen({ title }: { title: string }) {
  return (
    <Screen>
      <ScreenTitle title={title} description="준비 중인 화면이에요." />
    </Screen>
  );
}
