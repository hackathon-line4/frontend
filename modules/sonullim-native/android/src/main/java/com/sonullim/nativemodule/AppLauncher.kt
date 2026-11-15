package com.sonullim.nativemodule

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import android.view.WindowManager
import java.lang.ref.WeakReference

// 전원 버튼 3번 → 잠금화면 위로 당사자 대기 화면 띄우기 (B-7).
//
// - 서비스가 켜져 있는 동안(당사자 모드) 앱 화면은 항상 '잠금화면 위로 보이기' 상태로 둔다.
//   잠금 상태에서는 이 설정이 화면이 올라오기 '전에' 걸려 있어야 해서, 띄울 때 거는 방식은 안 됐다 (A16 확인).
//   덕분에 삼성 '측면 버튼 두 번 누르기 → 손울림 열기'로 열어도 잠금화면 위로 뜬다.
// - 서비스가 sonullim://recipient 로 앱을 연다. Android 10+는 백그라운드에서 화면을 띄우려면
//   '다른 앱 위에 표시' 권한이 있어야 한다.
// - 화면 켜기(turnScreenOn)는 전원 3번으로 열 때만 건다.
object AppLauncher {
  const val EXTRA_FROM_TRIGGER = "com.sonullim.FROM_POWER_TRIGGER"
  private const val TARGET_URL = "sonullim://recipient"

  private var activity = WeakReference<Activity>(null)

  /** 앱 화면이 지금 보이는 중인지 (onResume ~ onPause). 푸시를 받았을 때 띄울지 정한다 */
  @Volatile
  var isForeground = false
    internal set

  fun attach(activity: Activity) {
    this.activity = WeakReference(activity)
    setShowWhenLocked(activity, SonullimService.isEnabled(activity))
  }

  fun detach(activity: Activity) {
    if (this.activity.get() === activity) this.activity = WeakReference(null)
  }

  /** 서비스를 켜고 끌 때 지금 떠 있는 앱 화면에도 바로 반영 */
  fun onServiceEnabledChanged(enabled: Boolean) {
    activity.get()?.let { a -> a.runOnUiThread { setShowWhenLocked(a, enabled) } }
  }

  fun canDrawOverlays(context: Context): Boolean = Settings.canDrawOverlays(context)

  /** '다른 앱 위에 표시' 설정 화면 (손울림 항목으로 바로) */
  fun openOverlaySettings(context: Context) {
    val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:${context.packageName}"))
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    context.startActivity(intent)
  }

  /** 전원 3번. 권한이 없으면 띄우지 못하고 false */
  fun launchFromTrigger(context: Context): Boolean = launch(context, "전원 3번")

  /** B-8 앱이 꺼져 있을 때 신호 푸시를 받음 → 당사자 대기 화면을 띄우면 IncomingSync가 07-4로 이어간다 */
  fun launchForIncoming(context: Context): Boolean = launch(context, "신호 푸시")

  private fun launch(context: Context, reason: String): Boolean {
    if (!canDrawOverlays(context)) {
      Log.w("Sonullim", "$reason: '다른 앱 위에 표시' 권한이 없어서 앱을 띄우지 못했어요")
      return false
    }
    // 이미 메모리에 있는 앱 화면은 올라오기 전에 미리 걸어둔다
    activity.get()?.let { a ->
      setShowWhenLocked(a, true)
      wakeScreen(a)
    }
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(TARGET_URL))
      .setPackage(context.packageName)
      .putExtra(EXTRA_FROM_TRIGGER, true)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    return try {
      context.startActivity(intent)
      true
    } catch (e: Exception) {
      Log.w("Sonullim", "앱 띄우기 실패", e)
      false
    }
  }

  fun isFromTrigger(intent: Intent?): Boolean = intent?.getBooleanExtra(EXTRA_FROM_TRIGGER, false) == true

  private fun setShowWhenLocked(activity: Activity, show: Boolean) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      activity.setShowWhenLocked(show)
    } else {
      @Suppress("DEPRECATION")
      val flag = WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
      if (show) activity.window.addFlags(flag) else activity.window.clearFlags(flag)
    }
  }

  /** 화면 켜기. 한 번 켠 뒤 해제해서, 평소에 앱이 화면을 마음대로 켜지 않게 한다 */
  fun wakeScreen(activity: Activity) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      activity.setTurnScreenOn(true)
      activity.window.decorView.postDelayed({ activity.setTurnScreenOn(false) }, 3000)
    } else {
      @Suppress("DEPRECATION")
      activity.window.addFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
    }
  }
}
