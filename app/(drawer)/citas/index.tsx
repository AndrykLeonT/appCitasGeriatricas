import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function CitasIndex() {
    const router = useRouter();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.titulo}>Menú de Citas</Text>

            <View style={styles.grid}>
                <Pressable
                    style={({ pressed }) => [
                        styles.tarjeta,
                        { opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => router.push("/(drawer)/citas/crear-cita")}
                >
                    <FontAwesome name="calendar-plus-o" size={40} color="#60A5FA" />
                    <Text style={styles.tarjetaTitulo}>Crear Nueva Cita</Text>
                    <Text style={styles.tarjetaDesc}>
                        Agendar cita en el sistema
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
        marginBottom: 30,
        marginTop: 10,
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
