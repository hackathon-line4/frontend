package com.sonullim.nativemodule

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// 손울림 네이티브 기능. 지금은 진동만 (B-1). 포그라운드 서비스 · 앱 실행 트리거는 B-5~7에서 추가.
class SonullimNativeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SonullimNative")

    /** 세기(amplitude) 조절 지원 여부. false면 세기 없이 길이만 적용된다 */
    Function("hasAmplitudeControl") {
      vibrator.hasAmplitudeControl()
    }

    /**
     * 시간표대로 1회 진동. timings는 [쉼, 울림, 쉼, 울림, …] ms,
     * amplitudes는 같은 길이의 0~255 (쉼 칸은 0)
     */
    Function("vibrateWaveform") { timings: List<Long>, amplitudes: List<Int> ->
      if (timings.size != amplitudes.size) {
        throw IllegalArgumentException("timings와 amplitudes 길이가 달라요")
      }
      val v = vibrator
      v.cancel()
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val effect = if (v.hasAmplitudeControl()) {
          VibrationEffect.createWaveform(timings.toLongArray(), amplitudes.toIntArray(), -1)
        } else {
          VibrationEffect.createWaveform(timings.toLongArray(), -1)
        }
        v.vibrate(effect)
      } else {
        @Suppress("DEPRECATION")
        v.vibrate(timings.toLongArray(), -1)
      }
    }

    Function("cancelVibration") {
      vibrator.cancel()
    }
  }

  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val vibrator: Vibrator
    get() = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
    } else {
      @Suppress("DEPRECATION")
      context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }
}
