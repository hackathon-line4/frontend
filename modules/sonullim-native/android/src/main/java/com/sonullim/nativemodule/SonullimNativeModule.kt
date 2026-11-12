package com.sonullim.nativemodule

import android.content.Context
import android.util.Log
import com.google.firebase.FirebaseApp
import com.google.firebase.messaging.FirebaseMessaging
import expo.modules.kotlin.Promise
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

    // ── 잠금화면 위로 앱 띄우기 (B-7) ──

    /** '다른 앱 위에 표시' 권한. 없으면 전원 3번을 눌러도 앱이 뜨지 않는다 */
    Function("canDrawOverlays") {
      AppLauncher.canDrawOverlays(context)
    }

    Function("openOverlaySettings") {
      AppLauncher.openOverlaySettings(context)
    }

    // ── 당사자 폰 설정 안내 (B-9) ──

    Function("isIgnoringBatteryOptimizations") {
      DeviceSettings.isIgnoringBatteryOptimizations(context)
    }

    Function("requestIgnoreBatteryOptimizations") {
      DeviceSettings.requestIgnoreBatteryOptimizations(context)
    }

    Function("areNotificationsEnabled") {
      DeviceSettings.areNotificationsEnabled(context)
    }

    Function("openNotificationSettings") {
      DeviceSettings.openNotificationSettings(context)
    }

    Function("openAppDetails") {
      DeviceSettings.openAppDetails(context)
    }

    Function("isSamsung") {
      DeviceSettings.isSamsung
    }

    // ── FCM 푸시 (B-8) ──

    /** google-services.json이 들어간 빌드인지. false면 푸시를 받을 수 없다 */
    Function("isPushConfigured") {
      FirebaseApp.getApps(context).isNotEmpty()
    }

    /** 이 기기의 FCM 토큰. 서버 PUT /me/devices에 등록한다. 설정이 없거나 실패하면 null */
    AsyncFunction("getPushToken") { promise: Promise ->
      val ctx = context
      if (FirebaseApp.getApps(ctx).isEmpty()) {
        promise.resolve(null)
        return@AsyncFunction
      }
      try {
        FirebaseMessaging.getInstance().token
          .addOnSuccessListener { token ->
            SonullimMessagingService.savedToken(ctx, token)
            promise.resolve(token)
          }
          .addOnFailureListener { e ->
            Log.w("Sonullim", "FCM 토큰 받기 실패", e)
            promise.resolve(SonullimMessagingService.savedToken(ctx))
          }
      } catch (e: Exception) {
        Log.w("Sonullim", "FCM 토큰 받기 실패", e)
        promise.resolve(null)
      }
    }
  }

  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()
}
