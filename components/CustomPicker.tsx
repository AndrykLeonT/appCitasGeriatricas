import React, { useState } from 'react';
import { View, Text, Modal, Pressable, Platform, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

interface CustomPickerProps {
    selectedValue: any;
    onValueChange: (itemValue: any, itemIndex: number) => void;
    children: React.ReactNode;
    style?: any;
}

export default function CustomPicker({ selectedValue, onValueChange, children, style }: CustomPickerProps) {
    const [modalVisible, setModalVisible] = useState(false);

    const items: {label: string, value: any, color?: string}[] = [];
    React.Children.toArray(children).forEach((child: any) => {
        if (child && child.props && child.props.label !== undefined) {
            items.push({
                label: child.props.label, 
                value: child.props.value,
                color: child.props.color
            });
        }
    });

    if (Platform.OS === 'android') {
        return (
            <Picker
                selectedValue={selectedValue}
                onValueChange={onValueChange}
                style={[{ width: '100%', height: 50, backgroundColor: 'transparent' }, style]}
            >
                {items.map((item, index) => (
                    <Picker.Item key={index} label={item.label} value={item.value} color={item.color} />
                ))}
            </Picker>
        );
    }

    // iOS Implementation
    const selectedItem = items.find(item => String(item.value) === String(selectedValue));
    const displayLabel = selectedItem ? selectedItem.label : (items.length > 0 ? items[0].label : "Seleccione...");
    const isPlaceholder = items.length > 0 && String(selectedValue) === String(items[0].value);

    return (
        <>
            <Pressable 
                style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 50, paddingHorizontal: 15 }, style]} 
                onPress={() => setModalVisible(true)}
            >
                <Text style={[{ fontSize: 16, color: '#1F2937', flex: 1 }, isPlaceholder && { color: '#9CA3AF' }]} numberOfLines={1}>
                    {displayLabel}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </Pressable>

            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Pressable onPress={() => setModalVisible(false)}>
                                <Text style={styles.doneText}>Listo</Text>
                            </Pressable>
                        </View>
                        <Picker
                            selectedValue={selectedValue}
                            onValueChange={(itemValue, itemIndex) => {
                                onValueChange(itemValue, itemIndex);
                            }}
                            style={styles.iosPicker}
                            itemStyle={{ color: '#000000' }}
                        >
                            {items.map((item, index) => (
                                <Picker.Item key={index} label={item.label} value={item.value} color={item.color} />
                            ))}
                        </Picker>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

CustomPicker.Item = Picker.Item;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    doneText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    iosPicker: {
        width: '100%',
        backgroundColor: '#FFFFFF',
    }
});
