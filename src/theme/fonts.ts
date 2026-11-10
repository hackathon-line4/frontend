// 굵기별 경로로 import해야 쓰지 않는 굵기가 번들에 들어가지 않는다.
import { NotoSansKR_400Regular } from '@expo-google-fonts/noto-sans-kr/400Regular';
import { NotoSansKR_500Medium } from '@expo-google-fonts/noto-sans-kr/500Medium';
import { NotoSansKR_700Bold } from '@expo-google-fonts/noto-sans-kr/700Bold';
import { NotoSansKR_800ExtraBold } from '@expo-google-fonts/noto-sans-kr/800ExtraBold';
import { RobotoMono_500Medium } from '@expo-google-fonts/roboto-mono/500Medium';
import { RobotoMono_700Bold } from '@expo-google-fonts/roboto-mono/700Bold';
import { useFonts } from 'expo-font';

export function useAppFonts() {
  return useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
    NotoSansKR_800ExtraBold,
    RobotoMono_500Medium,
    RobotoMono_700Bold,
  });
}
