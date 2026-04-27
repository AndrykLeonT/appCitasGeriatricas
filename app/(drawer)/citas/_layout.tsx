import React from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import FloatingBackButton from '../../../components/FloatingBackButton';

export default function CitasLayout() {
    return (
        <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ title: "Mis Citas" }} />
                <Stack.Screen name="bitacora" options={{ title: "Bitácora de Citas" }} />
                <Stack.Screen name="crear-cita" options={{ title: "Crear Cita" }} />
                <Stack.Screen name="ver-cita" options={{ title: "Ver Cita" }} />
            </Stack>
            <FloatingBackButton />
        </View>
    );
}
