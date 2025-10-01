import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import DeviceInfoModule from './js/CustomDeviceInfoModule';

interface NfcTag {
    id: string;
    techList: string[];
    ndefPayloads: string[];
    timestamp: number;
}

interface WriteTemplate {
    id: string;
    name: string;
    type: 'TEXT' | 'URL' | 'WIFI' | 'CONTACT' | 'SMS' | 'EMAIL' | 'PHONE' | 'APP';
    data: Record<string, string>;
}

const NfcToolsApp: React.FC = () => {
    const [currentMode, setCurrentMode] = useState<'read' | 'write' | 'tools'>('read');
    const [nfcAvailable, setNfcAvailable] = useState<boolean | null>(null);
    const [writing, setWriting] = useState(false);
    const [lastTag, setLastTag] = useState<NfcTag | null>(null);
    const [tagHistory, setTagHistory] = useState<NfcTag[]>([]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<WriteTemplate | null>(null);
    const [customMessage, setCustomMessage] = useState<string>('Hello Nfc from React Native!');

    // Write templates
    const [templates] = useState<WriteTemplate[]>([
        {
            id: '1',
            name: 'Simple Text',
            type: 'TEXT',
            data: { text: 'Hello NFC World!' },
        },
        {
            id: '2',
            name: 'Website URL',
            type: 'URL',
            data: { url: 'https://example.com' },
        },
        {
            id: '3',
            name: 'WiFi Network',
            type: 'WIFI',
            data: { ssid: 'MyWiFi', password: 'password123', security: 'WPA' },
        },
        {
            id: '4',
            name: 'Contact Card',
            type: 'CONTACT',
            data: { name: 'John Doe', phone: '+1234567890', email: 'john@example.com' },
        },
        {
            id: '5',
            name: 'SMS Message',
            type: 'SMS',
            data: { phone: '+1234567890', message: 'Hello from NFC!' },
        },
        {
            id: '6',
            name: 'Email',
            type: 'EMAIL',
            data: { email: 'contact@example.com', subject: 'NFC Contact', body: 'Hello!' },
        },
        {
            id: '7',
            name: 'Phone Call',
            type: 'PHONE',
            data: { phone: '+1234567890' },
        },
        {
            id: '8',
            name: 'App Launch',
            type: 'APP',
            data: { package: 'com.example.app' },
        },
    ]);

    useEffect(() => {
        checkNfcAvailability();
        setupEventListeners();
    }, []);

    const checkNfcAvailability = async () => {
        try {
            const available = await DeviceInfoModule.isNfcAvailable();
            setNfcAvailable(available);
        } catch (error) {
            console.error('Error checking NFC:', error);
            setNfcAvailable(false);
        }
    };

    const setupEventListeners = () => {
        const tagSubscription = DeviceInfoModule.addNfcListener((event: any) => {
            const newTag: NfcTag = {
                id: event.id || 'Unknown',
                techList: event.techList,
                ndefPayloads: event.ndefPayloads,
                timestamp: Date.now(),
            };
            setLastTag(newTag);
            setTagHistory((prev) => [newTag, ...prev.slice(0, 9)]); // Keep last 10 tags
        });

        const progressSubscription = DeviceInfoModule.addNfcWriteProgressListener((event: any) => {
            setWriting(event.state === 'started');
        });

        const resultSubscription = DeviceInfoModule.addNfcWriteResultListener((event: any) => {
            setWriting(false);
            Alert.alert(
                'NFC Write Result',
                event.success
                    ? `${event.message}${event.tagId ? `\nTag ID: ${event.tagId}` : ''}`
                    : `❌ ${event.message}`
            );
        });

        return () => {
            tagSubscription.remove();
            progressSubscription.remove();
            resultSubscription.remove();
        };
    };

    const startNfcRead = async () => {
        try {
            await DeviceInfoModule.stopNfcWriteSession(); // Ensure write session is stopped before reading
            await DeviceInfoModule.startNfcSession();
            Alert.alert('NFC Reader', '📱 Ready to scan NFC tags...');
        } catch (error) {
            Alert.alert('Error', 'Failed to start NFC reading');
        }
    };

    const stopNfcRead = async () => {
        try {
            await DeviceInfoModule.stopNfcSession();
            Alert.alert('NFC Reader', 'NFC reading stopped');
        } catch (error) {
            Alert.alert('Error', 'Failed to stop NFC reading');
        }
    };

    const writeTemplate = async (template: WriteTemplate) => {
        try {
            await DeviceInfoModule.stopNfcSession(); // Ensure read session is stopped before writing
            await DeviceInfoModule.writeAdvancedNfcTag(template.type, template.data);
            Alert.alert('NFC Writer', `📝 Ready to write ${template.name}...\nTap an NFC tag to write.`);
            setShowTemplateModal(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to start NFC writing');
        }
    };

    const writeCustomMessage = async () => {
        if (!customMessage.trim()) {
            Alert.alert('NFC Writer', 'Please enter a message to write');
            return;
        }
        try {
            await DeviceInfoModule.stopNfcSession(); // Ensure read session is stopped before writing
            await DeviceInfoModule.writeCustomNfcMessage(customMessage);
            Alert.alert('NFC Writer', '📝 Ready to write a custom message...\nTap an NFC tag to write.');
        } catch (error) {
            Alert.alert('Error', 'Failed to start NFC writing');
        }
    };

    const eraseTag = async () => {
        Alert.alert(
            'Erase NFC Tag',
            '⚠️ This will permanently erase the tag content. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Erase',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await DeviceInfoModule.eraseNfcTag();
                            Alert.alert('NFC Eraser', '🗑️ Ready to erase...\nTap an NFC tag to erase.');
                        } catch (error: any) {
                            console.error("Erase Error", error);
                            const errorMessage = error?.message || error?.toString() || 'Failed to start erase operation';
                            Alert.alert('Error', `Failed to start erase operation ${errorMessage}`);
                        }
                    },
                },
            ]
        );
    };

    const formatTag = async () => {
        Alert.alert(
            'Format NFC Tag',
            '⚠️ This will format the tag and erase all content. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Format',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await DeviceInfoModule.formatNfcTag();
                            Alert.alert('NFC Formatter', '💾 Ready to format...\nTap an NFC tag to format.');
                        } catch (error: any) {
                            console.error("Format Error", error);
                            const errorMessage = error?.message || error?.toString() || 'Failed to start format operation';
                            Alert.alert('Error', `Failed to start format operation ${errorMessage}`);
                        }
                    },
                },
            ]
        );
    };

    const makeReadOnly = async () => {
        Alert.alert(
            'Make Read-Only',
            '🔒 This will make the tag permanently read-only. This cannot be undone!',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Make Read-Only',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await DeviceInfoModule.makeNfcTagReadOnly();
                            Alert.alert('NFC Lock', '🔒 Ready to lock...\nTap an NFC tag to make read-only.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to start read-only operation');
                        }
                    },
                },
            ]
        );
    };

    const handleModeChange = async (newMode: 'read' | 'write' | 'tools') => {
        if (newMode === currentMode) return;
        try {
            await DeviceInfoModule.stopNfcSession();
            await DeviceInfoModule.stopNfcWriteSession();
            setCurrentMode(newMode);
        } catch (error) {
            console.error('Error switching modes:', error);
            setCurrentMode(newMode); // Still switch modes even if stopping sessions fails
        }
    };

    const renderModeSelector = () => (
        <View style={styles.modeSelector}>
            {['read', 'write', 'tools'].map((mode) => (
                <TouchableOpacity
                    key={mode}
                    style={[styles.modeButton, currentMode === mode && styles.activeModeButton]}
                    onPress={() => handleModeChange(mode as any)}
                >
                    <Text style={[styles.modeButtonText, currentMode === mode && styles.activeModeButtonText]}>
                        {mode === 'read' ? 'Read' : mode === 'write' ? ' Write' : 'Tools'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderReadMode = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>NFC Reader</Text>
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.primaryButton} onPress={startNfcRead}>
                    <Text style={styles.buttonText}>📱 Start Reading</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={stopNfcRead}>
                    <Text style={styles.buttonText}>⏹️ Stop</Text>
                </TouchableOpacity>
            </View>

            {lastTag && (
                <View style={styles.tagCard}>
                    <Text style={styles.cardTitle}>📋 Last Scanned Tag</Text>
                    <Text style={styles.tagInfo}>ID: {lastTag.id}</Text>
                    <Text style={styles.tagInfo}>Technologies: {lastTag.techList.join(', ')}</Text>
                    <Text style={styles.tagInfo}>Records: {lastTag.ndefPayloads.length}</Text>
                    {lastTag.ndefPayloads.map((payload, index) => (
                        <Text key={index} style={styles.payload}>
                            • {payload}
                        </Text>
                    ))}
                    <Text style={styles.timestamp}>{new Date(lastTag.timestamp).toLocaleString()}</Text>
                </View>
            )}

            {tagHistory.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📚 Recent Tags</Text>
                    {tagHistory.slice(0, 3).map((tag) => (
                        <View key={`${tag.id}-${tag.timestamp}`} style={styles.historyItem}>
                            <Text style={styles.historyId}>{tag.id}</Text>
                            <Text style={styles.historyTime}>{new Date(tag.timestamp).toLocaleTimeString()}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    const renderWriteMode = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>NFC Writer</Text>

            <View style={styles.customMessageSection}>
                <Text style={styles.subsectionTitle}>Custom Text Message</Text>
                <TextInput
                    style={styles.customMessageInput}
                    value={customMessage}
                    onChangeText={setCustomMessage}
                    placeholder="Enter message to write"
                    multiline
                    numberOfLines={3}
                />
                <TouchableOpacity style={styles.primaryButton} onPress={writeCustomMessage}>
                    <Text style={styles.buttonText}>📝 Write Custom Message</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.templatesSection}>
                <Text style={styles.subsectionTitle}>Or Choose a Template</Text>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowTemplateModal(true)}>
                    <Text style={styles.buttonText}>📝 Choose Template</Text>
                </TouchableOpacity>

                <View style={styles.templateGrid}>
                    {templates.slice(0, 4).map((template) => (
                        <TouchableOpacity
                            key={template.id}
                            style={styles.templateCard}
                            onPress={() => writeTemplate(template)}
                        >
                            <Text style={styles.templateName}>{template.name}</Text>
                            <Text style={styles.templateType}>{template.type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderToolsMode = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>NFC Tools</Text>

            <View style={styles.toolsGrid}>
                <TouchableOpacity style={styles.toolButton} onPress={eraseTag}>
                    <Text style={styles.toolIcon}>🗑️</Text>
                    <Text style={styles.toolText}>Erase Tag</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolButton} onPress={formatTag}>
                    <Text style={styles.toolIcon}>💾</Text>
                    <Text style={styles.toolText}>Format Tag</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolButton} onPress={makeReadOnly}>
                    <Text style={styles.toolIcon}>🔒</Text>
                    <Text style={styles.toolText}>Lock Tag</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.toolButton}
                    onPress={() => Alert.alert('Coming Soon', 'Clone feature coming soon!')}
                >
                    <Text style={styles.toolIcon}>📋</Text>
                    <Text style={styles.toolText}>Clone Tag</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                    ⚠️ Warning: Some operations are permanent and cannot be undone!
                </Text>
            </View>
        </View>
    );

    const renderTemplateModal = () => (
        <Modal visible={showTemplateModal} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Choose Write Template</Text>
                    <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                        <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                    {templates.map((template) => (
                        <TouchableOpacity
                            key={template.id}
                            style={styles.templateItem}
                            onPress={() => writeTemplate(template)}
                        >
                            <Text style={styles.templateItemName}>{template.name}</Text>
                            <Text style={styles.templateItemType}>{template.type}</Text>
                            <Text style={styles.templateItemData}>
                                {Object.entries(template.data)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(' • ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </Modal>
    );

    if (nfcAvailable === null) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Checking NFC availability...</Text>
            </View>
        );
    }

    if (!nfcAvailable) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>📱❌</Text>
                <Text style={styles.errorTitle}>NFC Not Available</Text>
                <Text style={styles.errorText}>
                    NFC is not available or enabled on this device. Please enable NFC in your device settings.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📱 NFC Tools</Text>
                <Text style={styles.subtitle}>Professional NFC Tag Manager</Text>
            </View>

            {renderModeSelector()}

            {currentMode === 'read' && renderReadMode()}
            {currentMode === 'write' && renderWriteMode()}
            {currentMode === 'tools' && renderToolsMode()}

            {renderTemplateModal()}

            {writing && (
                <View style={styles.overlay}>
                    <View style={styles.overlayBox}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.overlayText}>Processing NFC operation...</Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 32,
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    header: {
        backgroundColor: '#007AFF',
        padding: 24,
        paddingTop: 48,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 4,
    },
    modeSelector: {
        flexDirection: 'row',
        backgroundColor: 'white',
        margin: 16,
        borderRadius: 12,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeModeButton: {
        backgroundColor: '#007AFF',
    },
    modeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    activeModeButtonText: {
        color: 'white',
    },
    section: {
        margin: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#666',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginLeft: 12,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    tagCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    tagInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    payload: {
        fontSize: 14,
        color: '#007AFF',
        marginLeft: 8,
        marginBottom: 2,
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
        textAlign: 'right',
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    historyId: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    historyTime: {
        fontSize: 12,
        color: '#666',
    },
    templateGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
    },
    templateCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    templateName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    templateType: {
        fontSize: 12,
        color: '#007AFF',
        marginTop: 4,
    },
    toolsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
    },
    toolButton: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    toolIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    toolText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    warningBox: {
        backgroundColor: '#FFF3CD',
        borderColor: '#FFEAA7',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },
    warningText: {
        fontSize: 14,
        color: '#856404',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 48,
        backgroundColor: '#007AFF',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    closeButton: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    templateItem: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    templateItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    templateItemType: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
        marginBottom: 8,
    },
    templateItemData: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    overlayBox: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
    },
    overlayText: {
        marginTop: 12,
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    customMessageSection: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    templatesSection: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    subsectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    customMessageInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        marginBottom: 16,
        minHeight: 80,
        textAlignVertical: 'top',
    },
});

export default NfcToolsApp;
