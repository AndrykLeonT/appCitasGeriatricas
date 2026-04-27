import React from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import FloatingBackButton from '../../../components/FloatingBackButton';

export default function MedicosLayout() {
    return (
        <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ title: "Médicos" }} />
                <Stack.Screen name="verMedico" options={{ title: "Detalle Médico" }} />
                <Stack.Screen name="registroPersonalMedico" options={{ title: "Registro Médico" }} />
            </Stack>
            <FloatingBackButton />
        </View>
    );
}
