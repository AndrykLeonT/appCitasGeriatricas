import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Patient, readPatientsFromFirebase } from '../../../services/firebasePatients';

const EVALUACIONES = [
    { label: "01. Mini-Cog™", route: "01_miniCog" },
    { label: "02. Fluencia verbal semántica", route: "02_fluenciaVerbalSemantica" },
    { label: "03. Mini-Mental", route: "03_minimental" },
    { label: "04. MoCA©", route: "04_evaluacionMoCa" },
    { label: "05. GDS-15", route: "05_formulario" },
    { label: "06. CESD-7 ítems", route: "06_CESD7Test6" },
    { label: "07. Índice de Katz", route: "07_KatzIndex" },
    { label: "08. Índice de Lawton", route: "08_Lawton" },
    { label: "11. Escala Braden", route: "11_App" },
    { label: "12. Escala Norton", route: "12_prueba" },
    { label: "14. Agudeza Visual", route: "14_AgudezaVisual" },
    { label: "15. MNA-SF", route: "15_MNA-SF" },
    { label: "16. MUST", route: "16_MUST" },
    { label: "17. SARC-F", route: "17_SARC-F" },
    { label: "18. OARS", route: "18_OARSScreen" },
    { label: "19. Escala geriátrica de maltrato", route: "19_EscalaMaltrato" },
    { label: "20. Movilidad en el entorno", route: "20_Formulario" },
];

export default function EvaluacionesIndex() {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatientId, setSelectedPatientId] = useState<string>("");
    const [selectedEvaluacion, setSelectedEvaluacion] = useState<string>(EVALUACIONES[0].route);

    useFocusEffect(
        useCallback(() => {
            const fetchPatients = async () => {
                setLoading(true);
                try {
                    const data = await readPatientsFromFirebase();
                    setPatients(data);
                    if (data.length > 0 && !selectedPatientId) {
                        setSelectedPatientId(data[0].id);
                    }
                } catch {
                    Alert.alert("Error", "No se pudieron cargar los pacientes.");
                } finally {
                    setLoading(false);
                }
            };
            fetchPatients();
        }, [])
    );

    const handleEjecutar = () => {
        if (!selectedPatientId) {
            Alert.alert("Atención", "Selecciona un paciente antes de continuar.");
            return;
        }
        const paciente = patients.find((p) => p.id === selectedPatientId);
        router.push({
            pathname: `/(drawer)/evaluaciones/${selectedEvaluacion}` as any,
            params: {
                pacienteId: selectedPatientId,
                pacienteNombre: paciente ? `${paciente.nombre} ${paciente.apellidos}` : "",
            },
        });
    };

    const selectedPatient = patients.find((p) => p.id === selectedPatientId);
    const selectedEval = EVALUACIONES.find((e) => e.route === selectedEvaluacion);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.titulo}>Evaluaciones</Text>

            <View style={styles.instructionCard}>
                <Ionicons name="information-circle-outline" size={22} color="#1D4ED8" style={{ marginBottom: 6 }} />
                <Text style={styles.instructionText}>
                    Selecciona un paciente y el tipo de evaluación para ver el historial o ejecutar la prueba.
                </Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 48 }} />
            ) : (
                <>
                    {/* ── Selector de paciente ── */}
                    <Text style={styles.label}>Paciente</Text>
                    <View style={styles.pickerWrapper}>
                        {patients.length === 0 ? (
                            <Text style={styles.emptyText}>No hay pacientes registrados</Text>
                        ) : (
                            <Picker
                                selectedValue={selectedPatientId}
                                onValueChange={(value) => setSelectedPatientId(value)}
                                style={styles.picker}
                            >
                                {patients.map((p) => (
                                    <Picker.Item
                                        key={p.id}
                                        label={`${p.nombre} ${p.apellidos}`}
                                        value={p.id}
                                    />
                                ))}
                            </Picker>
                        )}
                    </View>

                    {/* ── Selector de evaluación ── */}
                    <Text style={styles.label}>Evaluación</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={selectedEvaluacion}
                            onValueChange={(value) => setSelectedEvaluacion(value)}
                            style={styles.picker}
                        >
                            {EVALUACIONES.map((e) => (
                                <Picker.Item key={e.route} label={e.label} value={e.route} />
                            ))}
                        </Picker>
                    </View>

                    {/* ── Resumen de selección ── */}
                    {selectedPatient && selectedEval && (
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Resumen</Text>
                            <Text style={styles.summaryRow}>
                                <Text style={styles.summaryKey}>Paciente: </Text>
                                {`${selectedPatient.nombre} ${selectedPatient.apellidos}`}
                            </Text>
                            <Text style={styles.summaryRow}>
                                <Text style={styles.summaryKey}>Prueba: </Text>
                                {selectedEval.label}
                            </Text>
                        </View>
                    )}

                    {/* ── Botón ejecutar ── */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.btn,
                            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                            patients.length === 0 && styles.btnDisabled,
                        ]}
                        onPress={handleEjecutar}
                        disabled={patients.length === 0}
                    >
                        <Ionicons name="play-circle-outline" size={24} color="#fff" />
                        <Text style={styles.btnText}>Ejecutar prueba</Text>
                    </Pressable>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },
    content: { padding: 20, paddingBottom: 60 },

    titulo: {
        fontSize: 26,
        fontWeight: "800",
        color: "#1F2937",
        marginBottom: 16,
        marginTop: 10,
    },

    instructionCard: {
        backgroundColor: "#EFF6FF",
        borderRadius: 14,
        padding: 16,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: "#BFDBFE",
        alignItems: "center",
    },
    instructionText: {
        fontSize: 15,
        color: "#1E40AF",
        lineHeight: 22,
        textAlign: "center",
    },

    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.6,
    },
    pickerWrapper: {
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 20,
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    picker: { width: "100%" },
    emptyText: { padding: 16, color: "#9CA3AF", fontSize: 14 },

    summaryCard: {
        backgroundColor: "#F0FDF4",
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#BBF7D0",
    },
    summaryTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#166534",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    summaryRow: { fontSize: 14, color: "#374151", marginBottom: 3 },
    summaryKey: { fontWeight: "700", color: "#1F2937" },

    btn: {
        backgroundColor: "#3B82F6",
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        elevation: 3,
        shadowColor: "#3B82F6",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    btnDisabled: { backgroundColor: "#93C5FD", elevation: 0 },
    btnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
