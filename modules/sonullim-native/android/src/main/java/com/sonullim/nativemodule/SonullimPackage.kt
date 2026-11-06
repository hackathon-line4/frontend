package com.sonullim.nativemodule

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

// MainActivity 생명주기에 끼어들기 위한 Expo 패키지. 파일 이름이 *Package.kt 여야 autolinking이 찾는다.
// (MainActivity는 prebuild가 만드는 파일이라 직접 고치지 않는다)
class SonullimPackage : Package {
  override fun createReactActivityLifecycleListeners(activityContext: Context?): List<ReactActivityLifecycleListener> =
    listOf(SonullimActivityListener())
}

/** 앱 화면(MainActivity)을 AppLauncher에 알려주고, 잠금화면 위 표시를 맞춘다 */
class SonullimActivityListener : ReactActivityLifecycleListener {
  override fun onCreate(activity: Activity, savedInstanceState: Bundle?) {
    AppLauncher.attach(activity)
    if (AppLauncher.isFromTrigger(activity.intent)) AppLauncher.wakeScreen(activity)
  }

  override fun onResume(activity: Activity) {
    AppLauncher.attach(activity)
  }

  override fun onDestroy(activity: Activity) {
    AppLauncher.detach(activity)
  }
}
