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

    static async startNfcWriteSession(message: string) {
        return await NativeDeviceInfo.startNfcWriteSession(message);
    }

    static async stopNfcWriteSession() {
        return await NativeDeviceInfo.stopNfcWriteSession();
    }

    // Advanced NFC APIs
    static async writeAdvancedNfcTag(type: string, data: Record<string, string>) {
        return await NativeDeviceInfo.writeAdvancedNfcTag(type, data);
    }

    static async writeCustomNfcMessage(message: string) {
        return await NativeDeviceInfo.writeCustomNfcMessage(message);
    }

    static async eraseNfcTag() {
        return await NativeDeviceInfo.eraseNfcTag();
    }

    static async formatNfcTag() {
        return await NativeDeviceInfo.formatNfcTag();
    }

    static async makeNfcTagReadOnly() {
        return await NativeDeviceInfo.makeNfcTagReadOnly();
    }

    // Event helpers
    // Uses the global RCTDeviceEventEmitter via NativeEventEmitter without a native module arg
    static addNfcListener(callback: (event: { id: string | null; techList: string[]; ndefPayloads: string[] }) => void) {
        const emitter = new NativeEventEmitter();
        const subscription = emitter.addListener('NfcTagDiscovered', callback);
        return subscription;
    }

    static addNfcWriteProgressListener(callback: (event: { state: 'started' | 'finished'; tagId?: string }) => void) {
        const emitter = new NativeEventEmitter();
        const subscription = emitter.addListener('NfcWriteProgress', callback);
        return subscription;
    }

    static addNfcWriteResultListener(callback: (event: { success: boolean; message: string; tagId?: string }) => void) {
        const emitter = new NativeEventEmitter();
        const subscription = emitter.addListener('NfcWriteResult', callback);
        return subscription;
    }
}

export default DeviceInfoModule