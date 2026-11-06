package com.sonullim.nativemodule

import android.os.SystemClock

// 전원 버튼 빠르게 3번 감지 (B-6).
// 앱은 전원 버튼을 직접 못 받으므로, 버튼을 누를 때마다 바뀌는 화면 켜짐/꺼짐을 센다.
// 화면 상태가 WINDOW_MS 안에 PRESSES번 바뀌면 트리거. 평소 사용(한 번 켜고 끄기)과 겹치지 않는다.
// 값은 기기 검증 전 (placeholder).
class PowerPressDetector(private val onTrigger: () -> Unit) {
  private val presses = ArrayDeque<Long>()

  /** 화면 켜짐/꺼짐 이벤트마다 호출 */
  fun onScreenToggled() {
    val now = SystemClock.elapsedRealtime()
    presses.addLast(now)
    while (presses.isNotEmpty() && now - presses.first() > WINDOW_MS) presses.removeFirst()
    if (presses.size >= PRESSES) {
      presses.clear()
      onTrigger()
    }
  }

  companion object {
    const val PRESSES = 3
    const val WINDOW_MS = 3000L
  }
}
