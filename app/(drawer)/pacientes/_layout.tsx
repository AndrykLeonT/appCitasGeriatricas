import React from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import FloatingBackButton from '../../../components/FloatingBackButton';

export default function PacientesLayout() {
    return (
        <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ title: "Pacientes" }} />
                <Stack.Screen name="verPaciente" options={{ title: "Detalle Paciente" }} />
                <Stack.Screen name="registroPaciente" options={{ title: "Registro Paciente" }} />
                <Stack.Screen name="preferencias" options={{ title: "Preferencias" }} />
            </Stack>
            <FloatingBackButton />
        </View>
    );
}
