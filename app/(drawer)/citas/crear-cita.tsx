import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Switch,
    TextInput,
} from "react-native";
import CustomPicker from "../../../components/CustomPicker";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as SQLite from "expo-sqlite";

import { readPatientsFromFirebase, Patient } from "../../../services/firebasePatients";
import { createCitaInFirebase, readCitasFromFirebase, Cita } from "../../../services/firebaseCitas";
import { registrarMovimientoBitacora } from "../../../services/sqliteBitacoraCitas";

export default function CrearCitaScreen() {
    const router = useRouter();

    const [pacientes, setPacientes] = useState<Patient[]>([]);
    const [medicos, setMedicos] = useState<any[]>([]);
    
    const [selectedPacienteId, setSelectedPacienteId] = useState<string>("");
    const [selectedMedicoId, setSelectedMedicoId] = useState<number | "">("");
    
    // Default to current date and time
    const [fecha, setFecha] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [primeraCita, setPrimeraCita] = useState(false);
    const [motivo, setMotivo] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Patients from Firebase
                const fetchedPacientes = await readPatientsFromFirebase();
                setPacientes(fetchedPacientes);
                if (fetchedPacientes.length > 0) {
                    setSelectedPacienteId(fetchedPacientes[0].id);
                }

                // 2. Fetch Medicos from SQLite
                const db = await SQLite.openDatabaseAsync("medicos.db");
                const res = await db.getAllAsync("SELECT * FROM PersonalMedico ORDER BY id DESC;");
                const fetchedMedicos = res as any[];
                setMedicos(fetchedMedicos);
                if (fetchedMedicos.length > 0) {
                    setSelectedMedicoId(fetchedMedicos[0].id);
                }
            } catch (error) {
                console.error("Error loading data:", error);
                Alert.alert("Error", "No se pudieron cargar los datos de pacientes o médicos.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const onChangeDate = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || fecha;
        setShowDatePicker(false);
        setFecha(currentDate);
    };

    const onChangeTime = (event: any, selectedTime?: Date) => {
        const currentTime = selectedTime || fecha;
        setShowTimePicker(false);
        setFecha(currentTime);
    };

    const registrarCita = async () => {
        if (!selectedPacienteId || selectedMedicoId === "") {
            Alert.alert("Datos incompletos", "Por favor seleccione un paciente y un médico.");
            return;
        }
        
        if (!motivo.trim()) {
            Alert.alert("Datos incompletos", "Por favor ingrese el motivo de la cita.");
            return;
        }

        const pacienteName = pacientes.find(p => p.id === selectedPacienteId)?.nombre + " " + (pacientes.find(p => p.id === selectedPacienteId)?.apellidos || "");
        const medicoD = medicos.find(m => m.id === selectedMedicoId);
        const medicoName = medicoD ? `Dr. ${medicoD.nombre} ${medicoD.apellido1}` : "";

        setSaving(true);
        try {
            // Validar empalme de horarios
            const allCitas = await readCitasFromFirebase();
            const duration = primeraCita ? 60 : 30;
            const requestedStart = fecha.getTime();
            const requestedEnd = requestedStart + duration * 60 * 1000;

            const overlappingCita = allCitas.find((cita) => {
                // Solo revisar si es el mismo paciente o mismo médico
                if (cita.pacienteId !== selectedPacienteId && cita.medicoId !== selectedMedicoId) {
                    return false;
                }
                // No validar contra citas concluidas opcionalmente. Por seguridad validamos todas las activas:
                if (cita.status === 'concluida') return false;

                const existingStart = new Date(cita.fecha).getTime();
                const existingEnd = existingStart + cita.duracion * 60 * 1000;

                // Lógica de empalme: inicioNuevo < finExistente AND inicioExistente < finNuevo
                if (requestedStart < existingEnd && existingStart < requestedEnd) {
                    return true;
                }
                return false;
            });

            if (overlappingCita) {
                setSaving(false);
                Alert.alert(
                    "Conflicto de Horario",
                    "El médico o el paciente seleccionado ya tienen una cita que interfiere en ese horario. Por favor elija otra hora."
                );
                return;
            }

            const nuevaCita: Omit<Cita, 'id'> = {
                pacienteId: selectedPacienteId,
                pacienteNombre: pacienteName.trim(),
                medicoId: selectedMedicoId as number,
                medicoNombre: medicoName.trim(),
                fecha: fecha.toISOString(),
                primeraCita: primeraCita,
                duracion: duration,
                motivo: motivo.trim(),
                status: "agendado"
            };

            await createCitaInFirebase(nuevaCita);
            await registrarMovimientoBitacora("Creación de cita", undefined, `Pac: ${pacienteName.trim()} | Dr. ${medicoD?.nombre} ${medicoD?.apellido1}`);
            
            Alert.alert("Éxito", "La cita ha sido registrada correctamente.", [
                { text: "Aceptar", onPress: () => router.back() },
            ]);
        } catch (error) {
            console.error("Error al registrar cita:", error);
            Alert.alert("Error", "Ocurrió un problema al registrar la cita.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={{ marginTop: 10, color: "#6B7280" }}>Cargando datos...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
            <Text style={styles.instrucciones}>
                Seleccione el paciente y el médico para agendar una nueva cita.
            </Text>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Selección de Involucrados</Text>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Paciente</Text>
                    <View style={styles.pickerContainer}>
                        <CustomPicker
                            selectedValue={selectedPacienteId}
                            onValueChange={(itemValue) => setSelectedPacienteId(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Seleccione un paciente..." value="" color="#9CA3AF" />
                            {pacientes.map((p) => (
                                <Picker.Item key={p.id} label={`${p.nombre} ${p.apellidos}`} value={p.id} />
                            ))}
                        </CustomPicker>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Médico</Text>
                    <View style={styles.pickerContainer}>
                        <CustomPicker
                            selectedValue={selectedMedicoId}
                            onValueChange={(itemValue) => setSelectedMedicoId(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Seleccione un médico..." value="" color="#9CA3AF" />
                            {medicos.map((m) => (
                                <Picker.Item key={m.id} label={`Dr. ${m.nombre} ${m.apellido1} (${m.tituloEspecialidad || 'Médico General'})`} value={m.id} />
                            ))}
                        </CustomPicker>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Detalles de la Cita</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Fecha y Hora de la Cita</Text>
                    <View style={styles.dateButtonsRow}>
                        <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.dateButtonText}>{fecha.toLocaleDateString()}</Text>
                        </Pressable>
                        <Pressable style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
                            <Text style={styles.dateButtonText}>{fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                        </Pressable>
                    </View>
                    {showDatePicker && (
                        <DateTimePicker
                            value={fecha}
                            mode="date"
                            display="default"
                            onChange={onChangeDate}
                        />
                    )}
                    {showTimePicker && (
                        <DateTimePicker
                            value={fecha}
                            mode="time"
                            display="default"
                            onChange={onChangeTime}
                        />
                    )}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Motivo de la Cita</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Escriba el motivo principal de la consulta"
                        value={motivo}
                        onChangeText={setMotivo}
                        multiline
                    />
                </View>

                <View style={styles.switchContainer}>
                    <Text style={styles.labelBold}>¿Es Primera Cita?</Text>
                    <Switch
                        trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                        thumbColor={primeraCita ? "#3B82F6" : "#F3F4F6"}
                        onValueChange={setPrimeraCita}
                        value={primeraCita}
                    />
                </View>
                <Text style={styles.hintText}>
                    Duración calculada: {primeraCita ? "60 minutos" : "30 minutos"}
                </Text>
            </View>

            <Pressable
                style={({ pressed }) => [
                    styles.botonGuardar,
                    { opacity: pressed || saving ? 0.7 : 1 },
                ]}
                onPress={registrarCita}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.textoGuardar}>AGENDAR CITA</Text>
                )}
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F3F4F6", padding: 15 },
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    instrucciones: {
        backgroundColor: "#DBEAFE",
        padding: 15,
        borderRadius: 8,
        color: "#1E40AF",
        marginBottom: 20,
        fontStyle: "italic",
    },
    card: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        borderRadius: 8,
        elevation: 2,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#374151",
        marginTop: 10,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        paddingBottom: 5,
    },
    inputContainer: { marginBottom: 15 },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4B5563",
        marginBottom: 5,
    },
    labelBold: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1F2937",
    },
    input: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        color: "#1F2937",
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    pickerContainer: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        height: 50,
        justifyContent: "center",
    },
    picker: {
        width: "100%",
        color: "#1F2937",
        backgroundColor: "transparent",
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB'
    },
    hintText: {
        fontSize: 14,
        color: "#10B981",
        fontStyle: "italic",
        marginTop: 5,
        marginBottom: 15,
    },
    dateButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    dateButton: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center"
    },
    dateButtonText: {
        fontSize: 16,
        color: "#1F2937",
        fontWeight: "500",
    },
    botonGuardar: {
        backgroundColor: "#3B82F6",
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
        elevation: 3,
    },
    textoGuardar: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
});
