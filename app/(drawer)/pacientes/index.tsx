import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { deletePatientFromFirebase, Patient, readPatientsFromFirebase } from "../../../services/firebasePatients";

export default function PacientesIndex() {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const data = await readPatientsFromFirebase();
            setPatients(data);
        } catch (error) {
            Alert.alert("Error", "No se pudieron obtener los pacientes. Verifique su conexión.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPatients();
        }, [])
    );

    const handleDelete = (id: string) => {
        Alert.alert(
            "Confirmar eliminación",
            "¿Estás seguro de que deseas eliminar a este paciente?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await deletePatientFromFirebase(id);
                            await fetchPatients();
                        } catch (error) {
                            Alert.alert("Error", "No se pudo eliminar al paciente.");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = (id: string) => {
        router.push({
            pathname: "/(drawer)/pacientes/registroPaciente",
            params: { id }
        });
    };

    const renderPatientCard = ({ item }: { item: Patient }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                    <Ionicons name="person-circle" size={50} color="#3B82F6" />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.cardName}>{`${item.nombre} ${item.apellidos}`}</Text>
                    <Text style={styles.cardText}><Text style={styles.bold}>Edad:</Text> {item.edad} años</Text>
                    <Text style={styles.cardText}><Text style={styles.bold}>Teléfono:</Text> {item.telefono}</Text>
                    <Text style={styles.cardText}><Text style={styles.bold}>Tipo de Sangre:</Text> {item.tipoSangre}</Text>
                </View>
            </View>
            <View style={styles.actionsContainer}>
                <Pressable
                    style={({ pressed }) => [styles.actionButton, styles.editButton, pressed && { opacity: 0.7 }]}
                    onPress={() => handleEdit(item.id)}
                >
                    <MaterialIcons name="edit" size={20} color="#fff" />
                    <Text style={styles.actionText}>Editar</Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [styles.actionButton, styles.deleteButton, pressed && { opacity: 0.7 }]}
                    onPress={() => handleDelete(item.id)}
                >
                    <MaterialIcons name="delete" size={20} color="#fff" />
                    <Text style={styles.actionText}>Eliminar</Text>
                </Pressable>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titulo}>Dashboard de Pacientes</Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : patients.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No hay pacientes registrados aún.</Text>
                </View>
            ) : (
                <FlatList
                    data={patients}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPatientCard}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <Pressable
                style={({ pressed }) => [
                    styles.fab,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }
                ]}
                onPress={() => router.push("/(drawer)/pacientes/registroPaciente")}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FAFAFA" },
    header: { padding: 20, paddingBottom: 10 },
    titulo: { fontSize: 26, fontWeight: "800", color: "#1F2937", marginTop: 10 },
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyText: { fontSize: 16, color: "#6B7280", textAlign: "center" },
    listContainer: { padding: 20, paddingTop: 10, paddingBottom: 100 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        overflow: "hidden"
    },
    cardContent: {
        flexDirection: "row",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6"
    },
    iconContainer: { justifyContent: "center", marginRight: 15 },
    infoContainer: { flex: 1, justifyContent: "center" },
    cardName: { fontSize: 18, fontWeight: "bold", color: "#1F2937", marginBottom: 5 },
    cardText: { fontSize: 14, color: "#4B5563", marginBottom: 3 },
    bold: { fontWeight: "bold", color: "#374151" },
    actionsContainer: { flexDirection: "row" },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        gap: 8
    },
    editButton: { backgroundColor: "#3B82F6" },
    deleteButton: { backgroundColor: "#EF4444" },
    actionText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
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
