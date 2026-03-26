import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { createPatientInFirebase, readPatientsFromFirebase, updatePatientInFirebase } from "../../../services/firebasePatients";

export default function RegistroPaciente() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();

    const [loading, setLoading] = useState(false);
    const [initialFetchLoading, setInitialFetchLoading] = useState(!!id);

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
                } catch (error) {
                    Alert.alert("Error", "No se pudieron cargar los datos del paciente");
                } finally {
                    setInitialFetchLoading(false);
                }
            };
            fetchPatient();
        }
    }, [id]);

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
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
                Alert.alert("Éxito", "Paciente actualizado exitosamente.");
            } else {
                await createPatientInFirebase(formData);
                Alert.alert("Éxito", "Paciente registrado exitosamente.");
            }

            setFormData({
                nombre: "", apellidos: "", edad: "", sexo: "", fechaNacimiento: "",
                estadoCivil: "", ocupacion: "", escolaridad: "", telefono: "",
                correo: "", direccion: "", contactoEmergencia: "", telefonoEmergencia: "",
                tipoSangre: "", alergias: "", enfermedadesCronicas: "", cirugiasPrevias: "",
                medicamentosActuales: "", peso: "", talla: "",
            });
            router.back();

        } catch (error) {
            Alert.alert("Error", "Hubo un problema al guardar los datos del paciente. Inténtalo de nuevo.");
            console.error(error);
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
                <ScrollView style={styles.scrollContent}>
                    <Text style={styles.title}>{id ? "Editar Paciente" : "Registro de Paciente"}</Text>
                    <Text style={styles.subtitle}>Complete la información requerida clínica y personal.</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Datos Personales</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Nombre(s)</Text>
                            <TextInput style={styles.input} value={formData.nombre} onChangeText={(text) => handleChange("nombre", text)} />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Apellidos</Text>
                            <TextInput style={styles.input} value={formData.apellidos} onChangeText={(text) => handleChange("apellidos", text)} />
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Edad</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={formData.edad} onChangeText={(text) => handleChange("edad", text)} />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Sexo</Text>
                                <TextInput style={styles.input} value={formData.sexo} onChangeText={(text) => handleChange("sexo", text)} />
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Fecha de Nacimiento</Text>
                                <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={formData.fechaNacimiento} onChangeText={(text) => handleChange("fechaNacimiento", text)} />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Estado Civil</Text>
                                <TextInput style={styles.input} value={formData.estadoCivil} onChangeText={(text) => handleChange("estadoCivil", text)} />
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Ocupación</Text>
                                <TextInput style={styles.input} value={formData.ocupacion} onChangeText={(text) => handleChange("ocupacion", text)} />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Escolaridad</Text>
                                <TextInput style={styles.input} value={formData.escolaridad} onChangeText={(text) => handleChange("escolaridad", text)} />
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Datos de Contacto</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Teléfono</Text>
                            <TextInput style={styles.input} keyboardType="phone-pad" value={formData.telefono} onChangeText={(text) => handleChange("telefono", text)} />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Correo Electrónico</Text>
                            <TextInput style={styles.input} keyboardType="email-address" autoCapitalize="none" value={formData.correo} onChangeText={(text) => handleChange("correo", text)} />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Dirección Completa</Text>
                            <TextInput style={styles.input} value={formData.direccion} onChangeText={(text) => handleChange("direccion", text)} />
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Contacto de Emergencia</Text>
                                <TextInput style={styles.input} value={formData.contactoEmergencia} onChangeText={(text) => handleChange("contactoEmergencia", text)} />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Teléfono Especial (Emergencia)</Text>
                                <TextInput style={styles.input} keyboardType="phone-pad" value={formData.telefonoEmergencia} onChangeText={(text) => handleChange("telefonoEmergencia", text)} />
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Datos Médicos</Text>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Tipo de Sangre</Text>
                                <TextInput style={styles.input} value={formData.tipoSangre} onChangeText={(text) => handleChange("tipoSangre", text)} />
                            </View>
                            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Peso (kg)</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={formData.peso} onChangeText={(text) => handleChange("peso", text)} />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Talla (cm)</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={formData.talla} onChangeText={(text) => handleChange("talla", text)} />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Alergias</Text>
                            <TextInput style={[styles.input, styles.textArea]} multiline value={formData.alergias} onChangeText={(text) => handleChange("alergias", text)} />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Enfermedades Crónicas</Text>
                            <TextInput style={[styles.input, styles.textArea]} multiline value={formData.enfermedadesCronicas} onChangeText={(text) => handleChange("enfermedadesCronicas", text)} />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Cirugías Previas</Text>
                            <TextInput style={[styles.input, styles.textArea]} multiline value={formData.cirugiasPrevias} onChangeText={(text) => handleChange("cirugiasPrevias", text)} />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Medicamentos Actuales</Text>
                            <TextInput style={[styles.input, styles.textArea]} multiline value={formData.medicamentosActuales} onChangeText={(text) => handleChange("medicamentosActuales", text)} />
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
