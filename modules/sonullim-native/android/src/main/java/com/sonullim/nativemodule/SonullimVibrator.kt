package com.sonullim.nativemodule

import android.content.Context
import android.media.AudioAttributes
import android.os.Build
import android.os.VibrationAttributes
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

// 진동 공통 코드. JS 모듈과 백그라운드 서비스(앱 화면이 없을 때)가 같이 쓴다.
object SonullimVibrator {
  fun get(context: Context): Vibrator =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
    } else {
      @Suppress("DEPRECATION")
      context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }

  fun hasAmplitudeControl(context: Context): Boolean = get(context).hasAmplitudeControl()

  /** timings는 [쉼, 울림, 쉼, 울림, …] ms, amplitudes는 같은 길이의 0~255 (쉼 칸은 0) */
  fun vibrate(context: Context, timings: LongArray, amplitudes: IntArray) {
    require(timings.size == amplitudes.size) { "timings와 amplitudes 길이가 달라요" }
    val v = get(context)
    v.cancel()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val effect = if (v.hasAmplitudeControl()) {
        VibrationEffect.createWaveform(timings, amplitudes, -1)
      } else {
        VibrationEffect.createWaveform(timings, -1)
      }
      // 알람 용도: 화면이 꺼지거나 앱이 잠깐 백그라운드여도 OS가 진동을 막지 않게 한다
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        v.vibrate(effect, VibrationAttributes.createForUsage(VibrationAttributes.USAGE_ALARM))
      } else {
        @Suppress("DEPRECATION")
        v.vibrate(effect, AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build())
      }
    } else {
      @Suppress("DEPRECATION")
      v.vibrate(timings, -1)
    }
  }

  fun cancel(context: Context) = get(context).cancel()
}
