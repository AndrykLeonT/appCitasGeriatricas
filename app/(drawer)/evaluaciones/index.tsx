import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function EvaluacionesIndex() {
    const router = useRouter();

    // Mapeo básico a algunas pruebas o indicación de abrir el drawer
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.titulo}>Pruebas y Evaluaciones</Text>
            <Text style={styles.subtitulo}>
                Desliza desde la izquierda o usa el menú lateral para ver la lista completa de las 20 pruebas disponibles.
            </Text>

            <View style={styles.grid}>
                <Pressable
                    style={({ pressed }) => [
                        styles.tarjeta,
                        { opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => router.push("/(drawer)/evaluaciones/01_miniCog")}
                >
                    <MaterialCommunityIcons name="brain" size={40} color="#8B5CF6" />
                    <Text style={styles.tarjetaTitulo}>Iniciar Mini-Cog</Text>
                    <Text style={styles.tarjetaDesc}>
                        Ir a la Prueba 1
                    </Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: "#FAFAFA", padding: 20 },
    titulo: {
        fontSize: 26,
        fontWeight: "800",
        color: "#1F2937",
        marginBottom: 10,
        marginTop: 10,
    },
    subtitulo: {
        fontSize: 15,
        color: "#4B5563",
        marginBottom: 30,
        lineHeight: 22,
    },
    grid: { flexDirection: "column", gap: 20 },
    tarjeta: {
        backgroundColor: "#fff",
        padding: 25,
        borderRadius: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    tarjetaTitulo: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#374151",
        marginTop: 15,
        marginBottom: 5,
    },
    tarjetaDesc: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
    },
});
