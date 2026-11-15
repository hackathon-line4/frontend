package com.sonullim.nativemodule

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

// 앱이 꺼져 있을 때 받은 data-only 푸시를 시스템 알림으로 보여 준다 (서버는 문구 없이 type과 ID만 보낸다).
// 문구 · 중요도 · 눌렀을 때 열 화면은 노션 '서버 내부 처리 → 푸시 알림 종류' 표 기준.
// 앱이 화면에 떠 있으면 SSE가 화면에 바로 반영하므로 알림을 띄우지 않는다 (SonullimMessagingService에서 거른다).
object GuardianNotifier {
  private const val TAG = "Sonullim"

  /** 도움 요청: 가장 강하게 (소리 + 진동 + 잠금화면 전체 화면) */
  private const val CHANNEL_HELP = "sonullim_help"
  /** 당사자가 보호자를 부름 */
  private const val CHANNEL_CALL = "sonullim_call"
  /** 응답 · 응답 없음 · 연결 요청 결과 */
  private const val CHANNEL_UPDATES = "sonullim_updates"

  private data class Spec(val channel: String, val title: String, val body: String, val link: String)

  /** 처리하면 true. 모르는 type이면 false */
  fun show(context: Context, data: Map<String, String>): Boolean {
    val spec = specFor(data) ?: return false
    ensureChannels(context)
    if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) {
      Log.w(TAG, "알림 권한이 꺼져 있어 ${data["type"]} 알림을 못 띄웠어요")
      return true
    }
    val open = PendingIntent.getActivity(
      context,
      spec.link.hashCode(),
      Intent(Intent.ACTION_VIEW, Uri.parse(spec.link)).setPackage(context.packageName)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
    val help = spec.channel == CHANNEL_HELP
    val notification = NotificationCompat.Builder(context, spec.channel)
      .setSmallIcon(R.drawable.sonullim_notification)
      .setContentTitle(spec.title)
      .setContentText(spec.body)
      .setContentIntent(open)
      .setAutoCancel(true)
      .setPriority(if (spec.channel == CHANNEL_UPDATES) NotificationCompat.PRIORITY_DEFAULT else NotificationCompat.PRIORITY_HIGH)
      .setCategory(if (help) NotificationCompat.CATEGORY_ALARM else NotificationCompat.CATEGORY_MESSAGE)
      .apply { if (help) setFullScreenIntent(open, true) }
      .build()
    try {
      NotificationManagerCompat.from(context).notify(spec.link.hashCode(), notification)
    } catch (e: SecurityException) {
      Log.w(TAG, "알림을 띄우지 못했어요", e)
    }
    return true
  }

  private fun specFor(data: Map<String, String>): Spec? = when (data["type"]) {
    "HELP_REQUEST" -> data["helpRequestId"]?.let {
      Spec(CHANNEL_HELP, "도움 요청이 왔어요", "눌러서 위치와 상태를 확인해 주세요", "sonullim://guardian/record/$it?kind=HELP_REQUEST")
    }
    "RECIPIENT_SIGNAL" -> data["recipientSignalId"]?.let {
      Spec(CHANNEL_CALL, "당사자가 보호자를 불렀어요", "눌러서 확인해 주세요", "sonullim://guardian/record/$it?kind=RECIPIENT_SIGNAL")
    }
    "TOUCH_RESPONSE" -> data["messageId"]?.let {
      Spec(CHANNEL_UPDATES, "신호에 응답했어요", "당사자가 화면을 눌러 응답했어요", "sonullim://guardian/record/$it")
    }
    "NO_RESPONSE" -> data["messageId"]?.let {
      Spec(CHANNEL_UPDATES, "응답이 없어요", "보낸 신호에 아직 응답이 없어요", "sonullim://guardian/no-reply?id=$it")
    }
    "LINK_REQUEST" -> Spec(CHANNEL_UPDATES, "연결 요청이 왔어요", "눌러서 연결을 확인해 주세요", "sonullim://")
    "LINK_RESULT" -> Spec(CHANNEL_UPDATES, "연결 요청 결과가 나왔어요", "눌러서 확인해 주세요", "sonullim://")
    else -> null
  }

  private fun ensureChannels(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = context.getSystemService(NotificationManager::class.java)
    val alarm = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_ALARM)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()
    manager.createNotificationChannel(
      NotificationChannel(CHANNEL_HELP, "도움 요청", NotificationManager.IMPORTANCE_HIGH).apply {
        description = "당사자의 도움 요청. 가장 강하게 알려요"
        enableVibration(true)
        vibrationPattern = longArrayOf(0, 600, 200, 600, 200, 600)
        setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM), alarm)
        lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
      },
    )
    manager.createNotificationChannel(
      NotificationChannel(CHANNEL_CALL, "보호자 부르기", NotificationManager.IMPORTANCE_HIGH).apply {
        description = "당사자가 보호자를 불렀을 때"
        enableVibration(true)
      },
    )
    manager.createNotificationChannel(
      NotificationChannel(CHANNEL_UPDATES, "신호 응답", NotificationManager.IMPORTANCE_DEFAULT).apply {
        description = "보낸 신호에 대한 응답 · 응답 없음 · 연결 요청"
      },
    )
  }
}
