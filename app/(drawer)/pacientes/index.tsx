import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function PacientesIndex() {
    const router = useRouter();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.titulo}>Menú de Pacientes</Text>

            <View style={styles.grid}>
                <Pressable
                    style={({ pressed }) => [
                        styles.tarjeta,
                        { opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => router.push("/(drawer)/pacientes/registroPaciente")}
                >
                    <Ionicons name="person-add" size={40} color="#3B82F6" />
                    <Text style={styles.tarjetaTitulo}>Registrar Paciente</Text>
                    <Text style={styles.tarjetaDesc}>
                        Formulario completo clínico
                    </Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.tarjeta,
                        { opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => router.push("/(drawer)/pacientes/registroPersonalMedico")}
                >
                    <FontAwesome5 name="user-md" size={38} color="#10B981" />
                    <Text style={styles.tarjetaTitulo}>Personal Médico</Text>
                    <Text style={styles.tarjetaDesc}>
                        Añadir doctores o enfermeros
                    </Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.tarjeta,
                        { opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => router.push("/(drawer)/pacientes/preferencias")}
                >
                    <Ionicons name="settings" size={40} color="#8B5CF6" />
                    <Text style={styles.tarjetaTitulo}>Preferencias</Text>
                    <Text style={styles.tarjetaDesc}>
                        Configuración de usuario
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
