import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function VerMedico() {
    const { medicoData } = useLocalSearchParams<{ medicoData: string }>();
    const router = useRouter();
    const medico = medicoData ? JSON.parse(medicoData) : null;

    if (!medico) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>No se encontró información del médico.</Text>
            </View>
        );
    }

    const nombreCompleto = [medico.nombre, medico.apellido1, medico.apellido2]
        .filter(Boolean)
        .join(' ');

    const Field = ({ label, value }: { label: string; value?: string | number | null }) =>
        value !== null && value !== undefined && value !== '' ? (
            <View style={styles.field}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <Text style={styles.fieldValue}>{String(value)}</Text>
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
                <Ionicons name={icon} size={20} color="#10B981" />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {children}
        </View>
    );

    const sexoLabel =
        medico.sexo === 'M' || medico.sexo === 'Masculino'
            ? 'Masculino'
            : medico.sexo === 'F' || medico.sexo === 'Femenino'
            ? 'Femenino'
            : medico.sexo || undefined;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.heroCard}>
                <Ionicons name="person-circle" size={80} color="#10B981" />
                <Text style={styles.heroName}>{nombreCompleto}</Text>
                <Text style={styles.heroSpec}>
                    {medico.tituloEspecialidad || medico.carrera || 'Sin especialidad registrada'}
                </Text>
                {sexoLabel && <Text style={styles.heroSub}>{sexoLabel}</Text>}
            </View>

            <Section title="Información Profesional" icon="school-outline">
                <Field label="RFC" value={medico.rfc} />
                <Field label="Cédula profesional" value={medico.cedula} />
                <Field label="Carrera" value={medico.carrera} />
                <Field label="Escuela" value={medico.escuela} />
                <Field label="Especialidad" value={medico.tituloEspecialidad} />
                <Field label="Escuela de especialidad" value={medico.escuelaEspecialidad} />
            </Section>

            <Section title="Información Laboral" icon="briefcase-outline">
                <Field label="Turno" value={medico.turno} />
                <Field
                    label="Cubre urgencias"
                    value={medico.cubreUrgencias ? 'Sí' : 'No'}
                />
                <Field label="Teléfono" value={medico.telefono} />
            </Section>

            <View style={styles.actions}>
                <Pressable
                    style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
                    onPress={() =>
                        router.push({
                            pathname: '/(drawer)/medicos/registroPersonalMedico',
                            params: { medicoData: JSON.stringify(medico) },
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
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: 16, paddingBottom: 48 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, color: '#6B7280' },

    heroCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    heroName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1F2937',
        marginTop: 10,
        textAlign: 'center',
    },
    heroSpec: {
        fontSize: 15,
        color: '#10B981',
        fontWeight: '600',
        marginTop: 4,
        textAlign: 'center',
    },
    heroSub: { fontSize: 13, color: '#6B7280', marginTop: 4 },

    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },

    field: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    fieldLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldValue: { fontSize: 15, color: '#374151', marginTop: 2 },

    actions: { marginTop: 4 },
    editBtn: {
        backgroundColor: '#10B981',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 14,
        gap: 8,
        elevation: 3,
        shadowColor: '#10B981',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
    editBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
