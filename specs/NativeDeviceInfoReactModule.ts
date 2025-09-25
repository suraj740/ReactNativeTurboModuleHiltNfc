import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface DeviceInfo {
    deviceName: string;
    model: string;
    brand: string;
    manufacturer: string;
    androidVersion: string;
    apiLevel: number;
    buildId: string;
    hardware: string;
    product: string;
    device: string;
    board: string;
    bootLoader: string;
    fingerprint: string;
    host: string;
    id: string;
    tags: string;
    type: string;
    user: string;
    display: string;
    screenDensity: number;
    screenWidth: number;
    screenHeight: number;
}

export interface BatteryInfo {
    level: number; 
    isCharging: boolean;
    status: string; 
    health: string;
    technology: string; 
    temperature: number; 
    voltage: number;
}


export interface MemoryInfo {
    totalMemory: number; 
    availableMemory: number; 
    usedMemory: number;
    memoryUsagePercentage: number; 
    isLowMemory: boolean;
}
export interface StorageInfo {
    totalStorage: number; 
    availableStorage: number; 
    usedStorage: number;
    storageUsagePercentage: number;
}
export interface NetworkInfo { 
    networkType: string;
    isConnected: boolean;
    wifiSSID: string;
    wifiBSSID: string;
    wifiSignalStrength: number;
    ipAddress: string;
}

export interface Spec extends TurboModule {
    readonly getDeviceInfo: () => Promise<DeviceInfo>;
    readonly getBatteryInfo: () => Promise<BatteryInfo>;
    readonly getMemoryInfo: () => Promise<MemoryInfo>;
    readonly getStorageInfo: () => Promise<StorageInfo>;
    readonly getNetworkInfo: () => Promise<NetworkInfo>;
    readonly isDeviceRooted: () => Promise<boolean>;

    // NFC APIs
    readonly isNfcAvailable: () => Promise<boolean>;
    readonly startNfcSession: () => Promise<boolean>; 
    readonly stopNfcSession: () => Promise<boolean>;

    // Nfc Write APIs
    startNfcWriteSession: (message: string) => Promise<boolean>;
    stopNfcWriteSession: () => Promise<boolean>;
}
export default TurboModuleRegistry.getEnforcing<Spec>("CustomDeviceInfoModule");