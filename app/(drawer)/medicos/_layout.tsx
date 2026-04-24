import { Stack } from 'expo-router';

export default function MedicosLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: "Médicos" }} />
            <Stack.Screen name="verMedico" options={{ title: "Detalle Médico" }} />
            <Stack.Screen name="registroPersonalMedico" options={{ title: "Registro Médico" }} />
        </Stack>
    );
}
