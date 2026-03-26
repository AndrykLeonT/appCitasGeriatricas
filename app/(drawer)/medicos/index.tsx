import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as SQLite from "expo-sqlite";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Inicializa la base de datos (crea la tabla si no existe)
const initDB = async () => {
  const db = await SQLite.openDatabaseAsync("medicos.db");
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS PersonalMedico (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido1 TEXT NOT NULL,
      apellido2 TEXT,
      rfc TEXT,
      cedula TEXT,
      carrera TEXT,
      escuela TEXT,
      tituloEspecialidad TEXT,
      escuelaEspecialidad TEXT,
      turno TEXT,
      telefono TEXT,
      cubreUrgencias INTEGER
    );
  `);
  return db;
};

export default function MedicosIndex() {
    const router = useRouter();
    const [medicos, setMedicos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMedicos = async () => {
        setLoading(true);
        try {
            const db = await initDB();
            const data = await db.getAllAsync("SELECT * FROM PersonalMedico ORDER BY id DESC;");
            setMedicos(data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudieron obtener los médicos. Verifique su base de datos.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchMedicos();
        }, [])
    );

    const eliminarMedico = async (id: number) => {
        try {
            setLoading(true);
            const db = await SQLite.openDatabaseAsync("medicos.db");
            await db.runAsync("DELETE FROM PersonalMedico WHERE id = ?;", [id]);
            Alert.alert("Éxito", "Registro eliminado correctamente.");
            await fetchMedicos();
        } catch (error) {
            console.error("Error al eliminar médico", error);
            Alert.alert("Error", "No se pudo eliminar el registro.");
            setLoading(false);
        }
    };

    const handleBorrar = (id: number) => {
        Alert.alert("Confirmación", "¿Está seguro de eliminar este registro?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Borrar",
                style: "destructive",
                onPress: () => eliminarMedico(id),
            },
        ]);
    };

    const handleEditar = (medico: any) => {
        // Enlaza la data del médico como JSON al parámetro
        router.push({
            pathname: "/(drawer)/medicos/registroPersonalMedico",
            params: { medicoData: JSON.stringify(medico) }
        });
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.titulo}>Dashboard de Médicos</Text>
                </View>

                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#10B981" />
                    </View>
                ) : (
                    <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                        <Text style={styles.listaTitle}>
                            Médicos Registrados ({medicos.length})
                        </Text>

                        {medicos.length === 0 ? (
                            <Text style={styles.emptyText}>
                                No hay médicos registrados aún.
                            </Text>
                        ) : (
                            medicos.map((medico: any) => (
                                <View key={medico.id.toString()} style={styles.medicoCard}>
                                    <View style={styles.medicoInfo}>
                                        <Text style={styles.medicoName}>
                                            {medico.nombre} {medico.apellido1} {medico.apellido2 || ""}
                                        </Text>
                                        <Text style={styles.medicoSpec}>
                                            {medico.tituloEspecialidad ||
                                                medico.carrera ||
                                                "Sin especialidad"}
                                        </Text>
                                        <Text style={styles.medicoDetails}>
                                            Turno: {medico.turno} | Urgencias:{" "}
                                            {medico.cubreUrgencias ? "Sí" : "No"}
                                        </Text>
                                        <Text style={styles.medicoDetails}>
                                            Teléfono: {medico.telefono || "N/A"}
                                        </Text>
                                    </View>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={styles.btnEdit}
                                            onPress={() => handleEditar(medico)}
                                        >
                                            <Text style={styles.actionText}>Editar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.btnDelete}
                                            onPress={() => handleBorrar(medico.id)}
                                        >
                                            <Text style={styles.actionTextDelete}>Borrar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                )}

                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => router.push("/(drawer)/medicos/registroPersonalMedico")}
                >
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6" },
    header: { padding: 20, paddingBottom: 10, backgroundColor: "#f3f4f6" },
    titulo: { fontSize: 26, fontWeight: "800", color: "#1F2937", marginTop: 10 },
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    scrollContent: { paddingHorizontal: 25 },
    scrollContainer: { paddingBottom: 100 },
    listaTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 15,
        marginTop: 5,
    },
    emptyText: {
        color: "#6b7280",
        fontStyle: "italic",
        textAlign: "center",
        marginTop: 20,
    },
    medicoCard: {
        backgroundColor: "#ffffff",
        borderRadius: 8,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    medicoInfo: { marginBottom: 10 },
    medicoName: { fontSize: 18, fontWeight: "bold", color: "#111827" },
    medicoSpec: {
        fontSize: 15,
        color: "#10B981",
        marginTop: 4,
        fontWeight: "600",
    },
    medicoDetails: { fontSize: 13, color: "#6b7280", marginTop: 4 },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
        paddingTop: 10,
    },
    btnEdit: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: "#f3f4f6",
        marginRight: 10,
    },
    btnDelete: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: "#fee2e2",
    },
    actionText: { color: "#4b5563", fontWeight: "700", fontSize: 13 },
    actionTextDelete: { color: "#dc2626", fontWeight: "700", fontSize: 13 },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 30,
        backgroundColor: "#10B981", 
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    }
});
