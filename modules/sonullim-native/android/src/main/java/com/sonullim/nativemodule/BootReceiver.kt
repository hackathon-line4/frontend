package com.sonullim.nativemodule

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

// 재부팅 · 앱 업데이트 후 서비스 다시 켜기 (서비스를 켜둔 상태였을 때만)
class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    when (intent.action) {
      Intent.ACTION_BOOT_COMPLETED,
      Intent.ACTION_MY_PACKAGE_REPLACED -> {
        if (!SonullimService.isEnabled(context)) return
        try {
          SonullimService.start(context)
        } catch (e: Exception) {
          // Android 12+ 백그라운드 시작 제한 등. 앱을 한 번 열면 다시 켜진다
          Log.w("Sonullim", "서비스 재시작 실패", e)
        }
      }
    }
  }
}
