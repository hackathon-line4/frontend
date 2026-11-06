package com.sonullim.nativemodule

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat

// 당사자 폰에서 항상 켜져 있는 포그라운드 서비스 (B-5).
// 앱을 최근 앱에서 밀어 꺼도, 재부팅해도(BootReceiver) 계속 돈다.
// 전원 버튼 3번 감지(B-6), 앱 띄우기(B-7)는 이 서비스 안에서 한다.
class SonullimService : Service() {
  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    running = true
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val notification = buildNotification()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }
    // 시스템이 메모리 때문에 죽여도 다시 살린다
    return START_STICKY
  }

  override fun onDestroy() {
    running = false
    super.onDestroy()
  }

  private fun buildNotification(): Notification {
    val manager = getSystemService(NotificationManager::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(CHANNEL_ID, "손울림 대기", NotificationManager.IMPORTANCE_LOW).apply {
        description = "앱이 꺼져 있어도 신호를 받을 수 있게 대기해요"
        setShowBadge(false)
      }
      manager.createNotificationChannel(channel)
    }

    // 알림을 누르면 앱 열기
    val launch = packageManager.getLaunchIntentForPackage(packageName)
    val contentIntent = launch?.let {
      PendingIntent.getActivity(this, 0, it, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
    }

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(R.drawable.sonullim_notification)
      .setContentTitle("손울림이 대기 중이에요")
      .setContentText("신호가 오면 진동으로 알려드려요")
      .setOngoing(true)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .setCategory(NotificationCompat.CATEGORY_SERVICE)
      .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
      .setContentIntent(contentIntent)
      .build()
  }

  companion object {
    private const val CHANNEL_ID = "sonullim_standby"
    private const val NOTIFICATION_ID = 1001
    private const val PREFS = "sonullim_service"
    private const val KEY_ENABLED = "enabled"

    @Volatile
    var running = false
      private set

    /** 서비스 켜기. 켠 상태는 저장해서 재부팅 후에도 다시 켠다 */
    fun start(context: Context) {
      setEnabled(context, true)
      ContextCompat.startForegroundService(context, Intent(context, SonullimService::class.java))
    }

    fun stop(context: Context) {
      setEnabled(context, false)
      context.stopService(Intent(context, SonullimService::class.java))
    }

    fun isEnabled(context: Context): Boolean =
      context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(KEY_ENABLED, false)

    private fun setEnabled(context: Context, enabled: Boolean) {
      context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(KEY_ENABLED, enabled).apply()
    }
  }
}
