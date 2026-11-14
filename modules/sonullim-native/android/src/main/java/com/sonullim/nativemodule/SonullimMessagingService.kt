package com.sonullim.nativemodule

import android.content.Context
import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

// 앱이 꺼져 있을 때 받는 신호 (B-8).
//
// 서버는 신호를 알림 없이 데이터만 담아(data-only) 높은 우선순위로 보낸다. 예: {"type":"SIGNAL","linkId":…,"messageId":…}
// 이 서비스는 앱이 꺼져 있어도 시스템이 잠깐 깨워서 부른다. 여기서는 신호 내용을 읽지 않고
// 당사자 화면을 잠금화면 위로 띄우기만 한다. 앱이 뜨면 IncomingSync가 /messages/incoming을 읽어
// handleIncoming → 07-4 화면과 리듬 진동으로 이어진다 (SSE로 받을 때와 같은 입구).
//
// 앱이 이미 화면에 떠 있으면 SSE와 IncomingSync가 처리하므로 아무것도 하지 않는다.
class SonullimMessagingService : FirebaseMessagingService() {
  override fun onNewToken(token: String) {
    // JS는 앱이 켜질 때마다 getPushToken()으로 읽어 서버에 등록한다
    savedToken(this, token)
    Log.i(TAG, "FCM 토큰 갱신")
  }

  override fun onMessageReceived(message: RemoteMessage) {
    val type = message.data["type"]
    Log.i(TAG, "푸시 받음 type=$type priority=${message.priority}")
    if (type == "LOCATION_REQUEST") {
      // 화면은 띄우지 않고 뒤에서 위치만 보낸다 (앱이 켜져 있으면 실시간 이벤트로도 오지만 JS가 한 번만 답한다)
      message.data["locationRequestId"]?.let { SonullimHeadlessService.startLocationRequest(this, it) }
      return
    }
    if (type !in WAKE_TYPES) return
    if (AppLauncher.isForeground) return
    AppLauncher.launchForIncoming(this)
  }

  companion object {
    private const val TAG = "Sonullim"
    private const val PREFS = "sonullim_push"
    private const val KEY_TOKEN = "token"

    /** 당사자 앱을 깨워 07-4로 이어지는 푸시 종류 (서버 PushType 중 DATA 전달) */
    private val WAKE_TYPES = setOf("SIGNAL", "PRACTICE")

    fun savedToken(context: Context, token: String) {
      context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY_TOKEN, token).apply()
    }

    fun savedToken(context: Context): String? =
      context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_TOKEN, null)
  }
}
