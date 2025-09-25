/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme, View, Button, SafeAreaView, Alert, ScrollView, Text, NativeEventEmitter, TextInput } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import DeviceInfoModule from './specs/NativeDeviceInfoReactModule';
import { useEffect, useState } from 'react';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

 
  return (
     <SafeAreaProvider>
        <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
//   const safeAreaInsets = useSafeAreaInsets();
const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);
const [lastTag, setLastTag] = useState<{id: string | null; techlist: string[]; ndefPayloads: string[]} | null>(null);
const [writeMessage, setWriteMessage] = useState<string>("Hello from React Native!");
const [lastWriteResult, setLastWriteResult] = useState<{success: boolean; message: string; tagId?:string} | null>(null);
useEffect(() => {
    const emitter = new NativeEventEmitter();
    const sub = emitter.addListener('NfcTagDiscovered', (event) => {
        setLastTag(event);
    });

    const writeSub = emitter.addListener('NfcWriteResult', (event) => {
        setLastWriteResult(event);
    });
    return () => {
        sub.remove();
    }
}, []);


 const getDeviceInfo = async () => {
    console.log('Fetching device info...');
    try {
      const deviceInfo = await DeviceInfoModule.getDeviceInfo();
      console.log('Device Name:', deviceInfo.deviceName);
      console.log('Model:', deviceInfo.model);
      console.log('Android Version:', deviceInfo.androidVersion);
      console.log('Manufacturer:', deviceInfo.manufacturer);
      console.log('Battery Info:', await DeviceInfoModule.getBatteryInfo());
      console.log('Memory Info:', await DeviceInfoModule.getMemoryInfo());
      console.log('Storage Info:', await DeviceInfoModule.getStorageInfo());
      console.log('Network Info:', await DeviceInfoModule.getNetworkInfo());
      console.log('Is Device Rooted:', await DeviceInfoModule.isDeviceRooted());
    } catch (error) {
      console.error('Error fetching device info:', error);
    }
 }

 const checkNfc = async () => {
    try {
        const available = await DeviceInfoModule.isNfcAvailable();
        console. log("NFC Available:", available);
        setNfcAvailable(available);
        Alert.alert('NFC Availability', available ? "NFC is available and enabled" : "NFC not available or disabled");
    } catch (e) {
        console.error(e);
        Alert.alert('NFC', "Failed to check NFC availability");
    }
}

const startNfc = async () => {
    try {
        await DeviceInfoModule.startNfcSession();
        Alert.alert("NFC", "NFC session started. Tap a tag...");
    } catch (e) {
        console.error(e);
        Alert.alert("NFC", "Failed to start NFC session");
    }
}

const stopNfc = async () => {
    try {
    await DeviceInfoModule.stopNfcSession();
    Alert.alert('NFC', "NFC session stopped");
    } catch (e) {
        console.error(e);
        Alert.alert('NFC', "Failed to stop NFC session");
    }
}

const startNfcWrite = async () => {
    if(!writeMessage.trim()) {
        Alert.alert("NFC Write", "Please enter a message to write");
        return;
    }
    try {
        await DeviceInfoModule.startNfcWriteSession(writeMessage);
        Alert.alert("NFC Write", "NFC write session started. Tap a writable tag...");
    } catch (e) {
        console.error(e);
        Alert.alert("NFC Write", "Failed to start NFC write session");
    }
}

const stopNfcWrite = async () => {
    try {
        await DeviceInfoModule.stopNfcWriteSession();
        Alert.alert("NFC Write", "NFC write session stopped");
    } catch (e) {
        console.error(e);
        Alert.alert("NFC Write", "Failed to stop NFC write session");
    }
}

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      /> */}
        <Button title="Get Device Info" onPress={getDeviceInfo} />

        <View style={styles.divider} />
        <Text style={styles.subtitle}> NFC Demo</Text>
        <View style={styles.row}>
            <Button title="Check NFC" onPress={checkNfc}/>
            <View style={{ width: 12 }} />
            <Button title="Start NFC" onPress={startNfc} /> 
            <View style={{ width: 12 }} />
            <Button title="Stop NFC" onPress={stopNfc} />
        </View>
        <Text style={styles.note}>NFC Available: {nfcAvailable === null ? "Unknown" : nfcAvailable ? "Yes" : "No"}</Text>

        <View style={styles.divider} />
        <Text style={styles.subtitle}> NFC Write Demo</Text>
        <TextInput
            style={styles.textInput}
            value={writeMessage}
            onChangeText={setWriteMessage}
            placeholder="Enter message to write"
            multiline
        />
        <View style={styles.row}>
            <Button title="Start Write" onPress={startNfcWrite} />
            <View style={{ width: 12 }} />
            <Button title="Stop Write" onPress={stopNfcWrite} />
        </View>
        {lastWriteResult && (
            <View style={[styles.tagBox, {backgroundColor: lastWriteResult.success ? '#e8f5e8' : '#ffe8e8'}]}>
                <Text style={styles.subtitle}>Last Write Result</Text>
                <Text style={styles.text}>Status: {lastWriteResult.success ? "Success" : "Failed"}</Text>
                <Text style={styles.text}>Message: {lastWriteResult.message}</Text>
                {lastWriteResult.tagId && (
                    <Text style={styles.text}>Tag ID: {lastWriteResult.tagId}</Text>
                )}
            </View>
        )}
        {lastTag && (
        <View style={styles.tagBox}>
            <Text style={styles.subtitle}>Last NFC Tag</Text>
            <Text style={styles.text}>ID: {lastTag.id ?? "null"}</Text>
            {/* <Text style={styles.text}>Techs: {lastTag.techList.join(', ')}</Text> */}
            <Text style={styles.text}>Payloads:</Text>
            {lastTag.ndefPayloads.map((p, i) => (
                <Text key={i} style={styles.text}>{p}</Text>
            ))}
        </View>
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    alignSelf: 'stretch',
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagBox: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignSelf: 'stretch',
  },
  textInput: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
    backgroundColor: '#fff',
    minHeight: 60,
    fontSize: 16,
    textAlignVertical: 'top',
  }
});

export default App;
