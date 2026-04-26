import { Stack } from 'expo-router';

export default function CitasLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: "Mis Citas" }} />
            <Stack.Screen name="bitacora" options={{ title: "Bitácora de Citas" }} />
            <Stack.Screen name="crear-cita" options={{ title: "Crear Cita" }} />
            <Stack.Screen name="ver-cita" options={{ title: "Ver Cita" }} />
        </Stack>
    );
}
