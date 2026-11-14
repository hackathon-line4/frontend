package com.sonullim.nativemodule

import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

// 앱이 꺼져 있을 때 보호자의 위치 확인 요청에 답한다.
//
// 위치 요청 푸시(LOCATION_REQUEST)를 받으면 화면을 띄우지 않고 JS를 잠깐 실행한다.
// JS 쪽 'SonullimLocationRequest' 작업(src/headless.ts)이 로그인 정보를 읽고 위치를 한 번 재서
// 서버로 보낸 뒤 끝난다. 위치를 재려면 당사자가 위치 권한을 '항상 허용'으로 둬야 한다.
class SonullimHeadlessService : HeadlessJsTaskService() {
  override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
    val extras = intent?.extras ?: return null
    return HeadlessJsTaskConfig(
      extras.getString(EXTRA_TASK) ?: TASK_LOCATION_REQUEST,
      Arguments.fromBundle(extras),
      TIMEOUT_MS,
      true, // 앱이 화면에 있어도 실행 (실시간 이벤트와 겹치면 JS가 한 번만 답한다)
    )
  }

  companion object {
    private const val TAG = "Sonullim"
    const val TASK_LOCATION_REQUEST = "SonullimLocationRequest"
    /** 연결 확인 요청(CONNECTION_CHECK) → 화면 없이 ack만 보낸다 (src/headless.ts) */
    const val TASK_CONNECTION_CHECK = "SonullimConnectionCheck"
    private const val EXTRA_TASK = "task"
    /** 서버가 기다리는 시간(30초)보다 조금 짧게 */
    private const val TIMEOUT_MS = 25_000L

    fun startConnectionCheck(context: Context, checkId: String) =
      start(context, Intent(context, SonullimHeadlessService::class.java)
        .putExtra(EXTRA_TASK, TASK_CONNECTION_CHECK).putExtra("checkId", checkId), "연결 확인")

    fun startLocationRequest(context: Context, requestId: String) =
      start(context, Intent(context, SonullimHeadlessService::class.java)
        .putExtra(EXTRA_TASK, TASK_LOCATION_REQUEST).putExtra("requestId", requestId), "위치 요청")

    private fun start(context: Context, intent: Intent, label: String) {
      try {
        // 높은 우선순위 푸시를 받은 직후에는 백그라운드에서도 서비스를 시작할 수 있다
        context.startService(intent)
        HeadlessJsTaskService.acquireWakeLockNow(context)
        Log.i(TAG, "$label → JS 작업 시작")
      } catch (e: Exception) {
        Log.w(TAG, "$label 작업을 시작하지 못함", e)
      }
    }
  }
}
