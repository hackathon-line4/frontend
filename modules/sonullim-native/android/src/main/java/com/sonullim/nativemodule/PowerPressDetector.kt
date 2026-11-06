package com.sonullim.nativemodule

import android.os.SystemClock

// 전원 버튼 3번 감지 (B-6).
// 앱은 전원 버튼을 직접 못 받으므로, 버튼을 누를 때마다 바뀌는 화면 켜짐/꺼짐(interactive)을 센다.
//
// 규칙: 화면이 REST_MS 이상 꺼져 있다가 → 켜짐 → 꺼짐 → 켜짐 (각 간격 MAX_GAP_MS 이하) = 트리거.
// 당사자 폰은 평소 화면이 꺼져 있으므로 "꺼진 화면에서 1초 간격으로 3번"이 기본 사용법이다.
// 끝나면 화면이 켜진 상태라 띄운 당사자 화면이 바로 보인다.
//
// A16에서 확인한 것:
// - 0.3초 안에 연달아 누르면 안드로이드가 "연속 누르기" 하나로 묶어서 화면이 바뀌지 않는다
//   → 1초에 한 번쯤 또박또박 눌러야 한다.
// - 화면을 끄려고 누른 버튼까지 세서 2번만 눌러도 트리거됐다 → 꺼진 채로 쉰 뒤부터 센다.
// - 트리거 직후 앱이 화면을 직접 켜는 것도 잡혔다 → 트리거 뒤 COOLDOWN_MS 동안은 세지 않는다.
// - 0.03초 만에 꺼졌다 켜지는 깜빡임이 있다 → BLIP_MS 안에 되돌아온 변화는 둘 다 버린다.
class PowerPressDetector(private val onTrigger: () -> Unit) {
  private val presses = ArrayList<Long>()
  private var lastOffAt = SystemClock.elapsedRealtime()
  private var lastToggleAt = 0L
  private var ignoreUntil = 0L

  /** 화면 켜짐/꺼짐 변화마다 호출. on = 지금 켜졌는지 */
  fun onScreenToggled(on: Boolean) {
    val now = SystemClock.elapsedRealtime()
    val sinceLast = now - lastToggleAt
    val offBefore = lastOffAt
    lastToggleAt = now
    if (!on) lastOffAt = now
    if (now < ignoreUntil) return

    // 깜빡임: 바로 직전 변화와 함께 버린다
    if (sinceLast < BLIP_MS) {
      if (presses.isNotEmpty()) presses.removeAt(presses.lastIndex)
      return
    }

    when {
      // 꺼진 채로 충분히 쉰 뒤 켜짐 → 1번째
      on && now - offBefore >= REST_MS -> {
        presses.clear()
        presses.add(now)
      }
      // 이어지는 누름
      presses.isNotEmpty() && sinceLast <= MAX_GAP_MS -> presses.add(now)
      else -> presses.clear()
    }

    if (presses.size >= PRESSES) {
      presses.clear()
      ignoreUntil = now + COOLDOWN_MS
      onTrigger()
    }
  }

  companion object {
    const val PRESSES = 3
    const val REST_MS = 1500L
    const val MAX_GAP_MS = 1500L
    const val COOLDOWN_MS = 3000L
    const val BLIP_MS = 150L
  }
}
