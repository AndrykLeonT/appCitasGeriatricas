import { Stack } from 'expo-router';

export default function PacientesLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: "Pacientes" }} />
            <Stack.Screen name="verPaciente" options={{ title: "Detalle Paciente" }} />
            <Stack.Screen name="registroPaciente" options={{ title: "Registro Paciente" }} />
            <Stack.Screen name="preferencias" options={{ title: "Preferencias" }} />
        </Stack>
    );
}
