package com.deviceinfotest

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import android.util.Log

import com.example.deviceinfo.react.DeviceInfoReactPackage

import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class MainApplication : Application(), ReactApplication {
    
  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        // override fun getPackages(): List<ReactPackage> =
        //     Log.d("MainApplication", "Getting packages") // Debug log
        //     val packages = PackageList(this).packages.apply {
        //       // Packages that cannot be autolinked yet can be added manually here, for example:
        //       add(DeviceInfoReactPackage())
        //     }

        override fun getPackages() = PackageList(this).packages.apply {
            Log.d("MainApplication", "Getting packages") // Debug log
            add(DeviceInfoReactPackage())
        }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    // loadReactNative(this)
    SoLoader.init(this, OpenSourceMergedSoMapping)
     if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
  }
}
