package com.sonullim.nativemodule

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.util.Log
import androidx.core.app.NotificationManagerCompat

// 당사자 폰 설정 안내 화면(B-9)에서 쓰는 설정 상태 확인 · 설정 화면 열기.
// 상태를 읽을 수 없는 항목(삼성 절전 예외, 측면 버튼)은 앱 정보 화면만 열어 준다.
object DeviceSettings {
  /** 배터리 최적화 예외 (꺼져 있으면 앱이 오래 쉬는 동안 서비스·푸시가 늦어질 수 있다) */
  fun isIgnoringBatteryOptimizations(context: Context): Boolean {
    val power = context.getSystemService(Context.POWER_SERVICE) as PowerManager
    return power.isIgnoringBatteryOptimizations(context.packageName)
  }

  /** '배터리 사용량 최적화 중지' 확인 창. 열 수 없으면 최적화 목록 화면 */
  @SuppressLint("BatteryLife")
  fun requestIgnoreBatteryOptimizations(context: Context) {
    val request = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:${context.packageName}"))
    if (!start(context, request)) start(context, Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
  }

  /** 앱 알림 허용 여부 (Android 13+는 POST_NOTIFICATIONS 권한 포함) */
  fun areNotificationsEnabled(context: Context): Boolean =
    NotificationManagerCompat.from(context).areNotificationsEnabled()

  fun openNotificationSettings(context: Context) {
    val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
      .putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
    if (!start(context, intent)) openAppDetails(context)
  }

  /**
   * 전체 화면 알림(도움 요청을 잠금화면 위 전체 화면으로). Android 14+는 사용자가 따로 허용해야 한다.
   * 13 이하는 설치할 때 자동으로 허용된다
   */
  fun canUseFullScreenIntent(context: Context): Boolean {
    if (Build.VERSION.SDK_INT < 34) return true
    val manager = context.getSystemService(android.app.NotificationManager::class.java)
    return manager.canUseFullScreenIntent()
  }

  fun openFullScreenIntentSettings(context: Context) {
    if (Build.VERSION.SDK_INT < 34) { openNotificationSettings(context); return }
    val intent = Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT, Uri.parse("package:${context.packageName}"))
    if (!start(context, intent)) openNotificationSettings(context)
  }

  /** 앱 정보 화면. 삼성은 여기 '배터리 → 제한 없음'에서 절전 예외를 켠다 */
  fun openAppDetails(context: Context) {
    start(context, Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${context.packageName}")))
  }

  val isSamsung: Boolean
    get() = Build.MANUFACTURER.equals("samsung", ignoreCase = true)

  private fun start(context: Context, intent: Intent): Boolean =
    try {
      context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
      true
    } catch (e: Exception) {
      Log.w("Sonullim", "설정 화면을 열지 못했어요: ${intent.action}", e)
      false
    }
}
