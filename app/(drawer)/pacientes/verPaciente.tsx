import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

export default function VerPaciente() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const patients = await readPatientsFromFirebase();
                const found = patients.find((p) => p.id === id) ?? null;
                setPatient(found);
            } catch {
                Alert.alert("Error", "No se pudo cargar la información del paciente.");
            } finally {
                setLoading(false);
            }
        };
        fetchPatient();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (!patient) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Paciente no encontrado.</Text>
            </View>
        );
    }

    const Field = ({ label, value }: { label: string; value?: string }) =>
        value ? (
            <View style={styles.field}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <Text style={styles.fieldValue}>{value}</Text>
            </View>
        ) : null;

    const Section = ({
        title,
        icon,
        children,
    }: {
        title: string;
        icon: keyof typeof Ionicons.glyphMap;
        children: React.ReactNode;
    }) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Ionicons name={icon} size={20} color="#3B82F6" />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {children}
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.heroCard}>
                <Ionicons name="person-circle" size={80} color="#3B82F6" />
                <Text style={styles.heroName}>{`${patient.nombre} ${patient.apellidos}`}</Text>
                <Text style={styles.heroSub}>{patient.edad} años · {patient.sexo}</Text>
            </View>

            <Section title="Información Personal" icon="person-outline">
                <Field label="Fecha de nacimiento" value={patient.fechaNacimiento} />
                <Field label="Estado civil" value={patient.estadoCivil} />
                <Field label="Ocupación" value={patient.ocupacion} />
                <Field label="Escolaridad" value={patient.escolaridad} />
            </Section>

            <Section title="Contacto" icon="call-outline">
                <Field label="Teléfono" value={patient.telefono} />
                <Field label="Correo electrónico" value={patient.correo} />
                <Field label="Dirección" value={patient.direccion} />
                <Field label="Contacto de emergencia" value={patient.contactoEmergencia} />
                <Field label="Teléfono de emergencia" value={patient.telefonoEmergencia} />
            </Section>

            <Section title="Información Médica" icon="medkit-outline">
                <Field label="Tipo de sangre" value={patient.tipoSangre} />
                <Field label="Peso" value={patient.peso ? `${patient.peso} kg` : undefined} />
                <Field label="Talla" value={patient.talla ? `${patient.talla} cm` : undefined} />
                <Field label="Alergias" value={patient.alergias} />
                <Field label="Enfermedades crónicas" value={patient.enfermedadesCronicas} />
                <Field label="Cirugías previas" value={patient.cirugiasPrevias} />
                <Field label="Medicamentos actuales" value={patient.medicamentosActuales} />
            </Section>

            <View style={styles.actions}>
                <Pressable
                    style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
                    onPress={() =>
                        router.push({
                            pathname: "/(drawer)/pacientes/registroPaciente",
                            params: { id: patient.id },
                        })
                    }
                >
                    <MaterialIcons name="edit" size={20} color="#fff" />
                    <Text style={styles.editBtnText}>Editar información</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },
    content: { padding: 16, paddingBottom: 48 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    errorText: { fontSize: 16, color: "#6B7280" },

    heroCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginBottom: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    heroName: {
        fontSize: 22,
        fontWeight: "800",
        color: "#1F2937",
        marginTop: 10,
        textAlign: "center",
    },
    heroSub: { fontSize: 14, color: "#6B7280", marginTop: 4 },

    section: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937" },

    field: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F9FAFB",
    },
    fieldLabel: {
        fontSize: 11,
        color: "#9CA3AF",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    fieldValue: { fontSize: 15, color: "#374151", marginTop: 2 },

    actions: { marginTop: 4 },
    editBtn: {
        backgroundColor: "#3B82F6",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderRadius: 14,
        gap: 8,
        elevation: 3,
        shadowColor: "#3B82F6",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    editBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
