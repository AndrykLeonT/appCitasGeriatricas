import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import CustomPicker from '../../../components/CustomPicker';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { createPatientInFirebase, readPatientsFromFirebase, updatePatientInFirebase } from "../../../services/firebasePatients";

const SEXO_OPTIONS = ["", "Hombre", "Mujer", "Prefiero no especificar"];
const ESTADO_CIVIL_OPTIONS = ["", "Soltero/a", "Casado/a", "Viudo/a", "Prefiero no especificar"];
const ESCOLARIDAD_OPTIONS = [
    "", "Ninguno", "Preescolar", "Primaria", "Secundaria",
    "Preparatoria", "Universidad", "Maestría", "Doctorado",
];

const parseDateString = (str: string): Date => {
    if (!str) return new Date();
    const [day, month, year] = str.split('/');
    if (!day || !month || !year || isNaN(Number(year))) return new Date();
    return new Date(Number(year), Number(month) - 1, Number(day));
};

const formatDate = (date: Date): string => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}/${date.getFullYear()}`;
};

export default function RegistroPaciente() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();

    const [loading, setLoading] = useState(false);
    const [initialFetchLoading, setInitialFetchLoading] = useState(!!id);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        edad: "",
        sexo: "",
        fechaNacimiento: "",
        estadoCivil: "",
        ocupacion: "",
        escolaridad: "",
        telefono: "",
        correo: "",
        direccion: "",
        contactoEmergencia: "",
        telefonoEmergencia: "",
        tipoSangre: "",
        alergias: "",
        enfermedadesCronicas: "",
        cirugiasPrevias: "",
        medicamentosActuales: "",
        peso: "",
        talla: "",
    });

    useEffect(() => {
        if (id) {
            const fetchPatient = async () => {
                try {
                    const patients = await readPatientsFromFirebase();
                    const patientToEdit = patients.find(p => p.id === id);
                    if (patientToEdit) {
                        const { id: _, ...rest } = patientToEdit;
                        setFormData(rest);
                    } else {
                        Alert.alert("Error", "Paciente no encontrado");
                        router.back();
                    }
                } catch {
                    Alert.alert("Error", "No se pudieron cargar los datos del paciente");
                } finally {
                    setInitialFetchLoading(false);
                }
            };
            fetchPatient();
        }
    }, [id, router]);

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (_event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowDatePicker(false);
        if (selectedDate) handleChange('fechaNacimiento', formatDate(selectedDate));
    };

    const handleGuardar = async () => {
        if (!formData.nombre || !formData.apellidos) {
            Alert.alert("Campos requeridos", "Por favor ingresa al menos nombre y apellidos.");
            return;
        }
        setLoading(true);
        try {
            if (id) {
                await updatePatientInFirebase(id, formData);
                Alert.alert("Éxito", "Paciente actualizado exitosamente.", [
                    { text: "Aceptar", onPress: () => router.back() }
                ]);
            } else {
                await createPatientInFirebase(formData);
                Alert.alert("Éxito", "Paciente registrado exitosamente.", [
                    { text: "Aceptar", onPress: () => router.back() }
                ]);
            }
            // Clear form (optional since we navigate back, but good practice)
            setFormData({
                nombre: "", apellidos: "", edad: "", sexo: "", fechaNacimiento: "",
                estadoCivil: "", ocupacion: "", escolaridad: "", telefono: "",
                correo: "", direccion: "", contactoEmergencia: "", telefonoEmergencia: "",
                tipoSangre: "", alergias: "", enfermedadesCronicas: "", cirugiasPrevias: "",
                medicamentosActuales: "", peso: "", talla: "",
            });
        } catch {
            Alert.alert("Error", "Hubo un problema al guardar los datos del paciente. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    if (initialFetchLoading) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={{ marginTop: 10, color: "#6B7280" }}>Cargando datos del paciente...</Text>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                    <Text style={styles.title}>{id ? "Editar Paciente" : "Registro de Paciente"}</Text>
                    <Text style={styles.subtitle}>Complete la información requerida clínica y personal.</Text>

                    {/* ── Datos Personales ── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Datos Personales</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Nombre(s)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.nombre}
                                onChangeText={(t) => handleChange("nombre", t)}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Apellidos</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.apellidos}
                                onChangeText={(t) => handleChange("apellidos", t)}
                            />
                        </View>

                        {/* Edad + Sexo */}
                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Edad</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={formData.edad}
                                    onChangeText={(t) => handleChange("edad", t)}
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Sexo</Text>
                                <View style={styles.pickerWrapper}>
                                    <CustomPicker
                                        selectedValue={formData.sexo}
                                        onValueChange={(v) => handleChange("sexo", v)}
                                        style={styles.picker}
                                    >
                                        {SEXO_OPTIONS.map((o) => (
                                            <Picker.Item
                                                key={o}
                                                label={o === "" ? "Seleccionar..." : o}
                                                value={o}
                                            />
                                        ))}
                                    </CustomPicker>
                                </View>
                            </View>
                        </View>

                        {/* Fecha de Nacimiento + Estado Civil */}
                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Fecha de Nacimiento</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={[
                                        styles.dateButtonText,
                                        !formData.fechaNacimiento && styles.datePlaceholder,
                                    ]}>
                                        {formData.fechaNacimiento || "DD/MM/AAAA"}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={parseDateString(formData.fechaNacimiento)}
                                        mode="date"
                                        display="default"
                                        onChange={handleDateChange}
                                        maximumDate={new Date()}
                                    />
                                )}
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Estado Civil</Text>
                                <View style={styles.pickerWrapper}>
                                    <CustomPicker
                                        selectedValue={formData.estadoCivil}
                                        onValueChange={(v) => handleChange("estadoCivil", v)}
                                        style={styles.picker}
                                    >
                                        {ESTADO_CIVIL_OPTIONS.map((o) => (
                                            <Picker.Item
                                                key={o}
                                                label={o === "" ? "Seleccionar..." : o}
                                                value={o}
                                            />
                                        ))}
                                    </CustomPicker>
                                </View>
                            </View>
                        </View>

                        {/* Ocupación + Escolaridad */}
                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Ocupación</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.ocupacion}
                                    onChangeText={(t) => handleChange("ocupacion", t)}
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Escolaridad</Text>
                                <View style={styles.pickerWrapper}>
                                    <CustomPicker
                                        selectedValue={formData.escolaridad}
                                        onValueChange={(v) => handleChange("escolaridad", v)}
                                        style={styles.picker}
                                    >
                                        {ESCOLARIDAD_OPTIONS.map((o) => (
                                            <Picker.Item
                                                key={o}
                                                label={o === "" ? "Seleccionar..." : o}
                                                value={o}
                                            />
                                        ))}
                                    </CustomPicker>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* ── Datos de Contacto ── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Datos de Contacto</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Teléfono</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="phone-pad"
                                value={formData.telefono}
                                onChangeText={(t) => handleChange("telefono", t)}
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Correo Electrónico</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.correo}
                                onChangeText={(t) => handleChange("correo", t)}
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Dirección Completa</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.direccion}
                                onChangeText={(t) => handleChange("direccion", t)}
                            />
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Contacto de Emergencia</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.contactoEmergencia}
                                    onChangeText={(t) => handleChange("contactoEmergencia", t)}
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Teléfono Emergencia</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="phone-pad"
                                    value={formData.telefonoEmergencia}
                                    onChangeText={(t) => handleChange("telefonoEmergencia", t)}
                                />
                            </View>
                        </View>
                    </View>

                    {/* ── Datos Médicos ── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Datos Médicos</Text>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Tipo de Sangre</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.tipoSangre}
                                    onChangeText={(t) => handleChange("tipoSangre", t)}
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Peso (kg)</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={formData.peso}
                                    onChangeText={(t) => handleChange("peso", t)}
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Talla (cm)</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={formData.talla}
                                    onChangeText={(t) => handleChange("talla", t)}
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Alergias</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                multiline
                                value={formData.alergias}
                                onChangeText={(t) => handleChange("alergias", t)}
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Enfermedades Crónicas</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                multiline
                                value={formData.enfermedadesCronicas}
                                onChangeText={(t) => handleChange("enfermedadesCronicas", t)}
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Cirugías Previas</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                multiline
                                value={formData.cirugiasPrevias}
                                onChangeText={(t) => handleChange("cirugiasPrevias", t)}
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Medicamentos Actuales</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                multiline
                                value={formData.medicamentosActuales}
                                onChangeText={(t) => handleChange("medicamentosActuales", t)}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.btnGuardar, loading && { opacity: 0.7 }]}
                        onPress={handleGuardar}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.btnGuardarText}>
                                {id ? "Actualizar Paciente" : "Registrar Paciente"}
                            </Text>
                        )}
                    </TouchableOpacity>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6" },
    scrollContent: { padding: 20 },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 5,
        marginTop: 10,
    },
    subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 25 },
    section: {
        backgroundColor: "#ffffff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#3B82F6",
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        paddingBottom: 5,
    },
    row: { flexDirection: "row", justifyContent: "space-between" },
    formGroup: { marginBottom: 15 },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 6,
    },
    input: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6,
        backgroundColor: "#ffffff",
        height: 50,
        justifyContent: "center",
    },
    picker: {
        width: "100%",
        backgroundColor: "transparent",
    },
    dateButton: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 11,
        justifyContent: "center",
    },
    dateButtonText: {
        fontSize: 15,
        color: "#374151",
    },
    datePlaceholder: {
        color: "#9ca3af",
    },
    btnGuardar: {
        backgroundColor: "#10B981",
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 20,
        minHeight: 55,
    },
    btnGuardarText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
