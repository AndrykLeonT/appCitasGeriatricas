import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";
import { registrarMovimientoBitacora } from "../../../services/sqliteBitacoraCitas";
import { updateCitaInFirebase, deleteCitaFromFirebase, readCitasFromFirebase, Cita } from "../../../services/firebaseCitas";

export default function VerCitaScreen() {
    const { citaData } = useLocalSearchParams();
    const router = useRouter();

    const [cita, setCita] = useState<Cita | null>(null);
    const [status, setStatus] = useState<string>("agendado");
    const [observaciones, setObservaciones] = useState<string>("");
    const [fecha, setFecha] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [fechaChanged, setFechaChanged] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (citaData && typeof citaData === 'string') {
            try {
                const parsed = JSON.parse(citaData);
                setCita(parsed);
                setStatus(parsed.status);
                setObservaciones(parsed.observaciones || "");
                setFecha(new Date(parsed.fecha));
                setFechaChanged(false);
            } catch (err) {
                console.error("Error parsing cita data:", err);
                Alert.alert("Error", "No se pudo cargar la información de la cita.");
                router.back();
            }
        }
    }, [citaData]);

    const onChangeDate = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || fecha;
        setShowDatePicker(false);
        setFecha(currentDate);
        setFechaChanged(true);
    };

    const onChangeTime = (event: any, selectedTime?: Date) => {
        const currentTime = selectedTime || fecha;
        setShowTimePicker(false);
        setFecha(currentTime);
        setFechaChanged(true);
    };

    const guardarCambios = async () => {
        if (!cita) return;
        setSaving(true);
        console.log("Iniciando guardado de cita:", cita.id);

        const timeout = (ms: number, msg: string) => new Promise<never>((_, reject) => setTimeout(() => reject(new Error(msg)), ms));

        try {
            if (fechaChanged) {
                console.log("Fecha modificada, verificando empalmes...");
                const allCitas = await Promise.race([
                    readCitasFromFirebase(),
                    timeout(7000, "Tiempo de espera agotado al consultar citas para validación.")
                ]) as Cita[];
                
                const duration = cita.duracion;
                const requestedStart = fecha.getTime();
                const requestedEnd = requestedStart + duration * 60 * 1000;

                const overlappingCita = allCitas.find((c) => {
                    if (c.id === cita.id) return false;
                    if (c.pacienteId !== cita.pacienteId && c.medicoId !== cita.medicoId) return false;
                    if (c.status === 'concluida') return false;

                    const existingStart = new Date(c.fecha).getTime();
                    const existingEnd = existingStart + c.duracion * 60 * 1000;

                    if (requestedStart < existingEnd && existingStart < requestedEnd) return true;
                    return false;
                });

                if (overlappingCita) {
                    setSaving(false);
                    Alert.alert("Conflicto de Horario", "El médico o el paciente seleccionado ya tienen una cita que interfiere en este nuevo horario. Elija otra hora.");
                    return;
                }
            }

            console.log("Actualizando firebase con timeout...");
            await Promise.race([
                updateCitaInFirebase(cita.id, {
                    status: status as 'agendado' | 'en curso' | 'concluida',
                    observaciones: observaciones ? observaciones.trim() : "",
                    fecha: fecha.toISOString()
                }),
                timeout(7000, "No se pudo actualizar. Es posible que no tengas conexión estable a internet.")
            ]);

            if (fechaChanged) {
                console.log("Registrando bitacora de cambio de fecha...");
                try {
                    await registrarMovimientoBitacora("Re-agenda de cita", cita.id, `Pac: ${cita.pacienteNombre} | Dr. ${cita.medicoNombre} a ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`);
                } catch (e) {
                    console.log("Error silencioso en bitacora", e);
                }
            }

            Alert.alert("Éxito", "La cita ha sido actualizada.", [
                { text: "Aceptar", onPress: () => router.back() },
            ]);
            console.log("Actualización exitosa.");
        } catch (error: any) {
            console.error("Error updating cita:", error);
            const msg = error.message && error.message.includes("conexión") ? error.message : "Ocurrió un problema al guardar los cambios.";
            Alert.alert("Error", msg);
        } finally {
            console.log("Apagando boton de carga");
            setSaving(false);
        }
    };

    const eliminarCita = () => {
        Alert.alert("Eliminar Cita", "¿Está seguro que desea eliminar permanentemente esta cita?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar", style: "destructive", onPress: async () => {
                    setSaving(true);
                    try {
                        await deleteCitaFromFirebase(cita.id);
                        await registrarMovimientoBitacora("Eliminación de cita", cita.id, `Pac: ${cita.pacienteNombre} | Dr. ${cita.medicoNombre}`);
                        Alert.alert("Éxito", "La cita ha sido eliminada.");
                        router.back();
                    } catch (error) {
                        console.error("Error deleting cita:", error);
                        Alert.alert("Error", "No se pudo eliminar la cita.");
                        setSaving(false);
                    }
                }
            }
        ]);
    };

    if (!cita) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={{ marginTop: 10, color: "#6B7280" }}>Cargando cita...</Text>
            </View>
        );
    }

    const citaDate = new Date(cita.fecha);

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Detalles de la Cita</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Información General</Text>
                
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Paciente:</Text>
                    <Text style={styles.infoText}>{cita.pacienteNombre}</Text>
                </View>
                
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Médico:</Text>
                    <Text style={styles.infoText}>{cita.medicoNombre}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Fecha y Hora:</Text>
                    <View style={styles.dateButtonsRow}>
                        <Pressable style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.datePickerText}>{fecha.toLocaleDateString()}</Text>
                        </Pressable>
                        <Pressable style={styles.datePickerBtn} onPress={() => setShowTimePicker(true)}>
                            <Text style={styles.datePickerText}>{fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </Pressable>
                    </View>
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

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Duración:</Text>
                    <Text style={styles.infoText}>{cita.duracion} minutos</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Motivo:</Text>
                    <Text style={styles.infoText}>{cita.motivo || "N/A"}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tipo de Consulta:</Text>
                    <Text style={styles.infoText}>
                        {cita.primeraCita ? "Primera Cita" : "Seguimiento"}
                    </Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Seguimiento</Text>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Estatus de la Cita</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={status}
                            onValueChange={(itemValue) => setStatus(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Agendado" value="agendado" />
                            <Picker.Item label="En Curso" value="en curso" />
                            <Picker.Item label="Concluida" value="concluida" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Observaciones</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Agregue las notas o resultados de la consulta"
                        value={observaciones}
                        onChangeText={setObservaciones}
                        multiline
                    />
                </View>
            </View>

            <View style={styles.actionButtonsCol}>
                <Pressable
                    style={({ pressed }) => [styles.patientBtnPrimary, { opacity: pressed ? 0.8 : 1 }]}
                    onPress={() => router.push({ pathname: "/(drawer)/pacientes/registroPaciente", params: { id: cita.pacienteId } })}
                >
                    <Ionicons name="person-circle-outline" size={22} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.patientBtnText}>Ver Detalles del Paciente</Text>
                </Pressable>
                
                <Pressable
                    style={({ pressed }) => [styles.patientBtnSecondary, { opacity: pressed ? 0.8 : 1 }]}
                    onPress={() => router.push({ pathname: "/(drawer)/signos-vitales/dashboard", params: { id: cita.pacienteId, nombre: cita.pacienteNombre } })}
                >
                    <Ionicons name="pulse-outline" size={22} color="#1F2937" style={{ marginRight: 8 }} />
                    <Text style={[styles.patientBtnText, {color: "#1F2937"}]}>Ver Signos Vitales</Text>
                </Pressable>
            </View>

            <Pressable
                style={({ pressed }) => [
                    styles.botonGuardar,
                    { opacity: pressed || saving ? 0.7 : 1 },
                ]}
                onPress={guardarCambios}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <>
                        <Ionicons name="save-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.textoGuardar}>GUARDAR CAMBIOS</Text>
                    </>
                )}
            </Pressable>

            <Pressable
                style={({ pressed }) => [
                    styles.botonEliminar,
                    { opacity: pressed || saving ? 0.7 : 1 },
                ]}
                onPress={eliminarCita}
                disabled={saving}
            >
                <Ionicons name="trash-outline" size={20} color="#DC2626" style={{ marginRight: 8 }} />
                <Text style={styles.textoEliminar}>ELIMINAR CITA</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F3F4F6", padding: 15 },
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { marginBottom: 20, marginTop: 10 },
    headerTitle: { fontSize: 24, fontWeight: "bold", color: "#1F2937"},
    card: {
        backgroundColor: "#FFFFFF",
        padding: 15,
        borderRadius: 12,
        elevation: 2,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#374151",
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        paddingBottom: 5,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    infoLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#6B7280",
    },
    infoText: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#1F2937",
        maxWidth: '65%',
        textAlign: 'right'
    },
    dateButtonsRow: {
        flexDirection: 'row',
        gap: 8,
        maxWidth: '65%',
        justifyContent: 'flex-end',
    },
    datePickerBtn: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    datePickerText: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: 'bold',
    },
    inputContainer: { marginBottom: 15 },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4B5563",
        marginBottom: 5,
    },
    pickerContainer: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        overflow: 'hidden'
    },
    picker: {
        height: 50,
        width: "100%",
        color: "#1F2937"
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
        height: 100,
        textAlignVertical: "top",
    },
    botonGuardar: {
        flexDirection: 'row',
        backgroundColor: "#10B981",
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        elevation: 3,
    },
    textoGuardar: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
    botonEliminar: {
        flexDirection: 'row',
        backgroundColor: "#FEF2F2",
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#DC2626",
    },
    textoEliminar: { color: "#DC2626", fontWeight: "bold", fontSize: 16 },
    actionButtonsCol: { gap: 10, marginBottom: 20 },
    patientBtnPrimary: { flexDirection: 'row', backgroundColor: '#3B82F6', paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', elevation: 2 },
    patientBtnSecondary: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    patientBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});
