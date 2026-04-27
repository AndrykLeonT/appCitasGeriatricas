import React from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import FloatingBackButton from '../../../components/FloatingBackButton';

export default function EvaluacionesLayout() {
    return (
        <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ title: "Evaluaciones" }} />
                <Stack.Screen name="01_miniCog" options={{ title: "Mini-Cog ™" }} />
                <Stack.Screen name="02_fluenciaVerbalSemantica" options={{ title: "Fluencia verbal semántica" }} />
                <Stack.Screen name="03_minimental" options={{ title: "Mini-Mental" }} />
                <Stack.Screen name="04_evaluacionMoCa" options={{ title: "MoCA©" }} />
                <Stack.Screen name="05_formulario" options={{ title: "GDS-15" }} />
                <Stack.Screen name="06_CESD7Test6" options={{ title: "CESD-7 ítems" }} />
                <Stack.Screen name="07_KatzIndex" options={{ title: "Índice de Katz" }} />
                <Stack.Screen name="08_Lawton" options={{ title: "Índice de Lawton" }} />
                <Stack.Screen name="09_FrailApp" options={{ title: "Escala FRAIL" }} />
                <Stack.Screen name="10_SPPBScreen" options={{ title: "Batería de Desempeño Físico (SPPB)" }} />
                <Stack.Screen name="11_App" options={{ title: "Escala Braden" }} />
                <Stack.Screen name="12_prueba" options={{ title: "Escala Norton" }} />
                <Stack.Screen name="13_PruebaSusurro" options={{ title: "Prueba del Susurro" }} />
                <Stack.Screen name="14_AgudezaVisual" options={{ title: "Agudeza Visual" }} />
                <Stack.Screen name="14_Prueba" options={{ headerShown: false }} />
                <Stack.Screen name="14_Resultado" options={{ headerShown: false }} />
                <Stack.Screen name="15_MNA-SF" options={{ title: "MNA-SF" }} />
                <Stack.Screen name="16_MUST" options={{ title: "MUST" }} />
                <Stack.Screen name="17_SARC-F" options={{ title: "SARC-F" }} />
                <Stack.Screen name="18_OARSScreen" options={{ title: "OARS" }} />
                <Stack.Screen name="19_EscalaMaltrato" options={{ title: "Escala geriátrica de maltrato" }} />
                <Stack.Screen name="20_Formulario" options={{ title: "Movilidad en el entorno" }} />
                <Stack.Screen name="historial" options={{ title: "Historial de evaluación" }} />
            </Stack>
            <FloatingBackButton />
        </View>
    );
}
