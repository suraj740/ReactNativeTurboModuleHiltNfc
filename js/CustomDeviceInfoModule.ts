import { NativeEventEmitter } from "react-native";
import NativeDeviceInfo from "../specs/NativeDeviceInfoReactModule";


   
/**
* DeviceInfo TurboModule for React Native New Architecture (Bridgeless)
*
* This module provides comprehensive device information including:
* - Hardware specifications
* - Battery information
* - Memory usage
* - Storage usage
* - Network connectivity
* - Root detection
*/

class DeviceInfoModule {
    /**
    * Get complete device information
    */
    static async getDeviceInfo() {
        return await NativeDeviceInfo.getDeviceInfo();
    }

    /**
    Get battery information including level, charging status, and health
    */
    static async getBatteryInfo() {
        return await NativeDeviceInfo.getBatteryInfo();
    }

    /**
    * Get memory information including total, available, and used memory
    */
    static async getMemoryInfo() {
        return await NativeDeviceInfo.getMemoryInfo();
    }

    /**
    * Get storage information including total, available, and used storage
    */
    static async getStorageInfo(){
        return await NativeDeviceInfo.getStorageInfo();
    }

    /**
    * Get network connectivity information
    */
    static async getNetworkInfo(){
        return await NativeDeviceInfo.getNetworkInfo();
    }

    /**
    * Check if the device is rooted
    */
    static async isDeviceRooted() {
        return await NativeDeviceInfo.isDeviceRooted();
    }

    // NFC APIs
    static async isNfcAvailable() {
        return await NativeDeviceInfo.isNfcAvailable();
    }

    static async startNfcSession() {
        return await NativeDeviceInfo.startNfcSession();
    }
    static async stopNfcSession() {
        return await NativeDeviceInfo.stopNfcSession();
    }

    // Event helpers
    // Uses the global RCTDeviceEventEmitter via NativeEventEmitter without a native module arg
    static addNfcListener(callback: (event: { id: string | null; techlist: string[]; ndefPayloads: string[] }) => void) {
        const emitter = new NativeEventEmitter();
        const subscription = emitter.addListener('NfcTagDiscovered', callback);
        return subscription;
    }
}

export default DeviceInfoModule