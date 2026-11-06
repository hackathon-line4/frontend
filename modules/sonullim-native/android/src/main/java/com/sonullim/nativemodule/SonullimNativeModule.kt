package com.sonullim.nativemodule

import android.content.Context
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// 손울림 네이티브 기능을 JS에 연결. 실제 동작은 SonullimVibrator · SonullimService에 있다.
class SonullimNativeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SonullimNative")

    // ── 진동 (B-1) ──

    /** 세기(amplitude) 조절 지원 여부. false면 세기 없이 길이만 적용된다 */
    Function("hasAmplitudeControl") {
      SonullimVibrator.hasAmplitudeControl(context)
    }

    /**
     * 시간표대로 1회 진동. timings는 [쉼, 울림, 쉼, 울림, …] ms,
     * amplitudes는 같은 길이의 0~255 (쉼 칸은 0)
     */
    Function("vibrateWaveform") { timings: List<Long>, amplitudes: List<Int> ->
      SonullimVibrator.vibrate(context, timings.toLongArray(), amplitudes.toIntArray())
    }

    Function("cancelVibration") {
      SonullimVibrator.cancel(context)
    }

    // ── 백그라운드 서비스 (B-5) ──

    /** 상시 대기 서비스 켜기. 켠 상태는 저장돼서 재부팅 후에도 다시 켜진다 */
    Function("startBackgroundService") {
      SonullimService.start(context)
    }

    Function("stopBackgroundService") {
      SonullimService.stop(context)
    }

    /** running: 지금 돌고 있음 · enabled: 켜두기로 저장됨 (재부팅 후 다시 켜짐) · powerTriggers: 전원 3번 감지 횟수 */
    Function("getBackgroundServiceState") {
      mapOf(
        "running" to SonullimService.running,
        "enabled" to SonullimService.isEnabled(context),
        "powerTriggers" to SonullimService.triggerCount,
      )
    }
  }

  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()
}
